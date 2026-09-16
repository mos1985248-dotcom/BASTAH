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
        size={20}
        strokeWidth={1.6}
        color={t.colors.primary[800]}
      />
    ),
  },
  {
    label: "دفع آمن",
    Icon: (
      <Lock
        size={20}
        strokeWidth={1.6}
        color={t.colors.primary[800]}
      />
    ),
  },
  {
    label: "شحن لكل المملكة",
    Icon: (
      <Truck
        size={20}
        strokeWidth={1.6}
        color={t.colors.primary[800]}
      />
    ),
  },
  {
    label: "استجابة سريعة",
    Icon: (
      <Zap
        size={20}
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
                size={20}
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
          size={20}
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
                size={20}
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
        maxWidth: 1200,
        margin: "0 auto",
        padding: `${t.spacing["8"]} ${t.spacing["5"]} 0`,
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(320px, 1fr))",
        gap: t.spacing["6"],
        direction: "rtl",
      }}
    >
      {/* قصة الأسرة */}
      <div
        style={{
          minWidth: 0,
          background: t.colors.white,
          borderRadius: t.radius.xl,
          border: `1px solid ${t.colors.cream.border}`,
          overflow: "hidden",
          boxShadow: t.shadows.sm,
        }}
      >
        {storyImage ? (
          <div
            role="img"
            aria-label={`صورة من ${store.nameAr}`}
            style={{
              height: 190,
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
              height: 190,
              background: `linear-gradient(135deg, ${t.colors.gold[200]}, ${t.colors.cream.warm})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Leaf
              size={42}
              strokeWidth={1.5}
              color={t.colors.gold[700]}
            />
          </div>
        )}

        <div style={{ padding: t.spacing["6"] }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: t.spacing["3"],
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: t.radius.full,
                background: t.colors.primary[50],
                color: t.colors.primary[800],
              }}
            >
              <Leaf size={16} strokeWidth={1.7} />
            </span>

            <h2
              style={{
                margin: 0,
                color: t.colors.text.dark,
                fontSize: t.typography.fontSize.lg,
                fontWeight: t.typography.fontWeight.bold,
              }}
            >
              قصة الأسرة
            </h2>
          </div>

          <p
            style={{
              margin: 0,
              color: t.colors.text.body,
              fontSize: t.typography.fontSize.sm,
              lineHeight: 2,
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
          borderRadius: t.radius.xl,
          padding: t.spacing["6"],
          border: `1px solid ${t.colors.cream.border}`,
          boxShadow: t.shadows.sm,
        }}
      >
        <div style={{ marginBottom: t.spacing["5"] }}>
          <h3
            style={{
              margin: 0,
              color: t.colors.text.dark,
              fontSize: t.typography.fontSize.lg,
              fontWeight: t.typography.fontWeight.bold,
            }}
          >
            لماذا يثق العملاء بنا؟
          </h3>

          <p
            style={{
              margin: "4px 0 0",
              color: t.colors.text.light,
              fontSize: t.typography.fontSize.xs,
              lineHeight: 1.7,
            }}
          >
            مزايا وتجارب تساعدك على التسوق بثقة
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 10,
          }}
        >
          {badges.map((badge) => (
            <div
              key={badge.label}
              style={{
                minWidth: 0,
                minHeight: 108,
                padding: "14px 10px",
                boxSizing: "border-box",
                background: t.colors.white,
                border: `1px solid ${t.colors.cream.border}`,
                borderRadius: t.radius.lg,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: t.radius.full,
                  background: t.colors.primary[50],
                  marginBottom: 8,
                }}
              >
                {badge.Icon}
              </div>

              <div
                style={{
                  color: t.colors.text.body,
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.semibold,
                  lineHeight: 1.7,
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