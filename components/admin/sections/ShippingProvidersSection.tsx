// components/admin/sections/ShippingProvidersSection.tsx
// عرض فقط — مربوط حرفياً بـ/api/admin/shipping/providers (Endpoint موجود
// أصلاً، لا تعديل عليه). صفر رقم ثابت: connectedStores من StoreShipping
// الحقيقي، capability من lib/shipping/metadata.ts (تعكس ما تدعمه كل شركة
// فعلياً اليوم — getRate/testCredentials فقط، الباقي not_supported).
// لا "تفعيل/تعطيل على مستوى المنصة" هنا لأن الحقل غير موجود بالسكيما —
// platformActive تُعرض دائماً true (موثّق بالتقرير)، فلا يوجد زر تعطيل هنا.
"use client";

import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import LoadingState from "@/components/admin/ui/LoadingState";
import ErrorState from "@/components/admin/ui/ErrorState";
import EmptyState from "@/components/admin/ui/EmptyState";
import StatusBadge from "@/components/admin/ui/StatusBadge";

interface Provider {
  carrier: string;
  displayNameAr: string;
  logoUrl: string | null;
  capability: "rate_only" | "full";
  supported: boolean;
  platformActive: boolean;
  connectedStores: number;
}

export default function ShippingProvidersSection() {
  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api
      .get<{ providers: Provider[] }>("/api/admin/shipping/providers")
      .then((d) => setProviders(d.providers))
      .catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل شركات الشحن"));
  };

  useEffect(load, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!providers) return <LoadingState label="جاري تحميل شركات الشحن..." />;
  if (providers.length === 0) return <EmptyState icon={Truck} message="لا توجد شركات شحن مسجَّلة بالمنصة حالياً" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["4"] }}>
      <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, maxWidth: 640 }}>
        هذه الشركات مسجَّلة كودياً بمنصة بسطة (لكل شركة تنفيذ خاص بها). عدد
        المتاجر المربوطة حقيقي من بيانات الربط الفعلية. لا يوجد حالياً زر
        تعليق على مستوى المنصة — التحكم بربط كل متجر يكون من التاجر نفسه.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: t.spacing["3"] }}>
        {providers.map((p) => (
          <div
            key={p.carrier}
            style={{
              background: t.colors.white,
              borderRadius: t.radius.lg,
              border: `1px solid ${t.colors.cream.border}`,
              padding: t.spacing["4"],
              display: "flex",
              flexDirection: "column",
              gap: t.spacing["2"],
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 34, height: 34, borderRadius: t.radius.md, background: t.colors.primary[100],
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}
                >
                  <Truck size={17} strokeWidth={1.7} color={t.colors.primary[800]} />
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{p.displayNameAr}</p>
                  <p style={{ margin: 0, fontSize: 11, color: t.colors.text.light, direction: "ltr", textAlign: "end" }}>{p.carrier}</p>
                </div>
              </div>
              {p.platformActive ? (
                <StatusBadge label="نشطة" color={t.colors.semantic.success} bg={t.colors.semantic.successBg} />
              ) : (
                <StatusBadge label="معلَّقة" color={t.colors.semantic.danger} bg={t.colors.semantic.dangerBg} />
              )}
            </div>

            <div style={{ display: "flex", gap: t.spacing["2"], flexWrap: "wrap" }}>
              <StatusBadge
                label={p.capability === "full" ? "دعم كامل" : "أسعار فقط"}
                color={p.capability === "full" ? t.colors.semantic.success : t.colors.gold[600]}
                bg={p.capability === "full" ? t.colors.semantic.successBg : t.colors.gold[100]}
              />
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>{p.connectedStores}</span>
              <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>متجر مربوط فعلياً</span>
            </div>

            {p.capability === "rate_only" && (
              <p style={{ margin: 0, fontSize: 11, color: t.colors.text.light }}>
                إنشاء شحنات/تتبّع حقيقي بانتظار تأكيد رسمي من الشركة.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
