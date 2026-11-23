"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { api } from "@/lib/api-client";
import LoadingState from "@/components/dashboard/ui/LoadingState";
import s from "./marketing.module.css";

type Access = { allowed: boolean; requiredPlan: string | null; reason: string };
export type FeatureDecisions = Record<string, Access>;

export function useStoreFeatures() {
  const [features, setFeatures] = useState<FeatureDecisions | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api.get<{ features: FeatureDecisions }>("/api/entitlements")
      .then(data => { if (active) setFeatures(data.features); })
      .catch(() => { if (active) setError("تعذّر تحميل صلاحيات المتجر."); });
    return () => { active = false; };
  }, []);
  return { features, error };
}

export function FeatureGate({ access, title, description, children }: {
  access: Access | undefined; title: string; description: string; children: ReactNode;
}) {
  if (!access) return <LoadingState />;
  if (access.allowed) return <>{children}</>;
  return (
    <section className={s.sec} dir="rtl">
      <h2 className={s.h2}><LockKeyhole size={17} aria-hidden /> {title}</h2>
      <p className={s.note}>{description}</p>
      {access.reason === "disabled_on_platform" ? <p>الميزة موقوفة حاليًا.</p> : <>
        {access.requiredPlan && <p>الباقة المطلوبة {access.requiredPlan}</p>}
        <Link href="/dashboard/subscription">ترقية الباقة</Link>
      </>}
    </section>
  );
}
