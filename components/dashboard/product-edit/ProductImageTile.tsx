// components/dashboard/product-edit/ProductImageTile.tsx
import { ArrowLeft, ArrowRight, Star, Trash2 } from "lucide-react";
import s from "../forms.module.css";

export interface EditProductImage {
  id: string; url: string; thumbnailUrl: string; position: number; isCover: boolean;
}

export default function ProductImageTile({
  image, index, total, busy, onMove, onSetCover, onDelete,
}: {
  image: EditProductImage;
  index: number;
  total: number;
  busy: boolean;
  onMove: (dir: -1 | 1) => void;
  onSetCover: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`${s.tile} ${image.isCover ? s.tileCover : ""}`}
      style={{ backgroundImage: `url(${image.thumbnailUrl})`, opacity: busy ? 0.5 : 1 }}
      role="img"
      aria-label={`صورة ${index + 1}`}
    >
      {image.isCover && <span className={s.tileBadge}>غلاف</span>}
      <div className={s.tileBar}>
        <button type="button" className={s.tileBtn} onClick={() => onMove(-1)} disabled={index === 0 || busy} aria-label="تقديم الصورة">
          <ArrowRight size={15} strokeWidth={2} />
        </button>
        <button type="button" className={s.tileBtn} onClick={() => onMove(1)} disabled={index === total - 1 || busy} aria-label="تأخير الصورة">
          <ArrowLeft size={15} strokeWidth={2} />
        </button>
        {!image.isCover && (
          <button type="button" className={s.tileBtn} onClick={onSetCover} disabled={busy} title="تعيين كغلاف" aria-label="تعيين كغلاف">
            <Star size={15} strokeWidth={1.9} />
          </button>
        )}
        <button type="button" className={s.tileBtn} onClick={onDelete} disabled={busy} title="حذف" aria-label="حذف الصورة">
          <Trash2 size={15} strokeWidth={1.9} />
        </button>
      </div>
    </div>
  );
}
