// components/dashboard/marketing/ContentSection.tsx — المحتوى التسويقي (مسودات + إرسال للنشر عبر التكاملات).
"use client";

import { useState } from "react";
import { Film, Plus, Eye, MousePointerClick, ShoppingBag, AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import f from "../forms.module.css";
import s from "./marketing.module.css";
import MarketingStatusBadge from "./MarketingStatusBadge";
import PublishContentButton from "./PublishContentButton";
import type { MarketingContentRow } from "./types";

function Metric({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: number }) {
  return (
    <span className={s.metric}>
      <Icon size={14} strokeWidth={1.8} />
      <strong>{value}</strong>
      {label}
    </span>
  );
}

export default function ContentSection({ content, onChanged }: { content: MarketingContentRow[]; onChanged: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setSaving(true);
    setError("");
    try {
      await api.post("/api/marketing/content", { title, videoUrl: videoUrl || undefined });
      setTitle("");
      setVideoUrl("");
      setShowForm(false);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر إنشاء المحتوى");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={s.sec}>
      <div className={s.secHead}>
        <h2 className={s.h2}>
          <Film size={18} strokeWidth={1.8} />
          المحتوى التسويقي
        </h2>
        <button type="button" onClick={() => setShowForm((v) => !v)} className={`${f.btnSm} ${showForm ? "" : f.btnPrimary}`}>
          <Plus size={14} strokeWidth={2.2} />
          {showForm ? "إلغاء" : "محتوى جديد"}
        </button>
      </div>

      {showForm && (
        <div className={f.formBox}>
          <label className={f.fieldWrap}>
            <span className={f.fieldLabel}>عنوان المحتوى</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: جولة داخل مطبخ الأسرة" dir="rtl" className={f.field} />
          </label>
          <label className={f.fieldWrap}>
            <span className={f.fieldLabel}>رابط الفيديو (اختياري)</span>
            <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." dir="ltr" className={`${f.field} ${f.ltr}`} />
          </label>
          {error && (
            <p className={f.err} role="alert">
              <AlertTriangle size={14} strokeWidth={1.8} />
              {error}
            </p>
          )}
          <button type="button" onClick={handleCreate} disabled={saving || title.trim().length < 2} className={`${f.cta} ${s.submit}`}>
            {saving ? "جاري الحفظ..." : "حفظ كمسودة"}
          </button>
        </div>
      )}

      {content.length === 0 ? (
        <p className={s.empty}>لا يوجد محتوى تسويقي بعد.</p>
      ) : (
        <div className={s.list}>
          {content.map((c) => (
            <div key={c.id} className={s.card}>
              <div className={s.cardTop}>
                <p className={s.cardTitle}>{c.title}</p>
                <MarketingStatusBadge status={c.status} />
              </div>
              <p className={s.cardMeta}>{c.providerName ?? "غير مربوط بأي منصة بعد"}</p>
              <PublishContentButton contentId={c.id} status={c.status} onDone={onChanged} />
              <div className={s.metrics}>
                <Metric icon={Eye} label="مشاهدات" value={c.metric?.views ?? 0} />
                <Metric icon={MousePointerClick} label="نقرات للمنتج" value={c.metric?.clicksToProduct ?? 0} />
                <Metric icon={ShoppingBag} label="مبيعات منسوبة" value={c.metric?.purchasesAttributed ?? 0} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
