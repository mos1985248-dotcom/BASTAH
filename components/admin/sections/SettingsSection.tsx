// components/admin/sections/SettingsSection.tsx
// يعرض إعدادين فقط، مربوطين حرفياً بـ/api/admin/settings الموجود أصلاً
// (GET/PATCH، محمي بـrequireRole("ADMIN","SUPER_ADMIN") من قبل). صفر رقم
// ثابت هنا — القيمة الافتراضية (3 ر.س) تُعرض فقط لو الـAPI نفسه أرجعها
// (وهو ما يفعله lib/platform-settings.ts fallback عند عدم وجود سطر بعد).
"use client";

import { useEffect, useState } from "react";
import { Truck, Banknote, Settings2 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import LoadingState from "@/components/admin/ui/LoadingState";
import ErrorState from "@/components/admin/ui/ErrorState";
import SettingsField from "@/components/admin/ui/SettingsField";

interface SettingsData {
  basitaShippingFee: number;
  codFee: number;
}

export default function SettingsSection() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api
      .get<SettingsData>("/api/admin/settings")
      .then(setData)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "تعذّر تحميل الإعدادات"
        )
      );
  };

  useEffect(load, []);

  if (error) {
    return (
      <div
        dir="rtl"
        style={{
          maxWidth: 680,
        }}
      >
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  if (!data) {
    return (
      <div
        dir="rtl"
        style={{
          maxWidth: 680,
        }}
      >
        <LoadingState label="جاري تحميل إعدادات المنصة..." />
      </div>
    );
  }

  return (
    <section
      className="basita-platform-settings"
      dir="rtl"
      style={{
        maxWidth: 680,
      }}
    >
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: t.spacing["4"],
          padding: `${t.spacing["3"]} ${t.spacing["4"]}`,
          background: t.colors.white,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.lg,
          boxShadow: "0 2px 10px rgba(0,0,0,0.025)",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: t.radius.md,
            background: t.colors.primary[50],
            color: t.colors.primary[800],
            border: `1px solid ${t.colors.cream.border}`,
          }}
        >
          <Settings2 size={20} strokeWidth={1.9} />
        </div>

        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontSize: t.typography.fontSize.base,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.text.dark,
              lineHeight: 1.4,
            }}
          >
            إعدادات المنصة
          </h2>

          <p
            style={{
              margin: "3px 0 0",
              fontSize: t.typography.fontSize.xs,
              color: t.colors.text.mid,
              lineHeight: 1.6,
            }}
          >
            التحكم في الرسوم التشغيلية التي تُطبّق على الطلبات الجديدة.
          </p>
        </div>
      </div>

      {/* Settings fields */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: t.spacing["3"],
        }}
      >
        <div className="basita-setting-card">
          <SettingsField
            icon={Truck}
            label="رسوم التوصيل التشغيلية للمنصة"
            helper="رسوم بسطة الثابتة تُضاف فوق سعر شركة الشحن الفعلي بكل عملية شحن — وليست سعر الشحن نفسه، الذي يعتمد على الشركة والمنطقة والوزن. التغيير يسري على الطلبات الجديدة فقط، ولا يُعاد حسابه على طلبات سابقة."
            value={data.basitaShippingFee}
            onSave={async (v) => {
              const res = await api.patch<SettingsData>(
                "/api/admin/settings",
                { basitaShippingFee: v }
              );
              setData(res);
            }}
          />
        </div>

        <div className="basita-setting-card">
          <SettingsField
            icon={Banknote}
            label="رسوم الدفع عند الاستلام (COD)"
            helper="تُضاف فقط لطلبات الدفع عند الاستلام — الطلبات المدفوعة إلكترونياً (بطاقة/مدى/آبل باي/STC Pay) لا تتحمّلها إطلاقاً. التغيير يسري على الطلبات الجديدة فقط."
            value={data.codFee}
            onSave={async (v) => {
              const res = await api.patch<SettingsData>(
                "/api/admin/settings",
                { codFee: v }
              );
              setData(res);
            }}
          />
        </div>
      </div>

      <style>{`
        .basita-setting-card {
          background: ${t.colors.white};
          border: 1px solid ${t.colors.cream.border};
          border-radius: ${t.radius.lg};
          padding: 4px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.025);
          transition:
            border-color 160ms ease,
            box-shadow 160ms ease,
            transform 160ms ease;
        }

        .basita-setting-card:hover {
          border-color: rgba(0,0,0,0.10);
          box-shadow: 0 7px 20px rgba(0,0,0,0.045);
          transform: translateY(-1px);
        }

        @media (max-width: 700px) {
          .basita-platform-settings {
            max-width: 100% !important;
          }

          .basita-platform-settings > div:first-child {
            padding: 12px 14px !important;
          }
        }

        @media (max-width: 480px) {
          .basita-platform-settings > div:first-child {
            gap: 9px !important;
          }

          .basita-platform-settings > div:first-child > div:first-child {
            width: 38px !important;
            height: 38px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-setting-card {
            transition: none;
          }

          .basita-setting-card:hover {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}