// components/dashboard/product-edit/ImageManagerCard.tsx
import type { RefObject } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import ProductImageTile, { EditProductImage } from "./ProductImageTile";
import s from "../forms.module.css";

export default function ImageManagerCard({
  images, busyImageId, uploading, fileInputRef, onMove, onSetCover, onDelete, onFileSelected,
}: {
  images: EditProductImage[];
  busyImageId: string | null;
  uploading: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  onMove: (image: EditProductImage, dir: -1 | 1) => void;
  onSetCover: (id: string) => void;
  onDelete: (id: string) => void;
  onFileSelected: (file: File) => void;
}) {
  return (
    <section className={s.panel} style={uiVars} aria-labelledby="pe-images">
      <div className={s.panelHead}>
        <h2 id="pe-images" className={s.panelTitle}>الصور ({images.length}/8)</h2>
      </div>
      <div className={s.panelBody}>
        <div className={s.tiles}>
          {images.map((img, idx) => (
            <ProductImageTile
              key={img.id}
              image={img}
              index={idx}
              total={images.length}
              busy={busyImageId === img.id}
              onMove={(dir) => onMove(img, dir)}
              onSetCover={() => onSetCover(img.id)}
              onDelete={() => onDelete(img.id)}
            />
          ))}
          {images.length < 8 && (
            <button type="button" className={s.drop} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 size={22} strokeWidth={1.8} aria-hidden="true" /> : <ImagePlus size={24} strokeWidth={1.6} aria-hidden="true" />}
              {uploading ? "جاري الرفع..." : "إضافة صورة"}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => e.target.files?.[0] && onFileSelected(e.target.files[0])}
        />
        <p className={s.help}>JPG أو PNG أو WebP — حتى 8MB لكل صورة. استخدم النجمة لتعيين الغلاف والأسهم لإعادة الترتيب.</p>
      </div>
    </section>
  );
}
