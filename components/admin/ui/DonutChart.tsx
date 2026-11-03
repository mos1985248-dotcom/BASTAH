// components/admin/ui/DonutChart.tsx
// SVG خالص بدون مكتبة رسوم بيانية (recharts غير مثبَّتة بالمشروع عمداً —
// راجع تعليق package.json) — تجنّباً لإضافة حزمة لمخطط واحد بسيط.
import s from "../admin-ui.module.css";

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export default function DonutChart({ slices, centerLabel, centerValue }: { slices: DonutSlice[]; centerLabel: string; centerValue: number | string }) {
  const total = slices.reduce((sum, sl) => sum + sl.value, 0);
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
    <div className={s.donut}>
      <div className={s.donutBox}>
        <svg className={s.donutSvg} width={150} height={150} viewBox="0 0 150 150" role="img" aria-label={`${centerLabel}: ${centerValue}`}>
          <circle className={s.track} cx={75} cy={75} r={radius} fill="none" strokeWidth={stroke} />
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
        <div className={s.donutCenter}>
          <span className={s.donutValue}>{centerValue}</span>
          <span className={s.donutLabel}>{centerLabel}</span>
        </div>
      </div>

      <div className={s.legend}>
        {slices.map((sl) => (
          <div key={sl.label} className={s.legendRow}>
            {/* لون الشريحة قيمة ديناميكية من المستدعي */}
            <span className={s.swatch} style={{ background: sl.color }} />
            <span className={s.legendName}>{sl.label}</span>
            <span className={s.legendVal}>
              {sl.value} ({total > 0 ? Math.round((sl.value / total) * 100) : 0}٪)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
