// components/dashboard/product-new/NewImagesPicker.tsx
// اختيار صور المنتج داخل صفحة الإضافة نفسها (معاينة محلية، تُرفع عند الحفظ).
// الصورة الأولى هي الغلاف تلقائياً (نفس قاعدة السيرفر)، ونجعل أي صورة غلافاً
// بنقلها لأول القائمة.
"use client";

import { useRef } from "react";
import { Star, Trash2, ImagePlus } from "lucide-react";
import { t } from "@/theme";
import { MAX_PRODUCT_IMAGES, type PendingImage } from "@/lib/upload-product-images";

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
    <div>
      <p style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.text.dark }}>
        صور المنتج ({images.length}/{MAX_PRODUCT_IMAGES})
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: t.spacing["2"] }}>
        {images.map((img, idx) => (
          <div key={img.id} style={{ position: "relative", borderRadius: t.radius.lg, overflow: "hidden", border: `2px solid ${idx === 0 ? t.colors.gold[600] : t.colors.cream.border}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.previewUrl} alt="" style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
            {idx === 0 && (
              <span style={{ position: "absolute", top: 4, insetInlineEnd: 4, background: t.colors.gold[600], color: t.colors.white, fontSize: 9, padding: "2px 6px", borderRadius: t.radius.sm }}>
                غلاف
              </span>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 6px", background: "rgba(0,0,0,0.04)" }}>
              {idx !== 0 ? (
                <button type="button" onClick={() => onMakeCover(img.id)} disabled={disabled} title="تعيين كغلاف" style={{ border: "none", background: "none", cursor: "pointer", display: "flex", color: t.colors.gold[600] }}>
                  <Star size={13} strokeWidth={1.8} />
                </button>
              ) : <span />}
              <button type="button" onClick={() => onRemove(img.id)} disabled={disabled} title="حذف" style={{ border: "none", background: "none", cursor: "pointer", display: "flex", color: t.colors.semantic.danger }}>
                <Trash2 size={13} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        ))}

        {images.length < MAX_PRODUCT_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            style={{ height: 90, borderRadius: t.radius.lg, border: `2px dashed ${t.colors.cream.border}`, background: "none", cursor: disabled ? "not-allowed" : "pointer", color: t.colors.text.mid, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ImagePlus size={22} strokeWidth={1.6} />
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
      <p style={{ margin: `${t.spacing["2"]} 0 0`, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>
        JPG أو PNG أو WebP — حتى 8MB للصورة. الصورة الأولى هي الغلاف.
      </p>
    </div>
  );
}
