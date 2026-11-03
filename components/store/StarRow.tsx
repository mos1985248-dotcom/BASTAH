// components/store/StarRow.tsx
import { Star } from "lucide-react";
import s from "./reviews.module.css";

export default function StarRow({ rating, size = 15 }: { rating: number; size?: number }) {
  return (
    <span className={s.stars} role="img" aria-label={`التقييم ${rating} من 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} strokeWidth={1.7} fill={n <= Math.round(rating) ? "currentColor" : "none"} aria-hidden="true" />
      ))}
    </span>
  );
}
