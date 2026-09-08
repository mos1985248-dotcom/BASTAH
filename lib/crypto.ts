// lib/crypto.ts
// تشفير مفاتيح الدفع الخاصة بالتجار قبل تخزينها بقاعدة البيانات.
//
// لماذا AES-256-GCM بالتحديد: وضع GCM يعطي authenticated encryption —
// أي تعديل على النص المشفّر (حتى بايت واحد) يفشل عند فك التشفير فوراً،
// بعكس أوضاع مثل CBC التي يمكن العبث بها صمتاً. هذا مهم لأن القيمة هنا
// مفتاح دفع حقيقي — لا نريد فك تشفير "ناجح" لقيمة مُتلاعَب بها.
//
// ENCRYPTION_KEY يجب أن يكون 32 بايت (256-bit) مُشفَّر base64.
// توليده: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // الطول الموصى به لـ GCM

function getKey(): Buffer {
  const keyB64 = process.env.ENCRYPTION_KEY;
  if (!keyB64) {
    throw new Error("ENCRYPTION_KEY غير مضبوط في متغيرات البيئة — لا يمكن تشفير/فك تشفير مفاتيح الدفع");
  }
  const key = Buffer.from(keyB64, "base64");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY يجب أن يكون 32 بايت (256-bit) بعد فك base64");
  }
  return key;
}

/** يرجع نصاً واحداً يحتوي iv:authTag:ciphertext (كل جزء hex) — تخزين سهل بحقل String واحد */
export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSecret(stored: string): string {
  const key = getKey();
  const [ivHex, authTagHex, encryptedHex] = stored.split(":");
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error("صيغة القيمة المشفّرة غير صحيحة");
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(), // يرمي خطأ تلقائياً لو authTag غير متطابق (تلاعب أو تلف)
  ]);

  return decrypted.toString("utf8");
}

/**
 * توافق خلفي مؤقت: قيم قديمة مخزَّنة نصاً صريحاً قبل تفعيل التشفير على
 * هذا الحقل (مثل merchantGatewayWebhookSecret) ما تطابق صيغة iv:authTag:
 * ciphertext (3 أجزاء hex). نكتشف الصيغة ونفك التشفير فقط لو كانت
 * القيمة فعلاً مشفّرة، وإلا نرجّعها كما هي.
 * ⚠️ يُستخدم فقط لحقول كانت تُخزَّن سابقاً نصاً صريحاً أثناء فترة الترحيل
 * — يُفضَّل تشغيل سكربت ترحيل لتشفير كل القيم القديمة ثم حذف هذه الدالة.
 */
const ENCRYPTED_FORMAT = /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i;

export function decryptIfEncrypted(stored: string): string {
  if (!ENCRYPTED_FORMAT.test(stored)) return stored; // نص صريح قديم — كما هو
  try {
    return decryptSecret(stored);
  } catch {
    // شكله مشفّر بس فشل فك التشفير (تلف/مفتاح خاطئ) — نرجّعه كما هو
    // بدل ما نكسر التحقق بالكامل؛ المقارنة بعدها بتفشل طبيعياً لو غلط.
    return stored;
  }
}

/** يعرض آخر 4 أحرف فقط من مفتاح حساس — لعرضه بالواجهة بأمان (pk_live_••••3f9a) */
export function maskSecret(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) return "•".repeat(value.length);
  return "•".repeat(8) + value.slice(-visibleChars);
}
