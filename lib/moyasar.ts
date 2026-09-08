// lib/moyasar.ts
// عميل Moyasar — كل استدعاء يستخدم مفتاح التاجر الخاص (وليس مفتاحاً مركزياً
// للمنصة)، لأن كل تاجر يربط حسابه الخاص في Moyasar (قرار أحمد بالباقات).
//
// ⚠️ تصحيح معماري مهم (بعد مراجعة توثيق Moyasar الرسمي الحالي):
// الكود القديم كان يستخدم Payments API مباشرة بـ source:{type:"creditcard"}
// بدون أي بيانات بطاقة (name/number/month/year/cvc) — وهذه حقول مطلوبة
// إلزامياً حسب Moyasar، فالاستدعاء القديم كان سيفشل بخطأ تحقق 400 دائماً،
// ولم يكن يعمل فعلياً قط. الحل الصحيح لتدفق "استضافة صفحة الدفع" (بدون أن
// نجمع بيانات البطاقة على خوادمنا) هو Invoices API: ننشئ Invoice برابط
// صفحة دفع مُستضافة من Moyasar، نوجّه المشتري له، وهو يختار ويُدخل وسيلة
// الدفع هناك مباشرة — بطاقة/مدى/Apple Pay/STC Pay حسب ما فعّله التاجر.

const MOYASAR_API = "https://api.moyasar.com/v1";

export class MoyasarError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "MoyasarError";
  }
}

function authHeader(secretKey: string): string {
  return "Basic " + Buffer.from(`${secretKey}:`).toString("base64");
}

// ── Payments (قراءة/استرداد فقط — الإنشاء يتم عبر Invoices أدناه) ──

export interface MoyasarPayment {
  id: string;
  status: string; // initiated | paid | failed | authorized | captured | refunded | voided | verified
  amount: number;
  fee: number;
  currency: string;
  refunded: number;
  captured: number;
  invoice_id?: string | null;
  metadata?: Record<string, string> | null;
}

/** يجلب تفصيل عملية دفع من Moyasar — تحقق مباشر إضافي (مصالحة) بمعزل عن الـwebhook */
export async function fetchMoyasarPayment(secretKey: string, paymentId: string): Promise<MoyasarPayment> {
  const res = await fetch(`${MOYASAR_API}/payments/${paymentId}`, {
    headers: { Authorization: authHeader(secretKey) },
  });
  if (!res.ok) throw new MoyasarError("تعذّر جلب تفاصيل عملية الدفع", res.status);
  return res.json();
}

/** استرداد (كلي أو جزئي) لعملية دفع مكتملة — يُستخدم عند إلغاء طلب مدفوع */
export async function refundMoyasarPayment(secretKey: string, paymentId: string, amountHalalas?: number): Promise<MoyasarPayment> {
  const res = await fetch(`${MOYASAR_API}/payments/${paymentId}/refund`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader(secretKey) },
    body: JSON.stringify(amountHalalas !== undefined ? { amount: amountHalalas } : {}),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new MoyasarError(`فشل الاسترداد: ${body}`, res.status);
  }
  return res.json();
}

// ── Invoices (إنشاء صفحة دفع مُستضافة — هذا ما نستخدمه فعلياً للشراء) ──

export interface MoyasarInvoice {
  id: string;
  status: string; // initiated | paid | failed | refunded | canceled | on_hold | expired | voided
  amount: number;
  currency: string;
  url: string; // رابط صفحة الدفع المُستضافة — نوجّه المشتري له
  success_url?: string | null;
  payments?: MoyasarPayment[];
}

interface CreateInvoiceParams {
  secretKey: string;
  amountHalalas: number; // Moyasar يتعامل بالهللة (1 ر.س = 100 هللة)
  description: string;
  successUrl: string;
  metadata: Record<string, string>;
}

/** ينشئ فاتورة Moyasar (Invoice) — يرجع رابط صفحة الدفع المُستضافة للتوجيه إليه */
export async function createMoyasarInvoice(params: CreateInvoiceParams): Promise<MoyasarInvoice> {
  const { secretKey, amountHalalas, description, successUrl, metadata } = params;

  const res = await fetch(`${MOYASAR_API}/invoices`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader(secretKey) },
    body: JSON.stringify({
      amount: amountHalalas,
      currency: "SAR",
      description,
      success_url: successUrl,
      metadata,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new MoyasarError(`فشل إنشاء فاتورة الدفع: ${body}`, res.status);
  }

  return res.json();
}

/** يجلب فاتورة (وحالتها ودفعاتها) — يُستخدم للمصالحة عند تأخر الـwebhook */
export async function fetchMoyasarInvoice(secretKey: string, invoiceId: string): Promise<MoyasarInvoice> {
  const res = await fetch(`${MOYASAR_API}/invoices/${invoiceId}`, {
    headers: { Authorization: authHeader(secretKey) },
  });
  if (!res.ok) throw new MoyasarError("تعذّر جلب تفاصيل الفاتورة", res.status);
  return res.json();
}

/** يتحقق أن مفتاح التاجر صالح فعلاً (يُستخدم عند ربط الحساب لأول مرة) */
export async function validateMoyasarKey(secretKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${MOYASAR_API}/payments?page=1&per=1`, {
      headers: { Authorization: authHeader(secretKey) },
    });
    // 200 = مفتاح صحيح وله صلاحية قراءة. 401 = مفتاح خاطئ.
    return res.status === 200;
  } catch {
    return false;
  }
}

/** يُحوَّل ريال.هللة إلى هللات صحيحة — يتجنّب أخطاء الفاصلة العشرية في float */
export function toHalalas(sar: number): number {
  return Math.round(sar * 100);
}
