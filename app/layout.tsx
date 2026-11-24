// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import "@fontsource/ibm-plex-sans-arabic/300.css";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "@fontsource-variable/noto-kufi-arabic";
import "@fontsource/aref-ruqaa/400.css";
import "@fontsource/aref-ruqaa/700.css";
import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";
import { UserProvider } from "./providers";

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
    <html lang="ar" dir="rtl">
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
