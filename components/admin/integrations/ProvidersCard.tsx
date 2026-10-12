// components/admin/integrations/ProvidersCard.tsx
// إعداد المزوّدين. النموذج يُبنى من fields التي يعلنها كل مزوّد في السجل، فإضافة
// مزوّد جديد لا تتطلب تعديل هذا الملف. الأسرار لا تُعرض بعد الحفظ.
"use client";

import { useState } from "react";
import { PlugZap, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import type { ProviderView } from "./types";

const input: React.CSSProperties = { padding: 9, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: 13, boxSizing: "border-box", flex: 1, minWidth: 140 };
const btn: React.CSSProperties = { display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", border: `1px solid ${t.colors.cream.border}`, background: t.colors.white, borderRadius: t.radius.md, fontSize: 12, cursor: "pointer", color: t.colors.text.dark };

function randomSecret(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function ProviderForm({ provider, onChanged }: { provider: ProviderView; onChanged: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const base = `/api/admin/integrations/providers/${provider.key}`;

  const run = async (name: string, fn: () => Promise<unknown>, onOk?: () => void) => {
    setBusy(name);
    setError("");
    try { await fn(); onOk?.(); } catch (err) { setError(err instanceof ApiError ? err.message : "تعذّرت العملية"); }
    finally { setBusy(""); onChanged(); }
  };

  const filled = provider.fields.every((f) => (values[f.name] ?? "").trim() !== "");

  return (
    <div style={{ background: t.colors.white, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.lg, padding: t.spacing["4"], marginBottom: t.spacing["3"] }}>
      <p style={{ margin: 0, fontSize: 14, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{provider.label}</p>
      <p style={{ margin: "2px 0 8px", fontSize: 12, color: t.colors.text.mid }}>{provider.description}</p>
      <p style={{ margin: 0, fontSize: 13, color: t.colors.text.dark }}>
        الحالة: <strong>{provider.configured ? `مضبوط${provider.summary ? ` (${provider.summary})` : ""}` : "غير مضبوط"}</strong>
      </p>
      {provider.configured && provider.lastTestedAt && (
        <p style={{ display: "flex", alignItems: "center", gap: 4, margin: "6px 0 0", fontSize: 12, color: provider.lastTestOk ? t.colors.semantic.success : t.colors.semantic.danger }}>
          {provider.lastTestOk ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
          آخر اختبار: {provider.lastTestOk ? "ناجح" : "فشل"} — {new Date(provider.lastTestedAt).toLocaleString("ar-SA")}
        </p>
      )}
      {provider.configured && (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button onClick={() => run("test", () => api.post(`${base}/test`, {}))} disabled={busy === "test"} style={btn}><PlugZap size={13} />{busy === "test" ? "جاري الاختبار..." : "اختبار الاتصال"}</button>
          <button onClick={() => window.confirm("إزالة هذا المزوّد؟ ستتوقف الأحداث الموجّهة إليه.") && run("remove", () => api.delete(base))} disabled={busy === "remove"} style={{ ...btn, color: t.colors.semantic.danger }}><Trash2 size={13} />إزالة</button>
        </div>
      )}

      <p style={{ margin: `${t.spacing["3"]} 0 6px`, fontSize: 12, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.mid }}>{provider.configured ? "استبدال البيانات" : "إدخال البيانات"}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {provider.fields.map((f) => (
          <input key={f.name} dir="ltr" type={f.secret ? "password" : "text"} autoComplete="off" placeholder={f.placeholder ?? f.label} aria-label={f.label}
            value={values[f.name] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))} style={input} />
        ))}
        {provider.fields.filter((f) => f.generate).map((f) => (
          <button key={f.name} onClick={() => setValues((v) => ({ ...v, [f.name]: randomSecret() }))} style={btn}>توليد مفتاح</button>
        ))}
      </div>
      {error && <p style={{ margin: "8px 0 0", fontSize: 12, color: t.colors.semantic.danger }}>{error}</p>}
      <button onClick={() => run("save", () => api.post(base, values), () => setValues({}))} disabled={busy === "save" || !filled}
        style={{ ...btn, marginTop: 10, background: t.colors.primary[800], color: t.colors.white, border: "none", fontWeight: t.typography.fontWeight.bold, opacity: busy === "save" || !filled ? 0.5 : 1 }}>
        {busy === "save" ? "جاري الحفظ..." : "حفظ"}
      </button>
    </div>
  );
}

export default function ProvidersCard({ providers, onChanged }: { providers: ProviderView[]; onChanged: () => void }) {
  return (
    <section>
      <h3 style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.md, color: t.colors.text.dark }}>المزوّدون</h3>
      {providers.map((p) => <ProviderForm key={p.key} provider={p} onChanged={onChanged} />)}
    </section>
  );
}
