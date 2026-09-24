// lib/validation.ts
// مخططات Zod — كل API route يتحقق من المدخلات هنا قبل لمس قاعدة البيانات.
// قاعدة: لا نثق بأي مدخل من العميل، حتى لو الواجهة نفسها تتحقق منه مسبقاً.

import { z } from "zod";
import { listSupportedCarriers } from "./shipping/registry";

// ── Auth ─────────────────────────────────────────────────
export const syncUserSchema = z.object({
  name: z.string().trim().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?9665\d{8}$/, "رقم جوال سعودي غير صحيح")
    .optional(),
  role: z.enum(["BUYER", "SELLER"]).default("BUYER"),
});

// ── Store ────────────────────────────────────────────────
export const createStoreSchema = z.object({
  nameAr: z.string().trim().min(2, "اسم المتجر مطلوب").max(100),
  nameEn: z.string().trim().max(100).optional(),
  description: z.string().trim().max(1000).optional(),
  shortDesc: z.string().trim().max(160).optional(),
  city: z.string().trim().min(1, "المدينة مطلوبة").max(50),
  region: z.string().trim().max(50).optional(),
  // ⚠️ Geolocation (اختياري تماماً — بلا فرونت بعد، جاهز للـcontract فقط)
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  pickupEnabled: z.boolean().optional(),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\+?9665\d{8}$/, "رقم واتساب غير صحيح")
    .optional(),
  instagram: z.string().trim().max(100).optional(),
  categoryIds: z.array(z.string().cuid()).max(5).optional(),
});

export const updateStoreSchema = createStoreSchema.partial().extend({
  logo: z.string().url().optional(),
  coverImage: z.string().url().optional(),
});

// ⚠️ إضافي — يخص تحديث StorePublicInfo (منفصل عن Store نفسه، عبر
// PATCH /api/stores/[slug]/public-info الجديد). لا يمس updateStoreSchema.
export const updatePublicInfoSchema = z.object({
  storyAr: z.string().trim().max(2000).optional(),
  storyTags: z.array(z.string().trim().max(30)).max(10).optional(),
  videoUrl: z.string().trim().url().optional().or(z.literal("")),
  workingHours: z.string().trim().max(100).optional(),
  licenseNumber: z.string().trim().max(50).optional(),
  // ⚠️ إضافي — نفس الأعمدة موجودة أصلاً بـ StorePublicInfo (deliveryPartner,
  // paymentMethods, returnPolicyDays) بدون أي حقل تحقّق سابق يسمح بتعديلها.
  deliveryPartner: z.string().trim().max(60).optional(),
  paymentMethods: z.array(z.string().trim().max(20)).max(8).optional(),
  returnPolicyDays: z.coerce.number().int().min(0).max(90).optional(),
});

export const listStoresQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  city: z.string().trim().optional(),
  category: z.string().trim().optional(), // category slug
  search: z.string().trim().max(100).optional(),
  // ⚠️ Geolocation (اختياري تماماً — لا يغيّر سلوك من لا يرسله)
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  max_distance_km: z.coerce.number().positive().max(1000).optional(),
});

// ── Geolocation ──────────────────────────────────────────
export const nearbyStoresQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius_km: z.coerce.number().positive().max(200).default(25),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ── Product ──────────────────────────────────────────────
// ⚠️ الحقول بموديل منفصل (productBaseSchema) عمداً — .refine() يُرجع
// ZodEffects وليس ZodObject، و.partial() غير موجودة على ZodEffects. لازم
// نطبّق .partial() على الكائن الأساسي *قبل* أي .refine()، وإلا ينكسر
// updateProductSchema وقت التشغيل (TypeError: ...partial is not a
// function) على كل طلب — هذا كان يحدث فعلياً بـ/api/products و/api/stores.
const productBaseSchema = z.object({
  nameAr: z.string().trim().min(2, "اسم المنتج مطلوب").max(150),
  nameEn: z.string().trim().max(150).optional(),
  categoryId: z.string().cuid().optional(),
  shortDescAr: z.string().trim().max(160).optional(),
  descAr: z.string().trim().max(3000).optional(),

  price: z.coerce.number().positive("السعر يجب أن يكون أكبر من صفر"),
  comparePrice: z.coerce.number().positive().optional(),
  costPrice: z.coerce.number().nonnegative().optional(),

  sku: z.string().trim().max(50).optional(),
  quantity: z.coerce.number().int().nonnegative().default(0),
  minOrderQty: z.coerce.number().int().positive().default(1),
  lowStockAlert: z.coerce.number().int().nonnegative().default(5),

  images: z.array(z.string().url()).max(10).default([]),
  mainImage: z.string().url().optional(),

  weight: z.coerce.number().positive().optional(),
  requiresShipping: z.boolean().default(true),
  isHandmade: z.boolean().default(true),

  status: z.enum(["DRAFT", "ACTIVE"]).default("DRAFT"),
});

export const createProductSchema = productBaseSchema.refine(
  (data) => !data.comparePrice || data.comparePrice > data.price,
  { message: "سعر ما قبل الخصم يجب أن يكون أعلى من السعر الحالي", path: ["comparePrice"] }
);

export const updateProductSchema = productBaseSchema.partial().refine(
  // بالتحديث الجزئي قد يصل comparePrice بدون price (لا تُحدَّث بنفس
  // الطلب) — لا نرفض هذه الحالة، نتحقق فقط عند وجود القيمتين معاً
  (data) => !data.comparePrice || !data.price || data.comparePrice > data.price,
  { message: "سعر ما قبل الخصم يجب أن يكون أعلى من السعر الحالي", path: ["comparePrice"] }
);

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  storeId: z.string().cuid().optional(),
  category: z.string().trim().optional(),
  city: z.string().trim().optional(),
  search: z.string().trim().max(100).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sort: z.enum(["popular", "newest", "price_asc", "price_desc", "rating"]).default("popular"),
});

/**
 * يحوّل أخطاء Zod إلى شكل موحّد صالح للإرجاع في API response.
 * مثال الإخراج: { nameAr: "اسم المتجر مطلوب", price: "..." }
 */
export function formatZodError(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_root";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

// ── Payment Gateway Connection (ربط حساب Moyasar الخاص بالتاجر) ──
export const connectGatewaySchema = z.object({
  publishableKey: z.string().trim().regex(/^pk_(test|live)_/, "صيغة المفتاح العلني غير صحيحة"),
  secretKey: z.string().trim().regex(/^sk_(test|live)_/, "صيغة المفتاح السري غير صحيحة"),
  webhookSecret: z.string().trim().min(16, "سر الـ webhook قصير جداً — تأكدي من نسخه كاملاً من حساب Moyasar"),
});

// ⚠️ تحويل بنكي — بيانات حساب التاجر (تُعرض للمشتري وقت الدفع، وليست
// سراً كمفتاح API، فلا تحتاج تشفيراً). IBAN سعودي: SA + 22 رقم دائماً.
export const bankTransferSetupSchema = z.object({
  iban: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^SA\d{22}$/, "رقم الآيبان يجب أن يكون سعودياً بصيغة صحيحة (SA + 22 رقماً)"),
  accountHolder: z.string().trim().min(2, "اسم صاحب الحساب مطلوب").max(100),
  bankName: z.string().trim().min(2, "اسم البنك مطلوب").max(50),
});

// ── Address ──────────────────────────────────────────────
export const createAddressSchema = z.object({
  label: z.string().trim().max(30).default("المنزل"),
  name: z.string().trim().min(2, "الاسم مطلوب").max(100),
  phone: z.string().trim().regex(/^\+?9665\d{8}$/, "رقم جوال سعودي غير صحيح"),
  city: z.string().trim().min(1, "المدينة مطلوبة").max(50),
  region: z.string().trim().min(1, "المنطقة مطلوبة").max(50),
  address: z.string().trim().min(5, "العنوان التفصيلي مطلوب").max(300),
  zipCode: z.string().trim().max(10).optional(),
  isDefault: z.boolean().default(false),
});

// ── Product Image metadata update ───────────────────────
export const updateImageMetaSchema = z.object({
  position: z.coerce.number().int().min(0).optional(),
  isCover: z.boolean().optional(),
}).refine((d) => d.position !== undefined || d.isCover !== undefined, {
  message: "لا يوجد ما يُحدَّث",
});

// ── Shipping (Phase 4B) ──────────────────────────────────
// بيانات الاعتماد تُتحقق من حقولها المطلوبة داخل كل provider نفسه
// (requiredCredentialFields) — مصدر حقيقة واحد، لا تكرار هنا.
// ── Shipping Zones (seller) ─────────────────────────────
export const createShippingZoneSchema = z.object({
  nameAr: z.string().trim().min(1, "اسم المنطقة مطلوب").max(60),
  regions: z.array(z.string().trim().min(1)).min(1, "أضيفي منطقة واحدة على الأقل").max(30),
  price: z.coerce.number().min(0).max(1000),
  isFree: z.boolean().default(false),
  minOrderAmt: z.coerce.number().min(0).optional(),
  minDays: z.coerce.number().int().min(0).max(30).default(2),
  maxDays: z.coerce.number().int().min(0).max(60).default(5),
});

export const updateShippingZoneSchema = createShippingZoneSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// ⚠️ مصدر الحقيقة الوحيد لقائمة الشركات المدعومة هو lib/shipping/registry.ts
// (نفس القائمة التي يعتمدها /api/stores/shipping GET). لا نكرّرها هنا كنص
// ثابت — إضافة Provider ثالث لاحقاً تعني: كلاس جديد + سطر بـregistry.ts +
// enum بالسكيما، وهذا السطر يعكسها تلقائياً بدون أي تعديل إضافي هنا.
const SUPPORTED_CARRIERS = listSupportedCarriers() as [string, ...string[]];

export const connectShippingSchema = z.object({
  carrier: z.enum(SUPPORTED_CARRIERS),
  // ⚠️ إلزامي فقط لـcarrier=CUSTOM (يُتحقَّق منه بالـroute، لا هنا) — يحدد
  // أي شركة من ShippingProviderConfig يريد التاجر ربطها
  customProviderId: z.string().cuid().optional(),
  // فاضٍ افتراضياً — لـCUSTOM لا نحتاج بيانات اعتماد من التاجر إطلاقاً
  // (مشتركة على مستوى المنصة، راجع ShippingProviderConfig)
  credentials: z.record(z.string().trim().min(1)).default({}),
});

export const shippingRateRequestSchema = z.object({
  storeId: z.string().cuid().optional(), // ⚠️ لم يعد يُستخدَم بعد إصلاح الثغرة — نتجاهله دائماً لصالح متجر التاجر المصادَق عليه
  destCity: z.string().trim().min(1, "مدينة الوجهة مطلوبة").max(50),
  weightKg: z.coerce.number().positive("الوزن يجب أن يكون أكبر من صفر").max(1000),
});

// ── Checkout ─────────────────────────────────────────────
// ⚠️ checkoutBaseSchema بدون .refine() عمداً — .refine() يُرجع ZodEffects
// وليس ZodObject، و.omit()/.partial() غير موجودتين على ZodEffects (نفس
// السبب الموثّق أعلاه لـproductBaseSchema). checkout/preview/route.ts
// يستخدم .omit() على هذا الكائن الأساسي، فلازم يبقى ZodObject خالصاً.
export const checkoutBaseSchema = z.object({
  storeId: z.string().cuid(),
  items: z
    .array(
      z.object({
        productId: z.string().cuid(),
        variantId: z.string().cuid().optional(),
        quantity: z.coerce.number().int().positive().max(99),
      })
    )
    .min(1, "السلة فارغة")
    .max(50),
  // ⚠️ اختياري الآن — إلزامي فقط لـfulfillmentMethod=SHIPPING (راجع applyCheckoutRefinements)
  addressId: z.string().cuid().optional(),
  paymentMethod: z.enum(["CREDIT_CARD", "MADA", "APPLE_PAY", "STCPAY", "CASH_ON_DELIVERY", "BANK_TRANSFER"]),
  // ⚠️ استلام من موقع التاجر — بديل عن الشحن، مربوط حالياً بـBANK_TRANSFER
  // فقط (راجع تعليق Store.pickupEnabled بالـschema)
  fulfillmentMethod: z.enum(["SHIPPING", "PICKUP"]).default("SHIPPING"),
  buyerNotes: z.string().trim().max(500).optional(),
  couponCode: z.string().trim().max(30).optional(),
});

/**
 * تحقق تماسك fulfillmentMethod/paymentMethod/addressId — دالة مشتركة
 * بدل تكرار نفس .refine() بكل من checkoutSchema (/api/checkout) وpreviewSchema
 * (/api/checkout/preview)، لمنع انحراف الرسائل/الشروط بين الاثنين مستقبلاً.
 */
export function applyCheckoutRefinements<T extends z.ZodTypeAny>(schema: T) {
  return schema
    .refine((data: any) => data.fulfillmentMethod !== "SHIPPING" || data.addressId, {
      message: "عنوان الشحن مطلوب لطلبات الشحن",
      path: ["addressId"],
    })
    .refine((data: any) => data.fulfillmentMethod !== "PICKUP" || data.paymentMethod === "BANK_TRANSFER", {
      message: "الاستلام من موقع التاجر متاح حالياً فقط مع الدفع بتحويل بنكي",
      path: ["fulfillmentMethod"],
    });
}

export const checkoutSchema = applyCheckoutRefinements(checkoutBaseSchema);

// ── Order status update (seller) ────────────────────────
export const updateOrderStatusSchema = z.object({
  status: z.enum(["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  sellerNotes: z.string().trim().max(500).optional(),
  trackingNumber: z.string().trim().max(100).optional(),
  carrier: z.string().trim().max(50).optional(),
});

// ── Marketing (القسم ٣ — بنية فقط) ──────────────────────
export const createMarketingContentSchema = z.object({
  title: z.string().trim().min(2, "العنوان مطلوب").max(150),
  videoUrl: z.string().trim().url("رابط الفيديو غير صحيح").optional(),
});

export const createAdCampaignSchema = z.object({
  name: z.string().trim().min(2, "اسم الحملة مطلوب").max(100),
  budget: z.coerce.number().positive("الميزانية يجب أن تكون أكبر من صفر").max(1_000_000),
});

// ── شركة شحن مخصَّصة (بدون كود — تضيفها الإدارة من اللوحة) ──────
// REST: شركة عندها API فعلي. MANUAL: شركة بدون أي نظام تقني (سعر ثابت).
const carrierKeySchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9_]{2,30}$/, "المعرّف يجب أن يكون حروفاً إنجليزية/أرقام/شرطة سفلية فقط");
const displayNameArSchema = z.string().trim().min(2, "اسم الشركة مطلوب").max(50);

export const createShippingProviderConfigSchema = z.discriminatedUnion("providerType", [
  z.object({
    providerType: z.literal("REST"),
    carrierKey: carrierKeySchema,
    displayNameAr: displayNameArSchema,
    baseUrl: z.string().trim().url("رابط الـAPI غير صحيح"),
    ratePath: z.string().trim().regex(/^\//, "المسار يجب أن يبدأ بـ/").max(200).default("/rates"),
    apiKey: z.string().trim().min(8, "المفتاح قصير جداً"),
  }),
  z.object({
    providerType: z.literal("MANUAL"),
    carrierKey: carrierKeySchema,
    displayNameAr: displayNameArSchema,
    // ⚠️ لشركة بدون أي نظام تقني (مندوب/مكتب شحن صغير) — سعر ثابت
    flatFee: z.coerce.number().min(0, "الرسوم الأساسية يجب أن تكون صفر أو أكبر").max(1000),
    perKgFee: z.coerce.number().min(0, "الرسوم لكل كيلو يجب أن تكون صفر أو أكبر").max(500),
    // بيانات وصفية اختيارية (تعريف فقط، لا تؤثر على حساب السعر)
    agentName: z.string().trim().max(100).optional(),
    agentPhone: z.string().trim().max(20).optional(),
    vehicleType: z.string().trim().max(50).optional(),
    vehiclePlate: z.string().trim().max(20).optional(),
    licenseNumber: z.string().trim().max(50).optional(),
    serviceCity: z.string().trim().max(50).optional(),
  }),
]);

// ── مناديب المدن (بسطة للشحن) ──
export const createCityCourierSchema = z.object({
  city: z.string().trim().min(2, "المدينة مطلوبة").max(50),
  name: z.string().trim().min(2, "اسم المندوب مطلوب").max(100),
  phone: z.string().trim().regex(/^[0-9+\s-]{9,16}$/, "رقم الواتساب غير صحيح"),
});

export const updateCityCourierSchema = z.object({ isActive: z.boolean() });

export const dispatchCourierSchema = z.object({ courierId: z.string().min(1, "المندوب مطلوب") });

// ── متغيرات المنتج (مقاس/وزن/لون...) — اسم الخاصية نص حر من التاجر، لا قائمة مقفلة ──
export const productVariantsSchema = z
  .object({
    optionName: z.string().trim().max(30, "اسم الخاصية طويل").default(""),
    variants: z
      .array(
        z.object({
          id: z.string().cuid().optional(),
          value: z.string().trim().min(1, "قيمة المتغيّر مطلوبة").max(40, "قيمة المتغيّر طويلة"),
          price: z.number().positive("السعر يجب أن يكون أكبر من صفر").nullable().optional(),
          quantity: z.number().int("الكمية يجب أن تكون رقماً صحيحاً").min(0, "الكمية لا تقل عن صفر").max(100000),
          sku: z.string().trim().max(60).nullable().optional(),
        })
      )
      .max(30, "الحد الأقصى 30 متغيّراً للمنتج"),
  })
  .superRefine((d, ctx) => {
    if (d.variants.length > 0 && d.optionName.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "اسم الخاصية مطلوب (مثل: المقاس)", path: ["optionName"] });
    }
    const seen = new Set<string>();
    d.variants.forEach((v, i) => {
      const key = v.value.toLowerCase();
      if (seen.has(key)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `القيمة «${v.value}» مكرّرة`, path: ["variants", i, "value"] });
      seen.add(key);
    });
  });
