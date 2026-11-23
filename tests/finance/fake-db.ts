// tests/finance/fake-db.ts — قاعدة بيانات في الذاكرة تحاكي ما تستعمله خدمات المركز المالي من Prisma، لتشغيل كود الخدمات الحقيقي.
// تحاكي: where (مساواة/in/notIn/not/lt/gte/…/علاقات متداخلة)، فرادة الحقول (P2002)، إنشاء متداخل للتخصيصات،
// ومعاملات متسلسلة بقفل + تراجع كامل عند الخطأ (كمحاكاة لـSerializable). ليست بديلاً عن اختبار قاعدة الاختبار الفعلية.
import { Prisma } from "@prisma/client";

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const clone = <T,>(v: T): T => structuredClone(v);

function matches(row: Row, where: Row = {}, resolve?: (key: string, row: Row, cond: Row) => boolean | undefined): boolean {
  return Object.entries(where).every(([key, cond]) => {
    if (cond === undefined) return true;
    if (resolve) { const r = resolve(key, row, cond as Row); if (r !== undefined && r !== null) return r as boolean; }
    const v = row[key];
    if (cond === null) return v === null || v === undefined;
    if (cond instanceof Date || typeof cond !== "object") return v instanceof Date && cond instanceof Date ? v.getTime() === cond.getTime() : v === cond;
    const c = cond as Row;
    if ("in" in c && !c.in.includes(v)) return false;
    if ("notIn" in c && c.notIn.includes(v)) return false;
    if ("not" in c && (c.not === null ? v === null || v === undefined : v === c.not)) return false;
    for (const op of ["lt", "lte", "gt", "gte"] as const) {
      if (op in c) {
        if (v === null || v === undefined) return false;
        const a = v instanceof Date ? v.getTime() : v; const b = c[op] instanceof Date ? c[op].getTime() : c[op];
        if (op === "lt" && !(a < b)) return false; if (op === "lte" && !(a <= b)) return false;
        if (op === "gt" && !(a > b)) return false; if (op === "gte" && !(a >= b)) return false;
      }
    }
    const operators = ["in", "notIn", "not", "lt", "lte", "gt", "gte"];
    if (Object.keys(c).some((k) => !operators.includes(k))) return v ? matches(v, c) : false; // علاقة متداخلة
    return true;
  });
}

class Table {
  rows: Row[] = [];
  seq = 0;
  constructor(public name: string, private uniques: string[] = [], private defaults: () => Row = () => ({})) {}
  findMany(args: Row = {}, resolve?: Parameters<typeof matches>[2]) {
    let out = this.rows.filter((r) => matches(r, args.where, resolve));
    if (args.orderBy) { const [[k, dir]] = Object.entries(args.orderBy); out = [...out].sort((a, b) => (a[k] > b[k] ? 1 : -1) * (dir === "desc" ? -1 : 1)); }
    return clone(args.take ? out.slice(0, args.take) : out);
  }
  findUnique(args: Row) { const r = this.rows.find((x) => matches(x, args.where)); return r ? clone(r) : null; }
  create(args: Row) {
    const data = { ...args.data }; delete data.allocations;
    for (const u of this.uniques) {
      if (data[u] !== undefined && data[u] !== null && this.rows.some((r) => r[u] === data[u])) throw new Prisma.PrismaClientKnownRequestError(`Unique constraint failed on ${u}`, { code: "P2002", clientVersion: "test", meta: { target: [u] } });
    }
    const row = { id: `${this.name}_${++this.seq}`, createdAt: new Date(), ...this.defaults(), ...data };
    this.rows.push(row);
    return clone(row);
  }
  update(args: Row) { const r = this.rows.find((x) => matches(x, args.where)); if (!r) throw new Error(`${this.name}: not found`); Object.assign(r, args.data); return clone(r); }
  updateMany(args: Row) { const hit = this.rows.filter((x) => matches(x, args.where)); hit.forEach((r) => Object.assign(r, args.data)); return { count: hit.length }; }
}

export function createFakeDb() {
  const t = {
    shipment: new Table("shipment"), order: new Table("order"), shippingRate: new Table("shippingRate"),
    courierAssignment: new Table("courierAssignment", [], () => ({ supersededAt: null, supersededReason: null, assignedAt: new Date() })),
    cityCourier: new Table("cityCourier"), carrierCodTerms: new Table("carrierCodTerms"), platformSetting: new Table("platformSetting", ["key"]),
    financeSettlement: new Table("financeSettlement", ["idempotencyKey", "reversalOfId"], () => ({ isReversal: false, reversalOfId: null })),
    financeSettlementAllocation: new Table("financeSettlementAllocation"),
    subscriptionInvoice: new Table("subscriptionInvoice"), subscriptionRefund: new Table("subscriptionRefund", ["idempotencyKey", "reversalOfId"], () => ({ isReversal: false, reversalOfId: null })),
    platformExpense: new Table("platformExpense", [], () => ({ voidedAt: null, voidReason: null, paidAt: null })), auditLog: new Table("auditLog"),
  };
  const failNext: { auditLog: boolean } = { auditLog: false };

  const withAllocations = (s: Row) => ({ ...s, allocations: t.financeSettlementAllocation.rows.filter((a) => a.settlementId === s.id).map(clone) });
  const settlementResolve = (key: string, row: Row, cond: Row) => {
    if (key !== "settlement") return undefined;
    const s = t.financeSettlement.rows.find((x) => x.id === row.settlementId);
    return s ? matches(s, cond) : false;
  };

  const db = {
    shipment: {
      findMany: async (a: Row) => t.shipment.findMany(a),
      findUnique: async (a: Row) => { const s = t.shipment.findUnique(a); if (!s) return null; return { ...s, order: t.order.findUnique({ where: { id: s.orderId } }) }; },
    },
    order: { findUnique: async (a: Row) => t.order.findUnique(a), update: async (a: Row) => t.order.update(a) },
    shippingRate: { findMany: async (a: Row) => t.shippingRate.findMany(a) },
    courierAssignment: {
      findMany: async (a: Row) => t.courierAssignment.findMany(a), create: async (a: Row) => t.courierAssignment.create(a),
      updateMany: async (a: Row) => t.courierAssignment.updateMany(a),
    },
    cityCourier: { findUnique: async (a: Row) => t.cityCourier.findUnique(a) },
    carrierCodTerms: { findMany: async (a: Row) => t.carrierCodTerms.findMany(a), create: async (a: Row) => t.carrierCodTerms.create(a) },
    platformSetting: { findUnique: async (a: Row) => t.platformSetting.findUnique(a) },
    financeSettlement: {
      findMany: async (a: Row) => t.financeSettlement.findMany(a),
      findUnique: async (a: Row & { include?: Row }) => { const s = t.financeSettlement.findUnique(a); return s ? (a.include?.allocations ? withAllocations(s) : s) : null; },
      create: async (a: Row & { data: Row; include?: Row }) => {
        const s = t.financeSettlement.create(a);
        for (const al of a.data.allocations?.create ?? []) t.financeSettlementAllocation.create({ data: { ...al, settlementId: s.id } });
        return a.include?.allocations ? withAllocations(s) : s;
      },
    },
    financeSettlementAllocation: { findMany: async (a: Row) => t.financeSettlementAllocation.findMany(a, settlementResolve) },
    subscriptionInvoice: { findUnique: async (a: Row) => t.subscriptionInvoice.findUnique(a) },
    subscriptionRefund: {
      findUnique: async (a: Row) => t.subscriptionRefund.findUnique(a), findMany: async (a: Row) => t.subscriptionRefund.findMany(a), create: async (a: Row) => t.subscriptionRefund.create(a),
    },
    platformExpense: { create: async (a: Row) => t.platformExpense.create(a), findUnique: async (a: Row) => t.platformExpense.findUnique(a), update: async (a: Row) => t.platformExpense.update(a) },
    auditLog: { create: async (a: Row) => { if (failNext.auditLog) { failNext.auditLog = false; throw new Error("audit failure"); } return t.auditLog.create(a); } },
  };

  // معاملات متسلسلة: قفل + نسخة احتياطية كاملة للتراجع عند الخطأ
  let lock: Promise<unknown> = Promise.resolve();
  const $transaction = async <T,>(fn: (tx: typeof db) => Promise<T>): Promise<T> => {
    const run = async () => {
      const backup = Object.fromEntries(Object.entries(t).map(([k, tb]) => [k, { rows: clone(tb.rows), seq: tb.seq }]));
      try { return await fn(db); }
      catch (e) { for (const [k, b] of Object.entries(backup)) { (t as Record<string, Table>)[k].rows = b.rows; (t as Record<string, Table>)[k].seq = b.seq; } throw e; }
    };
    const next = lock.then(run, run);
    lock = next.catch(() => undefined);
    return next;
  };

  return { db: { ...db, $transaction }, tables: t, failNext };
}

export type FakeDb = ReturnType<typeof createFakeDb>;
