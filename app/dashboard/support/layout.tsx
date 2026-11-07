import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تواصل معنا والدعم | بسطة مارت",
  description: "تواصل مع فريق دعم بسطة مارت وتابع طلبات المساعدة من حسابك.",
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
