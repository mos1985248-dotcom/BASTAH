// lib/phone.ts
// توحيد أرقام الجوال السعودية إلى الصيغة المخزَّنة بقاعدتنا: +9665XXXXXXXX.
// Supabase يرجع رقم المستخدم بلا "+" (966512345678)، والمستخدم قد يكتب 05XXXXXXXX أو أرقاماً عربية.
// الأرقام غير السعودية تُرفض عمداً: المنتج سعودي، ورفض الدولي يحدّ من إساءة استعمال إرسال الرسائل (SMS pumping).

const ARABIC_DIGITS: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};

/** يرجع +9665XXXXXXXX أو null إن لم يكن رقم جوال سعودياً صالحاً. */
export function normalizeSaudiMobile(input: string | null | undefined): string | null {
  if (!input) return null;

  const digits = input
    .replace(/[٠-٩۰-۹]/g, (d) => ARABIC_DIGITS[d] ?? d)
    .replace(/[\s\-().]/g, "")
    .replace(/^\+/, "")
    .replace(/^00/, "");

  if (/^05\d{8}$/.test(digits)) return `+966${digits.slice(1)}`;
  if (/^5\d{8}$/.test(digits)) return `+966${digits}`;
  if (/^9665\d{8}$/.test(digits)) return `+${digits}`;
  return null;
}
