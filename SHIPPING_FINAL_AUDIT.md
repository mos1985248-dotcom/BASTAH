# SHIPPING_FINAL_AUDIT.md
### Basita — Shipping Backend — Final Audit Before Freeze

هذا الملف نقطة مرجعية للانتقال لجلسة جديدة. **هذه ليست نسخة Baseline جديدة** —
الـBaseline الأصلي (`basita-BASELINE-before-shipping.zip`) يبقى كما هو، نقطة
رجوع مستقلة قبل أي عمل على الشحن إطلاقاً.

---

## 1) 🔴 Security Bug — اكتُشف وأُصلح بهذه الجلسة

**أين**: `app/api/shipping/rates/route.ts`

**ما كان المشكلة**: المسار كان **بلا أي مصادقة إطلاقاً** — لا `requireUser`
ولا `requireActiveStore` ولا `requireRole`. كان يقبل `storeId` مباشرة من
جسم الطلب (`request body`) دون أي تحقق أن المُرسِل يملك هذا المتجر.

**لماذا كانت مشكلة أمنية حقيقية**:
- أي زائر **غير مسجّل دخول حتى** يقدر يرسل `storeId` لأي متجر بالمنصة.
- المسار يفكّ تشفير بيانات اعتماد شركة الشحن **الحقيقية** لذاك المتجر
  ويستدعي API الشركة الخارجية باسمه.
- استغلال متكرر كان يقدر يستنزف حصة الاستخدام (rate limit) لحساب التاجر
  عند الشركة، وربما يوقف حسابه أو يُنبّه لسلوك غير طبيعي.
- يكشف `carrier` و`totalRate` الفعلي لأي متجر لأي طرف مجهول.

**الإصلاح**:
1. أضفنا `requireActiveStore()` — نفس نمط الحماية المستخدم بكل مسار شحن آخر
   بالضبط (لا نمط جديد).
2. **تجاهلنا `storeId` من جسم الطلب نهائياً** — أصبح `storeId` يُشتق حصراً
   من المتجر المرتبط بالتاجر المصادَق عليه.
3. جعلنا `storeId` بالسكيما (`shippingRateRequestSchema`) اختيارياً بدل
   إجباري — يعكس أنه لم يعد يُقرأ من الطلب.
4. أضفنا فرع معالجة `AuthError` بالـ`catch` (كان مفقوداً — بدونه أي خطأ
   مصادقة كان سيرجع 500 عام بدل رمزه الصحيح 401/403).

**هل غيّر الإصلاح أي سلوك قائم؟** لا — **صفر مستهلك فرونت إند** لهذا
المسار (مؤكَّد بالـAudit الأصلي وبقي كذلك). أي طلب حقيقي مستقبلي من تاجر
مسجّل دخول لمتجره سيعمل تماماً كما كان، فقط بدون إمكانية انتحال متجر آخر.

---

## 2) مراجعة شاملة — كل مكوّن

| المكوّن | الحالة |
|---|---|
| **ShippingService** | نقطة الدخول الموحّدة تعمل، idempotent (`createShipment` يتحقق من شحنة فعّالة قبل الإنشاء)، ownership مُتحقَّق بـ4 دوال (`order.storeId`/`shipment.order.storeId`) |
| **Registry/Providers** | `ARAMEX`/`SPL` مسجَّلتان، التوسعة عبر إضافة (كلاس + سطر + enum) وليس تعديل — مؤكَّد بلا فروع `if(carrier===...)` خارج ملفات كل شركة |
| **Aramex** | `getRate`/`testCredentials` كما كانا (لا تغيير منطقي) + timeout حقيقي 10 ثوانٍ (كان غائباً) + تصنيف أخطاء. باقي القدرات ترمي `not_supported` صراحة |
| **SPL** | نفسه + `branchCode` أُضيف لحقول الاعتماد المطلوبة (تأكيد رسمي) |
| **ShippingZone CRUD** | GET/POST/PATCH/DELETE تعمل، ownership صارم، `isActive` يُفلتَر فعلياً بـ`computeShippingCost` |
| **StoreShipping GET/PATCH/DELETE** | GET يعرض الآن `platformFees` (مصدر واحد للتاجر)، PATCH يبدّل `isActive` فقط (لا يمس `credentialsEnc`)، DELETE يفصل نهائياً — الاثنان بـownership صارم |
| **Admin Providers endpoint** | قراءة فقط، `connectedStores` من `StoreShipping.groupBy` حقيقي، `platformActive:true` ثابتة (موثَّق أنه لا آلية تعليق فعلية بعد) |
| **Platform Shipping Settings** | `SettingsSection.tsx` مربوطة حرفياً بـ`/api/admin/settings` — صفر رقم ثابت بالواجهة |
| **رسوم الشحن التشغيلية / COD** | `PlatformSetting` — قابلة للضبط، snapshot دائم بكل `Order` (لا تتغيّر طلبات قديمة) |
| **صلاحيات ADMIN/SELLER** | كل الـ6 مسارات شحن محمية بلا استثناء (تحقّقتُ عدّاً: كل ملف فيه استدعاء حماية حقيقي) |
| **ملكية المتجر وعزل البيانات** | صفر تسريب — كل استعلام مقيَّد بـ`storeId` من الجلسة، لا `storeId` من العميل يُثق به بعد إصلاح اليوم |
| **Checkout integration** | `checkout-pricing.ts` يستخدم `ShippingService.calculateRate` (نفس `RateResult`)، `checkout`/`checkout/preview` بلا أي تغيير سلوكي |
| **Idempotency/timeout/retry** | Timeout 10 ثوانٍ بكل استدعاء شبكي، retry بـexponential backoff للأخطاء القابلة للتكرار فقط، idempotency حقيقية بإنشاء الشحنة |

---

## 3) الفجوات المتبقية (موثَّقة، لا تمنع الإغلاق)

- `OrderItem` بلا `weight` snapshot (تقدير 0.5kg بدله عند إنشاء شحنة مستقبلاً)
- `createShipment`/`getTracking`/`cancelShipment`/`getLabel` — عقد كامل، لكنها ترمي `not_supported` فعلياً لأي استدعاء حقيقي (بانتظار تأكيد Aramex/SPL الرسمي)
- لا آلية تعليق حقيقية لـProvider على مستوى المنصة (موثَّقة، مؤجَّلة بموافقتك)
- لا تجديد دوري لاختبار بيانات اعتماد التاجر (`lastTestOk` لا يُحدَّث تلقائياً)
- Aramex endpoint الدقيق وSPL endpoint/payload غير مؤكَّدين رسمياً بعد (يتطلب وصول شريك فعلي)

**لا يوجد أي فجوة أمنية معروفة متبقية.**

---

## 4) الحكم النهائي

# ✅ READY TO FREEZE

Backend الشحن جاهز للتجميد. الثغرة الأمنية الوحيدة المكتشفة أُصلحت وتحقَّقت
منها. الفجوات المتبقية كلها وظيفية/مستقبلية (تكامل حقيقي مع الشركات)، وليست
عيوباً تمنع الإغلاق أو تهدد البيانات.

---

## 5) الملفات المعدَّلة/الجديدة (هذه الجلسة الأخيرة فقط — إصلاح الثغرة)

```
app/api/shipping/rates/route.ts   (تعديل — إصلاح أمني)
lib/validation.ts                 (تعديل — storeId اختياري)
```

## الملفات من كامل مرحلة Shipping Backend (للسياق الكامل)

```
prisma/schema.prisma                              (ShippingZone.isActive, Shipment موسَّع, ShipmentEvent جديد)
lib/shipping/types.ts                              (Provider contract موسَّع)
lib/shipping/reliability.ts                        (جديد — timeout/retry)
lib/shipping/service.ts                            (جديد — ShippingService)
lib/shipping/metadata.ts                           (جديد — بيانات عرض فقط)
lib/shipping/providers/aramex.ts                   (موسَّع)
lib/shipping/providers/spl.ts                      (موسَّع — branchCode)
lib/checkout-pricing.ts                            (تعديل — يستخدم ShippingService)
lib/validation.ts                                  (Zone schemas + carrier ديناميكي + storeId اختياري)
app/api/stores/shipping/route.ts                   (تعديل — ShippingService + platformFees)
app/api/stores/shipping/[id]/route.ts               (جديد — PATCH/DELETE)
app/api/stores/shipping-zones/route.ts              (جديد)
app/api/stores/shipping-zones/[id]/route.ts          (جديد)
app/api/shipping/rates/route.ts                    (تعديل — ShippingService + إصلاح أمني)
app/api/admin/shipping/providers/route.ts           (جديد)
components/admin/sections/SettingsSection.tsx       (جديد — Frontend)
app/admin/page.tsx                                  (تعديل — ربط Sidebar + Settings)
```

## Endpoints الجديدة الكاملة

| Endpoint | Method | الحماية |
|---|---|---|
| `/api/stores/shipping-zones` | GET, POST | `requireActiveStore` |
| `/api/stores/shipping-zones/[id]` | PATCH, DELETE | `requireActiveStore` + ownership |
| `/api/stores/shipping/[id]` | PATCH, DELETE | `requireActiveStore` + ownership |
| `/api/admin/shipping/providers` | GET | `requireRole(ADMIN, SUPER_ADMIN)` |

## ما تم اختباره

- `tsc --noEmit` كامل بعد كل تعديل — قارنت فئات الأخطاء (diff) مع كل خطوة سابقة، **صفر خطأ جديد** بكل مرة.
- مراجعة يدوية سطراً بسطر لكل اسم حقل/موديل جديد مقابل `schema.prisma` مباشرة (القيد البيئي أدناه يمنع الاعتماد الكامل على tsc).
- عدّ صلاحيات كل مسار شحن (6/6 محمية).
- تتبّع تنفيذ (execution trace) لكل مسار ownership للتأكد من عدم تسرّب بيانات متجر لآخر.

## القيود البيئية المعروفة

- محرّك Prisma محجوب شبكياً بهذه البيئة (`binaries.prisma.sh` غير مسموح) —
  `tsc` يعمل بعميل Prisma جزئي/ناقص، لا يمكن تشغيل `next build` حقيقي أو
  اختبار تكامل فعلي (integration test) بهذه الجلسات. كل التحقق تم عبر
  المراجعة اليدوية للكود مقابل السكيما مباشرة.
- لم تُختبَر استدعاءات Aramex/SPL الحقيقية (لا مفاتيح إنتاج حقيقية،
  ولا يُفترض ربطها قبل التأكيد الرسمي كما وثّقنا).

## ما تبقّى (Frontend فقط — لم يُبدأ)

- Admin: عرض بصري لقسم "شركات الشحن" (Endpoint جاهز، UI لم يُبنَ)
- Seller: واجهة اختيار/تفعيل/تعطيل شركة الشحن + عرض رسوم المنصة بوضوح
- ربط `createShipment`/`getTracking`/إلخ بـroutes فعلية (بانتظار تأكيد رسمي من الشركتين أولاً)

## ⚠️ ما يجب عدم لمسه بالمرحلة القادمة (بدون سبب حقيقي)

- منطق `checkout`/`checkout/preview`/`ShippingService`/`Order` lifecycle
- `lib/tax.ts`, `lib/platform-settings.ts`, `lib/order-payment.ts`, `lib/inventory.ts`
- عقد `ShippingProvider` interface (إضافة فقط، لا تعديل بنية موجودة)
- الـBaseline الأصلي (`basita-BASELINE-before-shipping.zip`)
