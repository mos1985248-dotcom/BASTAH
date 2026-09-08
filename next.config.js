/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // ⚠️ أمني: لم تكن هناك أي security headers مضبوطة سابقاً — الموقع كان
  // مكشوفاً لهجوم clickjacking (تضمينه بـ<iframe> مخفي بموقع خبيث لخداع
  // المستخدم يضغط أزرار حقيقية)، بالذات خطير على صفحات الدفع/checkout.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // يمنع تضمين الموقع بـ<iframe> من أي مصدر — يقفل clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // يمنع المتصفح من تخمين نوع الملف (MIME sniffing)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // يفرض HTTPS لمدة سنة على كل الزيارات القادمة (بعد أول زيارة آمنة)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // يقلّل تسريب الـURL الكامل لمواقع خارجية عبر Referer
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // يمنع الوصول لكاميرا/مايكروفون/موقع من الصفحة (غير مستخدَمة حالياً)
          // ⚠️ geolocation=(self) — كانت geolocation=() (ممنوعة كلياً) من
          // المراجعة الأمنية الأولى، قبل ما تُبنى ميزة "موقع المتجر"
          // (القسم ١) اللي تحتاج navigator.geolocation فعلياً من صفحة
          // لوحة التاجر. camera/microphone تبقى ممنوعة (لسه غير مستخدَمتين).
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },

  // ملاحظة: منطق توجيه الدومينات المخصصة لكل متجر (custom domain routing)
  // ومنطق next-intl للترجمة ثنائية اللغة يُضافان في middleware.ts في مرحلة
  // لاحقة بعد استقرار Auth/Store/Products — لا حاجة لهما الآن.
};

module.exports = nextConfig;