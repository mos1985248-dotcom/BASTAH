// components/product/ProductGallery.tsx
"use client";
import { useEffect, useState } from "react";
import { Maximize2, Play, ShoppingBag, Star, X } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import type { ProductImageItem } from "./types";
import s from "./gallery.module.css";

interface Props {
  images: ProductImageItem[];
  mainImage: string | null;
  videoUrl: string | null;
  nameAr: string;
  isFeatured: boolean;
}

export default function ProductGallery({ images, mainImage, videoUrl, nameAr, isFeatured }: Props) {
  const gallery = images.length > 0 ? images.map((i) => i.url) : mainImage ? [mainImage] : [];
  const [active, setActive] = useState<number | "video">(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const src = active === "video" ? null : gallery[active];

  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoomOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomOpen]);

  return (
    <div className={s.gallery} style={uiVars}>
      <div
        className={s.main}
        role="img"
        aria-label={nameAr}
        style={src ? { backgroundImage: `url(${src})` } : undefined}
      >
        {active === "video" && videoUrl ? (
          <video src={videoUrl} className={s.video} autoPlay muted loop playsInline controls />
        ) : (
          !src && <ShoppingBag size={64} strokeWidth={1.2} aria-hidden="true" />
        )}

        {isFeatured && active !== "video" && (
          <span className={s.badge}>
            <Star size={14} strokeWidth={2} fill="currentColor" aria-hidden="true" />
            منتج مميز
          </span>
        )}
        {gallery.length > 1 && active !== "video" && (
          <span className={s.count}>{(active as number) + 1} / {gallery.length}</span>
        )}
        {src && active !== "video" && (
          <button type="button" className={s.zoom} onClick={() => setZoomOpen(true)} aria-label="تكبير الصورة">
            <Maximize2 size={18} strokeWidth={1.8} />
          </button>
        )}
      </div>

      {(gallery.length > 1 || videoUrl) && (
        <div className={s.thumbs} role="group" aria-label="صور المنتج">
          {gallery.map((url, i) => (
            <button
              key={url + i}
              type="button"
              className={`${s.thumb} ${active === i ? s.thumbOn : ""}`}
              style={{ backgroundImage: `url(${url})` }}
              onClick={() => setActive(i)}
              aria-label={`صورة ${i + 1}`}
              aria-current={active === i ? "true" : undefined}
            />
          ))}
          {videoUrl && (
            <button
              type="button"
              className={`${s.thumb} ${active === "video" ? s.thumbOn : ""}`}
              onClick={() => setActive("video")}
              aria-label="فيديو المنتج"
              aria-current={active === "video" ? "true" : undefined}
            >
              <Play size={22} strokeWidth={1.8} aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {zoomOpen && src && (
        <div className={s.lightbox} role="dialog" aria-modal="true" aria-label={`تكبير صورة ${nameAr}`} onClick={() => setZoomOpen(false)}>
          <button type="button" className={s.close} onClick={() => setZoomOpen(false)} aria-label="إغلاق">
            <X size={22} strokeWidth={1.9} />
          </button>
          <div
            className={s.lightboxImg}
            role="img"
            aria-label={nameAr}
            style={{ backgroundImage: `url(${src})` }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
