// components/blog/BlogPostCard.tsx
import { t } from "@/theme";

export interface BlogPostSummary {
  id: string; titleAr: string; slug: string; excerptAr: string | null;
  coverImage: string | null; category: string; authorName: string | null;
  authorAvatar: string | null; publishedAt: string | null;
}

const CATEGORY_LABEL: Record<string, string> = {
  "platform-news": "أخبار المنصة", "success-stories": "قصص نجاح",
  "store-management": "إدارة المتجر", crafts: "حرف يدوية",
};

export default function BlogPostCard({ post }: { post: BlogPostSummary }) {
  return (
    <a href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
      <div style={{ background: t.colors.white, borderRadius: t.radius.lg, overflow: "hidden", border: `1px solid ${t.colors.cream.border}` }}>
        <div
          style={{
            height: 150,
            background: post.coverImage ? `url(${post.coverImage}) center/cover` : `linear-gradient(135deg, ${t.colors.primary[700]}, ${t.colors.gold[600]})`,
          }}
        />
        <div style={{ padding: t.spacing["4"] }}>
          <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.gold[600], fontWeight: t.typography.fontWeight.bold }}>
            {CATEGORY_LABEL[post.category] ?? post.category}
          </span>
          <h3 style={{ margin: `${t.spacing["1"]} 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
            {post.titleAr}
          </h3>
          {post.excerptAr && (
            <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid, lineHeight: t.typography.lineHeight.relaxed }}>
              {post.excerptAr}
            </p>
          )}
          <p style={{ margin: `${t.spacing["2"]} 0 0`, fontSize: t.typography.fontSize.xs, color: t.colors.text.light }}>
            {post.authorName ?? "فريق بسطة"} {post.publishedAt && `· ${new Date(post.publishedAt).toLocaleDateString("ar-SA")}`}
          </p>
        </div>
      </div>
    </a>
  );
}
