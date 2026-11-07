"use client";
// components/home/StoreLane.tsx
// ممشى السوق: شريط أفقي يُتصفَّح بالسحب على الجوال وبالسهمين على الشاشات الكبيرة.
import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import s from "./stalls.module.css";

export default function StoreLane({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  // الاتجاه RTL: التقدّم للأمام = تمرير بقيمة سالبة
  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: -dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className={s.laneWrap}>
      <div ref={ref} className={s.lane} tabIndex={0} role="group" aria-label="بسطات السوق" data-home-reveal-group>
        {children}
      </div>
      <div className={s.arrows}>
        <button type="button" className={s.arrow} onClick={() => go(-1)} aria-label="البسطات السابقة">
          <ChevronRight size={20} strokeWidth={2} />
        </button>
        <button type="button" className={s.arrow} onClick={() => go(1)} aria-label="البسطات التالية">
          <ChevronLeft size={20} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
