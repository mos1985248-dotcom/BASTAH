// components/admin/finance/MonthlyChart.tsx — مقارنة شهرية بسيطة بـSVG خالص (المحصَّل مقابل المدفوع) بلا مكتبات.
import type { SummaryResponse } from "./api-types";
import { monthName, sar } from "./format";
import s from "./finance.module.css";

export default function MonthlyChart({ history }: { history: SummaryResponse["history"] }) {
  const max = Math.max(1, ...history.flatMap((h) => [h.cashReceiptsMinor, h.expensesMinor]));
  const W = 600, H = 220, pad = 28, band = (W - pad * 2) / history.length, bw = Math.min(34, band / 3);
  const y = (v: number) => H - 34 - (Math.max(0, v) / max) * (H - 70);
  return (
    <div>
      <svg className={s.chart} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="مقارنة المحصَّل والمدفوع لآخر ستة أشهر">
        <line className={s.axis} x1={pad} x2={W - pad} y1={H - 34} y2={H - 34} />
        {history.map((h, i) => {
          const cx = pad + band * i + band / 2;
          return (
            <g key={`${h.month.year}-${h.month.month}`}>
              <rect className={s.barA} x={cx - bw - 2} y={y(h.cashReceiptsMinor)} width={bw} height={H - 34 - y(h.cashReceiptsMinor)} rx={4}><title>{`المحصَّل: ${sar(h.cashReceiptsMinor)}`}</title></rect>
              <rect className={s.barB} x={cx + 2} y={y(h.expensesMinor)} width={bw} height={H - 34 - y(h.expensesMinor)} rx={4}><title>{`المدفوع: ${sar(h.expensesMinor)}`}</title></rect>
              <text className={s.lbl} x={cx} y={H - 14} textAnchor="middle">{monthName(h.month.month)}</text>
            </g>
          );
        })}
      </svg>
      <div className={s.legend}>
        <span><i className={`${s.dot} ${s.dotA}`} />المحصَّل (اشتراكات + تحصيلات)</span>
        <span><i className={`${s.dot} ${s.dotB}`} />المدفوع (مصروفات)</span>
      </div>
    </div>
  );
}
