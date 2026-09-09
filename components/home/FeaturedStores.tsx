// components/home/FeaturedStores.tsx
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle, Store } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import StoreCard, { HomeStore } from "./StoreCard";
import StoreCardSkeleton from "./StoreCardSkeleton";
import TrustedStoresCTACard from "./TrustedStoresCTACard";

export default function FeaturedStores() {
  const [stores, setStores] = useState<HomeStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get<{ stores: HomeStore[] }>("/api/stores?limit=5")
      .then((data) => setStores(data.stores))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section aria-labelledby="stores-heading" aria-busy={loading} style={{ maxWidth: 1200, margin: "0 auto", padding: `${t.spacing["10"]} ${t.spacing["4"]}` }}>
      {/* عنوان القسم ورابط "عرض الكل" */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: t.spacing["5"], gap: t.spacing["3"] }}>
        <h2 id="stores-heading" style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark, margin: 0 }}>
          تصفّح المتاجر
        </h2>
        <a href="/marketplace" className="basita-btn-interactive" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: t.typography.fontSize.sm, color: t.colors.gold[600], fontWeight: t.typography.fontWeight.semibold, textDecoration: "none", whiteSpace: "nowrap" }}>
          عرض الكل
          <ArrowLeft size={15} strokeWidth={2} style={{ transform: "rotate(180deg)" }} aria-hidden="true" />
        </a>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div role="alert" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: t.spacing["3"], color: t.colors.text.mid, fontSize: t.typography.fontSize.sm, textAlign: "center", padding: t.spacing["8"], background: t.colors.semantic.dangerBg, borderRadius: t.radius.lg }}>
          <AlertTriangle size={22} strokeWidth={1.8} color={t.colors.semantic.danger} aria-hidden="true" />
          <span style={{ color: t.colors.semantic.danger, fontWeight: t.typography.fontWeight.semibold }}>تعذّر تحميل المتاجر</span>
          <span>يبدو أن هناك مشكلة مؤقتة، حاولي تحديث الصفحة</span>
        </div>
      )}

      {/* حالة عدم وجود متاجر */}
      {!loading && !error && stores.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: t.spacing["3"], color: t.colors.text.mid, fontSize: t.typography.fontSize.sm, textAlign: "center", padding: t.spacing["10"], background: t.colors.cream.warm, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}` }}>
          <div style={{ width: 56, height: 56, borderRadius: t.radius.full, background: t.colors.white, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${t.colors.cream.border}` }}>
            <Store size={24} strokeWidth={1.8} color={t.colors.primary[800]} aria-hidden="true" />
          </div>
          <span style={{ fontWeight: t.typography.fontWeight.semibold, color: t.colors.text.dark, fontSize: t.typography.fontSize.base }}>لا توجد متاجر مميّزة حالياً</span>
          <span>تابعينا قريباً — نضيف متاجر جديدة من الأسر المنتجة باستمرار</span>
          <a href="/marketplace" className="basita-btn-interactive" style={{ marginTop: t.spacing["1"], padding: `10px ${t.spacing["5"]}`, background: t.colors.primary[800], color: t.colors.text.onDark, borderRadius: t.radius.md, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, textDecoration: "none" }}>
            تصفّح كل المتاجر
          </a>
        </div>
      )}

      {/* تخطيط شبكة المتاجر وبطاقة الـ CTA — يُخفى عند وجود خطأ أو غياب المتاجر */}
      {!error && (loading || stores.length > 0) && (
        <div style={{ display: "flex", gap: t.spacing["5"], flexWrap: "wrap", alignItems: "stretch" }}>
          <div style={{ flex: "1 1 600px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: t.spacing["4"] }}>
            {loading
              ? Array.from({ length: 5 }, (_, i) => <StoreCardSkeleton key={i} />)
              : stores.map((s) => <StoreCard key={s.id} store={s} />)}
          </div>

          {/* بطاقة الترويج للمتاجر الموثوقة */}
          <div style={{ flex: "0 1 300px", minWidth: "260px" }}>
            <TrustedStoresCTACard />
          </div>
        </div>
      )}
    </section>
  );
}
