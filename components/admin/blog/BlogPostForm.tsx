// components/admin/blog/BlogPostForm.tsx
import { AlertTriangle, FileText, Image, Save } from "lucide-react";
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid",
  borderRadius: 9,
  fontSize: 13,
  direction: "rtl",
  boxSizing: "border-box",
  background: t.colors.white,
  color: t.colors.text.dark,
  outline: "none",
  transition: "border-color 160ms ease, box-shadow 160ms ease",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  display: "block",
  marginBottom: 6,
  color: t.colors.text.dark,
};

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
    <div
      dir="rtl"
      style={{
        background: t.colors.white,
        border: `1px solid ${t.colors.cream.border}`,
        borderRadius: t.radius.xl,
        padding: t.spacing["5"],
        display: "flex",
        flexDirection: "column",
        gap: t.spacing["4"],
        boxShadow: "0 4px 18px rgba(0, 0, 0, 0.025)",
      }}
    >
      {/* رأس النموذج */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingBottom: 14,
          borderBottom: `1px solid ${t.colors.cream.border}`,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: t.radius.sm,
            background: t.colors.primary[50],
            color: t.colors.primary[800],
          }}
        >
          <FileText size={18} strokeWidth={1.8} />
        </div>

        <div>
          <h3
            style={{
              margin: 0,
              fontSize: t.typography.fontSize.base,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.text.dark,
            }}
          >
            {isEdit ? "تعديل المقال" : "إنشاء مقال جديد"}
          </h3>

          <p
            style={{
              margin: "3px 0 0",
              fontSize: 10,
              color: t.colors.text.mid,
            }}
          >
            أضف محتوى المقال ومعلوماته الأساسية
          </p>
        </div>
      </div>

      {/* العنوان */}
      <div>
        <label style={labelStyle}>العنوان</label>

        <input
          style={{
            ...inputStyle,
            borderColor: t.colors.cream.border,
            fontSize: 14,
            fontWeight: 600,
          }}
          value={form.titleAr}
          onChange={(e) => onChange({ titleAr: e.target.value })}
          placeholder="عنوان المقال"
        />
      </div>

      {/* الرابط */}
      <div>
        <label style={labelStyle}>
          الرابط (slug) — أحرف إنجليزية صغيرة وأرقام وشرطات فقط
        </label>

        <input
          style={{
            ...inputStyle,
            borderColor: t.colors.cream.border,
            direction: "ltr",
            textAlign: "left",
            fontFamily: "monospace",
          }}
          value={form.slug}
          onChange={(e) => onChange({ slug: e.target.value })}
          placeholder="my-article-slug"
        />
      </div>

      {/* المقتطف */}
      <div>
        <label style={labelStyle}>مقتطف مختصر</label>

        <textarea
          style={{
            ...inputStyle,
            borderColor: t.colors.cream.border,
            resize: "vertical",
            minHeight: 70,
            lineHeight: 1.8,
          }}
          rows={2}
          value={form.excerptAr}
          onChange={(e) => onChange({ excerptAr: e.target.value })}
          placeholder="اكتب وصفًا مختصرًا يظهر مع المقال..."
        />
      </div>

      {/* المحتوى */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <label style={{ ...labelStyle, marginBottom: 0 }}>
            المحتوى الكامل
          </label>

          <span
            style={{
              fontSize: 9,
              color: t.colors.text.light,
            }}
          >
            محتوى المقال
          </span>
        </div>

        <textarea
          style={{
            ...inputStyle,
            borderColor: t.colors.cream.border,
            resize: "vertical",
            minHeight: 240,
            lineHeight: 2,
          }}
          rows={10}
          value={form.contentAr}
          onChange={(e) => onChange({ contentAr: e.target.value })}
          placeholder="اكتب محتوى المقال هنا..."
        />
      </div>

      {/* التصنيف والكاتب */}
      <div
        className="basita-blog-form-two-columns"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: t.spacing["3"],
        }}
      >
        <div>
          <label style={labelStyle}>التصنيف</label>

          <select
            style={{
              ...inputStyle,
              borderColor: t.colors.cream.border,
              cursor: "pointer",
            }}
            value={form.category}
            onChange={(e) => onChange({ category: e.target.value })}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>اسم الكاتب (اختياري)</label>

          <input
            style={{
              ...inputStyle,
              borderColor: t.colors.cream.border,
            }}
            value={form.authorName}
            onChange={(e) => onChange({ authorName: e.target.value })}
            placeholder="فريق بسطة"
          />
        </div>
      </div>

      {/* صورة الغلاف */}
      <div>
        <label
          style={{
            ...labelStyle,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Image size={13} strokeWidth={1.8} />
          رابط صورة الغلاف (اختياري)
        </label>

        <input
          style={{
            ...inputStyle,
            borderColor: t.colors.cream.border,
            direction: "ltr",
            textAlign: "left",
          }}
          value={form.coverImage}
          onChange={(e) => onChange({ coverImage: e.target.value })}
          placeholder="https://..."
        />
      </div>

      {/* الوسوم */}
      <div>
        <label style={labelStyle}>الوسوم (افصلي بينها بفاصلة)</label>

        <input
          style={{
            ...inputStyle,
            borderColor: t.colors.cream.border,
          }}
          value={form.tagsInput}
          onChange={(e) => onChange({ tagsInput: e.target.value })}
          placeholder="تسويق, نصائح"
        />
      </div>

      {/* خيارات النشر */}
      <div
        style={{
          padding: "13px 14px",
          background: t.colors.cream.bg,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.md,
          display: "flex",
          alignItems: "center",
          gap: t.spacing["5"],
          flexWrap: "wrap",
        }}
      >
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            fontWeight: 600,
            color: t.colors.text.dark,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) =>
              onChange({ isPublished: e.target.checked })
            }
            style={{
              width: 16,
              height: 16,
              accentColor: t.colors.primary[800],
              cursor: "pointer",
            }}
          />
          نشر مباشرة
        </label>

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            fontWeight: 600,
            color: t.colors.text.dark,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) =>
              onChange({ isFeatured: e.target.checked })
            }
            style={{
              width: 16,
              height: 16,
              accentColor: t.colors.primary[800],
              cursor: "pointer",
            }}
          />
          مقال مميّز
        </label>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            margin: 0,
            padding: "10px 12px",
            background: t.colors.semantic.dangerBg,
            border: `1px solid ${t.colors.semantic.dangerBg}`,
            borderRadius: t.radius.md,
            fontSize: 12,
            color: t.colors.semantic.danger,
          }}
        >
          <AlertTriangle size={14} strokeWidth={1.8} />
          <span>{error}</span>
        </div>
      )}

      {/* زر الحفظ */}
      <button
        onClick={onSubmit}
        disabled={submitting}
        style={{
          width: "100%",
          minHeight: 45,
          padding: "11px 16px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background: submitting
            ? t.colors.primary[600]
            : t.colors.primary[800],
          color: t.colors.white,
          border: "none",
          borderRadius: t.radius.md,
          fontWeight: 700,
          fontSize: 13,
          cursor: submitting ? "not-allowed" : "pointer",
          opacity: submitting ? 0.82 : 1,
          transition: "all 160ms ease",
        }}
      >
        {!submitting && (
          <Save size={15} strokeWidth={1.9} />
        )}

        {submitting
          ? "جاري الحفظ..."
          : isEdit
            ? "حفظ التعديلات"
            : "إنشاء المقال"}
      </button>

      <style>{`
        .basita-blog-form-two-columns input:focus,
        .basita-blog-form-two-columns select:focus,
        input:focus,
        textarea:focus,
        select:focus {
          border-color: ${t.colors.primary[600]} !important;
          box-shadow: 0 0 0 3px ${t.colors.primary[50]};
        }

        button:not(:disabled):hover {
          filter: brightness(0.96);
        }

        @media (max-width: 650px) {
          .basita-blog-form-two-columns {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 480px) {
          .basita-blog-form {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}