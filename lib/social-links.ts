// lib/social-links.ts
// ⚠️ المصدر الوحيد لروابط تواصل بسطة بكل الموقع — عدّلي هنا فقط.
// أي حساب لم تُدخلي رابطه (يبقى null) لا تظهر أيقونته إطلاقاً بالواجهة —
// لا روابط وهمية أو placeholder تُعرض للزوار أبداً.

export interface SocialLinks {
  instagram: string | null;
  tiktok: string | null;
  snapchat: string | null;
  x: string | null;
  whatsapp: string | null;
}

export const SOCIAL_LINKS: SocialLinks = {
  instagram: null, // مثال: "https://instagram.com/your_handle"
  tiktok: null,
  snapchat: null,
  x: null,
  whatsapp: null, // رقم واتساب الدعم العام، مثال: "https://wa.me/9665XXXXXXXX"
};
