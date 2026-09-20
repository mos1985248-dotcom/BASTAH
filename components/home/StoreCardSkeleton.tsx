// components/home/StoreCardSkeleton.tsx
import Skeleton from "@/components/ui/Skeleton";
import { t } from "@/theme";

export default function StoreCardSkeleton() {
  return (
    <div
      style={{
        minHeight: 245,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: t.colors.cream.card,
        border: `1px solid ${t.colors.cream.borderLight}`,
        borderRadius: t.radius.lg,
        boxShadow: t.shadows.xs,
      }}
    >
      {/* صورة الغلاف */}
      <Skeleton height={124} radius="0" />

      {/* المحتوى */}
      <div
        style={{
          position: "relative",
          flex: 1,
          padding: "34px 16px 16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* شعار المتجر */}
        <Skeleton
          width={60}
          height={60}
          radius={`${t.radius.md}px`}
          style={{
            position: "absolute",
            top: -30,
            right: 16,
            border: `3px solid ${t.colors.cream.card}`,
            boxSizing: "border-box",
          }}
        />

        {/* اسم المتجر */}
        <Skeleton
          width="72%"
          height={17}
          radius="8px"
          style={{
            marginBottom: 9,
          }}
        />

        {/* المدينة والتقييم */}
        <Skeleton
          width="48%"
          height={12}
          radius="6px"
          style={{
            marginBottom: 12,
          }}
        />

        {/* الوصف */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 7,
          }}
        >
          <Skeleton width="92%" height={10} radius="6px" />
          <Skeleton width="68%" height={10} radius="6px" />
        </div>

        {/* الشريط السفلي */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: 12,
            borderTop: `1px solid ${t.colors.cream.borderLight}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Skeleton width={70} height={11} radius="6px" />

          <Skeleton
            width={28}
            height={28}
            radius={t.radius.full}
          />
        </div>
      </div>
    </div>
  );
}