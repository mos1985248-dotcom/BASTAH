"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { api } from "@/lib/api-client";
import s from "@/components/dashboard/forms.module.css";

type Variant = { id: string; nameAr?: string; options: { value: string }[]; quantity: number };
type Receipt = { id: string; quantity: number; unitCostMinor: number; variantName: string | null; createdAt: string };
type History = { receipts: Receipt[]; nextCursor: string | null };

const money = new Intl.NumberFormat("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const date = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Riyadh",
});

export default function StockReceiptsCard({ productId, variants, quantity, canReceive, onSaved }: {
  productId: string; variants: Variant[]; quantity: number; canReceive: boolean; onSaved: () => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [history, setHistory] = useState<History | null>(null);
  const [quantityInput, setQuantityInput] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [variantId, setVariantId] = useState("");
  const [busy, setBusy] = useState(false);
  const [historyBusy, setHistoryBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const path = `/api/products/${productId}/stock-receipts`;

  async function loadHistory(cursor?: string) {
    setHistoryBusy(true);
    setHistoryError("");
    try {
      const result = await api.get<History>(cursor ? `${path}?cursor=${encodeURIComponent(cursor)}` : path);
      setHistory(previous => ({
        ...result,
        receipts: cursor ? [...(previous?.receipts ?? []), ...result.receipts] : result.receipts,
      }));
    } catch {
      setHistoryError("تعذّر تحميل سجل الكميات.");
    } finally { setHistoryBusy(false); }
  }
  useEffect(() => { void loadHistory(); }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (window.location.hash !== "#add-stock") return;
    sectionRef.current?.scrollIntoView({ block: "start" });
    sectionRef.current?.focus({ preventScroll: true });
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");
    const id = requestId ?? crypto.randomUUID();
    setRequestId(id);
    setBusy(true);
    try {
      await api.post(path, {
        requestId: id,
        variantId: variants.length ? variantId : null,
        quantity: Number(quantityInput),
        unitPrice,
      });
      setQuantityInput("");
      setUnitPrice("");
      setRequestId(null);
      setNotice("تمت إضافة الكمية إلى المخزون.");
      onSaved();
      await loadHistory();
    } catch (error) {
      setError(error instanceof Error ? error.message : "تعذّر تسجيل الكمية.");
    } finally { setBusy(false); }
  }

  return (
    <section id="add-stock" ref={sectionRef} tabIndex={-1} className={`${s.panel} ${s.stockSection}`} aria-label="إضافة كمية للمخزون" dir="rtl">
      <div className={s.panelHead}><h2 className={s.panelTitle}>إضافة كمية للمخزون</h2></div>
      <div className={s.panelBody}>
      {variants.length === 0 && <p>الرصيد الحالي <strong>{quantity}</strong></p>}
      {canReceive && <form className={s.formBox} onSubmit={save}>
        {variants.length > 0 && <label className={s.fieldWrap}>
          <span className={s.fieldLabel}>خيار المنتج</span>
          <select className={s.field} value={variantId} required disabled={busy} onChange={event => {
            setVariantId(event.target.value);
            setRequestId(null);
          }}>
            <option value="">اختر الخيار</option>
            {variants.map(variant => <option key={variant.id} value={variant.id}>{variant.nameAr || variant.options[0]?.value} · الرصيد {variant.quantity}</option>)}
          </select>
        </label>}
        <label className={s.fieldWrap}>
          <span className={s.fieldLabel}>الكمية المضافة</span>
          <input className={s.field} type="number" min={1} max={1_000_000} step={1} required disabled={busy}
            value={quantityInput} onChange={event => { setQuantityInput(event.target.value); setRequestId(null); }} />
        </label>
        <label className={s.fieldWrap}>
          <span className={s.fieldLabel}>سعر شراء الوحدة (ريال)</span>
          <input className={s.field} type="number" min={0} max={999999.99} step="0.01" required disabled={busy}
            value={unitPrice} onChange={event => { setUnitPrice(event.target.value); setRequestId(null); }} />
        </label>
        <p className={s.sub}>يُسجّل التاريخ تلقائيًا بتوقيت الرياض.</p>
        <button type="submit" className={s.cta} disabled={busy || historyBusy}>{busy ? "جارٍ الحفظ…" : "إضافة الكمية"}</button>
      </form>}
      {!canReceive && <p className={s.sub}>إضافة الكمية متاحة للمنتجات التي يُتتبّع مخزونها.</p>}
      {notice && <p role="status">{notice}</p>}
      {error && <p className={s.err} role="alert">{error}</p>}
      <details>
        <summary>سجل الكميات المضافة</summary>
        {historyError && <p role="alert">{historyError} <button type="button" disabled={busy || historyBusy} onClick={() => loadHistory()}>إعادة المحاولة</button></p>}
        {history?.receipts.length === 0 && <p>لا توجد إضافات مسجّلة بعد.</p>}
        {!!history?.receipts.length && <ul>
          {history.receipts.map(receipt => <li key={receipt.id}>
            <time dateTime={receipt.createdAt}>{date.format(new Date(receipt.createdAt))}</time>
            {receipt.variantName && ` · ${receipt.variantName}`}
            {` · ${receipt.quantity} وحدة · ${money.format(receipt.unitCostMinor / 100)} ريال للوحدة`}
          </li>)}
        </ul>}
        {history?.nextCursor && <button type="button" disabled={busy || historyBusy} onClick={() => loadHistory(history.nextCursor ?? undefined)}>عرض المزيد</button>}
      </details>
      </div>
    </section>
  );
}
