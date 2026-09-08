// app/layout.tsx
// مطلوب من Next.js App Router نفسه — بدون هذا الملف لا يعمل المشروع إطلاقاً
// (هذا ليس اختيارياً، بل أساس تشغيل أي تطبيق App Router).
//
// دمج صفحات الواجهة الفعلية (BasitaHomepage.jsx وغيرها) في هذا الـ layout
// مؤجَّل لمرحلة لاحقة بعد استقرار الـ API — حالياً هذا أساس تقني فقط.

import "./globals.css";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { UserProvider } from "./providers";

// الخط الوحيد المسموح في كامل المنصة — theme/typography.ts يشير لنفس المتغيّر.
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export const metadata = {
  title: "بسطة | Basita",
  description: "منصة سعودية للحرف اليدوية والأسر المنتجة",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={plexArabic.variable}>
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
