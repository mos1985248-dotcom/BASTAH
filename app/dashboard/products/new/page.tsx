// app/dashboard/products/new/page.tsx
// صفحة واحدة: البيانات + الصور ثم "حفظ" واحد. الصور تُرفع بعد إنشاء المنتج
// مباشرة (السيرفر يحتاج productId) لكن التاجر لا يرى خطوة ثانية أو صفحة أخرى.
// المنطق كما كان حرفياً؛ التغيير في التخطيط والعرض فقط.
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ChevronRight } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { uiVars } from "@/components/ui/vars";
import { DashboardField, DashboardTextarea } from "@/components/dashboard/DashboardField";
import NewImagesPicker from "@/components/dashboard/product-new/NewImagesPicker";
import {
  MAX_PRODUCT_IMAGES, validateImageFile, uploadImagesSequentially, type PendingImage,
} from "@/lib/upload-product-images";
import s from "@/components/dashboard/forms.module.css";

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

  return (
    <div className={s.page} style={uiVars}>
      <a href="/dashboard/products" className={s.back}>
        <ChevronRight size={15} strokeWidth={2} aria-hidden="true" />
        منتجاتي
      </a>
      <div className={s.head}>
        <div>
          <h1 className={s.title}>إضافة منتج جديد</h1>
          <p className={s.sub}>أدخل البيانات الأساسية وأضف الصور، ويمكنك استكمال التفاصيل والمتغيّرات بعد الحفظ</p>
        </div>
      </div>

      <div className={s.layout}>
        <div className={s.col}>
          <section className={s.panel} aria-labelledby="np-data">
            <div className={s.panelHead}><h2 id="np-data" className={s.panelTitle}>بيانات المنتج</h2></div>
            <fieldset disabled={!!createdId} style={{ border: 0, margin: 0, minWidth: 0 }} className={s.panelBody}>
              <DashboardField label="اسم المنتج" value={form.nameAr} onChange={(v) => set("nameAr", v)} />
              <div className={s.two}>
                <DashboardField label="السعر (ر.س)" type="number" value={form.price} onChange={(v) => set("price", v)} />
                <DashboardField label="الكمية" type="number" value={form.quantity} onChange={(v) => set("quantity", v)} />
              </div>
              <DashboardTextarea label="وصف مختصر" value={form.shortDescAr} onChange={(v) => set("shortDescAr", v)} />
            </fieldset>
          </section>
        </div>

        <div className={`${s.col} ${s.sticky}`}>
          <section className={s.panel} aria-labelledby="np-images">
            <div className={s.panelHead}><h2 id="np-images" className={s.panelTitle}>الصور</h2></div>
            <div className={s.panelBody}>
              <NewImagesPicker images={images} disabled={loading} onPick={handlePick} onRemove={handleRemove} onMakeCover={handleMakeCover} />
            </div>
          </section>

          {error && (
            <div>
              <p className={s.err} role="alert">
                <AlertTriangle size={14} strokeWidth={1.8} aria-hidden="true" />
                {error}
              </p>
              {upgradeRequired && (
                <a href="/pricing" className={s.link}>
                  ترقية الباقة
                  <ArrowLeft size={13} strokeWidth={2} aria-hidden="true" />
                </a>
              )}
            </div>
          )}

          {createdId ? (
            <div className={s.actions}>
              <a href={`/dashboard/products/${createdId}/edit`} className={`${s.cta} ${s.ghost}`}>تعديل المنتج</a>
              <button type="button" onClick={() => handleSubmit(true)} disabled={loading} className={s.cta}>
                {loading ? "جاري رفع الصور..." : images.length > 0 ? "إعادة رفع الصور المتبقية" : "إنهاء"}
              </button>
            </div>
          ) : (
            <div className={s.actions}>
              <button type="button" onClick={() => handleSubmit(false)} disabled={loading} className={`${s.cta} ${s.ghost}`}>حفظ كمسودة</button>
              <button type="button" onClick={() => handleSubmit(true)} disabled={loading} className={s.cta}>
                {loading ? "جاري الحفظ..." : "حفظ ونشر المنتج"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
