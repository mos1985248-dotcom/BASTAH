// components/home/PlansSection.tsx
"use client";
import { useEffect, useState } from "react";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import Skeleton from "@/components/ui/Skeleton";
import type { PlanConfig } from "@/components/pricing/plan-types";
import PlanCard from "./PlanCard";
import s from "./plans.module.css";

export default function PlansSection() {
  const [plans, setPlans] = useState<PlanConfig[] | null>(null);

  useEffect(() => {
    fetch("/api/subscription/plans")
      .then((r) => r.json())
      .then((d) => setPlans(d.plans))
      .catch(() => setPlans([]));
  }, []);

  // الباقات الحقيقية من قاعدة البيانات فقط: لا باقات مختلقة عند الفشل
  if (plans && plans.length === 0) return null;

  return (
    <section
      aria-labelledby="plans-heading"
      aria-busy={plans === null}
      className={s.section}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}
    >
      <div className={s.header}>
        <p className={s.kicker}>باقات بسطة مارت</p>
        <h2 id="plans-heading" className={s.title} style={{ fontFamily: t.typography.fontFamily.display }}>
          باقات تناسب كل أسرة منتجة
        </h2>
        <p className={s.sub}>بدون عمولة على مبيعاتك مهما كانت باقتك — رسوم اشتراك ثابتة فقط</p>
      </div>

      <div className={s.grid} data-home-reveal-group>
        {plans === null
          ? Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={s.skeleton}>
                <Skeleton height={26} width="45%" />
                <Skeleton height={48} width="60%" />
                <Skeleton height={16} />
                <Skeleton height={16} />
                <Skeleton height={48} radius="999px" />
              </div>
            ))
          : plans.map((plan) => <PlanCard key={plan.plan} plan={plan} />)}
      </div>

      <a href="/pricing" className={s.compare}>
        مقارنة كل الميزات بالتفصيل
      </a>
    </section>
  );
}
