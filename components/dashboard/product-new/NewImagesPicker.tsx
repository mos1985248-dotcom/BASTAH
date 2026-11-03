// components/dashboard/product-new/NewImagesPicker.tsx
// اختيار صور المنتج داخل صفحة الإضافة نفسها (معاينة محلية، تُرفع عند الحفظ).
// الصورة الأولى هي الغلاف تلقائياً (نفس قاعدة السيرفر)، ونجعل أي صورة غلافاً
// بنقلها لأول القائمة. المنطق كما كان؛ التغيير في الشكل فقط.
"use client";

import { useRef } from "react";
import { ImagePlus, Star, Trash2 } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import { MAX_PRODUCT_IMAGES, type PendingImage } from "@/lib/upload-product-images";
import s from "../forms.module.css";

export default function NewImagesPicker({
  images, disabled, onPick, onRemove, onMakeCover,
}: {
  images: PendingImage[];
  disabled: boolean;
  onPick: (files: File[]) => void;
  onRemove: (id: string) => void;
  onMakeCover: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={uiVars}>
      <span className={s.fieldLabel}>صور المنتج ({images.length}/{MAX_PRODUCT_IMAGES})</span>
      <div className={s.tiles}>
        {images.map((img, index) => (
          <div key={img.id} className={`${s.tile} ${index === 0 ? s.tileCover : ""}`} style={{ backgroundImage: `url(${img.previewUrl})` }} role="img" aria-label={`صورة ${index + 1}`}>
            {index === 0 && <span className={s.tileBadge}>غلاف</span>}
            <div className={s.tileBar}>
              {index !== 0 && (
                <button type="button" className={s.tileBtn} onClick={() => onMakeCover(img.id)} disabled={disabled} title="تعيين كغلاف" aria-label="تعيين كغلاف">
                  <Star size={16} strokeWidth={1.9} />
                </button>
              )}
              <button type="button" className={s.tileBtn} onClick={() => onRemove(img.id)} disabled={disabled} title="حذف" aria-label="حذف الصورة">
                <Trash2 size={16} strokeWidth={1.9} />
              </button>
            </div>
          </div>
        ))}
        {images.length < MAX_PRODUCT_IMAGES && (
          <button type="button" className={s.drop} onClick={() => inputRef.current?.click()} disabled={disabled}>
            <ImagePlus size={24} strokeWidth={1.6} aria-hidden="true" />
            إضافة صور
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => {
          onPick(Array.from(e.target.files ?? []));
          e.target.value = ""; // يسمح باختيار نفس الملف مجدداً بعد حذفه
        }}
      />
      <p className={s.help} style={{ marginTop: 8 }}>JPG أو PNG أو WebP — حتى 8MB للصورة. الصورة الأولى هي الغلاف.</p>
    </div>
  );
}
