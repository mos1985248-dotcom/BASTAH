// components/dashboard/marketing/PublishContentButton.tsx
// يرسل المحتوى للنشر عبر نظام التكاملات. يظهر فقط إن كانت خدمة النشر مفعّلة من الإدارة
// وربط التاجر حساباً خارجياً واحداً على الأقل.
"use client";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import f from "../forms.module.css";
import s from "./marketing.module.css";

export default function PublishContentButton({ contentId, status, onDone }: { contentId: string; status: string; onDone: () => void }) {
  const [canSend, setCanSend] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<{ links: unknown[]; services: { key: string }[] }>("/api/stores/marketing-links")
      .then((r) => setCanSend(r.links.length > 0 && r.services.some((s) => s.key === "content.publish")))
      .catch(() => {});
  }, []);

  if (status === "PUBLISHED" || !canSend) return null;

  const send = async () => {
    setBusy(true);
    setError("");
    try {
      await api.post(`/api/marketing/content/${contentId}/publish`, {});
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر الإرسال");
    } finally {
      setBusy(false);
      onDone();
    }
  };

  return (
    <div className={s.publish}>
      <button type="button" onClick={send} disabled={busy} className={`${f.btnSm} ${f.btnPrimary}`}>
        <Send size={13} strokeWidth={2} />
        {busy ? "جاري الإرسال..." : "إرسال للنشر"}
      </button>
      {error && <span className={`${f.err} ${s.err}`} role="alert">{error}</span>}
    </div>
  );
}
