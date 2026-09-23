// components/admin/sections/ShippingProvidersSection.tsx
// ⚠️ تحكّم مركزي (تغيير معماري): أرامكس/SPL صارا يُداران من هنا (بيانات
// اعتماد مشتركة على مستوى المنصة) بدل ما يدخل كل تاجر حسابه الخاص —
// راجع lib/shipping/service.ts:resolveStoreShipping. التاجر بلوحته
// الآن بس يفعّل/يلغي، بدون أي إدخال بيانات.
"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import LoadingState from "@/components/admin/ui/LoadingState";
import ErrorState from "@/components/admin/ui/ErrorState";
import PlatformCarrierCard, { PlatformCarrier } from "@/components/admin/shipping/PlatformCarrierCard";
import CustomProviderCard, { CustomProvider } from "@/components/admin/shipping/CustomProviderCard";
import AddCustomProviderForm from "@/components/admin/shipping/AddCustomProviderForm";

export default function ShippingProvidersSection() {
  const [platformCarriers, setPlatformCarriers] = useState<PlatformCarrier[] | null>(null);
  const [customProviders, setCustomProviders] = useState<CustomProvider[] | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    Promise.all([
      api.get<{ carriers: PlatformCarrier[] }>("/api/admin/shipping/platform-credentials"),
      api.get<{ providers: CustomProvider[] }>("/api/admin/shipping/custom-providers"),
    ])
      .then(([p, c]) => {
        setPlatformCarriers(p.carriers);
        setCustomProviders(c.providers);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل شركات الشحن"));
  };

  useEffect(load, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!platformCarriers || !customProviders) return <LoadingState label="جاري تحميل شركات الشحن..." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["6"] }}>
      <section>
        <h3 style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.base, color: t.colors.text.dark }}>
          شركات مسجَّلة بالمنصة
        </h3>
        <p style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: 12, color: t.colors.text.mid, maxWidth: 640 }}>
          مفتاح واحد مشترك لكل شركة على مستوى المنصة كاملة — التاجر بلوحته
          فقط يفعّل/يلغي، بدون أي إدخال بيانات اعتماد.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: t.spacing["3"] }}>
          {platformCarriers.map((c) => (
            <PlatformCarrierCard key={c.carrier} carrier={c} onChanged={load} />
          ))}
        </div>
      </section>

      <section>
        <h3 style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.base, color: t.colors.text.dark }}>
          شركات محلية / مناديب / شركات بدون كود
        </h3>
        <p style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: 12, color: t.colors.text.mid, maxWidth: 640 }}>
          مناديب توصيل محليين (سعر ثابت، بدون أي نظام تقني) أو شركات عندها
          API خاص بها — تُضافان هنا مباشرة بدون كتابة كود.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: t.spacing["3"], marginBottom: t.spacing["3"] }}>
          {customProviders.map((p) => (
            <CustomProviderCard key={p.id} provider={p} onChanged={load} />
          ))}
        </div>
        <AddCustomProviderForm onAdded={load} />
      </section>
    </div>
  );
}
