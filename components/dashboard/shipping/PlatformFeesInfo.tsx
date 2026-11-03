// components/dashboard/shipping/PlatformFeesInfo.tsx
// قراءة فقط للتاجر — نفس القيم الحقيقية من PlatformSetting (مصدرها
// platformFees ضمن GET /api/stores/shipping، بلا رقم ثابت هنا). التعديل
// على هذه الرسوم حصراً من لوحة الإدارة (SettingsSection).
// يُرجع بطاقتي مؤشر لتوضعا داخل شبكة المؤشرات في الصفحة.
import { Truck, Banknote } from "lucide-react";
import ShipKpi from "./ShipKpi";

export default function PlatformFeesInfo({ basitaShippingFee, codFee }: { basitaShippingFee: number; codFee: number }) {
  return (
    <>
      <ShipKpi icon={Truck} label="رسوم بسطة التشغيلية" value={`${basitaShippingFee} ر.س`} />
      <ShipKpi icon={Banknote} label="رسوم الدفع عند الاستلام" value={`${codFee} ر.س`} />
    </>
  );
}
