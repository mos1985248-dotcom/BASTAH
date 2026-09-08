// components/admin/blog/BlogPostForm.tsx
import { AlertTriangle } from "lucide-react";
import { t } from "@/theme";
import { CATEGORY_OPTIONS } from "./types";

export interface BlogFormState {
  titleAr: string;
  slug: string;
  excerptAr: string;
  contentAr: string;
  coverImage: string;
  category: string;
  tagsInput: string;
  authorName: string;
  isPublished: boolean;
  isFeatured: boolean;
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid", borderRadius: 8, fontSize: 13, direction: "rtl", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 };

export default function BlogPostForm({
  form,
  onChange,
  onSubmit,
  submitting,
  error,
  isEdit,
}: {
  form: BlogFormState;
  onChange: (patch: Partial<BlogFormState>) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string;
  isEdit: boolean;
}) {
  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.xl, padding: t.spacing["5"], display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
      <div>
        <label style={labelStyle}>العنوان</label>
        <input style={{ ...inputStyle, borderColor: t.colors.cream.border }} value={form.titleAr} onChange={(e) => onChange({ titleAr: e.target.value })} placeholder="عنوان المقال" />
      </div>

      <div>
        <label style={labelStyle}>الرابط (slug) — أحرف إنجليزية صغيرة وأرقام وشرطات فقط</label>
        <input style={{ ...inputStyle, borderColor: t.colors.cream.border, direction: "ltr" }} value={form.slug} onChange={(e) => onChange({ slug: e.target.value })} placeholder="my-article-slug" />
      </div>

      <div>
        <label style={labelStyle}>مقتطف مختصر</label>
        <textarea style={{ ...inputStyle, borderColor: t.colors.cream.border, resize: "none" }} rows={2} value={form.excerptAr} onChange={(e) => onChange({ excerptAr: e.target.value })} />
      </div>

      <div>
        <label style={labelStyle}>المحتوى الكامل</label>
        <textarea style={{ ...inputStyle, borderColor: t.colors.cream.border, resize: "vertical" }} rows={10} value={form.contentAr} onChange={(e) => onChange({ contentAr: e.target.value })} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: t.spacing["2"] }}>
        <div>
          <label style={labelStyle}>التصنيف</label>
          <select style={{ ...inputStyle, borderColor: t.colors.cream.border }} value={form.category} onChange={(e) => onChange({ category: e.target.value })}>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>اسم الكاتب (اختياري)</label>
          <input style={{ ...inputStyle, borderColor: t.colors.cream.border }} value={form.authorName} onChange={(e) => onChange({ authorName: e.target.value })} placeholder="فريق بسطة" />
        </div>
      </div>

      <div>
        <label style={labelStyle}>رابط صورة الغلاف (اختياري)</label>
        <input style={{ ...inputStyle, borderColor: t.colors.cream.border, direction: "ltr" }} value={form.coverImage} onChange={(e) => onChange({ coverImage: e.target.value })} placeholder="https://..." />
      </div>

      <div>
        <label style={labelStyle}>الوسوم (افصلي بينها بفاصلة)</label>
        <input style={{ ...inputStyle, borderColor: t.colors.cream.border }} value={form.tagsInput} onChange={(e) => onChange({ tagsInput: e.target.value })} placeholder="تسويق, نصائح" />
      </div>

      <div style={{ display: "flex", gap: t.spacing["4"] }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <input type="checkbox" checked={form.isPublished} onChange={(e) => onChange({ isPublished: e.target.checked })} />
          نشر مباشرة
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => onChange({ isFeatured: e.target.checked })} />
          مقال مميّز
        </label>
      </div>

      {error && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 12, color: t.colors.semantic.danger }}>
          <AlertTriangle size={13} strokeWidth={1.8} />
          {error}
        </p>
      )}

      <button
        onClick={onSubmit}
        disabled={submitting}
        style={{ padding: 12, background: submitting ? t.colors.primary[600] : t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.md, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer" }}
      >
        {submitting ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إنشاء المقال"}
      </button>
    </div>
  );
}
