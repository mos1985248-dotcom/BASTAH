// اختبارات كود الخدمات الحقيقي على قاعدة في الذاكرة (محاكاة): التكرار، السقف، التسويات، الاسترداد، المصروفات، لقطات الإسناد وCOD.
import { fake } from "./setup-db"; // يجب أن يكون أول استيراد (يحقن القاعدة قبل تحميل lib/prisma)
import { beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { createExpense, expenseCreateSchema, updateExpense, voidExpense } from "../../lib/finance/expenses-service";
import { recordRefund, reverseRefund } from "../../lib/finance/refunds-service";
import { courierBalanceMinor, recordSettlement, reverseSettlement, settlementSchema } from "../../lib/finance/settlements-service";
import { snapshotCodShare, snapshotCourierAssignment } from "../../lib/finance/snapshots";
import { FinanceError } from "../../lib/finance/tx";

const T = fake.tables;
const ACTOR = "admin1";
const reset = () => { for (const tb of Object.values(T)) { tb.rows = []; tb.seq = 0; } fake.failNext.auditLog = false; };
beforeEach(reset);

let n = 0;
/** يضيف طلباً + شحنة مسلَّمة (+ إسناد/عمولة اختيارياً) */
function seedShipment(o: { store?: string; courierId?: string | null; wage?: number | null; fee?: number; orderStatus?: string; basitaFee?: number | null; carrierCode?: string | null; day?: number } = {}) {
  n += 1;
  const order = { id: `o${n}`, storeId: o.store ?? "s1", status: o.orderStatus ?? "DELIVERED", paymentMethod: "ONLINE", codFee: 0, shippingCost: o.fee ?? 10, codCarrierShare: null, total: 100, createdAt: new Date("2026-11-01T09:00:00Z") };
  T.order.rows.push(order);
  const ship = { id: `sh${n}`, orderId: order.id, deliveredAt: new Date(Date.UTC(2026, 10, o.day ?? 1 + (n % 28), 9)), status: "DELIVERED", courierId: o.courierId ?? null, carrier: null, carrierCode: o.carrierCode ?? null, order };
  T.shipment.rows.push(ship);
  if (o.courierId && o.wage !== null) T.courierAssignment.rows.push({ id: `a${n}`, shipmentId: ship.id, courierId: o.courierId, wageSnapshot: o.wage ?? 7, deliveryFeeSnapshot: o.fee ?? 10, directCostSnapshot: 0, supersededAt: null });
  if (!o.courierId && o.basitaFee !== null) T.shippingRate.rows.push({ id: `r${n}`, orderId: order.id, basitaFee: o.basitaFee ?? 3 });
  return ship;
}
const payout = (amount: number, key: string, extra: object = {}) =>
  settlementSchema.parse({ kind: "COURIER_PAYOUT", partyType: "COURIER", partyRef: "c1", amount, settledAt: "2026-11-20", idempotencyKey: key, ...extra });

describe("تسويات المناديب", () => {
  test("مندوب أنجز 100 شحنة بأجر 7 → 700؛ دفعة 500 تُبقي 200", async () => {
    for (let i = 0; i < 100; i++) seedShipment({ courierId: "c1", wage: 7 });
    assert.equal((await courierBalanceMinor("c1")).outstandingMinor, 70000);
    const { settlement, duplicate } = await recordSettlement(ACTOR, payout(500, "pay-0001"));
    assert.equal(duplicate, false);
    assert.equal(settlement.allocations.reduce((a, x) => a + Math.round(Number(x.amount) * 100), 0), 50000);
    assert.equal((await courierBalanceMinor("c1")).outstandingMinor, 20000);
  });

  test("تجاوز المتبقي مرفوض (409)، والمتبقي بالضبط مقبول ثم الرصيد صفر", async () => {
    for (let i = 0; i < 100; i++) seedShipment({ courierId: "c1", wage: 7 });
    await recordSettlement(ACTOR, payout(500, "pay-0001"));
    await assert.rejects(recordSettlement(ACTOR, payout(200.01, "pay-0002")), (e: FinanceError) => e instanceof FinanceError && e.status === 409);
    await recordSettlement(ACTOR, payout(200, "pay-0003"));
    assert.equal((await courierBalanceMinor("c1")).outstandingMinor, 0);
    await assert.rejects(recordSettlement(ACTOR, payout(0.01, "pay-0004")), FinanceError);
  });

  test("إعادة الإرسال بالمفتاح نفسه لا تُكرّر الدفعة", async () => {
    seedShipment({ courierId: "c1", wage: 7 }); seedShipment({ courierId: "c1", wage: 7 });
    const a = await recordSettlement(ACTOR, payout(5, "same-key-1"));
    const b = await recordSettlement(ACTOR, payout(5, "same-key-1"));
    assert.equal(b.duplicate, true);
    assert.equal(b.settlement.id, a.settlement.id);
    assert.equal(T.financeSettlement.rows.length, 1);
  });

  test("طلبان متزامنان بالمفتاح نفسه: دفعة واحدة، والثاني يُعيد الأصل لا خطأ", async () => {
    for (let i = 0; i < 10; i++) seedShipment({ courierId: "c1", wage: 7 }); // 70
    const [x, y] = await Promise.all([recordSettlement(ACTOR, payout(50, "race-key-1")), recordSettlement(ACTOR, payout(50, "race-key-1"))]);
    assert.equal(T.financeSettlement.rows.length, 1);
    assert.equal([x, y].filter((r) => r.duplicate).length, 1);
    assert.equal(x.settlement.id, y.settlement.id);
  });

  test("طلبان متزامنان بمفتاحين مختلفين يتجاوزان المستحق معاً: ينجح أحدهما فقط", async () => {
    for (let i = 0; i < 100; i++) seedShipment({ courierId: "c1", wage: 7 });
    const results = await Promise.allSettled([recordSettlement(ACTOR, payout(500, "race-a-0001")), recordSettlement(ACTOR, payout(500, "race-b-0001"))]);
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal((await courierBalanceMinor("c1")).outstandingMinor, 20000);
  });

  test("الشحنات بلا لقطة أجر (غير موثقة) والطلبات الملغاة لا تدخل المستحق", async () => {
    for (let i = 0; i < 5; i++) seedShipment({ courierId: "c1", wage: 7 });
    for (let i = 0; i < 10; i++) seedShipment({ courierId: "c1", wage: null });
    for (let i = 0; i < 3; i++) seedShipment({ courierId: "c1", wage: 7, orderStatus: "CANCELLED" });
    assert.equal((await courierBalanceMinor("c1")).outstandingMinor, 3500);
  });

  test("التخصيص أقدم شحنة أولاً، وتحديد شحنات يقيّد السقف بها", async () => {
    const first = seedShipment({ courierId: "c1", wage: 7, day: 2 });
    const second = seedShipment({ courierId: "c1", wage: 7, day: 9 });
    const { settlement } = await recordSettlement(ACTOR, payout(9, "alloc-0001"));
    const byShip = Object.fromEntries(settlement.allocations.map((a) => [a.shipmentId as string, Number(a.amount)]));
    assert.equal(byShip[first.id], 7);
    assert.equal(byShip[second.id], 2);
    await assert.rejects(recordSettlement(ACTOR, payout(6, "alloc-0002", { shipmentIds: [second.id] })), FinanceError); // المتبقي على الثانية 5
    await recordSettlement(ACTOR, payout(5, "alloc-0003", { shipmentIds: [second.id] }));
  });

  test("العكس: يعيد الرصيد ويُبقي الأصل، مرة واحدة فقط، ولا عكس للعكس", async () => {
    for (let i = 0; i < 10; i++) seedShipment({ courierId: "c1", wage: 7 });
    const { settlement } = await recordSettlement(ACTOR, payout(40, "rev-0001"));
    assert.equal((await courierBalanceMinor("c1")).outstandingMinor, 3000);
    const reversal = await reverseSettlement(ACTOR, settlement.id, "تحويل خاطئ");
    assert.equal((await courierBalanceMinor("c1")).outstandingMinor, 7000);
    assert.equal(T.financeSettlement.rows.length, 2); // الأصل باقٍ
    await assert.rejects(reverseSettlement(ACTOR, settlement.id, "مرة ثانية"), FinanceError);
    await assert.rejects(reverseSettlement(ACTOR, reversal.id, "عكس العكس"), FinanceError);
    await recordSettlement(ACTOR, payout(70, "rev-0002")); // بعد التصحيح يُسمح بدفع المستحق كاملاً
  });

  test("فشل التدقيق يُرجع المعاملة بالكامل (لا تسوية ولا تخصيصات يتيمة)", async () => {
    seedShipment({ courierId: "c1", wage: 7 });
    fake.failNext.auditLog = true;
    await assert.rejects(recordSettlement(ACTOR, payout(7, "audit-fail-1")));
    assert.equal(T.financeSettlement.rows.length, 0);
    assert.equal(T.financeSettlementAllocation.rows.length, 0);
    await recordSettlement(ACTOR, payout(7, "audit-ok-0001"));
  });
});

describe("تحصيلات بسطة", () => {
  test("عمولة الشحن الخارجي لتاجر: 3 ريال لكل شحنة، جزئي ثم كامل، ولا تجاوز", async () => {
    for (let i = 0; i < 3; i++) seedShipment({ store: "s1", carrierCode: "ARAMEX", basitaFee: 3 });
    seedShipment({ store: "s2", carrierCode: "ARAMEX", basitaFee: 3 });
    const receipt = (amount: number, key: string, store = "s1") => settlementSchema.parse({ kind: "COMMISSION_RECEIPT", partyType: "MERCHANT", partyRef: store, amount, settledAt: "2026-11-20", idempotencyKey: key });
    await recordSettlement(ACTOR, receipt(4, "rcpt-0001"));
    await assert.rejects(recordSettlement(ACTOR, receipt(5.01, "rcpt-0002")), FinanceError); // المتبقي 5
    await recordSettlement(ACTOR, receipt(5, "rcpt-0003"));
    await assert.rejects(recordSettlement(ACTOR, receipt(0.01, "rcpt-0004")), FinanceError);
    await recordSettlement(ACTOR, receipt(3, "rcpt-0005", "s2")); // تاجر آخر مستقل
  });

  test("نوع التسوية لا يناسب الطرف: مرفوض", async () => {
    await assert.rejects(recordSettlement(ACTOR, settlementSchema.parse({ kind: "COMMISSION_RECEIPT", partyType: "COURIER", partyRef: "c1", amount: 1, settledAt: "2026-11-20", idempotencyKey: "mismatch-01" })), FinanceError);
  });
});

describe("استرداد الاشتراكات", () => {
  const invoice = () => T.subscriptionInvoice.rows.push({ id: "inv1", amount: 99, status: "PAID", paidAt: new Date("2026-11-05T09:00:00Z") });
  const refund = (amount: number, key: string, id = "inv1") => ({ invoiceId: id, amount, refundedAt: new Date("2026-11-20"), idempotencyKey: key });

  test("جزئي ثم كامل ثم تجاوز مرفوض، والمكرر يُعاد دون تكرار", async () => {
    invoice();
    const a = await recordRefund(ACTOR, refund(30, "refund-0001"));
    await recordRefund(ACTOR, refund(69, "refund-0002"));
    await assert.rejects(recordRefund(ACTOR, refund(0.01, "refund-0003")), FinanceError);
    const dup = await recordRefund(ACTOR, refund(30, "refund-0001"));
    assert.equal(dup.duplicate, true);
    assert.equal(dup.refund.id, a.refund.id);
    assert.equal(T.subscriptionRefund.rows.length, 2);
  });

  test("العكس يعيد القدرة على الاسترداد، ولا استرداد لفاتورة غير مدفوعة أو غير موجودة", async () => {
    invoice();
    const first = await recordRefund(ACTOR, refund(99, "refund-full-1"));
    await assert.rejects(recordRefund(ACTOR, refund(1, "refund-over-1")), FinanceError);
    await reverseRefund(ACTOR, first.refund.id, "استرداد مسجّل بالخطأ");
    await recordRefund(ACTOR, refund(99, "refund-redo-1"));
    T.subscriptionInvoice.rows.push({ id: "inv2", amount: 49, status: "PENDING", paidAt: null });
    await assert.rejects(recordRefund(ACTOR, refund(10, "refund-pend-1", "inv2")), (e: FinanceError) => e.status === 409);
    await assert.rejects(recordRefund(ACTOR, refund(10, "refund-none-1", "nope")), (e: FinanceError) => e.status === 404);
  });

  test("استرداد متزامن بالمفتاح نفسه: واحد فقط", async () => {
    invoice();
    const [x, y] = await Promise.all([recordRefund(ACTOR, refund(50, "refund-race-1")), recordRefund(ACTOR, refund(50, "refund-race-1"))]);
    assert.equal(T.subscriptionRefund.rows.length, 1);
    assert.equal(x.refund.id, y.refund.id);
  });
});

describe("المصروفات", () => {
  const input = () => expenseCreateSchema.parse({ category: "OPERATIONS", description: "استضافة الخادم", amount: 120.5, expenseDate: "2026-11-03", status: "UNPAID", kind: "FIXED" });

  test("الإضافة بتدقيق، والتعديل بسبب وتوثيق القيمة قبل/بعد، والمدفوع يتطلب تاريخ دفع", async () => {
    const e = await createExpense(ACTOR, input());
    assert.equal(T.auditLog.rows.at(-1)!.action, "FINANCE_EXPENSE_CREATED");
    await assert.rejects(updateExpense(ACTOR, e.id, { amount: 130 }, ""), FinanceError); // بلا سبب
    await assert.rejects(updateExpense(ACTOR, e.id, { status: "PAID" }, "تم الدفع"), FinanceError); // بلا paidAt
    await updateExpense(ACTOR, e.id, { amount: 130, status: "PAID", paidAt: new Date("2026-11-05") }, "تصحيح المبلغ وتسجيل الدفع");
    const audit = T.auditLog.rows.at(-1)!;
    assert.equal(audit.action, "FINANCE_EXPENSE_UPDATED");
    assert.equal(audit.metadata.before.amount, 120.5);
    assert.equal(audit.metadata.after.amount, 130);
    assert.equal(audit.metadata.reason, "تصحيح المبلغ وتسجيل الدفع");
  });

  test("الإلغاء ناعم وموثَّق: يبقى السجل، ولا تعديل بعده، والتكرار آمن", async () => {
    const e = await createExpense(ACTOR, input());
    await voidExpense(ACTOR, e.id, "سجّل بالخطأ");
    assert.equal(T.platformExpense.rows.length, 1);
    assert.ok(T.platformExpense.rows[0].voidedAt);
    await assert.rejects(updateExpense(ACTOR, e.id, { amount: 1 }, "محاولة"), (er: FinanceError) => er.status === 409);
    const auditsBefore = T.auditLog.rows.length;
    await voidExpense(ACTOR, e.id, "مرة ثانية");
    assert.equal(T.auditLog.rows.length, auditsBefore); // لا قيد تدقيق مكرر
  });
});

describe("لقطات الإسناد وCOD", () => {
  const courier = (wage: number | null) => T.cityCourier.rows.push({ id: "c1", commissionPerShipment: wage }, { id: "c2", commissionPerShipment: 9 });
  const shipmentRow = () => { const s = seedShipment({ courierId: null }); return s; };

  test("الإسناد يثبّت الأجر وقيمة التوصيل والتكلفة المباشرة، ولا يتكرر لنفس المندوب", async () => {
    courier(7);
    T.platformSetting.rows.push({ id: "p1", key: "finance.local_direct_cost_sar", value: "2.5" });
    const s = shipmentRow();
    const first = await snapshotCourierAssignment(fake.db as never, { shipmentId: s.id, courierId: "c1" });
    assert.equal(Number(first!.wageSnapshot), 7);
    assert.equal(Number(first!.deliveryFeeSnapshot), 10);
    assert.equal(Number(first!.directCostSnapshot), 2.5);
    const again = await snapshotCourierAssignment(fake.db as never, { shipmentId: s.id, courierId: "c1" });
    assert.equal(again!.id, first!.id);
    assert.equal(T.courierAssignment.rows.length, 1);
  });

  test("تغيير أجر المندوب لاحقاً لا يغيّر لقطة الشحنة القديمة", async () => {
    courier(7);
    const s = shipmentRow();
    await snapshotCourierAssignment(fake.db as never, { shipmentId: s.id, courierId: "c1" });
    T.cityCourier.rows.find((c) => c.id === "c1")!.commissionPerShipment = 12;
    assert.equal(Number(T.courierAssignment.rows[0].wageSnapshot), 7);
    const s2 = shipmentRow();
    const next = await snapshotCourierAssignment(fake.db as never, { shipmentId: s2.id, courierId: "c1" });
    assert.equal(Number(next!.wageSnapshot), 12);
  });

  test("إعادة الإسناد لمندوب آخر تُنهي السابق وتبقي إسناداً فعّالاً واحداً (لا مضاعفة)", async () => {
    courier(7);
    const s = shipmentRow();
    await snapshotCourierAssignment(fake.db as never, { shipmentId: s.id, courierId: "c1" });
    await snapshotCourierAssignment(fake.db as never, { shipmentId: s.id, courierId: "c2", reason: "المندوب الأول اعتذر" });
    const active = T.courierAssignment.rows.filter((a) => a.supersededAt === null);
    assert.equal(active.length, 1);
    assert.equal(active[0].courierId, "c2");
    assert.equal(T.courierAssignment.rows.find((a) => a.courierId === "c1")!.supersededReason, "المندوب الأول اعتذر");
  });

  test("مندوب بلا أجر مضبوط: اللقطة null (غير موثقة) لا قيمة مخترعة", async () => {
    courier(null);
    const s = shipmentRow();
    const a = await snapshotCourierAssignment(fake.db as never, { shipmentId: s.id, courierId: "c1" });
    assert.equal(a!.wageSnapshot, null);
  });

  const codOrder = () => { const o = { id: "cod1", paymentMethod: "CASH_ON_DELIVERY", codFee: 10, total: 200, createdAt: new Date("2026-11-10T09:00:00Z"), codCarrierShare: null, status: "DELIVERED", storeId: "s1" }; T.order.rows.push(o); return o; };
  const terms = (over: object) => T.carrierCodTerms.rows.push({ id: `t${Math.random()}`, carrierKey: "ARAMEX", fixedShare: null, percentShare: null, percentBasis: null, effectiveFrom: new Date("2026-01-01"), ...over });

  test("COD: حصة الناقل تُثبَّت وقت الطلب بحسب الشروط السارية، ولا تُعاد كتابتها", async () => {
    codOrder(); terms({ fixedShare: 4 });
    assert.equal(await snapshotCodShare(fake.db as never, "cod1", "ARAMEX"), "SET");
    assert.equal(Number(T.order.rows[0].codCarrierShare), 4);
    terms({ fixedShare: 9, effectiveFrom: new Date("2026-12-01") }); // شروط لاحقة لا تمسّ الطلب
    assert.equal(await snapshotCodShare(fake.db as never, "cod1", "ARAMEX"), "SKIPPED");
    assert.equal(Number(T.order.rows[0].codCarrierShare), 4);
  });

  test("COD: شروط تسري بعد الطلب أو غائبة → «ناقص» بلا اختراع حصة، ونسبة بلا أساس مرفوضة", async () => {
    codOrder(); terms({ fixedShare: 4, effectiveFrom: new Date("2026-12-01") });
    assert.equal(await snapshotCodShare(fake.db as never, "cod1", "ARAMEX"), "INCOMPLETE");
    assert.equal(T.order.rows[0].codCarrierShare, null);
    T.carrierCodTerms.rows = []; terms({ percentShare: 2, percentBasis: null });
    assert.equal(await snapshotCodShare(fake.db as never, "cod1", "ARAMEX"), "INCOMPLETE");
    T.carrierCodTerms.rows = []; terms({ percentShare: 2, percentBasis: "ORDER_TOTAL", fixedShare: 1 });
    assert.equal(await snapshotCodShare(fake.db as never, "cod1", "ARAMEX"), "SET");
    assert.equal(Number(T.order.rows[0].codCarrierShare), 5); // 1 + 2% × 200
  });
});
