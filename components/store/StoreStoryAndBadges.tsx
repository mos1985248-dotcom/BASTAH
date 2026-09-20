// components/store/StoreStoryAndBadges.tsx

import type { ReactNode } from "react";
import {
  Landmark,
  Lock,
  Truck,
  Zap,
  BadgeCheck,
  Sparkles,
  RotateCcw,
  Leaf,
} from "lucide-react";
import { t } from "@/theme";
import { StoreDetail } from "./types";

// شارات ثابتة تعكس قدرات المنصة الفعلية.
// وليست ميزة خاصة بمتجر معيّن.
const PLATFORM_BADGES: {
  label: string;
  Icon: ReactNode;
}[] = [
  {
    label: "منتج سعودي",
    Icon: (
      <Landmark
        size={17}
        strokeWidth={1.6}
        color={t.colors.primary[800]}
      />
    ),
  },
  {
    label: "دفع آمن",
    Icon: (
      <Lock
        size={17}
        strokeWidth={1.6}
        color={t.colors.primary[800]}
      />
    ),
  },
  {
    label: "شحن لكل المملكة",
    Icon: (
      <Truck
        size={17}
        strokeWidth={1.6}
        color={t.colors.primary[800]}
      />
    ),
  },
  {
    label: "استجابة سريعة",
    Icon: (
      <Zap
        size={17}
        strokeWidth={1.6}
        color={t.colors.primary[800]}
      />
    ),
  },
];

export default function StoreStoryAndBadges({
  store,
}: {
  store: StoreDetail;
}) {
  const storyImage = store.bannerImages?.[0] ?? null;

  const dynamicBadges: {
    label: string;
    Icon: ReactNode;
  }[] = [
    ...(store.isVerified
      ? [
          {
            label: "متجر موثّق",
            Icon: (
              <BadgeCheck
                size={17}
                strokeWidth={1.6}
                color={t.colors.primary[800]}
              />
            ),
          },
        ]
      : []),

    ...(store.publicInfo?.storyTags ?? []).map((tag) => ({
      label: tag,
      Icon: (
        <Sparkles
          size={17}
          strokeWidth={1.6}
          color={t.colors.gold[600]}
        />
      ),
    })),
  ];

  const returnDays = store.publicInfo?.returnPolicyDays;

  const badges: {
    label: string;
    Icon: ReactNode;
  }[] = [
    ...dynamicBadges,
    ...PLATFORM_BADGES,

    ...(returnDays !== undefined
      ? [
          {
            label: `إرجاع خلال ${returnDays} ${
              returnDays === 1 ? "يوم" : "أيام"
            }`,
            Icon: (
              <RotateCcw
                size={17}
                strokeWidth={1.6}
                color={t.colors.primary[800]}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <section
      aria-label="قصة المتجر ومزاياه"
      style={{
        width: "100%",
        maxWidth: 1180,
        margin: "0 auto",
        padding: `${t.spacing["5"]} ${t.spacing["4"]} 0`,
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)",
        gap: t.spacing["4"],
        direction: "rtl",
      }}
    >
      {/* قصة الأسرة */}
      <div
        style={{
          minWidth: 0,
          background: t.colors.white,
          borderRadius: t.radius.lg,
          border: `1px solid ${t.colors.cream.border}`,
          overflow: "hidden",
          boxShadow: t.shadows.xs,
        }}
      >
        {storyImage ? (
          <div
            role="img"
            aria-label={`صورة من ${store.nameAr}`}
            style={{
              height: 135,
              backgroundImage: `url(${storyImage})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{
              height: 135,
              background: `linear-gradient(135deg, ${t.colors.gold[200]}, ${t.colors.cream.warm})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Leaf
              size={34}
              strokeWidth={1.5}
              color={t.colors.gold[700]}
            />
          </div>
        )}

        <div style={{ padding: t.spacing["4"] }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: t.spacing["2"],
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: t.radius.full,
                background: t.colors.primary[50],
                color: t.colors.primary[800],
              }}
            >
              <Leaf size={14} strokeWidth={1.7} />
            </span>

            <h2
              style={{
                margin: 0,
                color: t.colors.text.dark,
                fontSize: t.typography.fontSize.base,
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.4,
              }}
            >
              قصة الأسرة
            </h2>
          </div>

          <p
            style={{
              margin: 0,
              color: t.colors.text.body,
              fontSize: t.typography.fontSize.xs,
              lineHeight: 1.8,
            }}
          >
            {store.publicInfo?.storyAr ||
              store.description ||
              "لسه ما أضافت هذه الأسرة قصتها — تابعونا قريباً."}
          </p>
        </div>
      </div>

      {/* لماذا يثق العملاء بنا */}
      <div
        style={{
          minWidth: 0,
          background: t.colors.cream.warm,
          borderRadius: t.radius.lg,
          padding: t.spacing["4"],
          border: `1px solid ${t.colors.cream.border}`,
          boxShadow: t.shadows.xs,
        }}
      >
        <div
          style={{
            marginBottom: t.spacing["3"],
          }}
        >
          <h3
            style={{
              margin: 0,
              color: t.colors.text.dark,
              fontSize: t.typography.fontSize.base,
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.4,
            }}
          >
            لماذا يثق العملاء بنا؟
          </h3>

          <p
            style={{
              margin: "3px 0 0",
              color: t.colors.text.light,
              fontSize: "11px",
              lineHeight: 1.5,
            }}
          >
            مزايا تساعدك على التسوق بثقة
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(105px, 1fr))",
            gap: 7,
          }}
        >
          {badges.map((badge) => (
            <div
              key={badge.label}
              style={{
                minWidth: 0,
                minHeight: 72,
                padding: "8px 7px",
                boxSizing: "border-box",
                background: t.colors.white,
                border: `1px solid ${t.colors.cream.borderLight}`,
                borderRadius: t.radius.md,
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: t.radius.full,
                  background: t.colors.primary[50],
                }}
              >
                {badge.Icon}
              </div>

              <div
                style={{
                  minWidth: 0,
                  color: t.colors.text.body,
                  fontSize: "11px",
                  fontWeight: t.typography.fontWeight.semibold,
                  lineHeight: 1.45,
                }}
              >
                {badge.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}