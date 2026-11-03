# إعداد الدخول بـ Google وبالجوال — بسطة

الكود جاهز في الخلفية. هذه خطوات الإعداد الخارجية (لوحات Supabase وGoogle ومزوّد الرسائل)، وكلها لا تُنجَز من الكود.

## ١) قاعدة البيانات (إلزامي قبل النشر)
يجعل البريد اختيارياً في جدول المستخدمين:

    npx prisma migrate deploy
    npx prisma generate

الهجرة: `prisma/migrations/20261031000000_user_email_optional` (سطر واحد: `DROP NOT NULL` على `users.email`).

## ٢) Google
1. Google Cloud Console ← APIs & Services ← Credentials ← Create OAuth client ID (Web application).
2. Authorized redirect URI: العنوان الذي تعرضه Supabase في Authentication ← Providers ← Google (يشبه `https://<project>.supabase.co/auth/v1/callback`).
3. انسخ Client ID وClient Secret إلى Supabase ← Authentication ← Providers ← Google وفعّله.
4. Supabase ← Authentication ← URL Configuration: أضف إلى Redirect URLs العنوان `https://<دومين-بسطة>/auth/callback` (و`http://localhost:3000/auth/callback` للتطوير).

## ٣) الجوال (رمز OTP)
1. Supabase ← Authentication ← Providers ← Phone: فعّله.
2. Supabase ← Authentication ← Hooks ← Send SMS: اختر HTTPS وأدخل `https://<دومين-بسطة>/api/auth/sms-hook`، ثم ولّد السر وانسخه.
3. متغيرات البيئة على Vercel:
   - `SEND_SMS_HOOK_SECRET` = السر الذي ولّدته (بصيغة `v1,whsec_...`)
   - `SMS_PROVIDER` = اسم المزوّد بعد اختياره (انظر أدناه)
   - `NEXT_PUBLIC_APP_URL` = عنوان الموقع (يستعمله مسار callback)
4. Upstash مطلوب للإنتاج (`UPSTASH_REDIS_REST_URL/TOKEN`)، لأن حد 5 رسائل/دقيقة لكل رقم يعتمد عليه.

## مزوّد الرسائل (قرار مؤجَّل)
- حتى يُختار المزوّد: في التطوير يُطبع الرمز في طرفية الخادم لتجربة التدفق، وفي الإنتاج يفشل طلب الرمز برسالة واضحة (لا يُرسل شيء).
- عند اختياره يُضاف ملف `lib/sms/<provider>.ts` يحقق واجهة `SmsProvider` (دالة `send(to, message)`)، ويُسجَّل في `PROVIDERS` داخل `lib/sms/index.ts`. لا شيء آخر يتغير.
- الدخول بالجوال مقتصر على أرقام سعودية (`+9665XXXXXXXX`) عمداً.

## نقاط للتحقق عند أول تجربة
- شكل رد الخطأ من الـhook (`{ error: { http_code, message } }`) كما في توثيق Supabase: جرّب رقماً غير سعودي وتأكد أن الرسالة تصل للمستخدم.
- حساب جوال جديد: يُنشأ صف `users` بدور BUYER عند أول طلب مُصادَق (الشفاء الذاتي في `lib/auth.ts`).
- رقم مسجَّل مسبقاً عند حساب بريد (كُتب بلا تحقق): لا يُدمج الحسابان تلقائياً؛ يُنشأ حساب الجوال بلا رقم في جدولنا ويبقى الرقم الموثَّق في Supabase.
