// components/dashboard/StoreImageUpload.tsx
// رفع فعلي لصورة الشعار أو غلاف المتجر.
// يتم الرفع مباشرة عند اختيار الملف عبر POST /api/uploads/store.

"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { t } from "@/theme";

const MAX_UPLOAD_MB = 8;

export default function StoreImageUpload({
  slug,
  field,
  label,
  currentUrl,
  recommendedSize,
  aspectRatio,
  onUploaded,
}: {
  slug: string;
  field: "logo" | "cover";
  label: ReactNode;
  currentUrl: string;
  recommendedSize: string;
  aspectRatio: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploaded, setUploaded] = useState(false);

  const handleFile = async (file: File) => {
    setError("");
    setUploaded(false);

    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`حجم الملف أكبر من ${MAX_UPLOAD_MB}MB`);
      return;
    }

    setUploading(true);

    try {
      const fd = new FormData();

      fd.append("slug", slug);
      fd.append("field", field);
      fd.append("file", file);

      const response = await fetch("/api/uploads/store", {
        method: "POST",
        body: fd,
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          body?.error ?? "فشل رفع الصورة",
        );
      }

      const newUrl =
        field === "logo"
          ? body.store.logo
          : body.store.coverImage;

      onUploaded(newUrl);
      setUploaded(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "تعذّر رفع الصورة",
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const isLogo = field === "logo";

  return (
    <div
      style={{
        width: "100%",
        direction: "rtl",
        textAlign: "right",
      }}
    >
      {/* العنوان */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: t.typography.fontFamily.base,
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.bold,
            color: t.colors.text.dark,
          }}
        >
          {label}
        </span>

        {uploaded && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              color: t.colors.semantic.success,
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
              whiteSpace: "nowrap",
            }}
          >
            <CheckCircle2
              size={14}
              strokeWidth={2}
            />
            تم الحفظ
          </span>
        )}
      </div>

      {/* معاينة الصورة */}
      <div
        className={`basita-store-image-preview ${
          isLogo ? "is-logo" : "is-cover"
        }`}
        style={{
          width: isLogo ? 150 : "100%",
          maxWidth: "100%",
          aspectRatio,
          borderRadius: isLogo ? 20 : 18,
          overflow: "hidden",
          background: currentUrl
            ? `url("${currentUrl}") center / cover no-repeat`
            : t.colors.cream.warm,
          border: `1px solid ${t.colors.cream.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 11,
          boxShadow:
            "0 6px 18px rgba(67,48,29,0.055)",
          position: "relative",
          transition:
            `border-color ${t.motion.base} ${t.motion.ease}, ` +
            `box-shadow ${t.motion.base} ${t.motion.ease}`,
        }}
      >
        {!currentUrl && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: t.colors.text.light,
              padding: t.spacing["4"],
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                background: t.colors.white,
                border: `1px solid ${t.colors.cream.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ImageIcon
                size={21}
                strokeWidth={1.6}
                color={t.colors.primary[800]}
              />
            </div>

            <span
              style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight:
                  t.typography.fontWeight.medium,
              }}
            >
              لا توجد صورة بعد
            </span>
          </div>
        )}

        {uploading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "rgba(15,61,46,0.72)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: t.colors.white,
              fontSize: t.typography.fontSize.xs,
              fontWeight:
                t.typography.fontWeight.semibold,
              backdropFilter: "blur(2px)",
            }}
          >
            <div
              className="basita-upload-spinner"
              aria-hidden="true"
            />

            جاري رفع الصورة...
          </div>
        )}
      </div>

      {/* اختيار الملف */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            handleFile(file);
          }
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="basita-btn-interactive basita-store-image-button"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          minHeight: 40,
          padding: "0 15px",
          borderRadius: t.radius.full,
          border: `1px solid ${t.colors.cream.border}`,
          background: t.colors.white,
          color: t.colors.primary[800],
          fontFamily: t.typography.fontFamily.base,
          fontSize: t.typography.fontSize.xs,
          fontWeight: t.typography.fontWeight.bold,
          cursor: uploading
            ? "not-allowed"
            : "pointer",
          boxShadow:
            "0 3px 10px rgba(67,48,29,0.045)",
          opacity: uploading ? 0.65 : 1,
        }}
      >
        <Upload
          size={14}
          strokeWidth={1.9}
        />

        {uploading
          ? "جاري الرفع..."
          : currentUrl
            ? "استبدال الصورة"
            : "رفع صورة"}
      </button>

      {/* المعلومات */}
      <p
        style={{
          margin: "8px 0 0",
          fontSize: t.typography.fontSize.xs,
          lineHeight:
            t.typography.lineHeight.relaxed,
          color: t.colors.text.mid,
          fontWeight:
            t.typography.fontWeight.medium,
        }}
      >
        المقاس الموصى به: {recommendedSize}
        <br />
        JPG أو PNG أو WebP — حتى {MAX_UPLOAD_MB}MB
      </p>

      {/* الخطأ */}
      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            marginTop: 9,
            padding: "9px 10px",
            borderRadius: 12,
            background: t.colors.semantic.dangerBg,
            border:
              "1px solid rgba(220,38,38,0.12)",
            borderRight:
              `3px solid ${t.colors.semantic.danger}`,
            color: t.colors.semantic.danger,
            fontSize: t.typography.fontSize.xs,
            lineHeight:
              t.typography.lineHeight.relaxed,
          }}
        >
          <AlertTriangle
            size={15}
            strokeWidth={1.9}
            style={{
              flexShrink: 0,
              marginTop: 2,
            }}
          />

          <span>{error}</span>
        </div>
      )}
    </div>
  );
}