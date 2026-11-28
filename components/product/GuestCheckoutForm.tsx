"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { api, ApiError } from "@/lib/api-client";
import s from "./guest-checkout.module.css";

type Quote = { subtotal: number; shippingCost: number; codFee: number; taxAmount: number; total: number };
type Order = { orderId: string; orderNumber: string; total: number };

const fields = [
  { key: "name", label: "الاسم الكامل", autoComplete: "name", maxLength: 100 },
  { key: "phone", label: "الجوال السعودي", autoComplete: "tel", maxLength: 30 },
  { key: "city", label: "المدينة", autoComplete: "address-level2", maxLength: 100 },
  { key: "region", label: "المنطقة", autoComplete: "address-level1", maxLength: 100 },
  { key: "address", label: "عنوان التوصيل", autoComplete: "street-address", maxLength: 300 },
] as const;

export default function GuestCheckoutForm({ storeId, items, redirectPath, onComplete }: {
  storeId: string;
  items: { productId: string; variantId?: string; quantity: number }[];
  redirectPath: string;
  onComplete?: () => void;
}) {
  const [form, setForm] = useState({ name: "", phone: "", city: "", region: "", address: "" });
  const [quote, setQuote] = useState<Quote | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const requestId = useRef<string | null>(null);

  const attemptKey = "bastah:guest-attempt:" + storeId + ":" + items
    .map(({ productId, variantId, quantity }) => `${productId}:${variantId ?? ""}:${quantity}`).sort().join(",");
  const [recovering, setRecovering] = useState(true);

  useEffect(() => {
    let active = true;
    async function recover() {
      try {
        const attempt = sessionStorage.getItem(attemptKey);
        if (!attempt) return;
        requestId.current = attempt;
        const previous = await api.get<{ id: string; orderNumber: string; total: number }>(
          "/api/guest-checkout/status?attempt=" + encodeURIComponent(attempt),
        );
        if (!active) return;
        setOrder({ ...previous, orderId: previous.id });
        try { sessionStorage.removeItem(attemptKey); } catch { /* Storage may be unavailable. */ }
        onCompleteRef.current?.();
      } catch { /* The same attempt ID remains available for retries. */ }
      finally { if (active) setRecovering(false); }
    }
    void recover();
    return () => { active = false; };
  }, [attemptKey]);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);


  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || recovering) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    const payload = { ...form, storeId, items, paymentMethod: "CASH_ON_DELIVERY" };
    try {
      if (!quote) {
        setQuote(await api.post<Quote>("/api/guest-checkout/quote", payload));
        return;
      }
      requestId.current ??= crypto.randomUUID();
      try { sessionStorage.setItem(attemptKey, requestId.current); } catch { /* Retry remains available in this view. */ }
      setOrder(await api.post<Order>("/api/guest-checkout/confirm", {
        ...payload, requestId: requestId.current, expected: quote,
      }));
      setUncertain(false);
      try { sessionStorage.removeItem(attemptKey); } catch { /* Storage may be unavailable. */ }
      onComplete?.();
    } catch (cause) {
      const rejected = cause instanceof ApiError && cause.status < 500;
      if (quote && rejected && !uncertain && cause.status === 409) setQuote(null);
      if (quote && !rejected) setUncertain(true);
      setError(rejected ? cause.message : "تعذّر التحقق من النتيجة. حاول مرة أخرى من هنا.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  if (order) return (
    <div className={s.form} role="status">
      <h2>تم استلام طلبك</h2>
      <p>رقم الطلب <bdi>{order.orderNumber}</bdi></p>
      <p>الإجمالي {order.total.toFixed(2)} ر.س</p>
      <a href={`/guest-order?id=${encodeURIComponent(order.orderId)}`}>تابع طلبك</a>
    </div>
  );

  return (
    <form className={s.form} onSubmit={submit}>
      <h2>الشراء كزائر</h2>
      <a href={`/login?redirect=${encodeURIComponent(redirectPath)}`}>لديك حساب؟ سجّل الدخول</a>
      <fieldset disabled={busy || uncertain || recovering}>
        {fields.map(({ key, label, autoComplete, maxLength }) => (
          <label key={key}>{label}
            <input
              required maxLength={maxLength} autoComplete={autoComplete}
              type={key === "phone" ? "tel" : "text"} value={form[key]}
              onChange={(event) => {
                setForm({ ...form, [key]: event.target.value });
                setQuote(null);
              }}
            />
          </label>
        ))}
      </fieldset>
      <p>طريقة الدفع: الدفع عند الاستلام</p>
      {quote && (
        <dl className={s.totals}>
          {([
            ["المنتجات", quote.subtotal], ["الشحن", quote.shippingCost], ["رسوم الدفع", quote.codFee],
            ["الضريبة", quote.taxAmount], ["الإجمالي", quote.total],
          ] as const).map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value.toFixed(2)} ر.س</dd></div>
          ))}
        </dl>
      )}
      {error && <p role="alert">{error}</p>}
      <button disabled={busy || recovering}>{busy || recovering ? "لحظة من فضلك…" : quote ? "تأكيد الطلب" : "احسب تكلفة الطلب"}</button>
    </form>
  );
}
