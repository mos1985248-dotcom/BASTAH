// components/dashboard/CourierDispatchCard.tsx
// بسطة للشحن — التاجر يختار مندوب مدينة المشتري ويرسل الطلب له عبر واتساب.
"use client";

import { useEffect, useState } from "react";
import { MessageCircle, AlertTriangle, Printer, Truck } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import f from "./forms.module.css";
import s from "./courier.module.css";

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

  if (!info) return error ? <p className={f.err} role="alert">{error}</p> : null;

  return (
    <section className={`${f.panel} ${s.card}`}>
      <header className={f.panelHead}>
        <h3 className={f.panelTitle}>الشحن عبر مندوب بسطة</h3>
        <Truck size={18} strokeWidth={1.8} aria-hidden="true" />
      </header>

      <div className={f.panelBody}>
        {info.current && (
          <div className={s.assigned}>
            <p className={s.assignedText}>
              أُسند إلى: <strong>{info.current.courierName ?? "—"}</strong>
            </p>
            {/* بوليصة الشحن متاحة فقط لطلب له شحنة مندوب فعلية (بسطة للشحن) */}
            <a
              href={`/api/orders/${orderId}/shipping-label`}
              target="_blank"
              rel="noopener noreferrer"
              className={s.label}
            >
              <Printer size={15} strokeWidth={1.8} />
              طباعة بوليصة الشحن
            </a>
          </div>
        )}

        {info.couriers.length === 0 ? (
          <p className={s.none}>
            <AlertTriangle size={14} strokeWidth={1.8} />
            لا يوجد مندوب متاح لمدينة {info.city} — تواصل مع الإدارة.
          </p>
        ) : (
          <>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              aria-label="اختر المندوب"
              className={`${f.field} ${s.select}`}
            >
              {info.couriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button
              type="button"
              onClick={send}
              disabled={sending || !selected}
              className={`${f.cta} ${s.send}`}
            >
              <MessageCircle size={16} strokeWidth={1.8} />
              {info.current ? "إعادة الإرسال عبر واتساب" : "إرسال للمندوب عبر واتساب"}
            </button>
          </>
        )}

        {error && <p className={f.err} role="alert">{error}</p>}
      </div>
    </section>
  );
}
