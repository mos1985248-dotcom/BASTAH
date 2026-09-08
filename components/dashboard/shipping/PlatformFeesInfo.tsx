// components/dashboard/shipping/PlatformFeesInfo.tsx
// قراءة فقط للتاجر — نفس القيم الحقيقية من PlatformSetting (مصدرها
// platformFees ضمن GET /api/stores/shipping، بلا رقم ثابت هنا). التعديل
// على هذه الرسوم حصراً من لوحة الإدارة (SettingsSection).
import { Truck, Banknote } from "lucide-react";
import { t } from "@/theme";

export default function PlatformFeesInfo({ basitaShippingFee, codFee }: { basitaShippingFee: number; codFee: number }) {
  return (
    <div style={{ background: t.colors.primary[50], border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.lg, padding: t.spacing["4"], display: "flex", gap: t.spacing["5"], flexWrap: "wrap" }}>
      <div>
        <p style={{ display: "flex", alignItems: "center", gap: 5, margin: 0, fontSize: 11, color: t.colors.text.mid }}>
          <Truck size={12} strokeWidth={1.8} />
          رسوم بسطة التشغيلية
        </p>
        <p style={{ margin: 0, fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>{basitaShippingFee} ر.س</p>
      </div>
      <div>
        <p style={{ display: "flex", alignItems: "center", gap: 5, margin: 0, fontSize: 11, color: t.colors.text.mid }}>
          <Banknote size={12} strokeWidth={1.8} />
          رسوم الدفع عند الاستلام
        </p>
        <p style={{ margin: 0, fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>{codFee} ر.س</p>
      </div>
      <p style={{ margin: "auto 0 0", fontSize: 11, color: t.colors.text.light, flex: "1 1 200px" }}>
        هذه الرسوم تُضاف تلقائياً فوق سعر الشحن الفعلي بكل عملية — تُضبط من
        قِبل إدارة المنصة ولا يمكن تعديلها من هنا.
      </p>
    </div>
  );
}
