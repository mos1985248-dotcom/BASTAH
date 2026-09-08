// components/dashboard/product-edit/DetailsFormCard.tsx
import { Loader2, Sparkles } from "lucide-react";
import { t } from "@/theme";

interface FormState {
  nameAr: string; nameEn: string; price: string; quantity: string; shortDescAr: string; shortDescEn: string;
}

export default function DetailsFormCard({
  form,
  onChange,
  onTranslate,
  translating,
  onSave,
  saving,
}: {
  form: FormState;
  onChange: (k: keyof FormState, v: string) => void;
  onTranslate: () => void;
  translating: boolean;
  onSave: () => void;
  saving: boolean;
}) {
  const inputStyle = { padding: 10, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: t.typography.fontSize.sm, boxSizing: "border-box" as const };

  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.xl, padding: t.spacing["5"], marginBottom: t.spacing["4"] }}>
      <h3 style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: t.typography.fontSize.base, color: t.colors.text.dark }}>البيانات</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
        <input value={form.nameAr} onChange={(e) => onChange("nameAr", e.target.value)} placeholder="اسم المنتج" style={{ ...inputStyle, direction: "rtl" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: t.spacing["2"] }}>
          <input type="number" value={form.price} onChange={(e) => onChange("price", e.target.value)} placeholder="السعر" style={inputStyle} />
          <input type="number" value={form.quantity} onChange={(e) => onChange("quantity", e.target.value)} placeholder="الكمية" style={inputStyle} />
        </div>

        <textarea value={form.shortDescAr} onChange={(e) => onChange("shortDescAr", e.target.value)} placeholder="وصف مختصر (عربي)" rows={3} style={{ ...inputStyle, direction: "rtl", resize: "none" }} />

        <button
          onClick={onTranslate}
          disabled={translating || !form.nameAr}
          style={{
            padding: "9px 14px",
            background: t.colors.primary[100],
            border: "none",
            borderRadius: t.radius.md,
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.bold,
            color: t.colors.primary[800],
            cursor: "pointer",
            display: "flex",
            gap: t.spacing["1"],
            alignItems: "center",
          }}
        >
          {translating ? (
            <>
              <Loader2 size={13} strokeWidth={2} style={{ animation: "basita-spin 0.9s linear infinite" }} />
              جاري الترجمة بمنيرة...
            </>
          ) : (
            <>
              <Sparkles size={13} strokeWidth={1.8} />
              ترجمة للإنجليزي تلقائياً (منيرة)
            </>
          )}
        </button>

        <style>{`@keyframes basita-spin { to { transform: rotate(360deg); } }`}</style>

        <input value={form.nameEn} onChange={(e) => onChange("nameEn", e.target.value)} placeholder="Product name (English)" style={{ ...inputStyle, direction: "ltr" }} />
        <textarea value={form.shortDescEn} onChange={(e) => onChange("shortDescEn", e.target.value)} placeholder="Short description (English)" rows={2} style={{ ...inputStyle, direction: "ltr", resize: "none" }} />

        <button
          onClick={onSave}
          disabled={saving}
          style={{
            padding: 12,
            background: saving ? t.colors.primary[600] : t.colors.primary[800],
            color: t.colors.text.onDark,
            border: "none",
            borderRadius: t.radius.lg,
            fontWeight: t.typography.fontWeight.bold,
            cursor: "pointer",
          }}
        >
          {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>
    </div>
  );
}
