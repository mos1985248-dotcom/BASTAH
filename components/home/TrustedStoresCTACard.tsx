// components/home/TrustedStoresCTACard.tsx
import { ArrowLeft, Store } from "lucide-react";
import { t } from "@/theme";

export default function TrustedStoresCTACard() {
  return (
    <div
      className="basita-trusted-stores-card"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: 245,
        background: "#F7F1E5",
        borderRadius: 20,
        padding: t.spacing["5"],
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        border: "1px solid rgba(91,70,45,0.12)",
        boxShadow: "0 5px 16px rgba(67,48,29,0.045)",
        boxSizing: "border-box",
        transition:
          `transform ${t.motion.base} ${t.motion.ease}, ` +
          `box-shadow ${t.motion.base} ${t.motion.ease}, ` +
          `border-color ${t.motion.base} ${t.motion.ease}`,
      }}
    >
      {/* زخرفة خفيفة */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: "50%",
          top: -65,
          left: -55,
          border: "1px solid rgba(166,124,45,0.14)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: 52,
          height: 52,
          marginBottom: t.spacing["3"],
          borderRadius: 15,
          background: "#FFFDF8",
          border: "1px solid rgba(166,124,45,0.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Store
          size={24}
          strokeWidth={1.8}
          color={t.colors.gold[700]}
        />
      </div>

      <h3
        style={{
          position: "relative",
          zIndex: 1,
          margin: `0 0 ${t.spacing["2"]}`,
          fontSize: t.typography.fontSize.base,
          fontWeight: t.typography.fontWeight.bold,
          color: t.colors.primary[800],
        }}
      >
        اكتشف متاجر تستحق الثقة
      </h3>

      <p
        style={{
          position: "relative",
          zIndex: 1,
          margin: `0 0 ${t.spacing["4"]}`,
          fontSize: t.typography.fontSize.xs,
          color: t.colors.text.mid,
          lineHeight: t.typography.lineHeight.relaxed,
          maxWidth: 220,
        }}
      >
        جودة، أصالة، وتاريخ من شغف الأسر السعودية
      </p>

      <a
        href="/marketplace"
        className="basita-trusted-stores-link"
        style={{
          position: "relative",
          zIndex: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          minHeight: 42,
          padding: `0 ${t.spacing["4"]}`,
          background: t.colors.primary[800],
          color: t.colors.text.onDark,
          borderRadius: 12,
          fontSize: t.typography.fontSize.xs,
          fontWeight: t.typography.fontWeight.bold,
          textDecoration: "none",
          boxShadow: "0 5px 12px rgba(33,53,42,0.12)",
          transition:
            `transform ${t.motion.fast} ${t.motion.ease}, ` +
            `box-shadow ${t.motion.fast} ${t.motion.ease}`,
        }}
      >
        تصفّح جميع المتاجر
        <ArrowLeft
          size={14}
          strokeWidth={2}
          style={{ transform: "rotate(180deg)" }}
        />
      </a>

      <style>{`
        .basita-trusted-stores-card:hover {
          transform: translateY(-4px);
          border-color: rgba(166,124,45,0.26) !important;
          box-shadow: 0 12px 26px rgba(67,48,29,0.08);
        }

        .basita-trusted-stores-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(33,53,42,0.18);
        }
      `}</style>
    </div>
  );
}