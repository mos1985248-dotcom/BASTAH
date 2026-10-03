// app/dashboard/products/new/page.tsx
// صفحة واحدة: البيانات + الصور ثم "حفظ" واحد. الصور تُرفع بعد إنشاء المنتج
// مباشرة (السيرفر يحتاج productId) لكن التاجر لا يرى خطوة ثانية أو صفحة أخرى.
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import { DashboardField, DashboardTextarea } from "@/components/dashboard/DashboardField";
import NewImagesPicker from "@/components/dashboard/product-new/NewImagesPicker";
import {
  MAX_PRODUCT_IMAGES, validateImageFile, uploadImagesSequentially, type PendingImage,
} from "@/lib/upload-product-images";

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nameAr: "", price: "", quantity: "", shortDescAr: "" });
  const [images, setImages] = useState<PendingImage[]>([]);
  // بعد إنشاء المنتج فعلاً: إعادة المحاولة (لو فشل رفع صورة) لا تُنشئه مرة ثانية
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [loading, setLoading] = useState(false);

  const imagesRef = useRef(images);
  imagesRef.current = images;
  useEffect(() => () => imagesRef.current.forEach((i) => URL.revokeObjectURL(i.previewUrl)), []);

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handlePick = (files: File[]) => {
    setError("");
    const room = MAX_PRODUCT_IMAGES - images.length;
    const accepted: PendingImage[] = [];
    let problem = "";
    for (const file of files) {
      const invalid = validateImageFile(file);
      if (invalid) { problem = problem || invalid; continue; }
      if (accepted.length >= room) { problem = problem || `الحد الأقصى ${MAX_PRODUCT_IMAGES} صور`; continue; }
      accepted.push({ id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`, file, previewUrl: URL.createObjectURL(file) });
    }
    if (accepted.length) setImages((p) => [...p, ...accepted]);
    if (problem) setError(problem);
  };

  const handleRemove = (id: string) => {
    setImages((p) => {
      p.filter((i) => i.id === id).forEach((i) => URL.revokeObjectURL(i.previewUrl));
      return p.filter((i) => i.id !== id);
    });
  };

  const handleMakeCover = (id: string) =>
    setImages((p) => {
      const target = p.find((i) => i.id === id);
      return target ? [target, ...p.filter((i) => i.id !== id)] : p;
    });

  const handleSubmit = async (publish: boolean) => {
    if (!createdId && (!form.nameAr || !form.price)) {
      setError("اسم المنتج والسعر مطلوبان");
      return;
    }
    setLoading(true);
    setError("");
    setUpgradeRequired(false);
    try {
      let productId = createdId;
      if (!productId) {
        const { product } = await api.post<{ product: { id: string } }>("/api/products", {
          nameAr: form.nameAr,
          price: Number(form.price),
          quantity: Number(form.quantity || 0),
          shortDescAr: form.shortDescAr || undefined,
          status: publish ? "ACTIVE" : "DRAFT",
        });
        productId = product.id;
        setCreatedId(productId);
      }

      if (images.length > 0) {
        const { uploadedIds, failure } = await uploadImagesSequentially(productId, images);
        images.filter((i) => uploadedIds.includes(i.id)).forEach((i) => URL.revokeObjectURL(i.previewUrl));
        setImages((p) => p.filter((i) => !uploadedIds.includes(i.id)));
        if (failure) {
          setError(`تم حفظ المنتج، لكن تعذّر رفع «${images[failure.index].file.name}»: ${failure.message}`);
          return;
        }
      }
      router.push("/dashboard/products");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if ((err.details as any)?.upgradeRequired) setUpgradeRequired(true);
      } else {
        setError("حدث خطأ غير متوقع");
      }
    } finally {
      setLoading(false);
    }
  };

  const primary = { padding: 12, background: loading ? t.colors.primary[600] : t.colors.primary[800], color: t.colors.text.onDark, border: "none", borderRadius: t.radius.lg, cursor: loading ? "not-allowed" : "pointer", fontWeight: t.typography.fontWeight.bold } as const;

  return (
    <div style={{ minHeight: "100vh", padding: t.spacing["5"] }}>
      <div style={{ maxWidth: 460, margin: "0 auto", background: t.colors.white, borderRadius: t.radius.xl, padding: t.spacing["6"] }}>
        <h1 style={{ margin: `0 0 ${t.spacing["4"]}`, fontSize: t.typography.fontSize.xl, color: t.colors.primary[800] }}>إضافة منتج جديد</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
          <fieldset disabled={!!createdId} style={{ border: 0, padding: 0, margin: 0, minWidth: 0, display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
            <DashboardField label="اسم المنتج" value={form.nameAr} onChange={(v) => set("nameAr", v)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: t.spacing["2"] }}>
              <DashboardField label="السعر (ر.س)" type="number" value={form.price} onChange={(v) => set("price", v)} />
              <DashboardField label="الكمية" type="number" value={form.quantity} onChange={(v) => set("quantity", v)} />
            </div>
            <DashboardTextarea label="وصف مختصر" value={form.shortDescAr} onChange={(v) => set("shortDescAr", v)} />
          </fieldset>

          <NewImagesPicker images={images} disabled={loading} onPick={handlePick} onRemove={handleRemove} onMakeCover={handleMakeCover} />

          {error && (
            <div>
              <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.semantic.danger }}>
                <AlertTriangle size={13} strokeWidth={1.8} />
                {error}
              </p>
              {upgradeRequired && (
                <a href="/pricing" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: t.typography.fontSize.xs, color: t.colors.gold[600], fontWeight: t.typography.fontWeight.bold }}>
                  ترقية الباقة
                  <ArrowLeft size={12} strokeWidth={2} />
                </a>
              )}
            </div>
          )}

          {createdId ? (
            <div style={{ display: "flex", gap: t.spacing["2"] }}>
              <a href={`/dashboard/products/${createdId}/edit`} style={{ flex: 1, padding: 12, textAlign: "center", textDecoration: "none", background: t.colors.white, border: `1.5px solid ${t.colors.cream.border}`, borderRadius: t.radius.lg, color: t.colors.text.dark, fontWeight: t.typography.fontWeight.semibold }}>
                تعديل المنتج
              </a>
              <button onClick={() => handleSubmit(true)} disabled={loading} style={{ ...primary, flex: 2 }}>
                {loading ? "جاري رفع الصور..." : images.length > 0 ? "إعادة رفع الصور المتبقية" : "إنهاء"}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: t.spacing["2"] }}>
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                style={{ flex: 1, padding: 12, background: t.colors.white, border: `1.5px solid ${t.colors.cream.border}`, borderRadius: t.radius.lg, cursor: "pointer", fontWeight: t.typography.fontWeight.semibold }}
              >
                حفظ كمسودة
              </button>
              <button onClick={() => handleSubmit(true)} disabled={loading} style={{ ...primary, flex: 2 }}>
                {loading ? "جاري الحفظ..." : "حفظ ونشر المنتج"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
