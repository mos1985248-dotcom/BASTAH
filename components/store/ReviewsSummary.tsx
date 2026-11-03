// components/store/ReviewsSummary.tsx
import StarRow from "./StarRow";
import type { StoreReviewsResponse } from "./types";
import s from "./reviews.module.css";

export default function ReviewsSummary({
  avg,
  total,
  distribution,
}: {
  avg: number;
  total: number;
  distribution?: StoreReviewsResponse["distribution"];
}) {
  const max = distribution ? Math.max(1, ...Object.values(distribution)) : 1;
  return (
    <div className={s.summary}>
      <div className={s.avg}>
        <span className={s.avgNum}>{avg.toFixed(1)}</span>
        <span className={s.avgOf}>من 5</span>
      </div>
      <StarRow rating={avg} size={18} />
      <p className={s.total}>{total} مراجعة</p>
      {distribution && (
        <ul className={s.bars}>
          {(["5", "4", "3", "2", "1"] as const).map((star) => (
            <li key={star} className={s.bar}>
              <span>{star}★</span>
              <span className={s.track}>
                <span className={s.fill} style={{ width: `${(distribution[star] / max) * 100}%` }} />
              </span>
              <span>{distribution[star]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
