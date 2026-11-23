import { test } from "node:test";
import assert from "node:assert/strict";
import { csvCell, toCsv } from "../../lib/finance/csv";
import { formatSar, toMinor } from "../../lib/finance/money";
import { monthRangeUtc, riyadhMonthOf } from "../../lib/finance/riyadh";
import { allocateOldestFirst, codCarrierShareMinor, pickTerms, validateRefund, validateSettlementAmount, type CodTerms } from "../../lib/finance/rules";

test("المال بالهللات دون أخطاء كسور", () => {
  assert.equal(toMinor(1.005), 101);
  assert.equal(toMinor("49.00"), 4900);
  assert.equal(toMinor(0.1 + 0.2), 30);
  assert.equal(toMinor(null), null);
  assert.equal(formatSar(-1234), "-12.34");
});

test("حدود شهر الرياض", () => {
  assert.equal(riyadhMonthOf(new Date("2026-10-31T21:00:00Z")).month, 11);
  assert.equal(riyadhMonthOf(new Date("2026-10-31T20:59:59Z")).month, 10);
  const { start, end } = monthRangeUtc({ year: 2026, month: 12 });
  assert.equal(start.toISOString(), "2026-11-30T21:00:00.000Z");
  assert.equal(end.toISOString(), "2026-12-31T21:00:00.000Z");
});

test("التسوية: جزئية وكاملة مسموحة، ومحاولة تجاوز المستحق مرفوضة", () => {
  assert.equal(validateSettlementAmount(50000, 70000).ok, true);
  assert.equal(validateSettlementAmount(70000, 70000).ok, true);
  assert.equal(validateSettlementAmount(70001, 70000).ok, false);
  assert.equal(validateSettlementAmount(0, 70000).ok, false);
});

test("الاسترداد لا يتجاوز المدفوع المتبقي", () => {
  assert.equal(validateRefund(9900, 3000, 6900).ok, true);
  assert.equal(validateRefund(9900, 3000, 6901).ok, false);
});

test("توزيع التسوية على الشحنات الأقدم أولاً دون تجاوز المتبقي، وبلا تخصيص فوق المستحق", () => {
  const items = [
    { shipmentId: "new", dueMinor: 700, allocatedMinor: 0, deliveredAt: new Date("2026-11-05") },
    { shipmentId: "old", dueMinor: 700, allocatedMinor: 200, deliveredAt: new Date("2026-11-01") },
  ];
  assert.deepEqual(allocateOldestFirst(800, items), [{ shipmentId: "old", amountMinor: 500 }, { shipmentId: "new", amountMinor: 300 }]);
  assert.equal(allocateOldestFirst(1300, items), null);
});

const terms = (over: Partial<CodTerms> = {}): CodTerms => ({ carrierKey: "ARAMEX", fixedShare: null, percentShare: null, percentBasis: null, effectiveFrom: new Date("2026-01-01"), ...over });

test("حصة COD: ثابتة، نسبة بأساس صريح، أو الاثنان؛ والأساس مطلوب للنسبة", () => {
  assert.equal(codCarrierShareMinor(terms({ fixedShare: 4 }), 20000, 1000), 400);
  assert.equal(codCarrierShareMinor(terms({ percentShare: 2, percentBasis: "ORDER_TOTAL" }), 20000, 1000), 400); // 2% من 200 ر.س
  assert.equal(codCarrierShareMinor(terms({ percentShare: 40, percentBasis: "COD_FEE" }), 20000, 1000), 400); // 40% من رسم COD
  assert.equal(codCarrierShareMinor(terms({ fixedShare: 2, percentShare: 1, percentBasis: "ORDER_TOTAL" }), 20000, 1000), 400);
  assert.equal(codCarrierShareMinor(terms({ percentShare: 2, percentBasis: null }), 20000, 1000), null); // لا نفترض الأساس
  assert.equal(codCarrierShareMinor(null, 20000, 1000), null); // لا نخترع حصة
});

test("اختيار شروط COD السارية وقت الطلب فلا يؤثر تعديل الإعدادات لاحقاً على القديم", () => {
  const all = [terms({ fixedShare: 3, effectiveFrom: new Date("2026-01-01") }), terms({ fixedShare: 5, effectiveFrom: new Date("2026-11-01") })];
  assert.equal(pickTerms(all, "ARAMEX", new Date("2026-10-15"))?.fixedShare, 3);
  assert.equal(pickTerms(all, "ARAMEX", new Date("2026-11-15"))?.fixedShare, 5);
  assert.equal(pickTerms(all, "SPL", new Date("2026-11-15")), null);
});

test("CSV: BOM وحماية حقن المعادلات وتهريب الفواصل والاقتباس والعربية", () => {
  assert.equal(csvCell("=HYPERLINK(\"x\")"), "\"'=HYPERLINK(\"\"x\"\")\"");
  assert.equal(csvCell("+1"), "'+1");
  assert.equal(csvCell("-5"), "'-5");
  assert.equal(csvCell("@SUM(A1)"), "'@SUM(A1)");
  assert.equal(csvCell("مندوب, أول"), "\"مندوب, أول\"");
  assert.equal(csvCell(-12.5), "-12.5");              // الأرقام لا تُسبق بفاصلة
  assert.equal(csvCell({ sar: 5050 }), "50.50");
  const csv = toCsv(["الاسم", "المبلغ"], [["علي", { sar: 700 }]]);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes("\r\n"));
  assert.ok(csv.includes("علي,7.00"));
});
