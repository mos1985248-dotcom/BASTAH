// app/pricing/page.tsx
import type { Metadata } from "next";
import PricingClient from "@/components/pricing/PricingClient";

export const metadata: Metadata = {
  title: "الأسعار والباقات | بسطة",
  description: "باقات اشتراك بسطة — بدون أي عمولة على مبيعاتك، رسوم اشتراك شهرية ثابتة فقط. اختاري الباقة المناسبة لمتجرك",
};

export default function PricingPage() {
  return <PricingClient />;
}
