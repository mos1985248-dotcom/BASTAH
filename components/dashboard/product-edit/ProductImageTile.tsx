// components/dashboard/product-edit/ProductImageTile.tsx
import { ArrowRight, ArrowLeft, Star, Trash2 } from "lucide-react";
import { t } from "@/theme";

export interface EditProductImage {
  id: string; url: string; thumbnailUrl: string; position: number; isCover: boolean;
}

export default function ProductImageTile({
  image,
  index,
  total,
  busy,
  onMove,
  onSetCover,
  onDelete,
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
      style={{
        position: "relative",
        borderRadius: t.radius.lg,
        overflow: "hidden",
        border: `2px solid ${image.isCover ? t.colors.gold[600] : t.colors.cream.border}`,
        opacity: busy ? 0.5 : 1,
      }}
    >
      <img src={image.thumbnailUrl} alt="" style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
      {image.isCover && (
        <span style={{ position: "absolute", top: 4, insetInlineEnd: 4, background: t.colors.gold[600], color: t.colors.white, fontSize: 9, padding: "2px 6px", borderRadius: t.radius.sm }}>
          غلاف
        </span>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 6px", background: "rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", gap: 2 }}>
          <button onClick={() => onMove(-1)} disabled={index === 0} style={{ border: "none", background: "none", cursor: "pointer", display: "flex", color: t.colors.text.body }}><ArrowRight size={13} strokeWidth={2} /></button>
          <button onClick={() => onMove(1)} disabled={index === total - 1} style={{ border: "none", background: "none", cursor: "pointer", display: "flex", color: t.colors.text.body }}><ArrowLeft size={13} strokeWidth={2} /></button>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {!image.isCover && (
            <button onClick={onSetCover} title="تعيين كغلاف" style={{ border: "none", background: "none", cursor: "pointer", display: "flex", color: t.colors.gold[600] }}><Star size={13} strokeWidth={1.8} /></button>
          )}
          <button onClick={onDelete} title="حذف" style={{ border: "none", background: "none", cursor: "pointer", display: "flex", color: t.colors.semantic.danger }}><Trash2 size={13} strokeWidth={1.8} /></button>
        </div>
      </div>
    </div>
  );
}
