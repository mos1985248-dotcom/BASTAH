// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Amiri, Readex_Pro } from "next/font/google";
import "@fontsource/aref-ruqaa/400.css";
import "@fontsource/aref-ruqaa/700.css";
import { UserProvider } from "./providers";
import PublicMobileNavigation from "@/components/layout/PublicMobileNavigation";

const readex = Readex_Pro({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-readex",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-amiri",
});

export const metadata: Metadata = {
  title: "بسطة مارت | سوق الأسر المنتجة السعودية",
  description: "بسطة مارت سوق سعودي يجمع منتجات الأسر المنتجة والحرفيين، بأصالة الصنعة السعودية وروح الأسواق التراثية.",
  applicationName: "بسطة مارت",
  openGraph: {
    siteName: "بسطة مارت",
    title: "بسطة مارت | سوق الأسر المنتجة السعودية",
    description: "بسطة مارت سوق سعودي يجمع منتجات الأسر المنتجة والحرفيين، بأصالة الصنعة السعودية وروح الأسواق التراثية.",
    locale: "ar_SA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${readex.variable} ${amiri.variable}`}>
      <body>
        <UserProvider><PublicMobileNavigation>{children}</PublicMobileNavigation></UserProvider>
      </body>
    </html>
  );
}
