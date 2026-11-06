// components/home/MuniraShowcase.tsx
import {
  BarChart3,
  ImageIcon,
  PenLine,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import MuniraChat from "./MuniraChat";
import s from "./munira.module.css";

const CAPABILITIES: { Icon: LucideIcon; label: string }[] = [
  { Icon: BarChart3, label: "تحليل الأداء والمبيعات" },
  { Icon: ImageIcon, label: "تصميم صور احترافية" },
  { Icon: PenLine, label: "كتابة وصف المنتجات" },
  { Icon: Tag, label: "كتابة أسماء المنتجات" },
];

export default function MuniraShowcase() {
  return (
    <section
      aria-labelledby="munira-heading"
      className={s.section}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}
    >
      <div className={s.card}>
        <div className={s.copy}>
          <div className={s.intro}>
            <p className={s.kicker}>مساعدتك الذكية</p>
            <h2 id="munira-heading" className={s.title} style={{ fontFamily: t.typography.fontFamily.display }}>
              منيرة
            </h2>
            <p className={s.lead}>مساعدتك الذكية لإدارة متجرك وزيادة مبيعاتك</p>
          </div>

          <ul className={s.chips}>
            {CAPABILITIES.map(({ Icon, label }) => (
              <li key={label} className={s.chip}>
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>

          <a href="/dashboard/munira" className={s.cta}>
            اسأل منيرة
          </a>
        </div>

        <MuniraChat />
      </div>
    </section>
  );
}
