import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تسجيل الدخول | بسطة مارت",
  description: "سجّل دخولك إلى بسطة مارت للوصول إلى حسابك والتسوّق وإدارة متجرك.",
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
