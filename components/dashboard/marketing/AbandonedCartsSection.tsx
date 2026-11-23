// components/dashboard/marketing/AbandonedCartsSection.tsx
// السلات المتروكة (آخر 30 يوماً) — أرقام حقيقية من AbandonedCart. بلا هوية
// المشتري عمداً. لا بيانات بعد = «غير متاح»، لا أصفار توحي بنتيجة.
"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, RotateCcw, Send } from "lucide-react";
import { api } from "@/lib/api-client";
import f from "../forms.module.css";
import s from "./marketing.module.css";

interface Recent { items: { name: string; quantity: number }[]; id: string; status: string; itemCount: number; cartValue: number; detectedAt: string; merchantEventSentAt: string | null; contact: { name: string; phone: string | null } | null }
interface Stats {
  windowDays: number; abandonedCount: number; abandonedValue: number;
  recoveredCount: number; recoveredValue: number; recoveryRate: number | null; recent: Recent[];
}

const STATUS_LABEL: Record<string, string> = { DETECTED: "بانتظار التذكير", REMINDED: "تم تذكير المشتري", RECOVERED: "تم الاسترداد" };

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={s.stat}>
      <p className={s.statLbl}>{label}</p>
      <p className={s.statGold}>{value}</p>
    </div>
  );
}

export default function AbandonedCartsSection() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const load = () => api.get<Stats>("/api/marketing/abandoned-carts").then(setStats).catch(() => setError(true));
  useEffect(() => { void load(); }, []);

  async function remind(id: string) {
    setBusy(id);
    setFeedback("");
    try {
      await api.post("/api/marketing/abandoned-carts", { id });
      setFeedback("أُرسل تذكير داخل بسطة.");
      await load();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "تعذّر إرسال التذكير.");
    } finally { setBusy(null); }
  }

  return (
    <section className={s.sec}>
      <h2 className={s.h2}>
        <ShoppingCart size={18} strokeWidth={1.8} />
        السلات المتروكة
      </h2>
      <p className={s.lead}>
        تُرصد السلة بعد ست ساعات من آخر تعديل. تصل التذكيرات داخل بسطة للعملاء الذين وافقوا على استقبالها.
      </p>

      {feedback && <p role="status">{feedback}</p>}
      {error && <p className={f.err} role="alert">تعذّر تحميل السلات المتروكة</p>}

      {stats && stats.abandonedCount === 0 && (
        <p className={s.empty}>غير متاح — لم تُرصد سلات متروكة بعد (يعمل الكشف مرة يومياً).</p>
      )}

      {stats && stats.abandonedCount > 0 && (
        <>
          <div className={s.wrapRow}>
            <Stat label={`سلات متروكة (${stats.windowDays} يوماً)`} value={String(stats.abandonedCount)} />
            <Stat label="قيمتها" value={`${stats.abandonedValue.toFixed(0)} ر.س`} />
            <Stat label="تم استردادها" value={`${stats.recoveredCount} (${stats.recoveredValue.toFixed(0)} ر.س)`} />
            <Stat label="نسبة الاسترداد" value={stats.recoveryRate === null ? "غير متاح" : `${stats.recoveryRate}%`} />
          </div>
          <div className={s.list}>
            {stats.recent.map((r) => (
              <div key={r.id} className={s.card}>
                <div className={s.cartTop}>
                  <p className={s.cardTitle}>
                    {r.itemCount} منتج — {r.cartValue.toFixed(0)} ر.س
                  </p>
                  <span className={s.cartStatus}>{STATUS_LABEL[r.status] ?? r.status}</span>
                </div>
                {r.items.length > 0 && <ul>{r.items.map((item, index) => <li key={index}>{item.name} × {item.quantity}</li>)}</ul>}
                {r.status !== "RECOVERED" && r.contact && <button type="button" disabled={busy !== null} onClick={() => remind(r.id)}>إرسال تذكير</button>}
                <p className={s.cartMeta}>
                  {/* تغيير: ميلادي (ar-SA وحده يعرض التاريخ الهجري) */}
                  {new Date(r.detectedAt).toLocaleDateString("ar-SA-u-ca-gregory")}
                  {r.merchantEventSentAt && <span><Send size={11} /> أُرسل لنظام التكاملات</span>}
                  {r.contact && <span>وافق على التواصل: {r.contact.name}{r.contact.phone ? ` — ${r.contact.phone}` : ""}</span>}
                  {r.status === "RECOVERED" && <span><RotateCcw size={11} /> مُستردّة</span>}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
