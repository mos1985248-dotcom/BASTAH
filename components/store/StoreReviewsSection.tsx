// components/store/StoreReviewsSection.tsx
// المعدّل والتوزيع والمراجعات حقيقية فقط؛ عند غيابها تظهر حالة فارغة صادقة.
"use client";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import ReviewCard from "./ReviewCard";
import ReviewsSummary from "./ReviewsSummary";
import { useStoreReviews } from "./useStoreReviews";
import type { StoreDetail } from "./types";
import sec from "./sections.module.css";
import s from "./reviews.module.css";

export default function StoreReviewsSection({ store }: { store: StoreDetail }) {
  const { data, reviews, loading, page, hasMore, loadMore } = useStoreReviews(store.slug);
  const avg = data?.avgRating ?? store.avgRating;
  const total = data?.totalReviews ?? store.totalReviews;
  const firstLoad = loading && page === 1;

  return (
    <section
      aria-label="تقييمات العملاء"
      className={sec.section}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}
    >
      <div className={sec.head}>
        <p className={sec.kicker}>{total} مراجعة</p>
        <h2 className={sec.title} style={{ fontFamily: t.typography.fontFamily.display }}>تقييمات العملاء</h2>
        <p className={sec.sub}>آراء عملاء حقيقيين بعد تجربة المتجر</p>
      </div>

      {firstLoad ? (
        <Skeleton height={260} radius="28px" />
      ) : reviews.length === 0 ? (
        <EmptyState
          title="لا توجد مراجعات معتمدة بعد"
          description="يمكنك أن تكون أول من يقيّم المتجر بعد استلام طلبك."
        />
      ) : (
        <div className={s.layout}>
          <ReviewsSummary avg={avg} total={total} distribution={data?.distribution} />
          <ul className={s.list}>
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
            {hasMore && (
              <li style={{ display: "flex", justifyContent: "center", listStyle: "none" }}>
                <button type="button" className={s.more} onClick={loadMore} disabled={loading}>
                  {loading ? "جاري التحميل..." : "عرض المزيد"}
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </section>
  );
}
