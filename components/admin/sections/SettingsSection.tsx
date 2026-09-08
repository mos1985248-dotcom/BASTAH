// components/admin/sections/SettingsSection.tsx
// يعرض إعدادين فقط، مربوطين حرفياً بـ/api/admin/settings الموجود أصلاً
// (GET/PATCH، محمي بـrequireRole("ADMIN","SUPER_ADMIN") من قبل). صفر رقم
// ثابت هنا — القيمة الافتراضية (3 ر.س) تُعرض فقط لو الـAPI نفسه أرجعها
// (وهو ما يفعله lib/platform-settings.ts fallback عند عدم وجود سطر بعد).
"use client";

import { useEffect, useState } from "react";
import { Truck, Banknote } from "lucide-react";
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
      .catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل الإعدادات"));
  };

  useEffect(load, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <LoadingState label="جاري تحميل إعدادات المنصة..." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["4"], maxWidth: 560 }}>
      <SettingsField
        icon={Truck}
        label="رسوم التوصيل التشغيلية للمنصة"
        helper="رسوم بسطة الثابتة تُضاف فوق سعر شركة الشحن الفعلي بكل عملية شحن — وليست سعر الشحن نفسه، الذي يعتمد على الشركة والمنطقة والوزن. التغيير يسري على الطلبات الجديدة فقط، ولا يُعاد حسابه على طلبات سابقة."
        value={data.basitaShippingFee}
        onSave={async (v) => {
          const res = await api.patch<SettingsData>("/api/admin/settings", { basitaShippingFee: v });
          setData(res);
        }}
      />

      <SettingsField
        icon={Banknote}
        label="رسوم الدفع عند الاستلام (COD)"
        helper="تُضاف فقط لطلبات الدفع عند الاستلام — الطلبات المدفوعة إلكترونياً (بطاقة/مدى/آبل باي/STC Pay) لا تتحمّلها إطلاقاً. التغيير يسري على الطلبات الجديدة فقط."
        value={data.codFee}
        onSave={async (v) => {
          const res = await api.patch<SettingsData>("/api/admin/settings", { codFee: v });
          setData(res);
        }}
      />
    </div>
  );
}
