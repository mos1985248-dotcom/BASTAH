// components/admin/sections/ShippingProvidersSection.tsx
// عرض فقط — مربوط حرفياً بـ/api/admin/shipping/providers (Endpoint موجود
// أصلاً، لا تعديل عليه). صفر رقم ثابت: connectedStores من StoreShipping
// الحقيقي، capability من lib/shipping/metadata.ts (تعكس ما تدعمه كل شركة
// فعلياً اليوم — getRate/testCredentials فقط، الباقي not_supported).
// لا "تفعيل/تعطيل على مستوى المنصة" هنا لأن الحقل غير موجود بالسكيما —
// platformActive تُعرض دائماً true (موثّق بالتقرير)، فلا يوجد زر تعطيل هنا.
"use client";

import { useEffect, useState } from "react";
import { Truck, Store, ShieldCheck } from "lucide-react";
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
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "تعذّر تحميل شركات الشحن"
        )
      );
  };

  useEffect(load, []);

  if (error) return <ErrorState message={error} onRetry={load} />;

  if (!providers) {
    return <LoadingState label="جاري تحميل شركات الشحن..." />;
  }

  if (providers.length === 0) {
    return (
      <EmptyState
        icon={Truck}
        message="لا توجد شركات شحن مسجَّلة بالمنصة حالياً"
      />
    );
  }

  return (
    <section
      className="basita-shipping-providers"
      dir="rtl"
    >
      {/* Intro */}
      <div
        className="basita-shipping-intro"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: `${t.spacing["3"]} ${t.spacing["4"]}`,
          background: t.colors.white,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.lg,
          boxShadow: "0 2px 10px rgba(0,0,0,0.025)",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: t.radius.md,
            background: t.colors.primary[50],
            color: t.colors.primary[800],
          }}
        >
          <Truck size={19} strokeWidth={1.8} />
        </div>

        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.text.dark,
            }}
          >
            شركات الشحن المتاحة
          </p>

          <p
            style={{
              margin: 0,
              fontSize: t.typography.fontSize.xs,
              color: t.colors.text.mid,
              lineHeight: 1.75,
              maxWidth: 700,
            }}
          >
            هذه الشركات مسجَّلة كودياً بمنصة بسطة (لكل شركة تنفيذ خاص بها).
            عدد المتاجر المربوطة حقيقي من بيانات الربط الفعلية. لا يوجد حالياً
            زر تعليق على مستوى المنصة — التحكم بربط كل متجر يكون من التاجر نفسه.
          </p>
        </div>
      </div>

      {/* Providers */}
      <div
        className="basita-shipping-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(280px, 1fr))",
          gap: t.spacing["3"],
          marginTop: t.spacing["4"],
        }}
      >
        {providers.map((p) => (
          <div
            key={p.carrier}
            className="basita-shipping-card"
            style={{
              background: t.colors.white,
              borderRadius: t.radius.lg,
              border: `1px solid ${t.colors.cream.border}`,
              padding: t.spacing["4"],
              display: "flex",
              flexDirection: "column",
              gap: t.spacing["3"],
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Active accent */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                insetInlineStart: 0,
                top: 0,
                bottom: 0,
                width: 3,
                background: p.platformActive
                  ? t.colors.semantic.success
                  : t.colors.semantic.danger,
              }}
            />

            {/* Provider header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: t.radius.md,
                    background: t.colors.primary[100],
                    border: `1px solid ${t.colors.primary[100]}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Truck
                    size={19}
                    strokeWidth={1.7}
                    color={t.colors.primary[800]}
                  />
                </span>

                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: t.typography.fontWeight.bold,
                      color: t.colors.text.dark,
                      lineHeight: 1.4,
                    }}
                  >
                    {p.displayNameAr}
                  </p>

                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: 10,
                      color: t.colors.text.light,
                      direction: "ltr",
                      textAlign: "start",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.carrier}
                  </p>
                </div>
              </div>

              {p.platformActive ? (
                <StatusBadge
                  label="نشطة"
                  color={t.colors.semantic.success}
                  bg={t.colors.semantic.successBg}
                />
              ) : (
                <StatusBadge
                  label="معلَّقة"
                  color={t.colors.semantic.danger}
                  bg={t.colors.semantic.dangerBg}
                />
              )}
            </div>

            {/* Capability */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                paddingTop: t.spacing["2"],
                borderTop: `1px solid ${t.colors.cream.border}`,
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 10,
                  color: t.colors.text.mid,
                }}
              >
                <ShieldCheck size={13} strokeWidth={1.8} />
                مستوى التكامل
              </span>

              <StatusBadge
                label={
                  p.capability === "full"
                    ? "دعم كامل"
                    : "أسعار فقط"
                }
                color={
                  p.capability === "full"
                    ? t.colors.semantic.success
                    : t.colors.gold[600]
                }
                bg={
                  p.capability === "full"
                    ? t.colors.semantic.successBg
                    : t.colors.gold[100]
                }
              />
            </div>

            {/* Connected stores */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "10px 12px",
                background: t.colors.cream.bg,
                borderRadius: t.radius.md,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  color: t.colors.text.mid,
                }}
              >
                <Store size={15} strokeWidth={1.8} />

                <span
                  style={{
                    fontSize: t.typography.fontSize.xs,
                  }}
                >
                  المتاجر المربوطة فعلياً
                </span>
              </div>

              <span
                style={{
                  fontSize: t.typography.fontSize.xl,
                  lineHeight: 1,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.primary[800],
                }}
              >
                {p.connectedStores}
              </span>
            </div>

            {/* Rate-only note */}
            {p.capability === "rate_only" && (
              <p
                style={{
                  margin: 0,
                  paddingTop: 2,
                  fontSize: 10.5,
                  lineHeight: 1.7,
                  color: t.colors.text.light,
                }}
              >
                إنشاء شحنات/تتبّع حقيقي بانتظار تأكيد رسمي من الشركة.
              </p>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .basita-shipping-card {
          transition:
            transform 160ms ease,
            box-shadow 160ms ease,
            border-color 160ms ease;
        }

        .basita-shipping-card:hover {
          transform: translateY(-2px);
          border-color: rgba(0,0,0,0.10) !important;
          box-shadow: 0 9px 24px rgba(0,0,0,0.055);
        }

        @media (max-width: 700px) {
          .basita-shipping-grid {
            grid-template-columns: 1fr !important;
          }

          .basita-shipping-intro {
            padding: 12px 14px !important;
          }
        }

        @media (max-width: 420px) {
          .basita-shipping-card {
            padding: 13px !important;
          }

          .basita-shipping-intro {
            gap: 9px !important;
          }

          .basita-shipping-intro > div:first-child {
            width: 34px !important;
            height: 34px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-shipping-card {
            transition: none;
          }

          .basita-shipping-card:hover {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}