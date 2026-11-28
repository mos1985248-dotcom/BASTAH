import { normalizeArabic } from "./public-guide";
// Conservative opt-in allowlist: reject identifiers, free-form complaints and personal account questions.
// No raw conversation, IP, user ID or contact details are retained.
export function safeGapQuestion(message: string) {
  if (message.length > 140 || /[^\p{Script=Arabic}\p{M}\s؟،.?!]/u.test(message) || /\p{N}/u.test(message)) return null;
  const key = normalizeArabic(message);
  if (!/^(?:هل|كيف|ما|ماهي|ماهو|وش|ايش|شنو|كم|متي|اين|وين) /u.test(key)) return null;
  if (!/(?:بسطه مارت|الباقات|باقه|الاشتراك|العموله|دفاتري|منيره|التسجيل|التسويق|الشحن|التوصيل|الدفع|الاسترجاع)/u.test(key)) return null;
  if (/(?:اسمي|اسمه|اسمها|عنوان|جوال|بريد|حسابي|طلبي|شحنني|شحنتي|بطاق|هويه|كلمه|رمز|رقم|شكوي|مشكل|محجوب|عميل|فلان|ساكن)/u.test(key)) return null;
  // Retain only general vocabulary; unknown names and free text are not recorded.
  const allowed = new Set(normalizeArabic("هل كيف ما ماهي ماهو وش ايش شنو كم متى اين وين أقدر اقدر يمكن أستطيع استطيع أستفيد استفيد من في على عن الى إلى مع او أو و بسطة مارت الباقات باقة الاشتراك العمولة دفاتري منيرة التسجيل التسويق الشحن التوصيل الدفع الاسترجاع مجاني مجانا المجانية المدفوع المنتجات منتج المتاجر متجر البيع الشراء التجارة الالكترونية الإلكترونية الأسر المنتجة الحرفيين الدعم الخدمات مزايا مميزات حدود سعر أسعار تكلفة رسوم شهري سنوي شهريا سنويا طريقة طرق خيارات متاحة متاح موجود يوجد توجد خاص الخاصة العامة برنامج برامج توفير توفر تقدم تساعد يساعد استخدام استخدم استعمل إضافة اضافة تفعيل فتح انشاء إنشاء حساب جديد ترقية تغيير إلغاء الغاء استرداد مبلغ المبلغ بداية نمو انطلاق ازدهار عدد أكثر اقل أقل بدون هل هناك يكون تكون يتم").split(" "));
  if (key.split(" ").some(word => !allowed.has(word))) return null;
  return { questionKey: key, question: key };
}
