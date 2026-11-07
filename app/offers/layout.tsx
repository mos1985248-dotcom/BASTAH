import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "العروض والكوبونات | بسطة مارت",
  description: "اكتشف العروض والكوبونات المتاحة من متاجر بسطة مارت.",
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
