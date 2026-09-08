// app/privacy/page.tsx
// محتوى مقدَّم مباشرة من أحمد (ملف سياسة-الخصوصية.md المرفوع) — نُقل هنا
// حرفياً بصيغة مبدئية. [التاريخ] و[البريد الإلكتروني / واتساب الدعم]
// لا تزال بحاجة تعبئة فعلية — مميَّزة بمكوّن LegalPlaceholder.
import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import LegalSection from "@/components/legal/LegalSection";
import LegalPlaceholder from "@/components/legal/LegalPlaceholder";
import LegalDisclaimer from "@/components/legal/LegalDisclaimer";
import { t } from "@/theme";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | بسطة",
  description: "كيف تجمع بسطة بياناتك وتستخدمها وتحميها",
};

export default function PrivacyPage() {
  return (
    <SiteShell>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: t.spacing["6"] }}>
        <h1 style={{ fontSize: t.typography.fontSize["2xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], marginBottom: t.spacing["1"] }}>
          سياسة الخصوصية
        </h1>
        <p style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.light, marginBottom: t.spacing["2"] }}>
          آخر تحديث: <LegalPlaceholder>التاريخ</LegalPlaceholder>
        </p>
        <p style={{ fontSize: t.typography.fontSize.sm, color: t.colors.text.body, marginBottom: t.spacing["6"] }}>
          تحترم بسطة خصوصيتك، وتوضح هذه السياسة كيف نجمع بياناتك ونستخدمها ونحميها.
        </p>

        <LegalSection title="١. البيانات التي نجمعها">
          <p><strong>بيانات الحساب</strong>: الاسم، البريد الإلكتروني، رقم الجوال.</p>
          <p><strong>بيانات الطلب</strong>: عنوان الشحن، تفاصيل المنتجات المطلوبة.</p>
          <p><strong>بيانات التاجر</strong>: اسم المتجر، معلومات التواصل، بيانات بوابة الدفع المرتبطة (مشفّرة).</p>
          <p><strong>بيانات الاستخدام</strong>: سجلات الزيارة، تفاعلك مع المنتجات (لأغراض التحسين والتوصيات).</p>
        </LegalSection>

        <LegalSection title="٢. كيف نستخدم بياناتك">
          <p>لتنفيذ الطلبات وإتمام عمليات الشحن والدفع.</p>
          <p>للتواصل معك بخصوص طلباتك أو حسابك.</p>
          <p>لتحسين تجربة الاستخدام وتقديم توصيات مناسبة عبر ميزات الذكاء الاصطناعي (منيرة).</p>
          <p>للامتثال للأنظمة السعودية ذات العلاقة.</p>
        </LegalSection>

        <LegalSection title="٣. مشاركة البيانات">
          <p><strong>بيانات الشحن</strong> تُشارك مع شركة الشحن المختارة لغرض التوصيل فقط.</p>
          <p><strong>بيانات الدفع</strong> تُعالج مباشرة عبر بوابة الدفع الخاصة بالتاجر (Moyasar)، ولا تحتفظ بسطة ببيانات البطاقة الكاملة.</p>
          <p>لا تبيع بسطة بياناتك الشخصية لأي طرف ثالث لأغراض تسويقية.</p>
        </LegalSection>

        <LegalSection title="٤. حماية البيانات">
          <p>تُشفَّر بيانات حسابات التجار والمفاتيح الحساسة (مثل مفاتيح بوابة الدفع) قبل تخزينها.</p>
          <p>تُستخدم بروتوكولات اتصال آمنة (SSL) عبر جميع صفحات المنصة.</p>
        </LegalSection>

        <LegalSection title="٥. حقوقك">
          <p>يحق لك:</p>
          <p>الوصول إلى بياناتك الشخصية المخزنة لدينا.</p>
          <p>طلب تعديل أو حذف بياناتك (باستثناء ما يلزم الاحتفاظ به لأغراض نظامية مثل السجلات المالية).</p>
          <p>إلغاء الاشتراك من الرسائل التسويقية في أي وقت.</p>
        </LegalSection>

        <LegalSection id="cookies" title="٦. ملفات تعريف الارتباط (Cookies)">
          <p>
            تستخدم بسطة ملفات تعريف ارتباط أساسية لتشغيل المنصة (مثل تسجيل الدخول والسلة)، وقد تُستخدم ملفات
            إضافية لتحسين التجربة وقياس الأداء.
          </p>
        </LegalSection>

        <LegalSection title="٧. خصوصية الأطفال">
          <p>المنصة غير موجهة للأطفال دون سن ١٨ عاماً، ولا نجمع بيانات مستخدمين قاصرين عن علم.</p>
        </LegalSection>

        <LegalSection title="٨. التعديلات على هذه السياسة">
          <p>قد تُحدَّث هذه السياسة من وقت لآخر، وسيتم إشعارك بأي تغييرات جوهرية عبر المنصة.</p>
        </LegalSection>

        <LegalSection title="٩. التواصل">
          <p>
            لأي استفسار بخصوص خصوصية بياناتك، تواصل معنا عبر{" "}
            <LegalPlaceholder>البريد الإلكتروني / واتساب الدعم</LegalPlaceholder>، أو صفحة{" "}
            <a href="/dashboard/support" style={{ color: t.colors.gold[600] }}>الدعم والمساعدة</a>.
          </p>
        </LegalSection>

        <LegalDisclaimer>
          هذه مسودة أولية للمراجعة، وليست استشارة قانونية. يُنصح بمراجعتها مع محامٍ مرخّص، خصوصاً فيما يتعلق
          بمتطلبات نظام حماية البيانات الشخصية السعودي (PDPL).
        </LegalDisclaimer>
      </div>
    </SiteShell>
  );
}
