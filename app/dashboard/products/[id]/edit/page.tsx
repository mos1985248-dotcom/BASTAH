// app/dashboard/products/[id]/edit/page.tsx — المنطق كما كان حرفياً؛ التغيير في التخطيط والعرض فقط.
"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { uiVars } from "@/components/ui/vars";
import ImageManagerCard from "@/components/dashboard/product-edit/ImageManagerCard";
import DetailsFormCard from "@/components/dashboard/product-edit/DetailsFormCard";
import VariantsCard, { EditVariant } from "@/components/dashboard/product-edit/VariantsCard";
import { useProductTranslate } from "@/hooks/useProductTranslate";
import { EditProductImage } from "@/components/dashboard/product-edit/ProductImageTile";
import s from "@/components/dashboard/forms.module.css";

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

  const wrap = (children: React.ReactNode) => <div className={s.page} style={uiVars}>{children}</div>;

  if (loading) return wrap(<p className={s.state} role="status">جاري التحميل...</p>);
  if (!product) {
    return wrap(
      <p className={s.err} role="alert">
        <AlertTriangle size={16} strokeWidth={1.8} aria-hidden="true" />
        {error}
      </p>,
    );
  }

  const sortedImages = [...product.productImages].sort((a, b) => a.position - b.position);

  return wrap(
    <>
      <a href="/dashboard/products" className={s.back}>
        <ChevronRight size={15} strokeWidth={2} aria-hidden="true" />
        رجوع لمنتجاتي
      </a>
      <div className={s.head}>
        <div>
          <h1 className={s.title}>تعديل المنتج</h1>
          <p className={s.sub}>{product.nameAr}</p>
        </div>
      </div>

      {error && <p className={s.err} role="alert" style={{ marginBottom: 14 }}>{error}</p>}

      <div className={s.layout}>
        <div className={s.col}>
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
        </div>
        <div className={`${s.col} ${s.sticky}`}>
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
        </div>
      </div>
    </>,
  );
}
