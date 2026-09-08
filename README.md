# بسطة — مشروع Next.js حقيقي (Phase 1 + 2 + 3 + 4 + 5)

## Phase 5 — إعادة هيكلة الباقات (إزالة العمولة كاملةً) ✅ (هذه الدفعة)

### ما تم فحصه قبل الكتابة (كما طُلب)
- `SubscriptionPlan` enum: 4 قيم قديمة (`BASITA_ORIGINAL/NAMAA/PRO/AAMAL`)
- `SubscriptionPlanConfig`: فيه `commissionRate Float @default(0)` و `hasCommission Boolean` فعلياً
- `SubscriptionInvoice`: فيه `type InvoiceType` (SUBSCRIPTION_FEE/COMMISSION) + `grossSales`/`commissionRate`/`commissionAmount`
- `hasAIFeatures` كان **موجوداً مسبقاً** بكل الباقات الأربع (= true للجميع، بقية من تصميم تجريبي قديم) — أعدت استخدامه لبوّابة منيرة بدل إضافة حقل مكرّر
- كود التطبيق (لا الـ schema): **صفر** مراجع للعمولة فعلياً — لم تُكتب منطق محاسبة عمولة من الأساس، فقط الحقول كانت معرَّفة بالـ schema بانتظار البناء

### التغييرات على Prisma schema
| التغيير | التفاصيل |
|---|---|
| إعادة تسمية الـ enum | `BASITA_ORIGINAL→FREE`, `BASITA_NAMAA→STARTER`, `BASITA_PRO→GROWTH`, `BASITA_AAMAL→PRO` (٤ باقات كما صحّحتِ، الأسعار 0/49/99/199 لم تتغيّر) |
| حذف العمولة من `SubscriptionPlanConfig` | إزالة `commissionRate` و `hasCommission` **كحقلين كاملاً** — وليس تصفيرهما فقط، حتى لا يبقى مسار كودي يمكن تفعيله بالخطأ |
| حذف `InvoiceType` enum بالكامل | لم يبق إلا نوع فاتورة واحد (رسوم اشتراك)، فلا حاجة لحقل "نوع" إطلاقاً |
| تبسيط `SubscriptionInvoice` | حذف `grossSales`/`commissionRate`/`commissionAmount`؛ الاحتفاظ بـ `vatRate`/`vatAmount` (الضريبة مستقلة عن العمولة تماماً)؛ `@@unique` عُدِّل من `[subscriptionId, type, periodYear, periodMonth]` إلى `[subscriptionId, periodYear, periodMonth]` |
| `StoreSubscription.plan` | `@default(BASITA_ORIGINAL)` → `@default(FREE)` |

### منطق العمولة المُزال
لا يوجد — لم يكن هناك أي كود تطبيق (route/lib) يحسب أو يخصم عمولة من
الأساس بهذا المشروع (كان مخططاً فقط بالـ schema القديم وبملف JSX قديم
غير مربوط `MerchantBilling.jsx`). الإزالة كانت بالكامل على مستوى المخطط
وبيانات الـ seed.

### تفعيل/تعطيل منيرة حسب الباقة
أعدتُ استخدام `SubscriptionPlanConfig.hasAIFeatures` (لم أُضِف حقلاً جديداً):
`FREE`/`STARTER` → `false`، `GROWTH`/`PRO` → `true`. أضفتُ
`lib/subscription-limits.ts → assertHasMuniraAccess(storeId)` كبوّابة
جاهزة للاستخدام — **لكن لا يوجد أي API route حقيقي لمنيرة في هذا المشروع
بعد** (لم يُبنَ من الأساس، راجع نهاية الملف)، فهذه الدالة معطّلة فعلياً
حتى تُبنى أول نقطة نهاية تستهلكها.

### إخفاء منتجات الاشتراك المنتهي (طُبِّق فعلياً، مو فقط مخطَّط)
- `lib/subscription-limits.ts → isSubscriptionInGoodStanding()` + `GOOD_STANDING_STATUSES` (ACTIVE/TRIAL/GRACE_PERIOD فقط — SUSPENDED/CANCELLED/EXPIRED تُخفي)
- `GET /api/products` (القائمة العامة): فلتر جديد `store.subscription.status in GOOD_STANDING_STATUSES`
- `GET /api/products/[id]` (التفاصيل): نفس الفلتر، لكن **مالك المتجر/الإدارة يريان المنتج رغم ذلك** مع تنبيه `subscriptionWarning` صريح — تمييز ضروري لأن صفحة التعديل (`/dashboard/products/[id]/edit`) تستخدم هذا الـ endpoint نفسه ولا يصح حجبها عن مالكها
- `assertCanAddProduct`: تحقق موسَّع من `SUSPENDED` فقط إلى أي حالة غير سليمة (SUSPENDED/CANCELLED/EXPIRED)

### إنفاذ الحدود عبر الـ APIs
`assertCanAddProduct` كان موجوداً مسبقاً من Phase 1 ومستخدَماً في `POST /api/products` — لم يحتج تعديلاً بنيوياً، فقط توسيع شرط "الحالة السليمة" أعلاه.

## ما تبقى مؤجَّلاً (صراحة)
- **لا يوجد API لمنيرة AI** في هذا المشروع — `assertHasMuniraAccess` مبنية ومُختبَرة منطقياً لكن لا route تستدعيها بعد
- آلية "رسوم الشحن كإيراد" المذكورة (subscription-only + shipping fee) — `shippingCost` في `/api/checkout` لا يزال ثابتاً على 0 منذ Phase 2، لم يُبنَ أي منطق تسعير شحن فعلي
- ترقية/تخفيض الباقة من لوحة التاجر نفسها (الـ API الأساسي لإدارة الباقات لم يُبنَ بعد — فقط القراءة عبر `getProductUsage`)
- AdminPanel، ShippingPartners، Notifications، Support، Pricing/Blog، OurStory، i18n — لا تزال ملفات JSX منفصلة غير مربوطة

## Phase 1 + 2 + 3 + 4 (راجع التفاصيل الكاملة أدناه)

## Phase 4 — رفع صور المنتجات (Supabase Storage) ✅ (هذه الدفعة)

### ما تم فحصه قبل الكتابة (كما طُلب)
1. **Prisma schema**: `Product.images String[]` + `Product.mainImage String?` كانا
   موجودين لكن **بدون أي بنية حقيقية** — مجرد مصفوفة روابط بلا ترتيب، بلا تمييز
   غلاف، وبلا مسار تخزين منفصل يسمح بالحذف الفعلي من Storage.
2. **Supabase Storage**: bucket `basita-media` كان معرَّفاً في ملف SQL قديم
   منفصل (`supabase-setup.sql` خارج هذا المشروع)، لكن سياساته كانت لرفع
   عام بصلاحيات RLS مرتبطة بـ `auth.uid()` — لا تناسب تحقق الملكية
   (متجر ↔ منتج) المطلوب هنا.
3. **القرار**: لم أحذف `images`/`mainImage` (تكسر صفحات حقيقية مربوطة فعلاً
   من Phase 3) — حوّلتهما لـ **كاش محسوب تلقائياً** من جدول جديد، بدل
   اعتبارهما تكراراً.

### التغييرات على Prisma schema
- **موديل جديد `ProductImage`**: `storagePath`, `thumbnailPath` (مسارين
  منفصلين صراحة للحذف الموثوق)، `url`, `thumbnailUrl`, `width`, `height`,
  `position`, `isCover` — `onDelete: Cascade` مع Product، فهرس `[productId, position]`.
- **لا حذف لأي حقل قديم** — `Product.images`/`mainImage` أصبحا كاشاً
  تتم مزامنته تلقائياً من `ProductImage` بعد كل رفع/حذف/تعديل ترتيب
  (`lib/product-images.ts → syncProductImageCache`).

### API Routes المُضافة
| المسار | الوظيفة |
|---|---|
| `POST /api/uploads/products` | رفع صورة جديدة (multipart: productId + file) |
| `PATCH /api/uploads/products/[imageId]` | تعيين كغلاف أو تغيير الترتيب |
| `PUT /api/uploads/products/[imageId]` | استبدال محتوى الصورة (يحافظ على position/isCover) |
| `DELETE /api/uploads/products/[imageId]` | حذف + تنظيف فعلي من Storage |

### البنية الداعمة الجديدة
- `lib/image-processing.ts` — sharp: تحقق حقيقي من المحتوى (فك تشفير فعلي،
  لا امتداد اسم) + تحويل لـ WebP بنسختين (رئيسية 1600px، مصغّرة 400px)
- `lib/supabase-admin.ts` — عميل service_role منفصل تماماً عن عميلي
  المتصفح والسيرفر الموجودين (Phase 1/3) — **لا يُستخدم إلا داخل API routes**
- `lib/product-images.ts` — تحقق ملكية (متجر ↔ منتج) + تنسيق الرفع/الحذف/
  الاستبدال + ترقية تلقائية لغلاف جديد عند حذف الغلاف الحالي
- `prisma/storage-setup.sql` — إنشاء/تأكيد bucket (8MB، jpg/png/webp فقط)

**قرار أمان مهم:** الرفع **لا يحدث مباشرة من المتصفح لـ Storage**. كل ملف
يمرّ أولاً عبر سيرفرنا (تحقق هوية + ملكية + نوع/حجم/أبعاد فعلية) ثم يُرفع
بصلاحيات service_role. هذا يعني عدم الحاجة لسياسات RLS معقّدة على
`storage.objects` للكتابة — السيرفر نفسه هو الحارس، وهذا أبسط وأكثر أماناً
من محاولة كتابة RLS صحيحة لتحقق الملكية متعددة الطبقات (مستخدم ← متجر ← منتج).

### أي صفحات JSX قديمة "اكتملت" ربطها الآن
- `AddProductPage.jsx` (القديمة) → مُستبدَلة كاملاً بثلاث صفحات حقيقية مربوطة
  100%: `/dashboard/products` (قائمة) + `/dashboard/products/new` (إنشاء) +
  `/dashboard/products/[id]/edit` (تعديل + **إدارة صور كاملة**: رفع، تعيين
  غلاف، إعادة ترتيب، حذف). هذا أول ملف من القائمة القديمة يصل لربط **كامل
  100%** وليس جزئياً.
- `MarketplacePage.jsx` و `StorePage.jsx` (مربوطتان من Phase 3) تستفيدان
  تلقائياً من هذا التحديث **بدون أي تعديل عليهما** — لأنهما تقرآن
  `Product.mainImage` (الكاش)، الذي يتحدّث تلقائياً فور أول رفع صورة حقيقية.

### ما تبقى مؤجَّلاً (صراحة)
- نقل/تحويل صور قديمة (لا يوجد منتجات بصور base64 قديمة لتهجيرها — المشروع لم يصل مرحلة بيانات حقيقية بعد)
- ضغط/تنظيف دوري لملفات Storage "اليتيمة" (حالة فشل حذف نادرة موثّقة بسجل console فقط حالياً)
- رفع صور للمتجر نفسه (شعار/غلاف) — هذا الـ Phase غطّى صور المنتجات فقط كما طُلب
- AdminPanel، MuniraChat، ShippingPartners، Notifications، Support، Pricing/Blog، OurStory، i18n — لا تزال ملفات JSX منفصلة غير مربوطة

## Phase 1 + 2 + 3 (راجع التفاصيل الكاملة أدناه)

## Phase 3 — ربط الواجهات بالـ API ✅ (هذه الدفعة)

المسار الكامل من تسجيل الدخول إلى الشراء فعّال الآن بصفحات حقيقية:

| الصفحة | تربط بـ |
|---|---|
| `/login`, `/register` | Supabase Auth + `POST /api/auth/sync` |
| `/marketplace` | `GET /api/products` (بحث، فلاتر، صفحات) |
| `/store/[slug]` | `GET /api/stores/[slug]` + `GET /api/products?storeId=` |
| `/products/[id]` | تفاصيل المنتج + عناوين الشحن + `POST /api/checkout` (تحويل فعلي لـ Moyasar) |
| `/orders/[id]` | تأكيد طلب المشتري (`GET /api/orders/[id]`) |
| `/dashboard` | طلبات التاجر الحقيقية (`GET /api/orders?view=seller`) |
| `/dashboard/create-store` | `POST /api/stores` |
| `/dashboard/products/new` | `POST /api/products` (مع رسالة ترقية باقة عند تجاوز الحد) |
| `/dashboard/orders/[id]` | تفاصيل + تحديث حالة الطلب (`PATCH /api/orders/[id]`) |

**إضافة ضرورية اكتشفتها أثناء الربط:** `app/api/addresses/route.ts` — لم يكن
موجوداً، ولا يمكن لأي مشتري إكمال الدفع بدون عنوان شحن. أضفته لإكمال
المسار، وليس توسّعاً خارج الطلب.

### بنية مشتركة جديدة
- `lib/supabase-browser.ts` — عميل Supabase للمتصفح (مختلف عن `lib/auth.ts` السيرفر)
- `lib/api-client.ts` — غلاف fetch موحّد لمعالجة الأخطاء
- `app/providers.tsx` — `UserProvider` يجلب المستخدم الحالي مرة واحدة لكل الصفحات

## ما لم يُربَط بعد (صراحة)

- رفع صور المنتجات (يحتاج Supabase Storage — لا يوجد upload endpoint حقيقي بعد)
- صفحة `/dashboard/billing` (واجهة بوابة الدفع — الـ API جاهز من Phase 2، الواجهة لا)
- AdminPanel، MuniraChat، ShippingPartners، NotificationsSystem، SupportPage، PricingAndBlog، OurStoryPage — كل هذه بقيت ملفات JSX قديمة منفصلة، لم تُربَط لأن لا API حقيقي وراء أغلبها بعد
- سلة تسوّق متعددة المنتجات (حالياً "اشتري الآن" بمنتج واحد فقط — قرار مقصود يتماشى مع قيد "متجر واحد لكل دفعة")
- الترجمة ثنائية اللغة (i18n) — الصفحات الحالية عربي فقط

## Phase 1 + 2 (راجع التفاصيل الكاملة أدناه)

هذا مشروع Next.js **حقيقي وقابل للتشغيل** فعلياً — لا تعليقات بلوك (`/* ... */`)
بدل كود، لا بيانات وهمية. كل ملف هنا كود حقيقي يتصل بقاعدة بيانات حقيقية
وبحساب Moyasar حقيقي لكل تاجر.

## Phase 1 — Auth + Store + Products ✅

| الملف | الحالة |
|---|---|
| `prisma/schema.prisma` | مُحصَّن (indexes، cascade rules، AuditLog، WebhookEvent، GRACE_PERIOD/SUSPENDED) |
| `lib/prisma.ts`, `lib/auth.ts`, `lib/validation.ts` | حقيقية |
| `lib/subscription-limits.ts` | تحقق حدود الباقة قبل إضافة منتج |
| `lib/rate-limit.ts`, `lib/audit-log.ts` | حقيقية |
| `middleware.ts` | حراسة مسارات + rate limit + هيدرز أمان |
| `app/api/auth/*`, `app/api/stores/*`, `app/api/products/*` | حقيقية وكاملة |

## Phase 2 — Orders + Payments ✅ (هذه الدفعة)

| الملف | الوصف |
|---|---|
| `lib/crypto.ts` | تشفير AES-256-GCM لمفاتيح Moyasar الخاصة بكل تاجر |
| `lib/moyasar.ts` | عميل Moyasar — كل طلب بمفتاح التاجر نفسه، لا مفتاح منصة مشترك |
| `lib/inventory.ts` | حجز/إفراج المخزون **atomic** يمنع البيع المضاعف عند التزاحم |
| `app/api/stores/payment-gateway/route.ts` | ربط حساب Moyasar الخاص بالتاجر (يتحقق من صحة المفتاح فعلياً عند Moyasar) |
| `app/api/checkout/route.ts` | إنشاء طلب + حجز مخزون + بدء دفع، بمعاملة محلية + تعويض عند فشل الدفع |
| `app/api/orders/route.ts` + `[id]/route.ts` | قائمة/تفاصيل/تحديث حالة الطلب (مع إعادة المخزون عند الإلغاء) |
| `app/api/payments/moyasar/webhook/route.ts` | توقيع متعدد المستأجرين + idempotency + replay protection + معاملات آمنة |

### قرار معماري مهم (نتيجة طبيعية لقرار "كل تاجر يربط حسابه الخاص")
**لا يوجد سلة متعددة المتاجر بدفعة واحدة.** كل تاجر له حساب Moyasar مستقل،
فلا توجد طريقة لتقسيم دفعة واحدة بين حسابين مختلفين. الواجهة يجب أن تقسّم
سلة المشتري حسب `storeId` وتستدعي `/api/checkout` مرة لكل متجر.

### ⚠️ نقطة تحتاج تأكيد قبل الإطلاق الفعلي
اسم هيدر توقيع Moyasar (`moyasar-signature` في `webhook/route.ts`) **غير مؤكَّد
100%** لأنني بنيت هذا بدون اتصال إنترنت فعلي يسمح بمراجعة توثيق Moyasar
الحالي مباشرة. آلية HMAC نفسها صحيحة ومُختبَرة منطقياً — التعديل لو لزم
سطر واحد فقط (`SIGNATURE_HEADER_NAME`). **راجعي [docs.moyasar.com](https://docs.moyasar.com)
قبل ربط أي مفتاح حقيقي بالإنتاج.**

## ما لم يبدأ تنفيذه بعد (صراحة)

- استرداد المبالغ التلقائي (refunds) عبر Moyasar API — حالياً يدوي من حساب التاجر
- محرك دورة حياة الاشتراك (cron للتذكير/التعليق) وفواتير العمولة الشهرية
- تحقق فعلي من الكوبونات (الحقل موجود بـ checkout لكن بدون تطبيق خصم حقيقي)
- حساب تكلفة الشحن الفعلي (حالياً 0 ثابت)
- لوحات تحليلات GMV/MRR/ARR/churn
- ربط واجهات React القديمة (BasitaHomepage.jsx وغيرها) بهذا الـ API

## التشغيل

```bash
cp .env.example .env.local
# عبّي: DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#       UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, ENCRYPTION_KEY

# توليد ENCRYPTION_KEY:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

npm install
npx prisma db push
npm run prisma:seed
npm run dev             # http://localhost:3000
```

## تجربة تدفّق الطلب كاملاً

```bash
# 1) تاجر يربط بوابة الدفع (يحتاج جلسة Supabase + متجر فعّال)
curl -X POST http://localhost:3000/api/stores/payment-gateway \
  -H "Content-Type: application/json" \
  -d '{"publishableKey":"pk_test_xxx","secretKey":"sk_test_xxx","webhookSecret":"whsec_xxx"}'

# 2) مشتري يبدأ الدفع
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"storeId":"...","items":[{"productId":"...","quantity":1}],"addressId":"...","paymentMethod":"CREDIT_CARD"}'

# 3) Moyasar يستدعي الـ webhook تلقائياً بعد الدفع (محاكاة محلية بـ ngrok مطلوبة للتجربة الحقيقية)
```

