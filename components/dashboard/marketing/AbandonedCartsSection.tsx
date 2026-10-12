// components/dashboard/marketing/AbandonedCartsSection.tsx
// السلات المتروكة (آخر 30 يوماً) — أرقام حقيقية من AbandonedCart. بلا هوية
// المشتري عمداً. لا بيانات بعد = «غير متاح»، لا أصفار توحي بنتيجة.
"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, RotateCcw, Send } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";

interface Recent { id: string; status: string; itemCount: number; cartValue: number; detectedAt: string; merchantEventSentAt: string | null; contact: { name: string; phone: string | null } | null }
interface Stats {
  windowDays: number; abandonedCount: number; abandonedValue: number;
  recoveredCount: number; recoveredValue: number; recoveryRate: number | null; recent: Recent[];
}

const STATUS_LABEL: Record<string, string> = { DETECTED: "بانتظار التذكير", REMINDED: "تم تذكير المشتري", RECOVERED: "تم الاسترداد" };
const cardStyle: React.CSSProperties = { background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["4"] };

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ ...cardStyle, flex: 1, minWidth: 130 }}>
      <p style={{ margin: 0, fontSize: 11, color: t.colors.text.mid }}>{label}</p>
      <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: t.typography.fontWeight.bold, color: t.colors.gold[700] }}>{value}</p>
    </div>
  );
}

export default function AbandonedCartsSection() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get<Stats>("/api/marketing/abandoned-carts").then(setStats).catch(() => setError(true));
  }, []);

  return (
    <section>
      <h2 style={{ display: "flex", alignItems: "center", gap: 7, margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.lg, color: t.colors.text.dark }}>
        <ShoppingCart size={17} strokeWidth={1.8} />
        السلات المتروكة
      </h2>
      <p style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: 12, color: t.colors.text.mid }}>
        سلة لم يُعدَّل فيها شيء ٦ ساعات فأكثر ولم يُنشأ بعدها طلب. نرسل للمشتري تذكيراً داخل التطبيق مرة واحدة أسبوعياً، وإن ربطتِ حساباً خارجياً واحداً على الأقل (من صفحة التكاملات) تُرسل بسطة حدث السلة المتروكة إلى نظام التكاملات المركزي. هوية المشتري (الاسم والجوال) لا تُرسل إلا إن وافق صراحةً، وتتوقف إن سحب موافقته.
      </p>

      {error && <p style={{ ...cardStyle, fontSize: 13, color: t.colors.semantic.danger }}>تعذّر تحميل السلات المتروكة</p>}

      {stats && stats.abandonedCount === 0 && (
        <p style={{ ...cardStyle, textAlign: "center", color: t.colors.text.mid, fontSize: 13 }}>
          غير متاح — لم تُرصد سلات متروكة بعد (يعمل الكشف مرة يومياً).
        </p>
      )}

      {stats && stats.abandonedCount > 0 && (
        <>
          <div style={{ display: "flex", gap: t.spacing["2"], flexWrap: "wrap", marginBottom: t.spacing["3"] }}>
            <Stat label={`سلات متروكة (${stats.windowDays} يوماً)`} value={String(stats.abandonedCount)} />
            <Stat label="قيمتها" value={`${stats.abandonedValue.toFixed(0)} ر.س`} />
            <Stat label="تم استردادها" value={`${stats.recoveredCount} (${stats.recoveredValue.toFixed(0)} ر.س)`} />
            <Stat label="نسبة الاسترداد" value={stats.recoveryRate === null ? "غير متاح" : `${stats.recoveryRate}%`} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
            {stats.recent.map((r) => (
              <div key={r.id} style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
                    {r.itemCount} منتج — {r.cartValue.toFixed(0)} ر.س
                  </p>
                  <p style={{ display: "flex", alignItems: "center", gap: 8, margin: "2px 0 0", fontSize: 11, color: t.colors.text.light }}>
                    {new Date(r.detectedAt).toLocaleDateString("ar-SA")}
                    {r.merchantEventSentAt && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Send size={10} /> أُرسل لنظام التكاملات</span>}
                    {r.contact && <span>وافق على التواصل: {r.contact.name}{r.contact.phone ? ` — ${r.contact.phone}` : ""}</span>}
                    {r.status === "RECOVERED" && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><RotateCcw size={10} /> مُستردّة</span>}
                  </p>
                </div>
                <span style={{ fontSize: 11, color: t.colors.text.mid }}>{STATUS_LABEL[r.status] ?? r.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
