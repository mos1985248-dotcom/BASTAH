// components/admin/finance/BreakEvenCard.tsx — نقطة التعادل التشغيلية: التغطية، المتبقي، السيناريوهان، والاتجاه الشهري.
import type { BreakEvenOut } from "@/lib/finance/breakeven";
import { monthName, pct, sar } from "./format";
import Quality from "./Quality";
import s from "./finance.module.css";

const STATUS: Record<BreakEvenOut["status"], string> = { BELOW: "دون التعادل", AT: "عند التعادل", ABOVE: "فوق التعادل", INSUFFICIENT_DATA: "بيانات غير كافية", NON_POSITIVE_MARGIN: "هامش المساهمة غير موجب" };

export default function BreakEvenCard({ be }: { be: BreakEvenOut }) {
  const sub = be.scenarios.subscriptionsOnly;
  const mix = be.scenarios.mixed;
  const cover = be.coveragePct === null ? 0 : Math.min(100, Math.max(0, be.coveragePct));
  return (
    <div className={`${s.card} ${s.be}`}>
      <div className={s.beHead}>
        <h2 className={s.h2}>نقطة التعادل</h2>
        <span className={`${s.q} ${be.status === "ABOVE" || be.status === "AT" ? s.qOk : be.status === "BELOW" ? s.qEst : s.qBad}`}>{STATUS[be.status]}</span>
        <Quality q={be.basis === "ACTUAL" ? "OK" : "EST"} title={be.basis === "ACTUAL" ? "مبني على بيانات كافية" : "يعتمد على بيانات ناقصة أو افتراضات"} />
      </div>
      <p className={s.sub}>هل تغطي مساهمة الإيرادات المصروفات التشغيلية الثابتة؟ تُستبعد مصروفات التأسيس، ولا تُحتسب مستحقات المناديب ولا حصص الناقل أرباحاً.</p>

      <div className={s.progress} role="progressbar" aria-valuenow={cover} aria-valuemin={0} aria-valuemax={100} aria-label="نسبة تغطية التكاليف التشغيلية">
        <div className={`${s.progressFill} ${cover < 100 ? s.progressLow : ""}`} style={{ width: `${cover}%` }} />
      </div>
      <div className={s.facts}>
        <div className={s.fact}><p className={s.factL}>نسبة التغطية</p><p className={s.factV}>{pct(be.coveragePct)}</p></div>
        <div className={s.fact}><p className={s.factL}>مصروفات ثابتة (تشغيل)</p><p className={s.factV}>{sar(be.fixedOperatingMinor)}</p></div>
        <div className={s.fact}><p className={s.factL}>هامش المساهمة</p><p className={s.factV}>{sar(be.contributionMinor)}</p></div>
        <div className={s.fact}><p className={s.factL}>المتبقي للتعادل</p><p className={s.factV}>{sar(be.remainingMinor)}</p></div>
      </div>

      {be.reasons.length > 0 && <ul className={s.list}>{be.reasons.map((r) => <li key={r}>{r}</li>)}</ul>}

      <div className={s.grid2}>
        <div className={s.fact}>
          <p className={s.factL}>سيناريو الاشتراكات فقط</p>
          <p className={s.factV}>{sub.possible ? `${sub.neededSubscriptions} اشتراكاً إضافياً` : sub.reason ?? "—"}</p>
          {sub.assumptions.map((a) => <p key={a} className={s.muted}>{a}</p>)}
        </div>
        <div className={s.fact}>
          <p className={s.factL}>سيناريو مختلط (اشتراكات + شحنات)</p>
          <p className={s.factV}>{mix.possible ? `${mix.neededSubscriptions} اشتراكاً + ${mix.neededShipments} شحنة` : mix.reason ?? "—"}</p>
          {mix.assumptions.map((a) => <p key={a} className={s.muted}>{a}</p>)}
          {be.planMix.length > 0 && <p className={s.muted}>مزيج الباقات: {be.planMix.map((p) => `${p.plan} ${p.sharePct}%`).join(" — ")}</p>}
        </div>
      </div>

      <div className={s.scroll}>
        <table className={s.table}>
          <thead><tr><th>الشهر</th><th>مصروفات ثابتة</th><th>هامش المساهمة</th><th>التغطية</th></tr></thead>
          <tbody>{be.trend.map((t) => (
            <tr key={t.month}><td>{monthName(Number(t.month.slice(5)))} {t.month.slice(0, 4)}</td><td className={s.num}>{sar(t.fixedMinor)}</td><td className={s.num}>{sar(t.contributionMinor)}</td><td className={s.num}>{pct(t.coveragePct)}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
