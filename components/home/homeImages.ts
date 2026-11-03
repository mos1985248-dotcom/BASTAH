// components/home/homeImages.ts
// مصدر واحد لصور الرئيسية. src = null يعرض مكاناً محجوزاً مصمَّماً بدل صورة.
// الصور للأجواء والشرح فقط (البطل، خطوات الاستخدام) وليست صور منتجات متاجر.
export const homeImages = {
  hero: {
    src: "/images/hero.webp" as string | null,
    alt: "ركن مجلس تراثي: دلّة قهوة نحاسية وفناجين وتمر على طاولة خشبية بجانب أريكة خضراء",
  },
  // صورة شرح لقسم «لماذا بسطة»: طاولة تجهيز وتغليف منتجات يدوية (بلا أشخاص ولا نصوص)
  why: {
    src: "/images/why.webp" as string | null,
    alt: "طاولة تجهيز الطلبات: علبة شحن من الورق المقوى فيها صابون وبرطمان ورد مجفف وكيس خيش",
  },
  // صور أجواء الأقسام (تُعرض في بلاطات «تسوّق حسب الفئة»). قسم بلا صورة يعرض أيقونة.
  categories: {
    dates: "/images/categories/dates.webp",
    honey: "/images/categories/honey.webp",
    "oud-perfumes": "/images/categories/oud-perfumes.webp",
    "abayas-accessories": "/images/categories/abayas-accessories.webp",
    "home-decor": "/images/categories/home-decor.webp",
    "natural-products": "/images/categories/natural-products.webp",
    kitchen: "/images/categories/kitchen.webp",
  } as Record<string, string>,
} as const;
