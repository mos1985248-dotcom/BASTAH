// components/account/StatsRow.tsx
import s from "./account.module.css";

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
    <div className={s.stats}>
      {stats.map((st) => (
        <div key={st.label} className={s.stat}>
          <div className={s.statVal}>{st.value}</div>
          <div className={s.statLbl}>{st.label}</div>
        </div>
      ))}
    </div>
  );
}
