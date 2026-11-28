import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import GeneralFAQ from "@/components/faq/GeneralFAQ";
export const metadata: Metadata = {
 title: "الأسئلة الشائعة | بسطة مارت",
 description: "مركز المساعدة للمشترين والزوار وأصحاب البسطات: التسوق والطلبات والدفع والشحن والاسترجاع والحساب والباقات.",
};
export default function FAQPage() {
 return <SiteShell><GeneralFAQ /></SiteShell>;
}
