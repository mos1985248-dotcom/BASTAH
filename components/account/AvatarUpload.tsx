// components/account/AvatarUpload.tsx
"use client";

import { useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import s from "./account.module.css";

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
    <div className={s.avatarRow}>
      {/* صورة المستخدم قيمة ديناميكية فتبقى مضمّنة */}
      <div className={s.avatarBig} style={currentUrl ? { backgroundImage: `url(${currentUrl})` } : undefined} aria-hidden="true">
        {!currentUrl && name.trim().charAt(0)}
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className={s.upload}>
          {uploading ? "جاري الرفع..." : currentUrl ? "تغيير الصورة" : "رفع صورة"}
        </button>
        <p className={s.avatarHint}>JPG أو PNG أو WebP، حتى {MAX_UPLOAD_MB}MB</p>
        {error && (
          <p className={s.avatarErr} role="alert">
            <AlertTriangle size={13} strokeWidth={1.8} />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
