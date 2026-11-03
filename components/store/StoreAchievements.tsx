// components/store/StoreAchievements.tsx
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import sec from "./sections.module.css";
import type { StoreDetail } from "./types";
import s from "./about.module.css";

export default function StoreAchievements({ store }: { store: StoreDetail }) {
  const info = store.publicInfo;
  const items = [
    { value: info ? `${Math.round(info.satisfactionRate)}%` : "—", label: "رضا العملاء" },
    { value: `${info?.completedOrders ?? store.totalOrders}+`, label: "طلبات مكتملة" },
    { value: info?.prepTimeDays ?? "—", label: "متوسط التجهيز" },
    { value: info?.responseSpeed ?? "—", label: "سرعة الرد" },
    { value: String(store.totalProducts), label: "المنتجات" },
  ];
  return (
    <section
      aria-label="إحصائيات المتجر"
      className={sec.section}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}
    >
      <ul className={s.metrics}>
        {items.map(({ value, label }) => (
          <li key={label} className={s.metric}>
            <span className={s.metricValue} style={{ fontFamily: t.typography.fontFamily.display }}>{value}</span>
            <span className={s.metricLabel}>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
