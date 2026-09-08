// components/blog/BlogPostClient.tsx
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import SiteShell from "@/components/layout/SiteShell";

interface BlogPostDetail {
  titleAr: string; excerptAr: string | null; contentAr: string; coverImage: string | null;
  category: string; authorName: string | null; publishedAt: string | null;
}

export default function BlogPostClient({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<{ post: BlogPostDetail }>(`/api/blog/${slug}`)
      .then((d) => setPost(d.post))
      .catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل المقال"));
  }, [slug]);

  if (error) {
    return (
      <SiteShell>
        <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center", padding: t.spacing["16"], color: t.colors.semantic.danger }}>
          <AlertTriangle size={16} strokeWidth={1.8} />
          {error}
        </p>
      </SiteShell>
    );
  }
  if (!post) {
    return (
      <SiteShell>
        <p style={{ textAlign: "center", padding: t.spacing["16"], color: t.colors.text.mid }}>جاري التحميل...</p>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <article style={{ maxWidth: 720, margin: "0 auto", padding: t.spacing["6"] }}>
        {post.coverImage && (
          <div style={{ height: 240, borderRadius: t.radius.lg, background: `url(${post.coverImage}) center/cover`, marginBottom: t.spacing["5"] }} />
        )}
        <h1 style={{ fontSize: t.typography.fontSize["2xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], marginBottom: t.spacing["2"] }}>
          {post.titleAr}
        </h1>
        <p style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.light, marginBottom: t.spacing["6"] }}>
          {post.authorName ?? "فريق بسطة"} {post.publishedAt && `· ${new Date(post.publishedAt).toLocaleDateString("ar-SA")}`}
        </p>
        <div style={{ fontSize: t.typography.fontSize.base, color: t.colors.text.body, lineHeight: t.typography.lineHeight.relaxed, whiteSpace: "pre-wrap" }}>
          {post.contentAr}
        </div>
        <a href="/blog" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: t.spacing["6"], color: t.colors.gold[600], fontWeight: t.typography.fontWeight.bold, textDecoration: "none" }}>
          <ArrowRight size={14} strokeWidth={2} />
          رجوع للمدونة
        </a>
      </article>
    </SiteShell>
  );
}
