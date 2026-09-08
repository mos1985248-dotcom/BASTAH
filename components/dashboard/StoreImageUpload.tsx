// components/dashboard/StoreImageUpload.tsx
// رفع فعلي (ليس رابطاً يدوياً) — يستخدم POST /api/uploads/store الجاهز.
// الرفع يحدث فوراً عند اختيار الملف ويُحفَظ في قاعدة البيانات مباشرة من
// السيرفر (لا يحتاج زر "حفظ" منفصل)، ثم يُحدَّث المعاينة هنا فوراً.
"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, Upload, Image as ImageIcon } from "lucide-react";
import { t } from "@/theme";

const MAX_UPLOAD_MB = 8; // يطابق lib/image-processing.ts MAX_UPLOAD_BYTES

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
  recommendedSize: string; // مثال: "500×500 بكسل"
  aspectRatio: string; // مثال: "1 / 1" أو "8 / 3"
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`حجم الملف أكبر من ${MAX_UPLOAD_MB}MB`);
      return;
    }
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("slug", slug);
      fd.append("field", field);
      fd.append("file", file);
      const res = await fetch("/api/uploads/store", { method: "POST", body: fd });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "فشل رفع الصورة");
      const newUrl = field === "logo" ? body.store.logo : body.store.coverImage;
      onUploaded(newUrl);
    } catch (err: any) {
      setError(err.message ?? "تعذّر رفع الصورة");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div style={{ direction: "rtl", textAlign: "right" }}>
      <span style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 6, color: t.colors.text.dark }}>
        {label}
      </span>

      <div
        style={{
          width: "100%",
          aspectRatio,
          maxWidth: field === "logo" ? 140 : "100%",
          borderRadius: field === "logo" ? t.radius.full : t.radius.lg,
          overflow: "hidden",
          background: currentUrl ? `url(${currentUrl}) center/cover` : t.colors.cream.warm,
          border: `1px solid ${t.colors.cream.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
          boxShadow: t.shadows.sm,
          position: "relative",
        }}
      >
        {!currentUrl && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: t.colors.text.light, padding: t.spacing["3"] }}>
            <ImageIcon size={22} strokeWidth={1.5} color={t.colors.primary[800]} />
            <span style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium }}>لا توجد صورة بعد</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="basita-btn-interactive"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 18px",
          borderRadius: t.radius.full,
          border: `1px solid ${t.colors.cream.border}`,
          background: t.colors.white,
          color: t.colors.primary[800],
          fontSize: t.typography.fontSize.xs,
          fontWeight: t.typography.fontWeight.bold,
          cursor: uploading ? "not-allowed" : "pointer",
          boxShadow: t.shadows.sm,
        }}
      >
        <Upload size={14} strokeWidth={1.8} />
        {uploading ? "جاري الرفع..." : currentUrl ? "استبدال الصورة" : "رفع صورة"}
      </button>

      <p style={{ margin: "6px 0 0", fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, fontWeight: t.typography.fontWeight.medium }}>
        المقاس الموصى به: {recommendedSize} — JPG أو PNG أو WebP، حتى {MAX_UPLOAD_MB}MB
      </p>

      {error && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: "6px 0 0", fontSize: t.typography.fontSize.xs, color: t.colors.semantic.danger, fontWeight: t.typography.fontWeight.bold }}>
          <AlertTriangle size={14} strokeWidth={1.8} />
          {error}
        </p>
      )}
    </div>
  );
}