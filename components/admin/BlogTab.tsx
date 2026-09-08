// components/admin/BlogTab.tsx
"use client";

import { useEffect, useState } from "react";
import { Plus, ArrowRight, AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import BlogPostListRow from "./blog/BlogPostListRow";
import BlogPostForm, { BlogFormState } from "./blog/BlogPostForm";
import { BlogPostListItem, BlogPostFull } from "./blog/types";

const EMPTY_FORM: BlogFormState = {
  titleAr: "", slug: "", excerptAr: "", contentAr: "", coverImage: "",
  category: "platform-news", tagsInput: "", authorName: "", isPublished: false, isFeatured: false,
};

function slugify(text: string): string {
  return text.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 100);
}

export default function BlogTab() {
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const d = await api.get<{ posts: BlogPostListItem[] }>("/api/admin/blog?limit=50");
      setPosts(d.posts);
    } catch {
      setListError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError("");
    setView("form");
  };

  const startEdit = async (id: string) => {
    setBusyId(id);
    try {
      const { post } = await api.get<{ post: BlogPostFull }>(`/api/admin/blog/${id}`);
      setForm({
        titleAr: post.titleAr, slug: post.slug, excerptAr: post.excerptAr ?? "", contentAr: post.contentAr,
        coverImage: post.coverImage ?? "", category: post.category, tagsInput: post.tags.join(", "),
        authorName: post.authorName ?? "", isPublished: post.isPublished, isFeatured: post.isFeatured,
      });
      setEditingId(id);
      setFormError("");
      setView("form");
    } catch {
      setListError(true);
    } finally {
      setBusyId(null);
    }
  };

  const handleFormChange = (patch: Partial<BlogFormState>) => {
    setForm((p) => {
      const next = { ...p, ...patch };
      // توليد slug تلقائي من العنوان فقط عند الإنشاء (مو التعديل، حتى لا نكسر رابط منشور)
      if (patch.titleAr !== undefined && !editingId) next.slug = slugify(patch.titleAr);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!form.titleAr.trim() || !form.slug.trim() || !form.contentAr.trim()) {
      setFormError("العنوان والرابط والمحتوى مطلوبة");
      return;
    }
    setSubmitting(true);
    setFormError("");
    const payload = {
      titleAr: form.titleAr,
      slug: form.slug,
      excerptAr: form.excerptAr || undefined,
      contentAr: form.contentAr,
      coverImage: form.coverImage || undefined,
      category: form.category,
      tags: form.tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      authorName: form.authorName || undefined,
      isPublished: form.isPublished,
      isFeatured: form.isFeatured,
    };
    try {
      if (editingId) {
        await api.patch(`/api/admin/blog/${editingId}`, payload);
      } else {
        await api.post("/api/admin/blog", payload);
      }
      await load();
      setView("list");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "تعذّر حفظ المقال");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف هذا المقال نهائياً؟")) return;
    setBusyId(id);
    try {
      await api.delete(`/api/admin/blog/${id}`);
      setPosts((p) => p.filter((post) => post.id !== id));
    } catch {
      setListError(true);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: t.spacing["3"] }}>
        <h3 style={{ margin: 0, fontSize: t.typography.fontSize.base, color: t.colors.text.dark }}>مقالات المدونة</h3>
        {view === "list" ? (
          <button onClick={startCreate} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.full, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            <Plus size={14} strokeWidth={2} />
            مقال جديد
          </button>
        ) : (
          <button onClick={() => setView("list")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "none", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.full, fontSize: 11, cursor: "pointer", color: t.colors.text.mid }}>
            <ArrowRight size={13} strokeWidth={1.8} />
            رجوع للقائمة
          </button>
        )}
      </div>

      {view === "list" && (
        <>
          {loading && <p style={{ color: t.colors.text.mid, fontSize: t.typography.fontSize.xs }}>جاري التحميل...</p>}
          {listError && (
            <p style={{ color: t.colors.semantic.danger, fontSize: t.typography.fontSize.xs, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={14} strokeWidth={1.8} />
              حدث خطأ، حاول تحديث الصفحة
            </p>
          )}
          {!loading && !listError && posts.length === 0 && <p style={{ color: t.colors.text.mid, fontSize: t.typography.fontSize.xs }}>لا توجد مقالات بعد</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
            {posts.map((p) => (
              <BlogPostListRow key={p.id} post={p} busy={busyId === p.id} onEdit={() => startEdit(p.id)} onDelete={() => handleDelete(p.id)} />
            ))}
          </div>
        </>
      )}

      {view === "form" && (
        <BlogPostForm form={form} onChange={handleFormChange} onSubmit={handleSubmit} submitting={submitting} error={formError} isEdit={!!editingId} />
      )}
    </div>
  );
}
