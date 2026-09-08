// components/account/AccountHeroCard.tsx
import { t } from "@/theme";

export default function AccountHeroCard({ name, email }: { name: string; email: string }) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${t.colors.primary[900]}, ${t.colors.primary[800]})`,
        borderRadius: t.radius.xl,
        padding: t.spacing["6"],
        display: "flex",
        alignItems: "center",
        gap: t.spacing["4"],
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: t.radius.full,
          background: t.colors.gold[200],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          fontWeight: t.typography.fontWeight.bold,
          color: t.colors.primary[900],
          flexShrink: 0,
        }}
      >
        {name.charAt(0)}
      </div>
      <div>
        <h1 style={{ margin: `0 0 3px`, fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.onDark }}>
          مرحباً بك، {name}
        </h1>
        <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.onDarkMuted }}>{email}</p>
      </div>
    </div>
  );
}
