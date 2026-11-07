import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "إنشاء حساب | بسطة مارت",
  description: "انضم إلى بسطة مارت كمشترٍ أو صاحب متجر للأسر المنتجة والحرفيين.",
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
