// lib/munira/security.ts
// طبقة أمان منيرة — تعمل على كل رسالة واردة قبل إرسالها لـ Claude
// وعلى كل رد صادر قبل إعادته للعميل.

// ─── قواعد اكتشاف الـ Prompt Injection ──────────────────
// نمط الهجوم: المستخدم يحاول إعطاء Claude تعليمات جديدة تتجاوز الـ system prompt.
// الحماية الأساسية هي الـ system prompt نفسه (Claude لديه تدريب جيد)، لكن
// الفلترة هنا تمنع أكثر المحاولات الصريحة قبل وصولها لـ Claude أصلاً.

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|above|prior|system)\s+(instructions?|prompts?|rules?)/i,
  /forget\s+(everything|all|your\s+instructions?)/i,
  /you\s+are\s+now\s+(a\s+)?(different|new|another|unrestricted)/i,
  /act\s+as\s+(if\s+you\s+are\s+)?(a\s+)?(different|uncensored|evil|dan)/i,
  /\bDAN\b|\bJailbreak\b/i,
  /reveal\s+(your\s+)?(system\s+)?prompt/i,
  /show\s+(me\s+)?(your\s+)?(system\s+)?prompt/i,
  /what\s+(are|is)\s+your\s+(system\s+)?prompt/i,
  /print\s+(your\s+)?(system\s+|initial\s+)?instructions?/i,
  /disregard\s+(your\s+)?(instructions?|training|rules?)/i,
  /pretend\s+(you\s+are|to\s+be)\s+(an?\s+)?(admin|developer|openai|anthropic)/i,
  /override\s+(your\s+)?(safety|content|system)/i,
  /\bsystem\s+prompt\s+is:/i,
  /new\s+instruction:/i,
  /\[INST\]|\[\/INST\]|<\|system\|>|<\|user\|>/i, // ناقلات injection عبر template tokens
];

// مصطلحات تكشف محاولة استخراج بيانات متاجر أخرى أو مقاييس الإدارة
const DATA_EXFIL_PATTERNS: RegExp[] = [
  /other\s+store['s]?\s+(sales?|revenue|data|orders?|customers?)/i,
  /competitor['s]?\s+(store\s+)?(data|sales?|revenue)/i,
  /show\s+(me\s+)?(all|every)\s+store['s]?/i,
  /admin\s+(panel|dashboard|metrics?|data)/i,
  /total\s+(platform|basita)\s+(revenue|sales?|gmv)/i,
  /how\s+much\s+(does|is)\s+basita\s+(making|earning)/i,
  /(list|show)\s+all\s+(users?|sellers?|stores?)/i,
];

export interface SanitizeResult {
  safe: boolean;
  reason?: "injection_attempt" | "data_exfil" | "message_too_long";
  sanitizedContent?: string; // نُعيد المحتوى بعد حذف الأجزاء الضارة لو أمكن
}

const MAX_USER_MESSAGE_LENGTH = 4000; // حدّ معقول لرسالة واحدة

/**
 * يفحص رسالة المستخدم قبل إرسالها لـ Claude.
 * يرجع { safe: false } لو اكتشف محاولة injection — يرفع الـ route خطأ 400.
 * يرجع { safe: true, sanitizedContent } بعد تنظيف بسيط (إزالة template tokens).
 */
export function sanitizeUserInput(content: string): SanitizeResult {
  if (content.length > MAX_USER_MESSAGE_LENGTH) {
    return { safe: false, reason: "message_too_long" };
  }

  // فحص محاولات Injection الصريحة
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(content)) {
      return { safe: false, reason: "injection_attempt" };
    }
  }

  // فحص محاولات استخراج بيانات محظورة
  for (const pattern of DATA_EXFIL_PATTERNS) {
    if (pattern.test(content)) {
      return { safe: false, reason: "data_exfil" };
    }
  }

  // تنظيف: حذف أي template tokens مشبوهة من النص دون رفض الرسالة كاملاً
  const sanitized = content
    .replace(/<\|[^|]+\|>/g, "")  // <|system|> وما شابهها
    .replace(/\[INST\]|\[\/INST\]/gi, "")
    .trim();

  return { safe: true, sanitizedContent: sanitized };
}

// ─── فلترة المخرجات ────────────────────────────────────────
// Claude نفسه مدرَّب على عدم كشف system prompts، لكن هذا فلتر دفاع-في-العمق
// إضافي لو تسرّب أي محتوى حساس في الاستجابة.

const OUTPUT_SENSITIVE_PATTERNS: RegExp[] = [
  /ENCRYPTION_KEY/i,
  /sk_(live|test)_[a-zA-Z0-9]+/i,   // Moyasar secret keys
  /pk_(live|test)_[a-zA-Z0-9]+/i,   // Moyasar publishable keys
  /eyJ[a-zA-Z0-9_-]{10,}/,          // JWT tokens
  /DATABASE_URL/i,
  /SUPABASE_SERVICE_KEY/i,
  /my system prompt is/i,
  /the system prompt says/i,
];

const REDACTION_PLACEHOLDER = "[محتوى محجوب]";

/**
 * يفحص استجابة Claude ويُخفي أي بيانات حساسة تسرّبت.
 * يُطبَّق على كل chunk في streaming قبل إرساله للعميل.
 */
export function filterOutput(text: string): string {
  let filtered = text;
  for (const pattern of OUTPUT_SENSITIVE_PATTERNS) {
    filtered = filtered.replace(pattern, REDACTION_PLACEHOLDER);
  }
  return filtered;
}

/** رسائل الخطأ للمستخدم بلغات مختلفة حسب نوع المشكلة */
export const INJECTION_ERROR_MESSAGES: Record<string, Record<string, string>> = {
  injection_attempt: {
    ar: "عذراً، لا أستطيع معالجة هذا النوع من الطلبات. كيف يمكنني مساعدتك في تسوّقك أو متجرك؟",
    en: "Sorry, I can't process this type of request. How can I help with your shopping or store?",
    ur: "معذرت، میں اس قسم کی درخواست پر کارروائی نہیں کر سکتی۔ آپ کی خریداری یا دکان میں کیسے مدد کر سکتی ہوں؟",
    hi: "क्षमा करें, मैं इस प्रकार के अनुरोध को संसाधित नहीं कर सकती। आपकी खरीदारी या स्टोर में कैसे मदद कर सकती हूं?",
  },
  data_exfil: {
    ar: "لا أستطيع مشاركة بيانات متاجر أو مستخدمين آخرين. هل تودّ مساعدة في متجرك أو بحث عن منتج؟",
    en: "I can't share data from other stores or users. Can I help with your store or finding a product?",
    ur: "میں دوسرے اسٹورز یا صارفین کا ڈیٹا شیئر نہیں کر سکتی۔",
    hi: "मैं अन्य स्टोर या उपयोगकर्ताओं का डेटा साझा नहीं कर सकती।",
  },
  message_too_long: {
    ar: "رسالتك طويلة جداً، قصّريها لأقل من 4000 حرف.",
    en: "Your message is too long. Please keep it under 4000 characters.",
    ur: "آپ کا پیغام بہت لمبا ہے۔ براہ کرم 4000 حروف سے کم رکھیں۔",
    hi: "आपका संदेश बहुत लंबा है। कृपया 4000 अक्षरों से कम रखें।",
  },
};
