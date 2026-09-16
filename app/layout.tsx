// app/layout.tsx
import "./globals.css";
import { IBM_Plex_Sans_Arabic, Noto_Kufi_Arabic } from "next/font/google";
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

export const metadata = {
  title: "بسطة | Basita",
  description: "منصة سعودية للحرف اليدوية والأسر المنتجة",
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
      className={`${plexArabic.variable} ${kufiArabic.variable}`}
    >
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}