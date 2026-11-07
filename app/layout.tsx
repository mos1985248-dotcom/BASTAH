// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import {
  IBM_Plex_Sans_Arabic,
  Noto_Kufi_Arabic,
  Aref_Ruqaa,
  Amiri,
} from "next/font/google";
import { UserProvider } from "./providers";

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

const kufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-kufi-arabic",
  display: "swap",
});

// خطان خطّيان للمقارنة على الرئيسية؛ يُحذف الخاسر بعد الاعتماد.
const arefRuqaa = Aref_Ruqaa({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-aref-ruqaa",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
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
    <html
      lang="ar"
      dir="rtl"
      className={`${plexArabic.variable} ${kufiArabic.variable} ${arefRuqaa.variable} ${amiri.variable}`}
    >
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
