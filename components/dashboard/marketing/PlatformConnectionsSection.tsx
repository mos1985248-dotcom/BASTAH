// components/dashboard/marketing/PlatformConnectionsSection.tsx
// ربط منصة خارجية (لينز/فيسبوك/تيك توك/سناب...) — حقول اعتماد حرة لأن كل
// منصة تطلب شكلاً مختلفاً. هذا يخزّن البيانات فقط؛ لا إرسال فعلي لأي منصة
// بعد (lib/marketing/provider.interface.ts لا يزال بلا أي تنفيذ حقيقي) —
// الزر "اختبار الاتصال" يُعرض معطَّلاً مع توضيح هذا صراحة، لا نتيجة ملفَّقة.
"use client";

import { useEffect, useState } from "react";
import { Link2, Plus, Trash2, AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";

interface Connection { id: string; provider: string; isActive: boolean; connectedAt: string }

const inputStyle: React.CSSProperties = {
  padding: 9, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: 13, boxSizing: "border-box", flex: 1, minWidth: 0,
};

export default function PlatformConnectionsSection() {
  const [connections, setConnections] = useState<Connection[] | null>(null);
  const [provider, setProvider] = useState("");
  const [credKey, setCredKey] = useState("");
  const [credValue, setCredValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    api.get<{ connections: Connection[] }>("/api/stores/marketing-connections")
      .then((r) => setConnections(r.connections))
      .catch(() => setError("تعذّر تحميل المنصات المربوطة"));
  };
  useEffect(load, []);

  const add = async () => {
    setSaving(true);
    setError("");
    try {
      await api.post("/api/stores/marketing-connections", {
        provider, credentials: { [credKey || "key"]: credValue },
      });
      setProvider(""); setCredKey(""); setCredValue("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر حفظ الربط");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: string) => {
    await api.delete(`/api/stores/marketing-connections/${p}`).catch(() => {});
    load();
  };

  return (
    <section style={{ marginBottom: t.spacing["6"] }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: 7, margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.lg, color: t.colors.text.dark }}>
        <Link2 size={17} strokeWidth={1.8} />
        ربط منصات خارجية
      </h2>
      <p style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: 12, color: t.colors.text.mid }}>
        لينز، فيسبوك، تيك توك، سناب أو أي منصة أخرى — أضيفي اسمها وبيانات حسابك عندها، وسنفعّل إرسال البيانات إليها حال توفّر الدعم لها.
      </p>

      {connections?.map((c) => (
        <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: t.colors.white, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, padding: "10px 14px", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: t.typography.fontWeight.bold, textTransform: "capitalize", color: t.colors.text.dark }}>{c.provider}</span>
          <button onClick={() => remove(c.provider)} style={{ border: "none", background: "none", cursor: "pointer", color: t.colors.semantic.danger, display: "flex" }}>
            <Trash2 size={15} strokeWidth={1.8} />
          </button>
        </div>
      ))}

      <div style={{ background: t.colors.cream.bg, borderRadius: t.radius.md, padding: t.spacing["3"] }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input placeholder="اسم المنصة (مثال: facebook)" value={provider} onChange={(e) => setProvider(e.target.value)} style={inputStyle} />
          <input placeholder="اسم الحقل (مثال: access_token)" value={credKey} onChange={(e) => setCredKey(e.target.value)} style={inputStyle} />
          <input placeholder="القيمة" value={credValue} onChange={(e) => setCredValue(e.target.value)} style={inputStyle} />
        </div>
        {error && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, margin: "8px 0 0", fontSize: 12, color: t.colors.semantic.danger }}>
            <AlertTriangle size={12} strokeWidth={1.8} />
            {error}
          </p>
        )}
        <button
          onClick={add}
          disabled={saving || !provider.trim() || !credKey.trim() || !credValue.trim()}
          style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.md, fontSize: 13, fontWeight: t.typography.fontWeight.bold, cursor: "pointer", opacity: saving ? 0.6 : 1 }}
        >
          <Plus size={14} strokeWidth={2.2} />
          {saving ? "جاري الحفظ..." : "ربط المنصة"}
        </button>
      </div>
    </section>
  );
}
