"use client";

import { useId, useState } from "react";
import { Calculator, ChevronDown } from "lucide-react";
import {
  calculatePricing, emptyPricing, fixedFees, formatMinor, productCosts, variableFees, withStoreVat, type PricingInput,
} from "@/lib/pricing/product-pricing";
import { DashboardField } from "../DashboardField";
import form from "../forms.module.css";
import s from "./pricing.module.css";

const money = (value: bigint) => `${formatMinor(value)} ر.س`;

interface Props {
  value: PricingInput | null;
  onChange: (input: PricingInput | null) => void;
  price: string;
  onPrice: (price: string) => void;
  savedAt?: string;
  disabled?: boolean;
  dirty?: boolean;
  vatRate: string;
}

export default function ProductPricingCalculator({ value, onChange, price, onPrice, savedAt, disabled, dirty, vatRate }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const input = withStoreVat(value ?? emptyPricing, vatRate);
  const set = <K extends keyof PricingInput>(key: K, next: PricingInput[K]) => onChange({ ...input, [key]: next });
  const result = calculatePricing(input, price, "beforeVat");
  const valid = "error" in result ? null : result;
  const suggested = valid?.suggested;
  const current = valid?.current;
  const isInclusive = input.vatMode === "inclusive";

  return (
    <section className={form.panel} dir="rtl" aria-labelledby={id}>
      <div className={form.panelHead}>
        <button type="button" className={s.toggle} aria-expanded={open} aria-controls={`${id}-details`} onClick={() => setOpen(!open)}>
          <span id={id}><Calculator size={20} aria-hidden="true" />حاسبة تسعير المنتج</span>
          <span>{open ? "إخفاء التفاصيل" : "إظهار التفاصيل"}<ChevronDown size={16} aria-hidden="true" /></span>
        </button>
      </div>
      {open && (
        <fieldset disabled={disabled} id={`${id}-details`} className={`${form.panelBody} ${s.body}`}>
          <p className={form.sub}>احسب تكلفة منتجك وحدد سعر بيع يحقق لك الربح المناسب.</p>
          <h3>تكلفة المنتج للوحدة (ر.س)</h3>
          <div className={form.two}>
            {productCosts.map(([key, label]) => <DashboardField key={key} label={label} type="number" value={input[key]} onChange={v => set(key, v)} />)}
          </div>
          <h3>تكاليف البيع التي تتحملها</h3>
          <p className={form.sub}>اترك الرسوم غير المطبّقة فارغة، وسجّل كل تكلفة مرة واحدة فقط.</p>
          <div className={form.two}>
            {[...fixedFees, ...variableFees].map(([key, label]) => <DashboardField key={key} label={label} type="number" value={input[key]} onChange={v => set(key, v)} />)}
          </div>
          <div data-margin><DashboardField label="هامش الربح المستهدف (%)" type="number" value={input.targetMargin} onChange={v => set("targetMargin", v)} /></div>
          <div className={s.presets} aria-label="نسب هامش الربح">
            {["15", "20", "25", "30", "40"].map(rate => (
              <button key={rate} type="button" aria-pressed={input.targetMargin === rate} onClick={() => set("targetMargin", rate)}>{rate}%</button>
            ))}
            <button type="button" onClick={e => e.currentTarget.closest("fieldset")?.querySelector<HTMLInputElement>("[data-margin] input")?.focus()}>نسبة مخصصة</button>
          </div>
          <p className={form.sub}>هامش الربح هو الربح مقسومًا على سعر البيع قبل الضريبة. نسبة الزيادة هي الربح مقسومًا على التكلفة.</p>
          <div className={form.two}>
            <label className={form.fieldWrap}>
              <span className={form.fieldLabel}>تقريب السعر للتسويق</span>
              <select className={form.field} value={input.rounding} onChange={e => set("rounding", e.target.value as PricingInput["rounding"])}>
                <option value="none">بدون تقريب تسويقي</option><option value="99">أقرب سعر ينتهي بـ .99</option>
                <option value="90">أقرب سعر ينتهي بـ .90</option><option value="whole">أقرب ريال كامل</option>
              </select>
            </label>
            {input.vatMode !== "none" && <label className={form.fieldWrap}>
              <span className={form.fieldLabel}>عرض السعر المقترح</span>
              <select className={form.field} value={input.vatMode} onChange={e => set("vatMode", e.target.value as PricingInput["vatMode"])}>
                <option value="exclusive">قبل الضريبة</option><option value="inclusive">شامل الضريبة</option>
              </select>
            </label>}
          </div>
          {input.vatMode !== "none" && <p className={form.sub}>ضريبة متجرك {vatRate}%. التقريب والاعتماد يطبّقان على السعر قبل الضريبة. تُضاف الضريبة عند الدفع.</p>}
          {"error" in result && <p className={form.err} role="alert">{result.error}</p>}
          {valid && <div className={s.results} aria-live="polite">
            <p>سعر البيع المقترح</p>
            <strong className={s.price} dir="ltr">{suggested ? money(isInclusive ? suggested.gross : suggested.net) : "—"}</strong>
            {input.vatMode !== "none" && <p>{isInclusive ? "شامل الضريبة" : "قبل الضريبة"}</p>}
            <dl className={s.metrics}>
              <div><dt>إجمالي تكلفة المنتج</dt><dd>{money(valid.productCost)}</dd></div>
              {suggested && <>
                <div><dt>تكلفة الوحدة مع رسوم البيع الثابتة</dt><dd>{money(valid.cost)}</dd></div>
                <div><dt>رسوم البيع المتوقعة</dt><dd>{money(suggested.fees)}</dd></div>
                <div><dt>صافي الربح المتوقع للوحدة</dt><dd>{money(suggested.profit)}</dd></div>
                <div><dt>هامش الربح الفعلي</dt><dd>{suggested.margin === null ? "—" : `${formatMinor(suggested.margin)}%`}</dd></div>
                {input.vatMode !== "none" && <>
                  <div><dt>السعر قبل الضريبة</dt><dd>{money(suggested.net)}</dd></div>
                  <div><dt>السعر شامل الضريبة</dt><dd>{money(suggested.gross)}</dd></div>
                  <div><dt>الضريبة</dt><dd>{money(suggested.tax)}</dd></div>
                </>}
              </>}
              {current && <>
                <div><dt>سعر البيع في الحقل</dt><dd>{money(current.price)}</dd></div>
                {valid.difference !== null && <div><dt>الفرق عن السعر المقترح</dt><dd>{money(valid.difference)}</dd></div>}
                <div><dt>الربح الصافي بالسعر في الحقل</dt><dd>{money(current.profit)}</dd></div>
                <div><dt>الهامش بالسعر في الحقل</dt><dd>{current.margin === null ? "—" : `${formatMinor(current.margin)}%`}</dd></div>
              </>}
            </dl>
            {!suggested && <p>أدخل تكلفة للوحدة للحصول على سعر مقترح. يمكنك حفظ المنتج بسعر يدوي.</p>}
            {current && (current.profit < BigInt(0) || current.belowTarget) && (
              <p className={s.warning}>{current.profit < BigInt(0) ? "السعر في الحقل لا يغطي التكلفة ورسوم البيع." : "الهامش بالسعر في الحقل أقل من المستهدف."}</p>
            )}
            {suggested?.belowTarget && <p className={s.warning}>الهامش بعد التقريب أقل من المستهدف.</p>}
            {suggested && <label className={s.check}><input type="checkbox" checked={input.roundUp} onChange={e => set("roundUp", e.target.checked)} />التقريب للأعلى للحفاظ على الهامش</label>}
          </div>}
          {suggested && <button type="button" className={`${form.cta} ${s.apply}`} onClick={() => onPrice(formatMinor(suggested.net))}>اعتماد السعر المقترح</button>}
          {dirty && <button type="button" className={`${form.cta} ${form.ghost}`} onClick={() => onChange(null)}>تجاهل تغييرات الحاسبة</button>}
          {savedAt && <p className={form.sub}>آخر تحديث محفوظ للتكلفة: <bdi>{new Intl.DateTimeFormat("ar-SA", { calendar: "gregory", numberingSystem: "latn", dateStyle: "medium", timeZone: "Asia/Riyadh" }).format(new Date(savedAt))}</bdi></p>}
        </fieldset>
      )}
    </section>
  );
}
