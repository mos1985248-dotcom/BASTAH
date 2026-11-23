import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeMonth } from "../../lib/finance/engine";
import { baseInput, d, ext, local, settlement } from "./helpers";

test("شحن خارجي: 3 ريال لكل شحنة مسلَّمة (basitaFee التاريخية)، وليس كامل قيمة الشحن", () => {
  const s = summarizeMonth(baseInput({ shipments: [ext(), ext(), ext({ basitaFeeMinor: 500 })] }));
  assert.equal(s.external.accruedMinor, 300 + 300 + 500);
  assert.equal(s.external.eligibleCount, 3);
});

test("الطلب الملغى/المسترد والشحنة الفاشلة لا يستحق عنهما عمولة", () => {
  const s = summarizeMonth(baseInput({ shipments: [ext(), ext({ orderStatus: "CANCELLED" }), ext({ orderStatus: "REFUNDED" }), ext({ status: "RETURNED" }), ext({ status: "FAILED", deliveredAt: null })] }));
  assert.equal(s.external.eligibleCount, 1);
  assert.equal(s.external.accruedMinor, 300);
});

test("بسطة للشحن المحلي: لا عمولة شحن خارجي عليها، والهامش = التوصيل − الأجر − المباشر", () => {
  const s = summarizeMonth(baseInput({ shipments: [local("c1", { assignment: { wageMinor: 700, deliveryFeeMinor: 1000, directCostMinor: 50 } })] }));
  assert.equal(s.external.accruedMinor, 0);
  assert.equal(s.local.deliveryFeeMinor, 1000);
  assert.equal(s.local.courierWagesMinor, 700);
  assert.equal(s.local.directCostMinor, 50);
  assert.equal(s.local.marginMinor, 250);
});

test("مندوب أنجز 100 شحنة بأجر 7: المستحق 700، ودفعة 500 تُبقي 200", () => {
  const ships = Array.from({ length: 100 }, () => local("c1"));
  const s = summarizeMonth(baseInput({ shipments: ships, settlements: [settlement("p1", "COURIER_PAYOUT", "c1", 50000)] }));
  const line = s.couriers.lines.find((l) => l.courierId === "c1")!;
  assert.equal(line.deliveredCount, 100);
  assert.equal(line.accruedMinor, 70000);
  assert.equal(line.paidMinor, 50000);
  assert.equal(line.balanceMinor, 20000);
  assert.equal(s.couriers.balanceMinor, 20000);
});

test("قيد عكسي لدفعة خاطئة يعيد الرصيد ولا يحذف الأثر", () => {
  const ships = [local("c1"), local("c1")];
  const settlements = [settlement("p1", "COURIER_PAYOUT", "c1", 1400), settlement("p1x", "COURIER_PAYOUT", "c1", 1400, { isReversal: true })];
  const line = summarizeMonth(baseInput({ shipments: ships, settlements })).couriers.lines[0];
  assert.equal(line.paidMinor, 0);
  assert.equal(line.balanceMinor, 1400);
});

test("تغيير أجر المندوب لاحقاً لا يغيّر القديم: كل شحنة بلقطتها", () => {
  const old = local("c1", { assignment: { wageMinor: 700, deliveryFeeMinor: 1000, directCostMinor: 0 } });
  const fresh = local("c1", { assignment: { wageMinor: 900, deliveryFeeMinor: 1200, directCostMinor: 0 } });
  const s = summarizeMonth(baseInput({ shipments: [old, fresh] }));
  assert.equal(s.couriers.lines[0].accruedMinor, 1600);
});

test("إعادة الإسناد: المستحق للمندوب النهائي فقط ولا يتضاعف", () => {
  // الشحنة كانت لـc1 ثم أُعيد إسنادها لـc2 وسُلّمت: الصف الحالي courierId = c2
  const s = summarizeMonth(baseInput({ shipments: [local("c2")] }));
  assert.equal(s.couriers.lines.find((l) => l.courierId === "c1"), undefined);
  assert.equal(s.couriers.lines.find((l) => l.courierId === "c2")!.accruedMinor, 700);
});

test("شحنات محلية قديمة بلا قيم تاريخية: «غير موثقة» وتقديرها منفصل ولا يدخل المجاميع", () => {
  const legacy = local("c1", { assignment: null, orderShippingCostMinor: 1000, courierCurrentWageMinor: 700 });
  const s = summarizeMonth(baseInput({ shipments: [legacy, local("c1")] }));
  assert.equal(s.local.undocumentedCount, 1);
  assert.equal(s.local.deliveryFeeMinor, 1000); // الموثقة فقط
  assert.equal(s.local.estimatedAtCurrentRates.count, 1);
  assert.equal(s.local.estimatedAtCurrentRates.marginMinor, 300);
  assert.ok(s.flags.some((f) => f.code === "LOCAL_UNDOCUMENTED"));
});

test("COD: صافي حصة بسطة = رسم العميل − حصة الناقل المحفوظة، ولا يُحتسب كاملاً ربحاً", () => {
  const s = summarizeMonth(baseInput({ shipments: [ext({ paymentMethod: "CASH_ON_DELIVERY", codFeeMinor: 1000, codCarrierShareMinor: 400 })] }));
  assert.equal(s.cod.customerFeesGrossMinor, 1000);
  assert.equal(s.cod.carrierSharesMinor, 400);
  assert.equal(s.cod.netShareMinor, 600);
});

test("COD: طلب متعدد الشحنات يُحتسب رسمه مرة واحدة", () => {
  const a = ext({ orderId: "multi", paymentMethod: "CASH_ON_DELIVERY", codFeeMinor: 1000, codCarrierShareMinor: 400 });
  const b = ext({ orderId: "multi", paymentMethod: "CASH_ON_DELIVERY", codFeeMinor: 1000, codCarrierShareMinor: 400 });
  const s = summarizeMonth(baseInput({ shipments: [a, b] }));
  assert.equal(s.cod.eligibleCount, 1);
  assert.equal(s.cod.customerFeesGrossMinor, 1000);
  assert.equal(s.external.eligibleCount, 1); // وعمولة الشحن لمرة واحدة كذلك
});

test("COD بلا حصة ناقص محفوظة: إعداد تكلفة ناقص، ولا نخترع حصة", () => {
  const s = summarizeMonth(baseInput({ shipments: [ext({ paymentMethod: "CASH_ON_DELIVERY", codFeeMinor: 1000, codCarrierShareMinor: null })] }));
  assert.equal(s.cod.incompleteCount, 1);
  assert.equal(s.cod.netShareMinor, 0);
  assert.ok(s.flags.some((f) => f.code === "COD_COST_SETUP_INCOMPLETE"));
});

test("المستحق غير المحصَّل يظهر رصيداً مفتوحاً، والتحصيل الجزئي يخفضه", () => {
  const ships = [ext(), ext(), ext()];
  const s = summarizeMonth(baseInput({ shipments: ships, settlements: [settlement("r1", "COMMISSION_RECEIPT", "st1", 300)] }));
  assert.equal(s.external.accruedMinor, 900);
  assert.equal(s.external.receivedMinor, 300);
  assert.equal(s.external.outstandingMinor, 600);
});

test("الأرصدة التراكمية تشمل أشهراً سابقة بينما المستحق الشهري لشهره فقط", () => {
  const older = ext({ deliveredAt: d("2026-09-15T09:00:00Z") });
  const s = summarizeMonth(baseInput({ shipments: [older, ext()] }));
  assert.equal(s.external.accruedMinor, 300);
  assert.equal(s.external.outstandingMinor, 600);
});

test("شحنة سُلّمت بعد نهاية الشهر لا تظهر في أرصدته", () => {
  const future = ext({ deliveredAt: d("2026-12-03T09:00:00Z") });
  assert.equal(summarizeMonth(baseInput({ shipments: [future] })).external.outstandingMinor, 0);
});
