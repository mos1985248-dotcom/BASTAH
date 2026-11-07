// lib/sms/index.ts
// طبقة إرسال الرسائل النصية لرمز الدخول بالجوال. المزوّد الفعلي لم يُحسم بعد (قرار مؤجَّل):
// عند اختياره يُضاف ملف بجوار هذا (مثل lib/sms/taqnyat.ts) ويُسجَّل في PROVIDERS ويُفعَّل بـSMS_PROVIDER.
// لا أسرار ولا مزوّد مكتوب بالكود.

export interface SmsProvider {
  name: string;
  /** يرسل نصاً إلى رقم بصيغة +9665XXXXXXXX، ويرمي خطأ عند الفشل. */
  send(to: string, message: string): Promise<void>;
}

export class SmsNotConfiguredError extends Error {
  constructor() {
    super("SMS_PROVIDER غير مضبوط أو غير مسجَّل");
    this.name = "SmsNotConfiguredError";
  }
}

// مثال لاحقاً: { taqnyat: () => taqnyatProvider() }
const PROVIDERS: Record<string, () => SmsProvider> = {};

export function otpMessage(otp: string): string {
  return `رمز التحقق الخاص بك في بسطة مارت: ${otp}\nلا تشاركه مع أحد.`;
}

export async function sendOtpSms(to: string, otp: string): Promise<void> {
  const factory = process.env.SMS_PROVIDER ? PROVIDERS[process.env.SMS_PROVIDER] : undefined;

  if (!factory) {
    // التطوير المحلي فقط: نطبع الرمز بالطرفية ليمكن تجربة التدفق بلا مزوّد. لا يحدث أبداً بالإنتاج.
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[sms:dev] رمز ${otp} للرقم ${to} (لا مزوّد مضبوط)`);
      return;
    }
    throw new SmsNotConfiguredError();
  }

  await factory().send(to, otpMessage(otp));
}
