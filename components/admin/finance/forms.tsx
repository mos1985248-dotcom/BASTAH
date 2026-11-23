// components/admin/finance/forms.tsx — أدوات نماذج صغيرة مشتركة (تعيد استعمال أنماط forms.module.css).
"use client";

import { useCallback, useState } from "react";
import { ApiError } from "@/lib/api-client";
import f from "@/components/dashboard/forms.module.css";

export function F({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className={f.fieldWrap}>
      <span className={f.fieldLabel}>{label}</span>
      {children}
      {hint && <span className={f.help}>{hint}</span>}
    </label>
  );
}

export const inputClass = f.field;
export const ltrClass = `${f.field} ${f.ltr}`;

/** يشغّل عملية كتابة مع حالة انشغال ورسالة خطأ/نجاح (لا يُكرَّر الإرسال أثناء الانشغال). */
export function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const run = useCallback(async (fn: () => Promise<unknown>, success = "تم الحفظ") => {
    if (busy) return false;
    setBusy(true); setError(""); setOk("");
    try { await fn(); setOk(success); return true; }
    catch (err) { setError(err instanceof ApiError ? err.message : "تعذّر تنفيذ العملية"); return false; }
    finally { setBusy(false); }
  }, [busy]);
  return { busy, error, ok, run, reset: () => { setError(""); setOk(""); } };
}
