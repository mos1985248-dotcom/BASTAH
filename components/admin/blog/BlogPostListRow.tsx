// components/admin/blog/BlogPostListRow.tsx
import { Star } from "lucide-react";
import { t } from "@/theme";
import { BlogPostListItem, CATEGORY_OPTIONS } from "./types";

export default function BlogPostListRow({ post, onEdit, onDelete, busy }: { post: BlogPostListItem; onEdit: () => void; onDelete: () => void; busy: boolean }) {
  const categoryLabel = CATEGORY_OPTIONS.find((c) => c.value === post.category)?.label ?? post.category;

  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.md, padding: "12px 14px", border: `1px solid ${t.colors.cream.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: busy ? 0.5 : 1 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{post.titleAr}</p>
          <span
            style={{
              fontSize: 10, fontWeight: t.typography.fontWeight.bold, padding: "2px 8px", borderRadius: t.radius.full,
              background: post.isPublished ? t.colors.semantic.successBg : t.colors.semantic.warningBg,
              color: post.isPublished ? t.colors.semantic.success : t.colors.semantic.warning,
            }}
          >
            {post.isPublished ? "منشور" : "مسودة"}
          </span>
          {post.isFeatured && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, color: t.colors.gold[600] }}>
              <Star size={11} strokeWidth={2} fill={t.colors.gold[600]} />
              مميّز
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: 10, color: t.colors.text.mid }}>{categoryLabel} · {post.viewCount} مشاهدة · /{post.slug}</p>
      </div>

      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button onClick={onEdit} disabled={busy} style={{ padding: "5px 12px", background: t.colors.primary[100], color: t.colors.primary[800], border: "none", borderRadius: t.radius.sm, fontSize: 11, cursor: "pointer" }}>
          تعديل
        </button>
        <button onClick={onDelete} disabled={busy} style={{ padding: "5px 12px", background: t.colors.semantic.dangerBg, color: t.colors.semantic.danger, border: "none", borderRadius: t.radius.sm, fontSize: 11, cursor: "pointer" }}>
          حذف
        </button>
      </div>
    </div>
  );
}
