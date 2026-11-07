import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "استعادة كلمة المرور | بسطة مارت",
  description: "استعد الوصول إلى حسابك في بسطة مارت بأمان.",
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
