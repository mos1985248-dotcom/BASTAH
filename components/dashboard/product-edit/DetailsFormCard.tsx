// components/dashboard/product-edit/DetailsFormCard.tsx
import { Loader2, Sparkles } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import s from "../forms.module.css";

interface FormState {
  nameAr: string; nameEn: string; price: string; quantity: string; shortDescAr: string; shortDescEn: string;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className={s.fieldWrap}>
      <span className={s.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

export default function DetailsFormCard({
  form, onChange, onTranslate, translating, onSave, saving, quantityLocked,
}: {
  form: FormState;
  onChange: (k: keyof FormState, v: string) => void;
  onTranslate: () => void;
  translating: boolean;
  onSave: () => void;
  saving: boolean;
  quantityLocked?: boolean;
}) {
  return (
    <section className={s.panel} style={uiVars} aria-labelledby="pe-details">
      <div className={s.panelHead}><h2 id="pe-details" className={s.panelTitle}>البيانات</h2></div>
      <div className={s.panelBody}>
        <Field label="اسم المنتج">
          <input className={s.field} value={form.nameAr} onChange={(e) => onChange("nameAr", e.target.value)} />
        </Field>
        <div className={s.two}>
          <Field label="السعر (ر.س)">
            <input className={`${s.field} ${s.ltr}`} type="number" value={form.price} onChange={(e) => onChange("price", e.target.value)} />
          </Field>
          <Field label="الكمية">
            <input
              className={`${s.field} ${s.ltr}`}
              type="number"
              value={form.quantity}
              onChange={(e) => onChange("quantity", e.target.value)}
              disabled={quantityLocked}
              title={quantityLocked ? "تُحسب من كميات المتغيرات" : undefined}
            />
          </Field>
        </div>
        <Field label="وصف مختصر (عربي)">
          <textarea className={`${s.field} ${s.area}`} value={form.shortDescAr} onChange={(e) => onChange("shortDescAr", e.target.value)} rows={3} />
        </Field>

        <button type="button" className={`${s.cta} ${s.ghost}`} onClick={onTranslate} disabled={translating || !form.nameAr} style={{ alignSelf: "flex-start" }}>
          {translating ? <Loader2 size={15} strokeWidth={1.9} aria-hidden="true" /> : <Sparkles size={15} strokeWidth={1.8} aria-hidden="true" />}
          {translating ? "جاري الترجمة بمنيرة..." : "ترجمة للإنجليزي تلقائياً (منيرة)"}
        </button>

        <div className={s.two}>
          <Field label="Product name (English)">
            <input className={`${s.field} ${s.ltr}`} value={form.nameEn} onChange={(e) => onChange("nameEn", e.target.value)} />
          </Field>
          <Field label="Short description (English)">
            <textarea className={`${s.field} ${s.ltr}`} style={{ minHeight: 48, padding: "12px 14px" }} value={form.shortDescEn} onChange={(e) => onChange("shortDescEn", e.target.value)} rows={2} />
          </Field>
        </div>

        <button type="button" className={s.cta} onClick={onSave} disabled={saving}>
          {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>
    </section>
  );
}
