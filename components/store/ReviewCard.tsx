// components/store/ReviewCard.tsx
import { timeAgoAr } from "@/lib/store-helpers";
import StarRow from "./StarRow";
import type { StoreReview } from "./types";
import s from "./reviews.module.css";

export default function ReviewCard({ review }: { review: StoreReview }) {
  const { user } = review;
  return (
    <li className={s.review}>
      <div className={s.reviewHead}>
        <span className={s.avatar} style={user.avatar ? { backgroundImage: `url(${user.avatar})` } : undefined} aria-hidden="true">
          {!user.avatar && user.name.trim().charAt(0)}
        </span>
        <div className={s.who}>
          <span className={s.name}>{user.name}</span>
          <span className={s.when}>{timeAgoAr(review.createdAt)}</span>
        </div>
        <span className={s["stars-sm"]}>
          <StarRow rating={review.rating} />
        </span>
      </div>
      {review.comment && <p className={s.comment}>{review.comment}</p>}
      {review.product && <p className={s.about}>عن المنتج: {review.product.nameAr}</p>}
      {review.sellerReply && (
        <div className={s.reply}>
          <span className={s.replyLabel}>رد المتجر:</span>
          <p className={s.replyText}>{review.sellerReply}</p>
        </div>
      )}
    </li>
  );
}
