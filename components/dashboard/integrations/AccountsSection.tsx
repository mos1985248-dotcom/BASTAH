// components/dashboard/integrations/AccountsSection.tsx
// التاجر يربط حساباته الخارجية أو يلغي ربطها — لا مفاتيح ولا إعدادات تقنية.
// الأنواع المعروضة هي ما فعّلته الإدارة فقط (والخادم يتحقق مرة ثانية عند الحفظ).
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import type { MerchantIntegrations } from "./types";

const inputStyle: React.CSSProperties = {
  flex: 1, minWidth: 0, padding: 9, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: 13, boxSizing: "border-box",
};

export default function AccountsSection({ data, onChanged }: { data: MerchantIntegrations; onChanged: () => void }) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const add = async (platform: string) => {
    setBusy(platform);
    setError("");
    try {
      await api.post("/api/stores/marketing-links", { platform, url: drafts[platform] ?? "" });
      setDrafts((d) => ({ ...d, [platform]: "" }));
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر حفظ الرابط");
    } finally {
      setBusy("");
    }
  };

  const remove = async (platform: string) => {
    setBusy(platform);
    await api.delete(`/api/stores/marketing-links/${platform}`).catch(() => {});
    setBusy("");
    onChanged();
  };

  return (
    <section style={{ marginBottom: t.spacing["6"] }}>
      <h2 style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.lg, color: t.colors.text.dark }}>حساباتك</h2>
      <p style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: 12, color: t.colors.text.mid }}>
        أضيفي رابط حسابك، وتتولى بسطة بقية الربط. بإضافة حساب واحد على الأقل توافقين على إرسال محتواك وأحداث متجرك (مثل السلات المتروكة) إلى نظام التكاملات في بسطة. يمكنك الإلغاء في أي وقت.
      </p>
      {error && <p style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: 12, color: t.colors.semantic.danger }}>{error}</p>}

      {data.platforms.length === 0 && <p style={{ fontSize: 13, color: t.colors.text.mid }}>لا توجد أنواع حسابات متاحة حالياً.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.platforms.map((p) => {
          const link = data.links.find((l) => l.platform === p.key);
          const disabled = busy === p.key || !(drafts[p.key] ?? "").trim();
          return (
            <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", background: t.colors.white, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, padding: "10px 14px" }}>
              <span style={{ width: 80, fontSize: 13, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{p.label}</span>
              {link ? (
                <>
                  <span dir="ltr" style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12, color: t.colors.text.mid }}>{link.url}</span>
                  <button onClick={() => remove(p.key)} disabled={busy === p.key} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", border: `1px solid ${t.colors.cream.border}`, background: t.colors.white, borderRadius: t.radius.md, fontSize: 12, cursor: "pointer", color: t.colors.semantic.danger }}>
                    <Trash2 size={13} strokeWidth={1.8} />
                    إلغاء
                  </button>
                </>
              ) : (
                <>
                  <input dir="ltr" placeholder={p.example} value={drafts[p.key] ?? ""} onChange={(e) => setDrafts((d) => ({ ...d, [p.key]: e.target.value }))} style={inputStyle} />
                  <button onClick={() => add(p.key)} disabled={disabled} style={{ padding: "7px 16px", background: t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.md, fontSize: 12, fontWeight: t.typography.fontWeight.bold, cursor: "pointer", opacity: disabled ? 0.5 : 1 }}>
                    ربط
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
