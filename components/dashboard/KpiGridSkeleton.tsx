// components/dashboard/KpiGridSkeleton.tsx
import { t } from "@/theme";
import Skeleton from "@/components/ui/Skeleton";

export default function KpiGridSkeleton() {
  return (
    <div
      className="basita-kpi-grid-skeleton"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: t.spacing["4"],
        direction: "rtl",
      }}
    >
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          style={{
            background: t.colors.cream.card,
            borderRadius: 18,
            border: `1px solid ${t.colors.cream.border}`,
            padding: "18px",
            boxShadow: "0 6px 18px rgba(67,48,29,0.045)",
          }}
        >
          {/* رأس البطاقة */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <Skeleton
              width={42}
              height={42}
              style={{
                borderRadius: 13,
              }}
            />

            <Skeleton
              width={58}
              height={25}
              style={{
                borderRadius: t.radius.full,
              }}
            />
          </div>

          {/* القيمة */}
          <Skeleton
            width="55%"
            height={30}
            style={{
              marginBottom: 7,
              borderRadius: 7,
            }}
          />

          {/* العنوان */}
          <Skeleton
            width="78%"
            height={15}
            style={{
              borderRadius: 6,
            }}
          />
        </div>
      ))}
    </div>
  );
}