// components/marketplace/StoreGrid.tsx
import { AlertTriangle } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import StallCard from "@/components/home/StallCard";
import type { HomeStore } from "@/components/home/StoreCard";
import s from "./market.module.css";

export default function StoreGrid({
  stores,
  loading,
  error,
  onRetry,
}: {
  stores: HomeStore[];
  loading: boolean;
  error: string;
  onRetry?: () => void;
}) {
  // أجواء الممشى: زينة معلّقة فوق البسطات وأرضية تحتها
  const walkway = (grid: React.ReactNode) => (
    <div className={s.walkway} style={uiVars}>
      <div className={s.bunting} aria-hidden="true" />
      {grid}
      <div className={s.floor} aria-hidden="true" />
    </div>
  );

  if (loading) {
    return walkway(
      <div className={s.storeGrid} aria-busy="true">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} height={320} radius="24px" />
        ))}
      </div>,
    );
  }
  if (error) {
    return (
      <div className={s.notice} style={uiVars} role="alert">
        <AlertTriangle size={26} strokeWidth={1.8} aria-hidden="true" />
        <p>{error}</p>
        {onRetry && (
          <button type="button" className={s.retry} onClick={onRetry}>
            إعادة المحاولة
          </button>
        )}
      </div>
    );
  }
  if (stores.length === 0) {
    return <EmptyState title="لا توجد متاجر حالياً" description="جرّب تغيير القسم أو كلمة البحث." />;
  }
  return walkway(
    <div className={s.storeGrid}>
      {stores.map((store) => (
        <StallCard key={store.id} store={store} fluid compact />
      ))}
    </div>,
  );
}
