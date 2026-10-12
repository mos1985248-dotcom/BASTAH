// components/admin/integrations/AccountTypesCard.tsx — أنواع الحسابات الخارجية المتاحة للتجار
"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import type { AccountTypeView } from "./types";

export default function AccountTypesCard({ accountTypes, stats, onChanged }: { accountTypes: AccountTypeView[]; stats: { linkedStores: number; links: number }; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const toggle = async (key: string, enabled: boolean) => {
    setBusy(true);
    setError("");
    const disabled = accountTypes.filter((a) => (a.key === key ? !enabled : !a.enabled)).map((a) => a.key);
    try {
      await api.patch("/api/admin/integrations", { disabledAccountTypes: disabled });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر الحفظ");
    } finally {
      setBusy(false);
      onChanged();
    }
  };

  return (
    <section style={{ marginTop: t.spacing["5"] }}>
      <h3 style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.md, color: t.colors.text.dark }}>أنواع الحسابات المتاحة للتجار</h3>
      <p style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: 12, color: t.colors.text.mid }}>
        {stats.linkedStores} متجر ربط حساباً ({stats.links} حساب). تعطيل نوع يخفيه عن التجار ويوقف إرساله مع الأحداث، دون حذف ما ربطوه.
      </p>
      {error && <p style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: 12, color: t.colors.semantic.danger }}>{error}</p>}
      <div style={{ background: t.colors.white, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.lg, padding: t.spacing["3"], display: "flex", flexWrap: "wrap", gap: 16 }}>
        {accountTypes.map((a) => (
          <label key={a.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", color: t.colors.text.dark }}>
            <input type="checkbox" checked={a.enabled} disabled={busy} onChange={(e) => toggle(a.key, e.target.checked)} />
            {a.label} <span style={{ fontSize: 11, color: t.colors.text.light }}>({a.links})</span>
          </label>
        ))}
      </div>
    </section>
  );
}
