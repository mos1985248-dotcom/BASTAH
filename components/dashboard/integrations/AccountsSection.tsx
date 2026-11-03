// components/dashboard/integrations/AccountsSection.tsx
// التاجر يربط حساباته الخارجية أو يلغي ربطها — لا مفاتيح ولا إعدادات تقنية.
// الأنواع المعروضة هي ما فعّلته الإدارة فقط (والخادم يتحقق مرة ثانية عند الحفظ).
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import f from "../forms.module.css";
import s from "./integrations.module.css";
import type { MerchantIntegrations } from "./types";

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
    <section className={s.section}>
      <h2 className={s.h2}>حساباتك</h2>
      <p className={s.lead}>
        أضف رابط حسابك، وتتولى بسطة بقية الربط. بإضافة حساب واحد على الأقل توافق على إرسال محتواك وأحداث متجرك (مثل السلات المتروكة) إلى نظام التكاملات في بسطة. يمكنك الإلغاء في أي وقت.
      </p>
      {error && <p className={f.err} role="alert">{error}</p>}

      {data.platforms.length === 0 && <p className={s.empty}>لا توجد أنواع حسابات متاحة حالياً.</p>}
      <div className={f.stackCol}>
        {data.platforms.map((p) => {
          const link = data.links.find((l) => l.platform === p.key);
          const disabled = busy === p.key || !(drafts[p.key] ?? "").trim();
          return (
            <div key={p.key} className={s.account}>
              <span className={s.platform}>{p.label}</span>
              {link ? (
                <>
                  <span dir="ltr" className={s.url}>{link.url}</span>
                  <button type="button" onClick={() => remove(p.key)} disabled={busy === p.key} className={`${f.btnSm} ${f.btnDanger}`}>
                    <Trash2 size={14} strokeWidth={1.8} />
                    إلغاء
                  </button>
                </>
              ) : (
                <>
                  <input
                    dir="ltr"
                    placeholder={p.example}
                    value={drafts[p.key] ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [p.key]: e.target.value }))}
                    aria-label={`رابط ${p.label}`}
                    className={`${f.field} ${f.ltr} ${s.draft}`}
                  />
                  <button type="button" onClick={() => add(p.key)} disabled={disabled} className={`${f.btnSm} ${f.btnPrimary} ${s.link}`}>
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
