// components/dashboard/ui/StatusBadge.tsx
// tone يحلّ محل color/bg الحرّين: ok | off | warn | bad
import { uiVars } from "@/components/ui/vars";
import s from "../forms.module.css";

const TONE = { ok: s.pillOk, off: s.pillOff, warn: s.pillWarn, bad: s.pillBad } as const;

export default function StatusBadge({ label, tone = "off" }: { label: string; tone?: keyof typeof TONE }) {
  return <span className={`${s.pill} ${TONE[tone]}`} style={uiVars}>{label}</span>;
}
