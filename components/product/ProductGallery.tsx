// components/product/ProductGallery.tsx
"use client";

import { useState } from "react";
import {
  ShoppingBag,
  Star,
  Maximize2,
  X,
  Play,
  Image as ImageIcon,
} from "lucide-react";
import { t } from "@/theme";
import { ProductImageItem } from "./types";

interface Props {
  images: ProductImageItem[];
  mainImage: string | null;
  videoUrl: string | null;
  nameAr: string;
  isFeatured: boolean;
}

export default function ProductGallery({
  images,
  mainImage,
  videoUrl,
  nameAr,
  isFeatured,
}: Props) {
  const gallery =
    images.length > 0
      ? images.map((i) => i.url)
      : mainImage
        ? [mainImage]
        : [];

  const [active, setActive] = useState<number | "video">(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const src = active === "video" ? null : gallery[active];

  return (
    <div
      dir="rtl"
      className="basita-product-gallery"
      style={{
        width: "100%",
        minWidth: 0,
      }}
    >
      {/* الصورة الرئيسية */}
      <div
        className="basita-product-main-image"
        style={{
          height: 400,
          minHeight: 300,
          borderRadius: t.radius.xl,
          position: "relative",
          overflow: "hidden",
          background: src
            ? `url(${src}) center/cover`
            : `linear-gradient(135deg, ${t.colors.gold[700]}, ${t.colors.gold[600]})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 14px 38px rgba(25, 45, 35, 0.08)",
          border: `1px solid ${t.colors.cream.border}`,
        }}
        aria-label={nameAr}
      >
        {src && active !== "video" && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.22), transparent 42%)",
              pointerEvents: "none",
            }}
          />
        )}

        {active === "video" && videoUrl ? (
          <video
            src={videoUrl}
            controls
            autoPlay
            style={{
              width: "100%",
              height: "100%",
              borderRadius: t.radius.xl,
              objectFit: "cover",
              background: t.colors.primary[950],
            }}
          />
        ) : (
          !src && (
            <div
              style={{
                width: 86,
                height: 86,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: t.radius.full,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
              }}
            >
              <ShoppingBag
                size={42}
                strokeWidth={1.4}
                color="rgba(255,255,255,0.9)"
              />
            </div>
          )
        )}

        {/* شارة المنتج المميز */}
        {isFeatured && active !== "video" && (
          <span
            style={{
              position: "absolute",
              top: t.spacing["4"],
              insetInlineStart: t.spacing["4"],
              background: t.colors.gold[600],
              color: t.colors.white,
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.bold,
              padding: "7px 13px",
              borderRadius: t.radius.full,
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 5px 16px rgba(0,0,0,0.14)",
              zIndex: 2,
            }}
          >
            <Star size={12} strokeWidth={2} fill={t.colors.white} />
            منتج مميز
          </span>
        )}

        {/* عداد الصور */}
        {gallery.length > 1 && active !== "video" && (
          <span
            style={{
              position: "absolute",
              top: t.spacing["4"],
              insetInlineEnd: t.spacing["4"],
              minWidth: 34,
              height: 30,
              padding: "0 9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: t.radius.full,
              background: "rgba(15, 61, 46, 0.78)",
              color: t.colors.white,
              fontSize: 11,
              fontWeight: t.typography.fontWeight.bold,
              backdropFilter: "blur(8px)",
              zIndex: 2,
            }}
          >
            {active + 1} / {gallery.length}
          </span>
        )}

        {/* زر التكبير */}
        {src && active !== "video" && (
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            className="basita-gallery-zoom-button"
            style={{
              position: "absolute",
              bottom: t.spacing["4"],
              insetInlineEnd: t.spacing["4"],
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 14px",
              background: "rgba(255,255,255,0.94)",
              border: "1px solid rgba(255,255,255,0.8)",
              borderRadius: t.radius.full,
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
              color: t.colors.text.dark,
              cursor: "pointer",
              boxShadow: "0 5px 16px rgba(0,0,0,0.12)",
              zIndex: 3,
              transition:
                "transform 160ms ease, box-shadow 160ms ease, background 160ms ease",
            }}
          >
            <Maximize2 size={13} strokeWidth={2} />
            تكبير الصورة
          </button>
        )}
      </div>

      {/* الصور المصغرة */}
      {(gallery.length > 1 || videoUrl) && (
        <div
          className="basita-product-thumbnails"
          style={{
            display: "flex",
            alignItems: "center",
            gap: t.spacing["2"],
            marginTop: t.spacing["3"],
            padding: "2px",
            overflowX: "auto",
            scrollbarWidth: "thin",
          }}
          aria-label="صور المنتج"
        >
          {gallery.map((url, i) => {
            const isActive = active === i;

            return (
              <button
                type="button"
                key={url + i}
                onClick={() => setActive(i)}
                className="basita-product-thumbnail"
                style={{
                  width: 64,
                  height: 64,
                  flexShrink: 0,
                  position: "relative",
                  borderRadius: t.radius.md,
                  border: `2px solid ${
                    isActive ? t.colors.primary[800] : "transparent"
                  }`,
                  background: `url(${url}) center/cover`,
                  cursor: "pointer",
                  padding: 0,
                  overflow: "hidden",
                  boxShadow: isActive
                    ? "0 4px 12px rgba(15,61,46,0.14)"
                    : "0 2px 7px rgba(25,45,35,0.06)",
                  transition:
                    "transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
                }}
                aria-label={`صورة ${i + 1}`}
                aria-current={isActive ? "true" : undefined}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(15,61,46,0.08)",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </button>
            );
          })}

          {videoUrl && (
            <button
              type="button"
              onClick={() => setActive("video")}
              className="basita-product-thumbnail basita-product-video-thumb"
              style={{
                width: 64,
                height: 64,
                flexShrink: 0,
                borderRadius: t.radius.md,
                border: `2px solid ${
                  active === "video"
                    ? t.colors.primary[800]
                    : "transparent"
                }`,
                background: t.colors.primary[950],
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: t.colors.white,
                position: "relative",
                overflow: "hidden",
                boxShadow:
                  active === "video"
                    ? "0 4px 12px rgba(15,61,46,0.16)"
                    : "0 2px 7px rgba(25,45,35,0.06)",
                transition:
                  "transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
              }}
              aria-label="فيديو المنتج"
              aria-current={active === "video" ? "true" : undefined}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.06), transparent)",
                }}
              />

              <span
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: t.radius.full,
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Play
                  size={15}
                  strokeWidth={1.8}
                  fill={t.colors.white}
                />
              </span>

              <span
                style={{
                  position: "absolute",
                  bottom: 4,
                  insetInlineEnd: 6,
                  fontSize: 9,
                  fontWeight: t.typography.fontWeight.bold,
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                فيديو
              </span>
            </button>
          )}
        </div>
      )}

      {/* مؤشر وجود صور */}
      {gallery.length === 0 && !videoUrl && (
        <div
          style={{
            marginTop: t.spacing["3"],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            color: t.colors.text.light,
            fontSize: t.typography.fontSize.xs,
          }}
        >
          <ImageIcon size={14} strokeWidth={1.7} />
          لا توجد صور إضافية للمنتج
        </div>
      )}

      {/* نافذة التكبير */}
      {zoomOpen && src && (
        <div
          className="basita-gallery-lightbox"
          onClick={() => setZoomOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`تكبير صورة ${nameAr}`}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8, 31, 24, 0.94)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: t.spacing["6"],
            cursor: "zoom-out",
            backdropFilter: "blur(7px)",
            animation: "basitaGalleryFadeIn 160ms ease-out",
          }}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "min(1100px, 94vw)",
              maxHeight: "90vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={nameAr}
              style={{
                maxWidth: "100%",
                maxHeight: "90vh",
                borderRadius: t.radius.lg,
                objectFit: "contain",
                display: "block",
                boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="إغلاق"
            className="basita-gallery-close"
            style={{
              position: "absolute",
              top: t.spacing["5"],
              insetInlineEnd: t.spacing["5"],
              width: 44,
              height: 44,
              borderRadius: t.radius.full,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.96)",
              color: t.colors.text.dark,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 7px 22px rgba(0,0,0,0.18)",
              zIndex: 2,
              transition: "transform 160ms ease, background 160ms ease",
            }}
          >
            <X size={19} strokeWidth={2} />
          </button>
        </div>
      )}

      <style>{`
        .basita-product-thumbnail:hover {
          transform: translateY(-2px);
        }

        .basita-gallery-zoom-button:hover {
          transform: translateY(-2px);
          background: ${t.colors.white} !important;
          box-shadow: 0 8px 20px rgba(0,0,0,0.16) !important;
        }

        .basita-gallery-close:hover {
          transform: scale(1.05);
          background: ${t.colors.white} !important;
        }

        .basita-product-thumbnails::-webkit-scrollbar {
          height: 5px;
        }

        .basita-product-thumbnails::-webkit-scrollbar-track {
          background: transparent;
        }

        .basita-product-thumbnails::-webkit-scrollbar-thumb {
          background: rgba(15,61,46,0.18);
          border-radius: 999px;
        }

        @keyframes basitaGalleryFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (max-width: 980px) {
          .basita-product-main-image {
            height: min(440px, 68vw) !important;
          }
        }

        @media (max-width: 700px) {
          .basita-product-main-image {
            height: min(400px, 82vw) !important;
            min-height: 270px !important;
            border-radius: ${t.radius.lg} !important;
          }

          .basita-product-thumbnails {
            margin-top: ${t.spacing["2"]} !important;
          }

          .basita-product-thumbnail,
          .basita-product-video-thumb {
            width: 58px !important;
            height: 58px !important;
          }

          .basita-gallery-zoom-button {
            bottom: 12px !important;
            inset-inline-end: 12px !important;
            padding: 8px 12px !important;
          }
        }

        @media (max-width: 480px) {
          .basita-product-main-image {
            height: min(360px, 88vw) !important;
            min-height: 240px !important;
          }

          .basita-product-thumbnail,
          .basita-product-video-thumb {
            width: 54px !important;
            height: 54px !important;
          }

          .basita-gallery-lightbox {
            padding: 12px !important;
          }

          .basita-gallery-close {
            top: 12px !important;
            inset-inline-end: 12px !important;
            width: 40px !important;
            height: 40px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-product-thumbnail,
          .basita-gallery-zoom-button,
          .basita-gallery-close,
          .basita-gallery-lightbox {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}