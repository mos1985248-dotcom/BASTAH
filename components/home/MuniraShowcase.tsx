"use client";

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
import MerchantToolCopy from "./MerchantToolCopy";
import tools from "./merchant-tools.module.css";
import s from "./munira.module.css";

const CAPABILITIES: { Icon: LucideIcon; label: string; mobile: string }[] = [
  { Icon: BarChart3, label: "تحليل الأداء والمبيعات", mobile: "كيف ماشية مبيعاتك؟" },
  { Icon: ImageIcon, label: "تصميم صور احترافية", mobile: "رتّب صور منتجاتك" },
  { Icon: PenLine, label: "كتابة وصف المنتجات", mobile: "اكتب وصف يشوّق" },
  { Icon: Tag, label: "كتابة أسماء المنتجات", mobile: "اقترح أسماء لمنتجاتك" },
];

export default function MuniraShowcase() {
  return (
    <section
      aria-labelledby="munira-heading"
      className={`${s.section} ${tools.section}`}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}
    >
      <div className={s.card}>
        <div className={s.copy}>
          <div className={s.intro} data-home-reveal>
            <h2 id="munira-heading" className={s.title} style={{ fontFamily: t.typography.fontFamily.display }}>
              منيرة
            </h2>
            <p className={s.lead}><MerchantToolCopy desktop="مساعدتك الذكية لإدارة متجرك وزيادة مبيعاتك" mobile="منيرة مساعدتك الذكية كل يوم. تساعدك تكتب وصف يشوّق الزبون، وتقترح لك أسماء مرتّبة، وتنسّق صورك، وتخلّيك تتابع مبيعاتك بسهولة." /></p>
          </div>

          <ul className={s.chips} data-home-reveal-group>
            {CAPABILITIES.map(({ Icon, label, mobile }) => (
              <li key={label} className={s.chip} data-home-reveal>
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                <MerchantToolCopy desktop={label} mobile={mobile} />
              </li>
            ))}
          </ul>

          <button type="button" className={s.cta} onClick={() => document.getElementById("public-munira-launch")?.click()}>
            اسأل منيرة
          </button>
        </div>

        <MuniraChat />
      </div>
    </section>
  );
}
