// components/admin/StatCard.tsx
import { t } from "@/theme";

export default function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      className="basita-stat-card"
      style={{
        position: "relative",
        overflow: "hidden",
        background: t.colors.white,
        borderRadius: t.radius.md,
        padding: "15px 16px 14px",
        border: `1px solid ${t.colors.cream.border}`,
        minHeight: 92,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        boxSizing: "border-box",
        transition:
          "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
      }}
    >
      {/* Accent */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          left: 0,
          height: 2,
          background: color ?? t.colors.primary[800],
          opacity: 0.85,
        }}
      />

      <p
        style={{
          margin: "0 0 5px",
          fontSize: t.typography.fontSize.xs,
          lineHeight: 1.5,
          color: t.colors.text.mid,
          fontWeight: t.typography.fontWeight.regular,
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: "0 0 3px",
          fontSize: t.typography.fontSize["2xl"],
          lineHeight: 1.2,
          fontWeight: t.typography.fontWeight.bold,
          color: color ?? t.colors.primary[800],
          letterSpacing: "-0.02em",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </p>

      {sub && (
        <p
          style={{
            margin: 0,
            fontSize: 10,
            lineHeight: 1.5,
            color: t.colors.text.light,
          }}
        >
          {sub}
        </p>
      )}

      <style>{`
        .basita-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.07);
          border-color: ${t.colors.cream.border};
        }

        @media (max-width: 480px) {
          .basita-stat-card {
            padding: 13px 14px 12px !important;
            min-height: 86px !important;
          }
        }
      `}</style>
    </div>
  );
}