// components/home/FeaturedStores.tsx
"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Store } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import Skeleton from "@/components/ui/Skeleton";
import type { HomeStore } from "./StoreCard";
import StallCard from "./StallCard";
import StoreLane from "./StoreLane";
import s from "./stalls.module.css";

export default function FeaturedStores() {
  const [stores, setStores] = useState<HomeStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get<{ stores: HomeStore[] }>("/api/stores?limit=5")
      .then((data) => setStores(data.stores))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const empty = !loading && !error && stores.length === 0;

  return (
    <section
      aria-labelledby="stores-heading"
      aria-busy={loading}
      className={s.section}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}
    >
      <div className={s.header}>
        <div>
          <p className={s.kicker}>من سوق بسطة مارت</p>
          <h2 id="stores-heading" className={s.title} style={{ fontFamily: t.typography.fontFamily.display }}>
            تجوّل في سوق بسطة مارت
          </h2>
          <p className={s.sub}>اكتشف بسطات الأسر المنتجة ومنتجات سعودية أصيلة</p>
        </div>
        <a href="/marketplace?view=stores" className={s.all}>كل البسطات</a>
      </div>

      {error && (
        <div role="alert" className={s.notice}>
          <AlertTriangle size={26} strokeWidth={1.8} aria-hidden="true" />
          <p>تعذّر تحميل البسطات</p>
        </div>
      )}

      {empty && (
        <div className={s.notice}>
          <Store size={26} strokeWidth={1.8} aria-hidden="true" />
          <p className={s.noticeTitle}>لا توجد بسطات مميّزة حالياً</p>
          <p>تابعينا قريباً — نضيف بسطات جديدة من الأسر المنتجة باستمرار</p>
        </div>
      )}

      {!error && (loading || stores.length > 0) && (
        <StoreLane>
          {loading
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={i} className={s.skeleton}>
                  <Skeleton height={28} radius="20px 20px 0 0" />
                  <Skeleton height={150} radius="0" />
                  <div className={s.skeletonBody}>
                    <Skeleton height={18} width="60%" />
                    <Skeleton height={14} />
                  </div>
                </div>
              ))
            : stores.map((store) => <StallCard key={store.id} store={store} reveal compact />)}

          {!loading && (
            <div className={s.endCard}>
              <h3 className={s.endTitle}>اكتشف متاجر تستحق الثقة</h3>
              <p className={s.endText}>جودة، أصالة، وتاريخ من شغف الأسر السعودية</p>
              <a href="/marketplace?view=stores" className={s.endCta}>تصفّح جميع المتاجر</a>
            </div>
          )}
        </StoreLane>
      )}
    </section>
  );
}
