// components/admin/finance/FlagsBanner.tsx — تنبيهات المحرك: نقص بيانات وتحذيرات تؤثر على دقة الأرقام.
import { AlertTriangle, Info, OctagonAlert } from "lucide-react";
import type { Flag } from "@/lib/finance/types";
import s from "./finance.module.css";

export default function FlagsBanner({ flags }: { flags: Flag[] }) {
  if (flags.length === 0) return null;
  return (
    <div className={s.flags} role="region" aria-label="تنبيهات دقة الأرقام">
      {flags.map((f) => {
        const Icon = f.severity === "BLOCKING" ? OctagonAlert : f.severity === "WARN" ? AlertTriangle : Info;
        return (
          <p key={f.code} className={`${s.flag} ${f.severity === "BLOCKING" ? s.flagBlock : f.severity === "WARN" ? s.flagWarn : ""}`}>
            <Icon size={16} strokeWidth={1.9} aria-hidden="true" />
            <span>{f.message}{f.count ? ` (${f.count})` : ""}</span>
          </p>
        );
      })}
    </div>
  );
}
