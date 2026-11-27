// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "@fontsource/aref-ruqaa/400.css";
import "@fontsource/aref-ruqaa/700.css";
import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";
import { UserProvider } from "./providers";

const plex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-plex-arabic",
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
    <html lang="ar" dir="rtl" className={plex.variable}>
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
