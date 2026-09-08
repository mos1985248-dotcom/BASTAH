// app/offers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import SiteShell from "@/components/layout/SiteShell";
import OfferCard, { Offer } from "@/components/offers/OfferCard";

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get<{ coupons: Offer[] }>("/api/offers").then((d) => setOffers(d.coupons)).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);

  return (
    <SiteShell>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: t.spacing["6"] }}>
        <h1 style={{ fontSize: t.typography.fontSize["2xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], marginBottom: t.spacing["1"] }}>
          العروض والكوبونات
        </h1>
        <p style={{ fontSize: t.typography.fontSize.sm, color: t.colors.text.mid, marginBottom: t.spacing["6"] }}>
          أكواد خصم فعّالة من متاجر بسطة — استخدميها عند إتمام الطلب
        </p>

        {loading && <p style={{ color: t.colors.text.mid }}>جاري التحميل...</p>}
        {error && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, color: t.colors.semantic.danger }}>
            <AlertTriangle size={15} strokeWidth={1.8} />
            تعذّر تحميل العروض، حاولي تحديث الصفحة
          </p>
        )}
        {!loading && !error && offers.length === 0 && <p style={{ color: t.colors.text.mid }}>لا توجد عروض فعّالة حالياً — تابعي المتاجر لأحدث الكوبونات</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: t.spacing["4"] }}>
          {offers.map((o) => (
            <OfferCard key={o.id} offer={o} />
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
