// components/admin/blog/BlogPostListRow.tsx
import { Eye, Pencil, Star, Trash2 } from "lucide-react";
import { t } from "@/theme";
import { BlogPostListItem, CATEGORY_OPTIONS } from "./types";

export default function BlogPostListRow({
  post,
  onEdit,
  onDelete,
  busy,
}: {
  post: BlogPostListItem;
  onEdit: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const categoryLabel =
    CATEGORY_OPTIONS.find((c) => c.value === post.category)?.label ??
    post.category;

  return (
    <div
      dir="rtl"
      className="basita-blog-post-row"
      style={{
        background: t.colors.white,
        borderRadius: t.radius.lg,
        padding: "14px 16px",
        border: `1px solid ${t.colors.cream.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        opacity: busy ? 0.55 : 1,
        transition:
          "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
      }}
    >
      {/* بيانات المقال */}
      <div
        style={{
          minWidth: 0,
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 7,
            marginBottom: 6,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.text.dark,
              lineHeight: 1.6,
              overflowWrap: "anywhere",
            }}
          >
            {post.titleAr}
          </p>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "3px 8px",
              borderRadius: t.radius.full,
              background: post.isPublished
                ? t.colors.semantic.successBg
                : t.colors.semantic.warningBg,
              color: post.isPublished
                ? t.colors.semantic.success
                : t.colors.semantic.warning,
              fontSize: 9,
              fontWeight: t.typography.fontWeight.bold,
              whiteSpace: "nowrap",
            }}
          >
            {post.isPublished ? "منشور" : "مسودة"}
          </span>

          {post.isFeatured && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 7px",
                borderRadius: t.radius.full,
                background: t.colors.gold[100],
                color: t.colors.gold[600],
                fontSize: 9,
                fontWeight: t.typography.fontWeight.bold,
                whiteSpace: "nowrap",
              }}
            >
              <Star
                size={11}
                strokeWidth={2}
                fill={t.colors.gold[600]}
              />
              مميّز
            </span>
          )}
        </div>

        {/* بيانات المقال الثانوية */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 7,
            color: t.colors.text.mid,
            fontSize: 10,
            lineHeight: 1.7,
          }}
        >
          <span>{categoryLabel}</span>

          <span
            style={{
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: t.colors.text.light,
            }}
          />

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Eye size={11} strokeWidth={1.8} />
            {post.viewCount} مشاهدة
          </span>

          <span
            style={{
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: t.colors.text.light,
            }}
          />

          <span
            dir="ltr"
            style={{
              color: t.colors.text.light,
              overflowWrap: "anywhere",
            }}
          >
            /{post.slug}
          </span>
        </div>
      </div>

      {/* الإجراءات */}
      <div
        className="basita-blog-post-actions"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onEdit}
          disabled={busy}
          aria-label={`تعديل ${post.titleAr}`}
          style={{
            minHeight: 32,
            padding: "6px 11px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            background: t.colors.primary[100],
            color: t.colors.primary[800],
            border: "none",
            borderRadius: t.radius.sm,
            fontSize: 10,
            fontWeight: t.typography.fontWeight.bold,
            cursor: busy ? "not-allowed" : "pointer",
            transition: "all 150ms ease",
          }}
        >
          <Pencil size={12} strokeWidth={1.9} />
          تعديل
        </button>

        <button
          onClick={onDelete}
          disabled={busy}
          aria-label={`حذف ${post.titleAr}`}
          style={{
            minHeight: 32,
            padding: "6px 11px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            background: t.colors.semantic.dangerBg,
            color: t.colors.semantic.danger,
            border: "none",
            borderRadius: t.radius.sm,
            fontSize: 10,
            fontWeight: t.typography.fontWeight.bold,
            cursor: busy ? "not-allowed" : "pointer",
            transition: "all 150ms ease",
          }}
        >
          <Trash2 size={12} strokeWidth={1.9} />
          حذف
        </button>
      </div>

      <style>{`
        .basita-blog-post-row:hover {
          transform: translateY(-1px);
          border-color: ${t.colors.primary[100]};
          box-shadow: 0 5px 18px rgba(0, 0, 0, 0.045);
        }

        .basita-blog-post-actions button:not(:disabled):hover {
          filter: brightness(0.96);
          transform: translateY(-1px);
        }

        .basita-blog-post-actions button:disabled {
          opacity: 0.6;
        }

        @media (max-width: 600px) {
          .basita-blog-post-row {
            align-items: flex-start !important;
            flex-direction: column !important;
            padding: 13px !important;
          }

          .basita-blog-post-actions {
            width: 100%;
          }

          .basita-blog-post-actions button {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}