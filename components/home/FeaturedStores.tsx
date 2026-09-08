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
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: `${t.spacing["10"]} ${t.spacing["4"]}` }}>
      {/* عنوان القسم ورابط "عرض الكل" */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: t.spacing["5"] }}>
        <h2 style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark, margin: 0 }}>
          تصفّح المتاجر
        </h2>
        <a href="/marketplace" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: t.typography.fontSize.sm, color: t.colors.gold[600], fontWeight: t.typography.fontWeight.semibold, textDecoration: "none" }}>
          عرض الكل
          <ArrowLeft size={15} strokeWidth={2} style={{ transform: "rotate(180deg)" }} />
        </a>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <p style={{ display: "flex", alignItems: "center", gap: 8, color: t.colors.semantic.danger, fontSize: t.typography.fontSize.sm, marginBottom: t.spacing["4"] }}>
          <AlertTriangle size={16} strokeWidth={1.8} />
          تعذّر تحميل المتاجر، حاولي تحديث الصفحة
        </p>
      )}

      {/* حالة عدم وجود متاجر */}
      {!loading && !error && stores.length === 0 && (
        <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: t.colors.text.mid, fontSize: t.typography.fontSize.sm, textAlign: "center", padding: t.spacing["8"], background: t.colors.cream.warm, borderRadius: t.radius.lg }}>
          <Store size={18} strokeWidth={1.8} />
          لا توجد متاجر مميّزة حالياً
        </p>
      )}

      {/* تخطيط شبكة المتاجر وبطاقة الـ CTA */}
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
    </section>
  );
}