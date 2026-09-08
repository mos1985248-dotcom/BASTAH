// components/account/AvatarUpload.tsx
"use client";

import { useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { t } from "@/theme";

const MAX_UPLOAD_MB = 8;

export default function AvatarUpload({ currentUrl, name, onUploaded }: { currentUrl: string | null; name: string; onUploaded: (url: string) => void }) {
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
      fd.append("file", file);
      const res = await fetch("/api/uploads/avatar", { method: "POST", body: fd });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "فشل رفع الصورة");
      onUploaded(body.user.avatar);
    } catch (err: any) {
      setError(err.message ?? "تعذّر رفع الصورة");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: t.spacing["4"] }}>
      <div
        style={{
          width: 80, height: 80, borderRadius: t.radius.full, flexShrink: 0,
          background: currentUrl ? `url(${currentUrl}) center/cover` : t.colors.primary[100],
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800],
          border: `1px solid ${t.colors.cream.border}`,
        }}
      >
        {!currentUrl && name.trim().charAt(0)}
      </div>

      <div>
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
          style={{
            padding: "7px 16px", borderRadius: t.radius.full, border: `1px solid ${t.colors.cream.border}`,
            background: t.colors.white, color: t.colors.primary[800], fontSize: 12, fontWeight: t.typography.fontWeight.bold,
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        >
          {uploading ? "جاري الرفع..." : currentUrl ? "تغيير الصورة" : "رفع صورة"}
        </button>
        <p style={{ margin: "6px 0 0", fontSize: 11, color: t.colors.text.light }}>
          JPG أو PNG أو WebP، حتى {MAX_UPLOAD_MB}MB
        </p>
        {error && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, margin: "4px 0 0", fontSize: 12, color: t.colors.semantic.danger }}>
            <AlertTriangle size={12} strokeWidth={1.8} />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
