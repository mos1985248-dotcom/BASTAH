// components/product/ProductReviewCard.tsx
import { timeAgoAr } from "@/lib/store-helpers";
import StarRow from "@/components/store/StarRow";
import s from "@/components/store/reviews.module.css";
import type { ProductReview } from "./types";
import x from "./extras.module.css";

export default function ProductReviewCard({
  review,
  onOpenImage,
}: {
  review: ProductReview;
  onOpenImage: (url: string) => void;
}) {
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
      {review.images.length > 0 && (
        <div className={x.reviewImages}>
          {review.images.map((url, i) => (
            <button
              key={url}
              type="button"
              className={x.reviewThumb}
              style={{ backgroundImage: `url(${url})` }}
              onClick={() => onOpenImage(url)}
              aria-label={`عرض صورة التقييم ${i + 1}`}
            />
          ))}
        </div>
      )}
      {review.sellerReply && (
        <div className={s.reply}>
          <span className={s.replyLabel}>رد المتجر:</span>
          <p className={s.replyText}>{review.sellerReply}</p>
        </div>
      )}
    </li>
  );
}
