// components/admin/ui/DonutChart.tsx
// SVG خالص بدون مكتبة رسوم بيانية (recharts غير مثبَّتة بالمشروع عمداً —
// راجع تعليق package.json) — تجنّباً لإضافة حزمة لمخطط واحد بسيط.
import { t } from "@/theme";

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export default function DonutChart({ slices, centerLabel, centerValue }: { slices: DonutSlice[]; centerLabel: string; centerValue: number | string }) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  const radius = 60;
  const stroke = 22;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = slices.map((sl) => {
    const fraction = total > 0 ? sl.value / total : 0;
    const dash = fraction * circumference;
    const seg = { ...sl, dash, gap: circumference - dash, offset };
    offset += dash;
    return seg;
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: t.spacing["5"], flexWrap: "wrap" }}>
      <div style={{ position: "relative", width: 150, height: 150, flexShrink: 0 }}>
        <svg width={150} height={150} viewBox="0 0 150 150" style={{ transform: "rotate(-90deg)" }}>
          <circle cx={75} cy={75} r={radius} fill="none" stroke={t.colors.cream.border} strokeWidth={stroke} />
          {segments.map((seg) => (
            <circle
              key={seg.label}
              cx={75}
              cy={75}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>{centerValue}</span>
          <span style={{ fontSize: 10, color: t.colors.text.mid }}>{centerLabel}</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 140 }}>
        {slices.map((sl) => (
          <div key={sl.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: t.typography.fontSize.sm }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: sl.color, flexShrink: 0 }} />
            <span style={{ color: t.colors.text.dark, flex: 1 }}>{sl.label}</span>
            <span style={{ color: t.colors.text.mid, fontSize: t.typography.fontSize.xs }}>
              {sl.value} ({total > 0 ? Math.round((sl.value / total) * 100) : 0}٪)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
