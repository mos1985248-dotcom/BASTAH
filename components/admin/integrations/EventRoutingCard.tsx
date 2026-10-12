// components/admin/integrations/EventRoutingCard.tsx
// توجيه الأحداث المسموح بها (من Event Catalog): تفعيل كل حدث واختيار مزوّديه.
// الحفظ فوري عند كل تغيير.
"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import type { EventView, ProviderView } from "./types";

export default function EventRoutingCard({ events, providers, onChanged }: { events: EventView[]; providers: ProviderView[]; onChanged: () => void }) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const save = async (ev: EventView, next: { enabled: boolean; providers: string[] }) => {
    setBusy(ev.key);
    setError("");
    try {
      await api.patch("/api/admin/integrations", { routing: { [ev.key]: next } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر الحفظ");
    } finally {
      setBusy("");
      onChanged();
    }
  };

  const toggleProvider = (ev: EventView, key: string) =>
    save(ev, { enabled: ev.enabled, providers: ev.providers.includes(key) ? ev.providers.filter((p) => p !== key) : [...ev.providers, key] });

  return (
    <section style={{ marginTop: t.spacing["5"] }}>
      <h3 style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.md, color: t.colors.text.dark }}>الخدمات وتوجيه الأحداث</h3>
      <p style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: 12, color: t.colors.text.mid }}>الحدث المعطَّل لا يُرسل لأي متجر. الحدث بلا مزوّد مضبوط لا يظهر للتجار كخدمة جاهزة.</p>
      {error && <p style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: 12, color: t.colors.semantic.danger }}>{error}</p>}
      {events.map((ev) => (
        <div key={ev.key} style={{ background: t.colors.white, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.lg, padding: t.spacing["4"], marginBottom: t.spacing["2"], opacity: busy === ev.key ? 0.6 : 1 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
            <input type="checkbox" checked={ev.enabled} disabled={busy === ev.key} onChange={(e) => save(ev, { enabled: e.target.checked, providers: ev.providers })} />
            {ev.label} <span dir="ltr" style={{ fontSize: 11, fontWeight: "normal", color: t.colors.text.light }}>{ev.key}</span>
          </label>
          <p style={{ margin: "4px 0 8px", fontSize: 12, color: t.colors.text.mid }}>{ev.description}</p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: t.colors.text.dark }}>
            <span style={{ color: t.colors.text.mid }}>يُوجَّه إلى:</span>
            {providers.map((p) => (
              <label key={p.key} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                <input type="checkbox" checked={ev.providers.includes(p.key)} disabled={busy === ev.key} onChange={() => toggleProvider(ev, p.key)} />
                {p.label}{!p.configured && " (غير مضبوط)"}
              </label>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
