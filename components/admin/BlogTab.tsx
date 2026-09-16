// components/admin/BlogTab.tsx
"use client";

import { useEffect, useState } from "react";
import { Plus, ArrowRight, AlertTriangle, FileText } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import BlogPostListRow from "./blog/BlogPostListRow";
import BlogPostForm, { BlogFormState } from "./blog/BlogPostForm";
import { BlogPostListItem, BlogPostFull } from "./blog/types";

const EMPTY_FORM: BlogFormState = {
  titleAr: "",
  slug: "",
  excerptAr: "",
  contentAr: "",
  coverImage: "",
  category: "platform-news",
  tagsInput: "",
  authorName: "",
  isPublished: false,
  isFeatured: false,
};

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 100);
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
      const d = await api.get<{ posts: BlogPostListItem[] }>(
        "/api/admin/blog?limit=50"
      );
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
      const { post } = await api.get<{ post: BlogPostFull }>(
        `/api/admin/blog/${id}`
      );

      setForm({
        titleAr: post.titleAr,
        slug: post.slug,
        excerptAr: post.excerptAr ?? "",
        contentAr: post.contentAr,
        coverImage: post.coverImage ?? "",
        category: post.category,
        tagsInput: post.tags.join(", "),
        authorName: post.authorName ?? "",
        isPublished: post.isPublished,
        isFeatured: post.isFeatured,
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

      // توليد slug تلقائي من العنوان فقط عند الإنشاء
      // (مو التعديل، حتى لا نكسر رابط منشور)
      if (patch.titleAr !== undefined && !editingId) {
        next.slug = slugify(patch.titleAr);
      }

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
      tags: form.tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
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
      setFormError(
        err instanceof ApiError ? err.message : "تعذّر حفظ المقال"
      );
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
    <div dir="rtl" style={{ width: "100%" }}>
      {/* Header */}
      <div
        className="basita-admin-blog-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: t.spacing["3"],
          marginBottom: t.spacing["4"],
          paddingBottom: t.spacing["3"],
          borderBottom: `1px solid ${t.colors.cream.border}`,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: t.typography.fontSize.base,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.text.dark,
              lineHeight: 1.5,
            }}
          >
            مقالات المدونة
          </h3>

          <p
            style={{
              margin: "3px 0 0",
              fontSize: 11,
              color: t.colors.text.mid,
              lineHeight: 1.6,
            }}
          >
            إدارة المحتوى والمقالات المنشورة على بسطة
          </p>
        </div>

        {view === "list" ? (
          <button
            type="button"
            onClick={startCreate}
            aria-label="إنشاء مقال جديد"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              minHeight: 38,
              padding: "0 16px",
              background: t.colors.primary[800],
              color: t.colors.white,
              border: "none",
              borderRadius: t.radius.full,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              transition: "transform 160ms ease, box-shadow 160ms ease",
            }}
          >
            <Plus size={15} strokeWidth={2.1} />
            مقال جديد
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setView("list")}
            aria-label="العودة إلى قائمة المقالات"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              minHeight: 36,
              padding: "0 14px",
              background: t.colors.white,
              border: `1px solid ${t.colors.cream.border}`,
              borderRadius: t.radius.full,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              color: t.colors.text.mid,
              whiteSpace: "nowrap",
            }}
          >
            <ArrowRight size={13} strokeWidth={1.8} />
            رجوع للقائمة
          </button>
        )}
      </div>

      {/* List */}
      {view === "list" && (
        <>
          {loading && (
            <div
              style={{
                minHeight: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: t.colors.white,
                border: `1px solid ${t.colors.cream.border}`,
                borderRadius: t.radius.md,
                color: t.colors.text.mid,
                fontSize: t.typography.fontSize.xs,
              }}
            >
              <span>جاري تحميل المقالات...</span>
            </div>
          )}

          {listError && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "13px 15px",
                background: t.colors.white,
                border: `1px solid ${t.colors.cream.border}`,
                borderRadius: t.radius.md,
                color: t.colors.semantic.danger,
                fontSize: t.typography.fontSize.xs,
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  background: `${t.colors.semantic.danger}12`,
                }}
              >
                <AlertTriangle size={15} strokeWidth={1.8} />
              </span>

              <span>حدث خطأ، حاول تحديث الصفحة</span>
            </div>
          )}

          {!loading && !listError && posts.length === 0 && (
            <div
              style={{
                minHeight: 150,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: 20,
                background: t.colors.white,
                border: `1px solid ${t.colors.cream.border}`,
                borderRadius: t.radius.md,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  background: t.colors.cream.bg,
                  color: t.colors.primary[800],
                }}
              >
                <FileText size={19} strokeWidth={1.7} />
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: 600,
                  color: t.colors.text.dark,
                }}
              >
                لا توجد مقالات بعد
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  color: t.colors.text.mid,
                }}
              >
                ابدأ بإضافة أول مقال إلى المدونة
              </p>
            </div>
          )}

          {!loading && !listError && posts.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: t.spacing["2"],
              }}
            >
              {posts.map((p) => (
                <BlogPostListRow
                  key={p.id}
                  post={p}
                  busy={busyId === p.id}
                  onEdit={() => startEdit(p.id)}
                  onDelete={() => handleDelete(p.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Form */}
      {view === "form" && (
        <BlogPostForm
          form={form}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={formError}
          isEdit={!!editingId}
        />
      )}

      <style>{`
        .basita-admin-blog-header button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.10);
        }

        @media (max-width: 600px) {
          .basita-admin-blog-header {
            align-items: flex-start !important;
          }

          .basita-admin-blog-header button {
            flex-shrink: 0;
          }
        }

        @media (max-width: 480px) {
          .basita-admin-blog-header {
            flex-direction: column !important;
            gap: 12px !important;
          }

          .basita-admin-blog-header button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}