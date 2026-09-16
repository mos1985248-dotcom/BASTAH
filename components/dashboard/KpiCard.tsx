// components/dashboard/KpiCard.tsx
import {
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { t } from "@/theme";

export default function KpiCard({
  icon: Icon,
  value,
  label,
  changePct,
  highlighted,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  changePct?: number;
  highlighted?: boolean;
}) {
  const positive = (changePct ?? 0) >= 0;

  return (
    <div
      className="basita-card-interactive basita-kpi-card"
      style={{
        position: "relative",
        overflow: "hidden",
        background: highlighted
          ? `linear-gradient(
              135deg,
              ${t.colors.primary[950]} 0%,
              ${t.colors.primary[800]} 100%
            )`
          : t.colors.cream.card,
        border: highlighted
          ? "1px solid rgba(255,255,255,0.08)"
          : `1px solid ${t.colors.cream.border}`,
        borderRadius: 18,
        padding: "18px",
        direction: "rtl",
        boxShadow: highlighted
          ? "0 10px 24px rgba(15,61,46,0.14)"
          : "0 6px 18px rgba(67,48,29,0.045)",
      }}
    >
      {/* لمسة زخرفية للبطاقة المميزة */}
      {highlighted && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 150,
            height: 150,
            borderRadius: "50%",
            top: -95,
            left: -65,
            border: "1px solid rgba(239,220,176,0.10)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* الرأس */}
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {/* الأيقونة */}
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            background: highlighted
              ? "rgba(255,255,255,0.08)"
              : t.colors.primary[50],
            border: highlighted
              ? "1px solid rgba(255,255,255,0.07)"
              : `1px solid ${t.colors.primary[100]}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon
            size={20}
            strokeWidth={1.85}
            color={
              highlighted
                ? t.colors.gold[400]
                : t.colors.primary[800]
            }
          />
        </div>

        {/* نسبة التغير */}
        {changePct !== undefined && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              minHeight: 25,
              padding: "0 8px",
              borderRadius: t.radius.full,
              fontSize: 11,
              fontWeight: t.typography.fontWeight.bold,
              color: positive
                ? t.colors.semantic.success
                : t.colors.semantic.danger,
              background: positive
                ? t.colors.semantic.successBg
                : t.colors.semantic.dangerBg,
              direction: "ltr",
              whiteSpace: "nowrap",
            }}
          >
            {positive ? (
              <TrendingUp
                size={12}
                strokeWidth={2.2}
              />
            ) : (
              <TrendingDown
                size={12}
                strokeWidth={2.2}
              />
            )}

            {Math.abs(changePct)}%
          </span>
        )}
      </div>

      {/* القيمة */}
      <p
        style={{
          position: "relative",
          margin: "0 0 5px",
          fontFamily: t.typography.fontFamily.base,
          fontSize: "clamp(24px, 2.2vw, 30px)",
          fontWeight: t.typography.fontWeight.bold,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          color: highlighted
            ? t.colors.white
            : t.colors.primary[800],
          direction: "rtl",
        }}
      >
        {value}
      </p>

      {/* العنوان */}
      <p
        style={{
          position: "relative",
          margin: 0,
          fontFamily: t.typography.fontFamily.base,
          fontSize: t.typography.fontSize.sm,
          fontWeight: t.typography.fontWeight.medium,
          lineHeight: 1.6,
          color: highlighted
            ? t.colors.text.onDarkMuted
            : t.colors.text.mid,
        }}
      >
        {label}
      </p>
    </div>
  );
}