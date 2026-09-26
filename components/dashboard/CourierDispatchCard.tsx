// components/dashboard/CourierDispatchCard.tsx
// بسطة للشحن — التاجر يختار مندوب مدينة المشتري ويرسل الطلب له عبر واتساب.
"use client";

import { useEffect, useState } from "react";
import { MessageCircle, AlertTriangle, Printer } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";

interface CourierInfo {
  city: string;
  couriers: { id: string; name: string }[];
  current: { courierName: string | null; status: string } | null;
}

export default function CourierDispatchCard({ orderId, onDone }: { orderId: string; onDone: () => void }) {
  const [info, setInfo] = useState<CourierInfo | null>(null);
  const [selected, setSelected] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    api.get<CourierInfo>(`/api/orders/${orderId}/courier`)
      .then((r) => { setInfo(r); setSelected((s) => s || r.couriers[0]?.id || ""); })
      .catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل المناديب"));
  };
  useEffect(load, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async () => {
    setSending(true);
    setError("");
    // نفتح النافذة فوراً (ضغطة المستخدم) ثم نوجّهها للرابط — حتى لا يحجبها المتصفح بعد الانتظار
    const win = window.open("", "_blank");
    try {
      const { waUrl } = await api.post<{ waUrl: string }>(`/api/orders/${orderId}/courier`, { courierId: selected });
      if (win) win.location.href = waUrl;
      else window.location.href = waUrl;
      load();
      onDone();
    } catch (err) {
      win?.close();
      setError(err instanceof ApiError ? err.message : "تعذّر إرسال الطلب للمندوب");
    } finally {
      setSending(false);
    }
  };

  const card = { background: t.colors.white, borderRadius: t.radius.lg, padding: t.spacing["4"], marginBottom: t.spacing["3"] };
  const h3 = { margin: "0 0 10px", fontSize: t.typography.fontSize.base, color: t.colors.text.dark };

  if (!info) return error ? <p style={{ color: t.colors.semantic.danger, fontSize: 12 }}>{error}</p> : null;

  return (
    <div style={card}>
      <h3 style={h3}>الشحن عبر مندوب بسطة</h3>
      {info.current && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: t.spacing["2"], flexWrap: "wrap", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 12, color: t.colors.text.mid }}>
            أُسند إلى: <strong style={{ color: t.colors.text.dark }}>{info.current.courierName ?? "—"}</strong>
          </p>
          {/* بوليصة الشحن متاحة فقط لطلب له شحنة مندوب فعلية (بسطة للشحن) */}
          <a
            href={`/api/orders/${orderId}/shipping-label`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: t.colors.primary[800], textDecoration: "none", fontWeight: t.typography.fontWeight.bold }}
          >
            <Printer size={14} strokeWidth={1.8} />
            طباعة بوليصة الشحن
          </a>
        </div>
      )}
      {info.couriers.length === 0 ? (
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 12, color: t.colors.semantic.warning }}>
          <AlertTriangle size={12} strokeWidth={1.8} />
          لا يوجد مندوب متاح لمدينة {info.city} — تواصلي مع الإدارة.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            style={{ padding: 10, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, direction: "rtl" }}
          >
            {info.couriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button
            onClick={send}
            disabled={sending || !selected}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 11, background: t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.md, cursor: sending ? "not-allowed" : "pointer", fontWeight: t.typography.fontWeight.bold }}
          >
            <MessageCircle size={15} strokeWidth={1.8} />
            {info.current ? "إعادة الإرسال عبر واتساب" : "إرسال للمندوب عبر واتساب"}
          </button>
        </div>
      )}
      {error && <p style={{ margin: `${t.spacing["2"]} 0 0`, fontSize: 12, color: t.colors.semantic.danger }}>{error}</p>}
    </div>
  );
}
