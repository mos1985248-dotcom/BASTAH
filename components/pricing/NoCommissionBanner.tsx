// components/pricing/NoCommissionBanner.tsx
import { HandCoins, Truck, RotateCcw, type LucideIcon } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import s from "./NoCommissionBanner.module.css";

const POINTS: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: HandCoins,
    title: "بدون عمولة على المبيعات",
    desc: "كل ريال تبيعينه لك بالكامل — مهما زادت مبيعاتك",
  },
  {
    Icon: Truck,
    title: "عمولة شحن ٣ ريال",
    desc: "عمولة بسطة مارت لكل شحنة عبر شركات الشحن الخارجية، بخلاف تكلفة الشحن",
  },
  {
    Icon: RotateCcw,
    title: "رقّي أو خفّضي باقتك وقتما شئتِ",
    desc: "بدون التزام سنوي — غيّري باقتك من لوحة التحكم بأي وقت",
  },
];

export default function NoCommissionBanner() {
  return (
    <section aria-label="مزايا الاشتراك في بسطة مارت" className={s.section} style={uiVars}>
      <div className={s.frame}>
        <div className={s.grid}>
          {POINTS.map(({ Icon, title, desc }) => (
            <div key={title} className={s.point}>
              <span className={s.icon} aria-hidden="true"><Icon size={21} strokeWidth={1.8} /></span>
              <div className={s.copy}>
                <h3 className={s.title}>{title}</h3>
                <p className={s.description}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
