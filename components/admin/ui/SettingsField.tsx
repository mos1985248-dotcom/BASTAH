// components/admin/ui/SettingsField.tsx
"use client";

import { useState } from "react";
import { Check, AlertTriangle, type LucideIcon } from "lucide-react";
import { t } from "@/theme";

export default function SettingsField({
  icon: Icon,
  label,
  helper,
  value,
  onSave,
}: {
  icon: LucideIcon;
  label: string;
  helper: string;
  value: number;
  onSave: (v: number) => Promise<void>;
}) {
  const [draft, setDraft] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const dirty = Number(draft) !== value;

  const handleSave = async () => {
    const num = Number(draft);
    if (!Number.isFinite(num) || num < 0) {
      setStatus("error");
      setErrorMsg("أدخلي رقماً صحيحاً أكبر من أو يساوي صفر");
      return;
    }
    setSaving(true);
    setStatus("idle");
    try {
      await onSave(num);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "تعذّر حفظ الإعداد");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["5"] }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Icon size={17} strokeWidth={1.7} color={t.colors.primary[800]} />
        <h3 style={{ margin: 0, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{label}</h3>
      </div>
      <p style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>{helper}</p>

      <div style={{ display: "flex", gap: t.spacing["2"], alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 160 }}>
          <input
            type="number"
            min={0}
            step="0.5"
            value={draft}
            onChange={(e) => { setDraft(e.target.value); setStatus("idle"); }}
            style={{ width: "100%", padding: "10px 46px 10px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], boxSizing: "border-box" }}
          />
          <span style={{ position: "absolute", insetInlineEnd: 12, top: "50%", transform: "translateY(-50%)", fontSize: t.typography.fontSize.xs, color: t.colors.text.light }}>ر.س</span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          style={{
            padding: "10px 20px",
            background: !dirty ? t.colors.cream.border : saving ? t.colors.primary[600] : t.colors.primary[800],
            color: !dirty ? t.colors.text.light : t.colors.white,
            border: "none",
            borderRadius: t.radius.md,
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.bold,
            cursor: saving || !dirty ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "جاري الحفظ..." : "حفظ"}
        </button>
      </div>

      {status === "success" && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: `${t.spacing["2"]} 0 0`, fontSize: t.typography.fontSize.xs, color: t.colors.semantic.success }}>
          <Check size={13} strokeWidth={2.2} />
          تم الحفظ بنجاح — يسري على الطلبات الجديدة فقط
        </p>
      )}
      {status === "error" && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: `${t.spacing["2"]} 0 0`, fontSize: t.typography.fontSize.xs, color: t.colors.semantic.danger }}>
          <AlertTriangle size={13} strokeWidth={1.8} />
          {errorMsg}
        </p>
      )}
    </div>
  );
}
