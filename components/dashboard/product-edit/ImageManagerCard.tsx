// components/dashboard/product-edit/ImageManagerCard.tsx
import { RefObject } from "react";
import { Star, ArrowLeft, ArrowRight } from "lucide-react";
import { t } from "@/theme";
import ProductImageTile, { EditProductImage } from "./ProductImageTile";

export default function ImageManagerCard({
  images,
  busyImageId,
  uploading,
  fileInputRef,
  onMove,
  onSetCover,
  onDelete,
  onFileSelected,
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
    <div style={{ background: t.colors.white, borderRadius: t.radius.xl, padding: t.spacing["5"], marginBottom: t.spacing["4"] }}>
      <h3 style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: t.typography.fontSize.base, color: t.colors.text.dark }}>
        الصور ({images.length}/8)
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: t.spacing["2"], marginBottom: t.spacing["4"] }}>
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
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              height: 90,
              borderRadius: t.radius.lg,
              border: `2px dashed ${t.colors.cream.border}`,
              background: "none",
              cursor: uploading ? "not-allowed" : "pointer",
              fontSize: 24,
              color: t.colors.text.mid,
            }}
          >
            {uploading ? "..." : "+"}
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
      <p style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>
        JPG, PNG, WebP — حتى 8MB لكل صورة.
        <Star size={11} strokeWidth={1.8} color={t.colors.gold[600]} /> لتعيين الغلاف،
        <ArrowLeft size={11} strokeWidth={2} /> <ArrowRight size={11} strokeWidth={2} /> لإعادة الترتيب.
      </p>
    </div>
  );
}
