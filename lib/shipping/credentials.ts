// lib/shipping/credentials.ts
// تشفير/فك تشفير بيانات اعتماد شركات الشحن — غلاف رقيق حول lib/crypto.ts
// الموجود مسبقاً (نفس الآلية المستخدمة لمفاتيح Moyasar في Phase 2). لا
// نظام تشفير ثانٍ، فقط JSON.stringify/parse حول القيمة لأن بيانات اعتماد
// الشحن متعددة الحقول (عكس مفتاح Moyasar السري الذي كان سلسلة واحدة).

import { encryptSecret, decryptSecret } from "../crypto";

export function encryptShippingCredentials(credentials: Record<string, string>): string {
  return encryptSecret(JSON.stringify(credentials));
}

export function decryptShippingCredentials(encrypted: string): Record<string, string> {
  return JSON.parse(decryptSecret(encrypted));
}
