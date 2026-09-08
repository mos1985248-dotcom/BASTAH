// components/blog/BlogListClient.tsx
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import SiteShell from "@/components/layout/SiteShell";
import BlogPostCard, { BlogPostSummary } from "@/components/blog/BlogPostCard";

export default function BlogListClient() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<{ posts: BlogPostSummary[] }>("/api/blog?limit=20")
      .then((d) => setPosts(d.posts))
      .catch(() => setError("تعذّر تحميل المدونة"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SiteShell>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: t.spacing["6"] }}>
        <h1 style={{ fontSize: t.typography.fontSize["2xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], marginBottom: t.spacing["1"] }}>
          المدونة
        </h1>
        <p style={{ fontSize: t.typography.fontSize.sm, color: t.colors.text.mid, marginBottom: t.spacing["6"] }}>
          قصص ملهمة، نصائح لإدارة متجرك، وأخبار الأسر المنتجة
        </p>

        {loading && <p style={{ color: t.colors.text.mid }}>جاري التحميل...</p>}
        {error && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, color: t.colors.semantic.danger }}>
            <AlertTriangle size={15} strokeWidth={1.8} />
            {error}
          </p>
        )}
        {!loading && !error && posts.length === 0 && (
          <p style={{ color: t.colors.text.mid }}>لا توجد مقالات منشورة بعد — تابعونا قريباً</p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: t.spacing["4"] }}>
          {posts.map((p) => (
            <BlogPostCard key={p.id} post={p} />
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
