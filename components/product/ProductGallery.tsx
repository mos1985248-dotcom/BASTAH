// components/product/ProductGallery.tsx
"use client";

import { useState } from "react";
import { ShoppingBag, Star, Maximize2, X, Play } from "lucide-react";
import { t } from "@/theme";
import { ProductImageItem } from "./types";

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

  return (
    <div>
      <div
        style={{
          height: 400,
          borderRadius: t.radius.lg,
          position: "relative",
          background: src
            ? `url(${src}) center/cover`
            : `linear-gradient(135deg, ${t.colors.gold[700]}, ${t.colors.gold[600]})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
        }}
        aria-label={nameAr}
      >
        {active === "video" && videoUrl ? (
          <video src={videoUrl} controls autoPlay style={{ width: "100%", height: "100%", borderRadius: t.radius.lg, objectFit: "cover" }} />
        ) : (
          !src && <ShoppingBag size={44} strokeWidth={1.5} color="rgba(255,255,255,0.85)" />
        )}

        {isFeatured && active !== "video" && (
          <span
            style={{
              position: "absolute",
              top: t.spacing["3"],
              insetInlineStart: t.spacing["3"],
              background: t.colors.gold[600],
              color: t.colors.white,
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.bold,
              padding: "5px 12px",
              borderRadius: t.radius.full,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Star size={12} strokeWidth={2} fill={t.colors.white} />
            منتج مميز
          </span>
        )}

        {src && active !== "video" && (
          <button
            onClick={() => setZoomOpen(true)}
            className="basita-btn-interactive"
            style={{
              position: "absolute",
              bottom: t.spacing["3"],
              insetInlineEnd: t.spacing["3"],
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              background: "rgba(255,255,255,0.92)",
              border: "none",
              borderRadius: t.radius.full,
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
              color: t.colors.text.dark,
              cursor: "pointer",
            }}
          >
            <Maximize2 size={13} strokeWidth={2} />
            تكبير الصورة
          </button>
        )}
      </div>

      {(gallery.length > 1 || videoUrl) && (
        <div style={{ display: "flex", gap: t.spacing["2"], marginTop: t.spacing["3"], overflowX: "auto" }}>
          {gallery.map((url, i) => (
            <button
              key={url + i}
              onClick={() => setActive(i)}
              style={{
                width: 64,
                height: 64,
                flexShrink: 0,
                borderRadius: t.radius.md,
                border: `2px solid ${active === i ? t.colors.primary[800] : "transparent"}`,
                background: `url(${url}) center/cover`,
                cursor: "pointer",
                padding: 0,
              }}
              aria-label={`صورة ${i + 1}`}
            />
          ))}
          {videoUrl && (
            <button
              onClick={() => setActive("video")}
              style={{
                width: 64,
                height: 64,
                flexShrink: 0,
                borderRadius: t.radius.md,
                border: `2px solid ${active === "video" ? t.colors.primary[800] : "transparent"}`,
                background: t.colors.primary[900],
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: t.colors.white,
              }}
              aria-label="فيديو المنتج"
            >
              <Play size={20} strokeWidth={1.8} fill={t.colors.white} />
            </button>
          )}
        </div>
      )}

      {zoomOpen && src && (
        <div
          onClick={() => setZoomOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,61,46,0.9)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: t.spacing["5"],
            cursor: "zoom-out",
          }}
        >
          <img src={src} alt={nameAr} style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: t.radius.md, objectFit: "contain" }} />
          <button
            onClick={() => setZoomOpen(false)}
            aria-label="إغلاق"
            style={{
              position: "absolute",
              top: t.spacing["5"],
              insetInlineEnd: t.spacing["5"],
              width: 40,
              height: 40,
              borderRadius: t.radius.full,
              border: "none",
              background: t.colors.white,
              color: t.colors.text.dark,
              cursor: "pointer",
            }}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
