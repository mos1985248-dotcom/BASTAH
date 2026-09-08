// components/account/StatsRow.tsx
import { t } from "@/theme";

export default function StatsRow({
  totalSpent,
  ordersCount,
  addressesCount,
  favoritesCount,
}: {
  totalSpent: number;
  ordersCount: number;
  addressesCount: number;
  favoritesCount: number;
}) {
  const stats = [
    { value: `${totalSpent.toFixed(0)} ر.س`, label: "إجمالي مشترياتك" },
    { value: String(ordersCount), label: "الطلبات" },
    { value: String(addressesCount), label: "العناوين" },
    { value: String(favoritesCount), label: "المفضلة" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: t.spacing["2"] }} className="basita-account-stats">
      {stats.map((s) => (
        <div key={s.label} style={{ background: t.colors.white, borderRadius: t.radius.md, padding: "12px 8px", textAlign: "center", border: `1px solid ${t.colors.cream.border}` }}>
          <div style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>{s.value}</div>
          <div style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>{s.label}</div>
        </div>
      ))}
      <style>{`
        @media (max-width: 500px) {
          .basita-account-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
