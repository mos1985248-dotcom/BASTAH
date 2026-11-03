// components/admin/ui/SettingsField.tsx
"use client";

import { useState } from "react";
import { Check, AlertTriangle, type LucideIcon } from "lucide-react";
import s from "../admin-ui.module.css";

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
      setErrorMsg("أدخل رقماً صحيحاً أكبر من أو يساوي صفر");
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
    <div className={s.setting}>
      <div className={s.setHead}>
        <Icon size={18} strokeWidth={1.7} />
        <h3 className={s.setTitle}>{label}</h3>
      </div>

      <p className={s.setHelper}>{helper}</p>

      <div className={s.setRow}>
        <div className={s.inputBox}>
          <input
            type="number"
            min={0}
            step="0.5"
            value={draft}
            aria-label={label}
            onChange={(e) => {
              setDraft(e.target.value);
              setStatus("idle");
            }}
            className={s.numInput}
          />
          <span className={s.unit}>ر.س</span>
        </div>

        <button type="button" onClick={handleSave} disabled={saving || !dirty} className={s.save}>
          {saving ? "جاري الحفظ..." : "حفظ"}
        </button>
      </div>

      {status === "success" && (
        <p className={`${s.msg} ${s.msgOk}`} role="status">
          <Check size={14} strokeWidth={2.2} />
          تم الحفظ بنجاح — يسري على الطلبات الجديدة فقط
        </p>
      )}
      {status === "error" && (
        <p className={`${s.msg} ${s.msgErr}`} role="alert">
          <AlertTriangle size={14} strokeWidth={1.8} />
          {errorMsg}
        </p>
      )}
    </div>
  );
}
