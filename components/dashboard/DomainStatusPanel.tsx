// components/dashboard/DomainStatusPanel.tsx
// حالة ربط الدومين الحيّة + سجلات DNS المطلوبة من التاجر (تأتي من Vercel نفسها).
"use client";

import { useState } from "react";
import { CheckCircle2, Clock, RefreshCw, Copy, Check } from "lucide-react";
import { t } from "@/theme";
import type { DomainStatus } from "@/lib/domain-types";

const STATE_TEXT: Record<DomainStatus["state"], { label: string; hint: string }> = {
  CONNECTED: { label: "متصل ويعمل", hint: "متجرك يظهر الآن على دومينك." },
  PENDING_DNS: { label: "بانتظار إعداد DNS", hint: "أضيفي السجل التالي عند مزوّد الدومين، ثم اضغطي «تحقق الآن». قد يستغرق الانتشار من دقائق إلى بضع ساعات." },
  PENDING_OWNERSHIP: { label: "بانتظار إثبات الملكية", hint: "دومينك مسجَّل سابقاً على Vercel — أضيفي سجل TXT التالي ليتأكد من ملكيتك، ثم اضغطي «تحقق الآن»." },
};

function CopyValue({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard?.writeText(value); setDone(true); setTimeout(() => setDone(false), 1500); }}
      aria-label="نسخ"
      style={{ display: "inline-flex", border: "none", background: "none", cursor: "pointer", color: t.colors.primary[800], padding: 2 }}
    >
      {done ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.8} />}
    </button>
  );
}

export default function DomainStatusPanel({
  status, checking, onCheck,
}: { status: DomainStatus | null; checking: boolean; onCheck: () => void }) {
  if (!status) {
    return (
      <p style={{ margin: `${t.spacing["3"]} 0 0`, fontSize: 12, color: t.colors.text.mid }}>
        تعذّر قراءة حالة الربط الآن.{" "}
        <button type="button" onClick={onCheck} disabled={checking} style={{ border: "none", background: "none", cursor: "pointer", color: t.colors.primary[800], fontWeight: t.typography.fontWeight.bold, padding: 0 }}>
          إعادة المحاولة
        </button>
      </p>
    );
  }

  const text = STATE_TEXT[status.state];
  const ok = status.state === "CONNECTED";
  const Icon = ok ? CheckCircle2 : Clock;

  return (
    <div style={{ marginTop: t.spacing["3"], padding: t.spacing["3"], background: t.colors.cream.bg, borderRadius: t.radius.md }}>
      <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 13, fontWeight: t.typography.fontWeight.bold, color: ok ? t.colors.semantic.success : t.colors.semantic.warning }}>
        <Icon size={15} strokeWidth={1.9} />
        {text.label}
      </p>
      <p style={{ margin: `${t.spacing["1"]} 0 0`, fontSize: 12, color: t.colors.text.mid, lineHeight: 1.7 }}>{text.hint}</p>

      {status.records.map((r) => (
        <div key={r.type + r.name} dir="ltr" style={{ marginTop: t.spacing["2"], padding: 10, background: t.colors.white, borderRadius: t.radius.sm, fontSize: 12, lineHeight: 1.8, textAlign: "left" }}>
          <div><strong>Type:</strong> {r.type}</div>
          <div><strong>Name:</strong> {r.name} <CopyValue value={r.name} /></div>
          <div style={{ wordBreak: "break-all" }}><strong>Value:</strong> {r.value} <CopyValue value={r.value} /></div>
        </div>
      ))}

      {!ok && (
        <button
          type="button"
          onClick={onCheck}
          disabled={checking}
          style={{ marginTop: t.spacing["3"], display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: t.colors.white, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: 12, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], cursor: checking ? "not-allowed" : "pointer" }}
        >
          <RefreshCw size={13} strokeWidth={2} />
          {checking ? "جاري التحقق..." : "تحقق الآن"}
        </button>
      )}
    </div>
  );
}
