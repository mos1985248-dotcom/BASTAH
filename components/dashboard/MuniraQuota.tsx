"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import s from "./munira-page.module.css";

type Quota = {
  planName: string;
  period: "trial" | "monthly";
  active: boolean;
  expired: boolean;
  allowed: boolean;
  retained: boolean;
  limit: number;
  used: number;
  remaining: number;
  plans: { plan: string; nameAr: string; muniraMonthlyMessages: number; muniraTrialMessages: number }[];
};

export default function MuniraQuota({ streaming }: { streaming: boolean }) {
  const [quota, setQuota] = useState<Quota | null>(null);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (streaming) return;
    const controller = new AbortController();
    setError(false);
    fetch("/api/ai/quota", { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("Quota unavailable");
        const data: Quota = await response.json();
        if (!controller.signal.aborted) setQuota(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [streaming, reload]);

  return (
    <section className={s.quota} aria-label="حصة رسائل منيرة">
      {error && <div className={s.quotaHeading}>
        <p role="status">تعذّر تحديث حصة الرسائل.</p>
        <button type="button" onClick={() => setReload(value => value + 1)}>إعادة المحاولة</button>
      </div>}
      {!quota && !error && <p role="status">جارٍ تحميل حصة الرسائل…</p>}
      {quota && <>
        <div className={s.quotaHeading}>
          <h2>{quota.planName}</h2>
          <span>{quota.expired ? "انتهت مدة الاشتراك" : !quota.active ? "الاشتراك غير نشط" : quota.period === "trial" ? "تجربة لمرة واحدة" : "الحصة الشهرية"}</span>
        </div>
        <dl className={s.quotaNumbers} aria-live="polite">
          <div><dt>حصة الباقة</dt><dd>{quota.limit}</dd></div>
          <div><dt>المستهلك</dt><dd>{quota.used}</dd></div>
          <div><dt>{quota.allowed ? "المتبقي" : "غير مستخدم"}</dt><dd>{quota.remaining}</dd></div>
        </dl>
        {quota.retained && <p>يمكنك استخدام الرصيد المتبقي من آخر حصة. تبدأ حصة جديدة بعد تجديد الاشتراك.</p>}
        {!quota.active && !quota.allowed && <p>
          إرسال رسائل جديدة يتطلب اشتراكًا نشطًا. <Link href="/dashboard/subscription">عرض الاشتراك</Link>
        </p>}
        {quota.active && !quota.allowed && quota.limit > 0 && <p>إرسال رسائل جديدة غير متاح حاليًا.</p>}
        <details>
          <summary>حصص جميع الباقات</summary>
          <ul className={s.quotaPlans}>
            {quota.plans.map(plan => <li key={plan.plan}>
              <strong>{plan.nameAr}</strong>
              {plan.muniraTrialMessages > 0 ? `${plan.muniraTrialMessages} رسائل لمرة واحدة`
                : plan.muniraMonthlyMessages > 0 ? `${plan.muniraMonthlyMessages} رسالة شهريًا` : "0 رسائل"}
            </li>)}
          </ul>
        </details>
      </>}
    </section>
  );
}
