// app/dashboard/products/[id]/edit/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import ImageManagerCard from "@/components/dashboard/product-edit/ImageManagerCard";
import DetailsFormCard from "@/components/dashboard/product-edit/DetailsFormCard";
import VariantsCard, { EditVariant } from "@/components/dashboard/product-edit/VariantsCard";
import { useProductTranslate } from "@/hooks/useProductTranslate";
import { EditProductImage } from "@/components/dashboard/product-edit/ProductImageTile";

interface ProductDetail {
  id: string; nameAr: string; price: number; quantity: number; shortDescAr: string | null;
  status: string; productImages: EditProductImage[]; variants?: EditVariant[];
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [form, setForm] = useState({ nameAr: "", nameEn: "", price: "", quantity: "", shortDescAr: "", shortDescEn: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busyImageId, setBusyImageId] = useState<string | null>(null);

  const { translating, translateToEnglish } = useProductTranslate(
    form,
    (r) => setForm((p) => ({ ...p, ...r })),
    setError
  );

  const load = () => {
    api
      .get<{ product: ProductDetail }>(`/api/products/${id}`)
      .then(({ product }) => {
        setProduct(product);
        setForm({
          nameAr: product.nameAr,
          nameEn: (product as any).nameEn ?? "",
          price: String(product.price),
          quantity: String(product.quantity),
          shortDescAr: product.shortDescAr ?? "",
          shortDescEn: (product as any).shortDescEn ?? "",
        });
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل المنتج"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const hasVariants = (product?.variants?.length ?? 0) > 0;

  const saveDetails = async () => {
    setSavingDetails(true);
    setError("");
    try {
      await api.patch(`/api/products/${id}`, {
        nameAr: form.nameAr,
        nameEn: form.nameEn || undefined,
        price: Number(form.price),
        quantity: hasVariants ? undefined : Number(form.quantity),
        shortDescAr: form.shortDescAr || undefined,
        shortDescEn: form.shortDescEn || undefined,
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر حفظ التعديلات");
    } finally {
      setSavingDetails(false);
    }
  };

  const handleFileSelected = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("productId", id);
      fd.append("file", file);
      const res = await fetch("/api/uploads/products", { method: "POST", body: fd });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "فشل رفع الصورة");
      load();
    } catch (err: any) {
      setError(err.message ?? "تعذّر رفع الصورة");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const setCover = async (imageId: string) => {
    setBusyImageId(imageId);
    try {
      await api.patch(`/api/uploads/products/${imageId}`, { isCover: true });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر تعيين الغلاف");
    } finally {
      setBusyImageId(null);
    }
  };

  const moveImage = async (image: EditProductImage, direction: -1 | 1) => {
    const newPosition = image.position + direction;
    if (newPosition < 0 || !product) return;
    setBusyImageId(image.id);
    try {
      await api.patch(`/api/uploads/products/${image.id}`, { position: newPosition });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر تغيير الترتيب");
    } finally {
      setBusyImageId(null);
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm("حذف هذه الصورة نهائياً؟")) return;
    setBusyImageId(imageId);
    try {
      await api.delete(`/api/uploads/products/${imageId}`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر حذف الصورة");
    } finally {
      setBusyImageId(null);
    }
  };

  if (loading) return <p style={{ textAlign: "center", padding: t.spacing["10"], color: t.colors.text.mid }}>جاري التحميل...</p>;
  if (!product) return (
    <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center", padding: t.spacing["10"], color: t.colors.semantic.danger }}>
      <AlertTriangle size={16} strokeWidth={1.8} />
      {error}
    </p>
  );

  const sortedImages = [...product.productImages].sort((a, b) => a.position - b.position);

  return (
    <div style={{ padding: t.spacing["4"] }}>
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <h1 style={{ fontSize: t.typography.fontSize.xl, color: t.colors.primary[800], marginBottom: t.spacing["4"] }}>تعديل المنتج</h1>

        <ImageManagerCard
          images={sortedImages}
          busyImageId={busyImageId}
          uploading={uploading}
          fileInputRef={fileInputRef}
          onMove={moveImage}
          onSetCover={setCover}
          onDelete={deleteImage}
          onFileSelected={handleFileSelected}
        />

        <DetailsFormCard
          form={form}
          onChange={(k, v) => setForm((p) => ({ ...p, [k]: v }))}
          onTranslate={translateToEnglish}
          translating={translating}
          onSave={saveDetails}
          saving={savingDetails}
          quantityLocked={hasVariants}
        />

        <VariantsCard productId={id} variants={product.variants ?? []} basePrice={product.price} onSaved={load} />

        {error && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, color: t.colors.semantic.danger, fontSize: t.typography.fontSize.xs }}>
            <AlertTriangle size={13} strokeWidth={1.8} />
            {error}
          </p>
        )}
        <a href="/dashboard/products" style={{ display: "flex", alignItems: "center", gap: 5, color: t.colors.text.mid, fontSize: t.typography.fontSize.sm }}>
          <ArrowRight size={14} strokeWidth={2} />
          رجوع لمنتجاتي
        </a>
      </div>
    </div>
  );
}
