// components/home/FeaturedStores.tsx
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle, Store } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import StoreCard, { HomeStore } from "./StoreCard";
import StoreCardSkeleton from "./StoreCardSkeleton";
import TrustedStoresCTACard from "./TrustedStoresCTACard";

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

  return (
    <section
      aria-labelledby="stores-heading"
      aria-busy={loading}
      className="basita-featured-stores"
      style={{
        maxWidth: t.layout.containerMaxWidth,
        margin: "0 auto",
        padding: `${t.spacing["12"]} ${t.spacing["4"]}`,
        boxSizing: "border-box",
      }}
    >
      {/* عنوان القسم */}
      <div
        className="basita-featured-stores-header"
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: t.spacing["5"],
          marginBottom: t.spacing["6"],
        }}
      >
        <div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              marginBottom: t.spacing["2"],
              color: t.colors.gold[700],
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 24,
                height: 2,
                borderRadius: t.radius.full,
                background: t.colors.gold[500],
              }}
            />
            من سوق بسطة
          </span>

          <h2
            id="stores-heading"
            style={{
              margin: 0,
              color: t.colors.primary[800],
              fontFamily: t.typography.fontFamily.heading,
              fontSize: t.typography.fontSize["2xl"],
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: t.typography.lineHeight.tight,
            }}
          >
            تجوّل في سوق بسطة
          </h2>

          <p
            style={{
              margin: `${t.spacing["2"]} 0 0`,
              color: t.colors.text.mid,
              fontSize: t.typography.fontSize.sm,
              lineHeight: t.typography.lineHeight.normal,
            }}
          >
            اكتشف بسطات الأسر المنتجة ومنتجات سعودية أصيلة
          </p>
        </div>

        <a
          href="/marketplace"
          className="basita-btn-interactive basita-featured-stores-all"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            minHeight: 40,
            padding: `8px ${t.spacing["4"]}`,
            color: t.colors.primary[800],
            background: t.colors.primary[50],
            border: `1px solid ${t.colors.primary[200]}`,
            borderRadius: t.radius.full,
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.semibold,
            textDecoration: "none",
            whiteSpace: "nowrap",
            transition:
              `background ${t.motion.fast} ${t.motion.ease}, ` +
              `border-color ${t.motion.fast} ${t.motion.ease}, ` +
              `transform ${t.motion.fast} ${t.motion.ease}`,
          }}
        >
          تجوّل في سوق بسطة

          <ArrowLeft
            size={15}
            strokeWidth={2}
            style={{ transform: "rotate(180deg)" }}
            aria-hidden="true"
          />
        </a>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: t.spacing["3"],
            minHeight: 220,
            padding: t.spacing["8"],
            color: t.colors.text.mid,
            background: t.colors.semantic.dangerBg,
            border: `1px solid rgba(220, 38, 38, 0.12)`,
            borderRadius: t.radius.xl,
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: t.radius.full,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: t.colors.white,
              border: `1px solid rgba(220, 38, 38, 0.12)`,
            }}
          >
            <AlertTriangle
              size={22}
              strokeWidth={1.8}
              color={t.colors.semantic.danger}
              aria-hidden="true"
            />
          </div>

          <span
            style={{
              color: t.colors.semantic.danger,
              fontSize: t.typography.fontSize.base,
              fontWeight: t.typography.fontWeight.semibold,
            }}
          >
            تعذّر تحميل البسطات
          </span>

          <span
            style={{
              fontSize: t.typography.fontSize.sm,
              lineHeight: t.typography.lineHeight.normal,
            }}
          >
            يبدو أن هناك مشكلة مؤقتة، حاولي تحديث الصفحة
          </span>
        </div>
      )}

      {/* حالة عدم وجود بسطات */}
      {!loading && !error && stores.length === 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: t.spacing["3"],
            minHeight: 300,
            padding: `${t.spacing["10"]} ${t.spacing["6"]}`,
            background: t.colors.cream.warm,
            border: `1px solid ${t.colors.cream.borderLight}`,
            borderRadius: t.radius.xl,
            color: t.colors.text.mid,
            fontSize: t.typography.fontSize.sm,
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: t.radius.full,
              background: t.colors.cream.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${t.colors.cream.borderLight}`,
              boxShadow: t.shadows.xs,
            }}
          >
            <Store
              size={25}
              strokeWidth={1.7}
              color={t.colors.primary[700]}
              aria-hidden="true"
            />
          </div>

          <span
            style={{
              color: t.colors.text.dark,
              fontSize: t.typography.fontSize.base,
              fontWeight: t.typography.fontWeight.semibold,
            }}
          >
            لا توجد بسطات مميّزة حالياً
          </span>

          <span
            style={{
              maxWidth: 480,
              lineHeight: t.typography.lineHeight.normal,
            }}
          >
            تابعينا قريباً — نضيف بسطات جديدة من الأسر المنتجة باستمرار
          </span>

          <a
            href="/marketplace"
            className="basita-btn-interactive"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: t.spacing["2"],
              minHeight: 42,
              padding: `9px ${t.spacing["5"]}`,
              background: t.colors.primary[800],
              color: t.colors.text.onDark,
              borderRadius: t.radius.md,
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
              textDecoration: "none",
            }}
          >
            تجوّل في سوق بسطة
          </a>
        </div>
      )}

      {/* شبكة البسطات + بطاقة الترويج */}
      {!error && (loading || stores.length > 0) && (
        <div
          className="basita-featured-stores-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 300px",
            gap: t.spacing["5"],
            alignItems: "stretch",
          }}
        >
          {/* البسطات */}
          <div
            className="basita-featured-stores-grid"
            style={{
              minWidth: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: t.spacing["4"],
              alignItems: "stretch",
            }}
          >
            {loading
              ? Array.from({ length: 5 }, (_, i) => (
                  <StoreCardSkeleton key={i} />
                ))
              : stores.map((s) => (
                  <StoreCard key={s.id} store={s} />
                ))}
          </div>

          {/* بطاقة الثقة */}
          <div
            className="basita-featured-stores-cta"
            style={{
              minWidth: 0,
            }}
          >
            <TrustedStoresCTACard />
          </div>
        </div>
      )}

      {/* Mobile responsive */}
      <style jsx>{`
        @media (max-width: 767px) {
          .basita-featured-stores {
            padding: 32px 10px !important;
          }

          .basita-featured-stores-header {
            align-items: flex-start !important;
            flex-direction: column !important;
            gap: 12px !important;
            margin-bottom: 18px !important;
          }

          .basita-featured-stores-header h2 {
            font-size: 22px !important;
            line-height: 1.35 !important;
          }

          .basita-featured-stores-header p {
            margin-top: 5px !important;
            font-size: 13px !important;
            line-height: 1.7 !important;
          }

          .basita-featured-stores-header > div:first-child {
            width: 100%;
          }

          .basita-featured-stores-all {
            width: 100%;
            box-sizing: border-box;
            min-height: 38px !important;
            padding: 7px 12px !important;
            font-size: 12px !important;
          }

          /*
           * الجوال:
           * نلغي تقسيم العمودين بالكامل.
           * المتاجر تأتي أولاً، ثم بطاقة الثقة أسفلها.
           */
          .basita-featured-stores-layout {
            display: flex !important;
            flex-direction: column !important;
            gap: 14px !important;
            width: 100%;
          }

          /*
           * كل متجر في صف مستقل.
           */
          .basita-featured-stores-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            width: 100%;
          }

          .basita-featured-stores-grid > * {
            width: 100% !important;
            min-width: 0 !important;
            max-width: none !important;
            grid-column: auto !important;
            grid-row: auto !important;
          }

          /*
           * بطاقة الثقة لا تدخل بين المتاجر.
           */
          .basita-featured-stores-cta {
            width: 100%;
            margin-top: 2px;
          }

          .basita-featured-stores-cta > * {
            width: 100% !important;
            max-width: none !important;
          }
        }

        @media (max-width: 420px) {
          .basita-featured-stores {
            padding: 28px 8px !important;
          }

          .basita-featured-stores-header {
            margin-bottom: 15px !important;
          }

          .basita-featured-stores-header h2 {
            font-size: 21px !important;
          }

          .basita-featured-stores-header p {
            font-size: 12px !important;
          }

          .basita-featured-stores-grid {
            gap: 8px !important;
          }

          .basita-featured-stores-layout {
            gap: 12px !important;
          }
        }
      `}</style>
    </section>
  );
}