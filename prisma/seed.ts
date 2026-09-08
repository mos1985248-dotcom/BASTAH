// prisma/seed.ts
// بيانات الباقات الأربع — يُشغَّل مرة واحدة عند إعداد قاعدة البيانات
//
// ⚠️ نموذج الإيراد: رسوم الاشتراك فقط — لا توجد عمولة على المبيعات
// إطلاقاً في أي باقة (أُزيلت حقول commissionRate/hasCommission من
// المخطط نفسه، وليس فقط من هذه البيانات).

import { PrismaClient, SubscriptionPlan } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Basita subscription plans...\n");

  const plans = [

    // ─────────────────────────────────────────────────────────
    // 1. FREE — مجاني للأبد
    // ─────────────────────────────────────────────────────────
    {
      plan: SubscriptionPlan.FREE,
      nameAr: "بسطة بداية",
      nameEn: "Basita Free",
      taglineAr: "خطوتك الأولى للسوق",
      badgeAr: null,

      priceMonthly: 0,
      priceYearly: 0,

      maxProducts: 3,          // 3 منتجات فقط
      maxOrders: null,
      storageGB: 0.5,

      // الميزات
      hasDaftari: false,
      hasCustomDomain: false,
      hasPaymentGateway: false,
      hasRemoveBranding: false,  // شعار "مدعوم من بسطة" يظهر
      hasDiscountCodes: false,
      hasFeaturedListing: false,
      hasVerifiedBadge: false,
      hasPrioritySearch: false,

      reportsLevel: "BASIC",   // إجمالي مبيعات + أرباح فقط

      hasChatSupport: false,
      hasPrioritySupport: false,
      hasAIFeatures: false,    // ❌ منيرة غير مفعّلة

      featuresAr: [
        "متجر إلكتروني بعنوان خاص",
        "3 منتجات فقط",
        "لوحة تحكم أساسية",
        "بدون أي عمولة على المبيعات",
        'شعار "مدعوم من بسطة"',
      ],
      sortOrder: 1,
    },

    // ─────────────────────────────────────────────────────────
    // 2. STARTER — 49 ريال
    // ─────────────────────────────────────────────────────────
    {
      plan: SubscriptionPlan.STARTER,
      nameAr: "بسطة نمو",
      nameEn: "Basita Starter",
      taglineAr: "خلِّ بسَطتك تكبر",
      badgeAr: null,

      priceMonthly: 49,
      priceYearly: 470,        // ~39 ريال/شهر

      maxProducts: 20,         // 20 منتج
      maxOrders: null,
      storageGB: 2,

      // الميزات
      hasDaftari: true,        // ✅ دفاتري مفعّل
      hasCustomDomain: false,
      hasPaymentGateway: false,
      hasRemoveBranding: true, // ✅ إزالة شعار بسطة
      hasDiscountCodes: true,  // ✅ أكواد خصم مخصصة
      hasFeaturedListing: false,
      hasVerifiedBadge: false,
      hasPrioritySearch: false,

      reportsLevel: "MONTHLY", // شهري + تفاصيل منتجات

      hasChatSupport: true,
      hasPrioritySupport: false,
      hasAIFeatures: false,    // ❌ منيرة غير مفعّلة

      featuresAr: [
        "جميع ميزات الباقة المجانية",
        "20 منتج",
        "بدون أي عمولة على المبيعات",
        "دفاتري: حساب صافي الربح تلقائياً",
        'إزالة شعار "مدعوم من بسطة"',
        "أكواد خصم مخصصة",
      ],
      sortOrder: 2,
    },

    // ─────────────────────────────────────────────────────────
    // 3. GROWTH — 99 ريال
    // ─────────────────────────────────────────────────────────
    {
      plan: SubscriptionPlan.GROWTH,
      nameAr: "بسطة انطلاق",
      nameEn: "Basita Growth",
      taglineAr: "وسّع حضورك في السوق",
      badgeAr: "الأكثر شعبية ⭐",

      priceMonthly: 99,
      priceYearly: 950,        // ~79 ريال/شهر

      maxProducts: 50,         // 50 منتج
      maxOrders: null,
      storageGB: 10,

      // الميزات
      hasDaftari: true,        // ✅
      hasCustomDomain: true,   // ✅ دومين مخصص
      hasPaymentGateway: true, // ✅ بوابة دفع Moyasar (حساب التاجر الخاص)
      hasRemoveBranding: true,
      hasDiscountCodes: true,
      hasFeaturedListing: true, // ✅ ظهور مميّز في بسطة
      hasVerifiedBadge: false,
      hasPrioritySearch: false,

      reportsLevel: "ADVANCED", // كامل + مصروفات + مقارنة

      hasChatSupport: true,
      hasPrioritySupport: false,
      hasAIFeatures: true,     // ✅ منيرة مفعّلة

      featuresAr: [
        "جميع ميزات بسطة نمو",
        "50 منتج",
        "منيرة — المساعدة الذكية ✨",
        "ظهور مميّز في بسطة",
        "تحليلات مبيعات متقدمة",
        "إدارة الطلبات والكوبونات",
        "دومين مخصص .com",
        "بوابة دفع مدمجة",
      ],
      sortOrder: 3,
    },

    // ─────────────────────────────────────────────────────────
    // 4. PRO — 199 ريال
    // ─────────────────────────────────────────────────────────
    {
      plan: SubscriptionPlan.PRO,
      nameAr: "بسطة ازدهار",
      nameEn: "Basita Pro",
      taglineAr: "انطلق نحو آفاق أكبر",
      badgeAr: null,

      priceMonthly: 199,
      priceYearly: 1910,       // ~159 ريال/شهر

      maxProducts: null,       // ∞ غير محدود
      maxOrders: null,
      storageGB: 50,

      // جميع الميزات مفعّلة
      hasDaftari: true,        // ✅
      hasCustomDomain: true,   // ✅
      hasPaymentGateway: true, // ✅
      hasRemoveBranding: true, // ✅
      hasDiscountCodes: true,  // ✅
      hasFeaturedListing: true, // ✅
      hasVerifiedBadge: true,  // ✅ توثيق المتجر Verified
      hasPrioritySearch: true, // ✅ أولوية في نتائج البحث

      reportsLevel: "FULL",    // كامل + تصدير Excel + تحليل AI

      hasChatSupport: true,
      hasPrioritySupport: true, // ✅ أولوية الدعم
      hasAIFeatures: true,      // ✅ منيرة مفعّلة

      featuresAr: [
        "جميع ميزات بسطة انطلاق",
        "منتجات غير محدودة",
        "منيرة — المساعدة الذكية ✨",
        "توثيق المتجر (Verified)",
        "أولوية في نتائج البحث",
        "أولوية الدعم",
      ],
      sortOrder: 4,
    },
  ];

  for (const planData of plans) {
    await prisma.subscriptionPlanConfig.upsert({
      where: { plan: planData.plan },
      update: planData,
      create: planData,
    });
    const products = planData.maxProducts ?? "∞";
    const munira = planData.hasAIFeatures ? "منيرة ✅" : "منيرة ❌";
    console.log(`  ✅ ${planData.nameAr.padEnd(14)} | ${String(planData.priceMonthly).padStart(3)} ر.س | ${String(products).padEnd(3)} منتج | ${munira}`);
  }

  console.log("\n✨ تم تهيئة الباقات بنجاح! (بدون أي عمولة على المبيعات في أي باقة)\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
