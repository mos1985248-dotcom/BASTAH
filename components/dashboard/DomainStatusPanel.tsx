// components/dashboard/DomainStatusPanel.tsx
// حالة ربط الدومين الحيّة + سجلات DNS المطلوبة من التاجر (تأتي من Vercel نفسها).
"use client";
import { useState } from "react";
import { CheckCircle2, Clock, RefreshCw, Copy, Check } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import type { DomainStatus } from "@/lib/domain-types";
import s from "./forms.module.css";

const STATE_TEXT: Record<DomainStatus["state"], { label: string; hint: string }> = {
  CONNECTED: { label: "متصل ويعمل", hint: "متجرك يظهر الآن على دومينك." },
  PENDING_DNS: { label: "بانتظار إعداد DNS", hint: "أضف السجل التالي عند مزوّد الدومين، ثم اضغط «تحقق الآن». قد يستغرق الانتشار من دقائق إلى بضع ساعات." },
  PENDING_OWNERSHIP: { label: "بانتظار إثبات الملكية", hint: "دومينك مسجَّل سابقاً على Vercel — أضف سجل TXT التالي ليتأكد من ملكيتك، ثم اضغط «تحقق الآن»." },
};

function CopyValue({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard?.writeText(value); setDone(true); setTimeout(() => setDone(false), 1500); }}
      aria-label="نسخ"
      className={s.tileBtn}
      style={{ width: 32, height: 32, color: "var(--ui-green)", display: "inline-flex", verticalAlign: "middle" }}
    >
      {done ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.8} />}
    </button>
  );
}

export default function DomainStatusPanel({
  status, checking, onCheck,
}: { status: DomainStatus | null; checking: boolean; onCheck: () => void }) {
  if (!status) {
    return (
      <p className={s.help} style={uiVars}>
        تعذّر قراءة حالة الربط الآن.{" "}
        <button type="button" onClick={onCheck} disabled={checking} className={s.link} style={{ border: 0, background: "none", cursor: "pointer", fontFamily: "inherit" }}>
          إعادة المحاولة
        </button>
      </p>
    );
  }

  const text = STATE_TEXT[status.state];
  const ok = status.state === "CONNECTED";
  const Icon = ok ? CheckCircle2 : Clock;

  return (
    <div className={s.formBox} style={uiVars}>
      <p className={s.itemName} style={{ display: "flex", alignItems: "center", gap: 6, color: ok ? "var(--ui-green)" : "var(--ui-kicker)" }}>
        <Icon size={16} strokeWidth={1.9} aria-hidden="true" />
        {text.label}
      </p>
      <p className={s.help}>{text.hint}</p>
      {status.records.map((r) => (
        <div key={r.type + r.name} dir="ltr" className={s.field} style={{ minHeight: 0, padding: 12, fontSize: 13, lineHeight: 1.9, textAlign: "left" }}>
          <div><strong>Type:</strong> {r.type}</div>
          <div><strong>Name:</strong> {r.name} <CopyValue value={r.name} /></div>
          <div style={{ wordBreak: "break-all" }}><strong>Value:</strong> {r.value} <CopyValue value={r.value} /></div>
        </div>
      ))}
      {!ok && (
        <button type="button" onClick={onCheck} disabled={checking} className={s.btnSm} style={{ alignSelf: "flex-start" }}>
          <RefreshCw size={14} strokeWidth={2} aria-hidden="true" />
          {checking ? "جاري التحقق..." : "تحقق الآن"}
        </button>
      )}
    </div>
  );
}
