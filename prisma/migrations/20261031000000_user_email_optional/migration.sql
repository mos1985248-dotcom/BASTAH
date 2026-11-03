-- البريد الإلكتروني اختياري: الدخول بالجوال (OTP) وGoogle صارا خيارين للمستخدم، وحساب الجوال قد لا يملك بريداً.
-- قيد UNIQUE يبقى كما هو (PostgreSQL يسمح بعدة قيم NULL فيه).
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
