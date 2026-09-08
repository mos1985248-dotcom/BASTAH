-- prisma/storage-setup.sql
-- يُنفَّذ مرة واحدة في Supabase SQL Editor لإنشاء/تأكيد bucket الصور.
--
-- قرار معماري (ليه ما فيه سياسات RLS للكتابة هنا):
-- الرفع لا يحدث مباشرة من المتصفح لـ Supabase Storage. كل رفع يمر أولاً
-- عبر app/api/uploads/products (سيرفرنا)، الذي يتحقق من الهوية والملكية
-- والصلاحيات بنفسه (lib/auth.ts + lib/product-images.ts) قبل أي اتصال
-- بالتخزين، ثم يرفع باستخدام service_role key (lib/supabase-admin.ts)
-- الذي يتجاوز RLS بالكامل. فلا حاجة لسياسة INSERT/UPDATE/DELETE معقّدة
-- مرتبطة بـ auth.uid() — الحارس الحقيقي هو الـ API route نفسه.
--
-- القراءة فقط عامة (bucket public:true) لأن صور المنتجات يجب أن تظهر
-- لأي زائر بدون تسجيل دخول.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'basita-media',
  'basita-media',
  true,              -- قراءة عامة بدون RLS (تخدم عبر CDN مباشرة)
  8388608,           -- 8MB — يطابق lib/image-processing.ts MAX_UPLOAD_BYTES
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ملاحظة: لو احتجتِ مستقبلاً نوع رفع آخر يحدث مباشرة من المتصفح (بدون
-- وسيط سيرفر)، تحتاجين وقتها سياسات RLS حقيقية على storage.objects
-- مرتبطة بمسار الملف ومعرّف المستخدم — ليست مطلوبة في النموذج الحالي.
