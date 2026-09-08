// app/terms/page.tsx
// محتوى مقدَّم مباشرة من أحمد (ملف الشروط-والأحكام.md المرفوع) — نُقل
// هنا حرفياً بصيغة مبدئية. القيم بين قوسين [مثل هذا] لا تزال بحاجة تعبئة
// فعلية قبل النشر الرسمي — مميَّزة بصرياً بمكوّن LegalPlaceholder لسهولة
// إيجادها لاحقاً. الرابط لسياسة الاسترجاع بالقسم ٦ يشير لصفحة
// /returns-policy الفعلية بالمنصة (كانت [رابط سياسة الاسترجاع] بالأصل).
import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import LegalSection from "@/components/legal/LegalSection";
import LegalPlaceholder from "@/components/legal/LegalPlaceholder";
import LegalDisclaimer from "@/components/legal/LegalDisclaimer";
import { t } from "@/theme";

export const metadata: Metadata = {
  title: "الشروط والأحكام | بسطة",
  description: "الشروط والأحكام الخاصة باستخدام منصة بسطة",
};

export default function TermsPage() {
  return (
    <SiteShell>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: t.spacing["6"] }}>
        <h1 style={{ fontSize: t.typography.fontSize["2xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], marginBottom: t.spacing["1"] }}>
          الشروط والأحكام
        </h1>
        <p style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.light, marginBottom: t.spacing["2"] }}>
          آخر تحديث: <LegalPlaceholder>التاريخ</LegalPlaceholder>
        </p>
        <p style={{ fontSize: t.typography.fontSize.sm, color: t.colors.text.body, marginBottom: t.spacing["6"] }}>
          مرحباً بك في بسطة، منصة إلكترونية سعودية تربط الأسر المنتجة بالمشترين. باستخدامك للمنصة (كمشترٍ أو تاجر)، فإنك توافق على الشروط التالية.
        </p>

        <LegalSection title="١. تعريفات">
          <p><strong>المنصة</strong>: تطبيق وموقع بسطة.</p>
          <p><strong>التاجر</strong>: صاحب الحساب الذي يعرض منتجاته عبر متجره الخاص داخل المنصة.</p>
          <p><strong>المشتري</strong>: أي مستخدم يقوم بشراء منتج عبر المنصة.</p>
        </LegalSection>

        <LegalSection title="٢. طبيعة الخدمة">
          <p>
            بسطة سوق إلكتروني (Marketplace) يتيح للتجار عرض وبيع منتجاتهم مباشرة للمشترين. <strong>كل عملية دفع تتم
            مباشرة بين المشتري والتاجر عبر بوابة الدفع الخاصة بالتاجر</strong>، وبسطة لا تحتفظ بأموال المشتري ولا
            تُعتبر طرفاً في عملية البيع نفسها، بل مزوّد للبنية التقنية والتسهيلات.
          </p>
        </LegalSection>

        <LegalSection title="٣. حسابات التجار">
          <p>يلتزم التاجر بتقديم معلومات صحيحة عند التسجيل وعرض منتجاته.</p>
          <p>يلتزم التاجر بربط بوابة دفع صالحة باسمه لاستقبال المدفوعات.</p>
          <p>تحتفظ بسطة بحق مراجعة أو تعليق أي حساب تاجر يخالف الشروط أو يعرض منتجات مخالفة للأنظمة السعودية.</p>
          <p>تخضع اشتراكات التجار للباقات المعلنة على المنصة (مجاني، ستارت، نماء، برو)، ويحق للمنصة تعديل هذه الباقات مع إشعار مسبق.</p>
        </LegalSection>

        <LegalSection title="٤. الطلبات والدفع">
          <p>يتم عرض السعر النهائي شاملاً المنتج ورسوم الشحن قبل تأكيد الطلب.</p>
          <p>تتوفر طرق دفع متعددة (بطاقات، محافظ رقمية، الدفع عند الاستلام حيث يتوفر)، وقد تُضاف رسوم إضافية لبعض طرق الدفع كما هو موضح وقت الطلب.</p>
          <p>بمجرد تأكيد الدفع الإلكتروني، يُعتبر الطلب مؤكداً وتبدأ إجراءات التجهيز والشحن.</p>
        </LegalSection>

        <LegalSection title="٥. الشحن">
          <p>يتم حساب رسوم الشحن تلقائياً بناءً على شركة الشحن التي يختارها التاجر ومنطقة التوصيل.</p>
          <p>المنصة تتعاقد مع شركات شحن معتمدة لتسهيل عملية التوصيل، وتُضاف رسوم خدمة ثابتة ضمن تكلفة الشحن.</p>
          <p>مدة التوصيل التقديرية تظهر عند إتمام الطلب وقد تختلف حسب المنطقة وشركة الشحن.</p>
        </LegalSection>

        <LegalSection id="returns" title="٦. الاسترجاع والإلغاء">
          <p>
            تخضع طلبات الاسترجاع والإلغاء لسياسة الاسترجاع المنشورة بشكل منفصل —{" "}
            <a href="/returns-policy" style={{ color: t.colors.gold[600] }}>سياسة الاسترجاع والإلغاء</a>.
          </p>
        </LegalSection>

        <LegalSection title="٧. مسؤولية المحتوى والمنتجات">
          <p>التاجر مسؤول بشكل كامل عن دقة وصف منتجاته، جودتها، وصلاحيتها للاستخدام.</p>
          <p>تحتفظ بسطة بحق إزالة أي منتج أو محتوى يخالف الأنظمة السعودية أو معايير المنصة.</p>
        </LegalSection>

        <LegalSection title="٨. حسابات المستخدمين">
          <p>يلتزم المستخدم بالحفاظ على سرية بيانات حسابه، وهو مسؤول عن أي نشاط يتم من خلاله.</p>
          <p>يحق للمنصة تعليق أي حساب يُستخدم بشكل مخالف لهذه الشروط.</p>
        </LegalSection>

        <LegalSection title="٩. الملكية الفكرية">
          <p>
            جميع حقوق العلامة التجارية &quot;بسطة&quot; وتصميم المنصة محفوظة. محتوى المنتجات (صور، أوصاف) المملوكة
            للتجار تبقى ملكاً لهم، مع منح المنصة ترخيصاً لعرضها ضمن الخدمة.
          </p>
        </LegalSection>

        <LegalSection title="١٠. تعديل الشروط">
          <p>يحق لبسطة تعديل هذه الشروط في أي وقت، ويُعتبر استمرار استخدامك للمنصة بعد التعديل موافقة ضمنية عليها.</p>
        </LegalSection>

        <LegalSection title="١١. القانون الحاكم">
          <p>تخضع هذه الشروط لأنظمة المملكة العربية السعودية، وتختص المحاكم السعودية بالنظر في أي نزاع.</p>
        </LegalSection>

        <LegalSection title="١٢. التواصل">
          <p>
            لأي استفسار بخصوص هذه الشروط، يمكنكم التواصل عبر{" "}
            <LegalPlaceholder>البريد الإلكتروني / واتساب الدعم</LegalPlaceholder>، أو صفحة{" "}
            <a href="/dashboard/support" style={{ color: t.colors.gold[600] }}>الدعم والمساعدة</a>.
          </p>
        </LegalSection>

        <LegalDisclaimer>
          هذه مسودة أولية للمراجعة، وليست استشارة قانونية. يُنصح بعرضها على محامٍ مرخّص قبل نشرها رسمياً، خصوصاً
          البنود المتعلقة بالمسؤولية بين المنصة والتاجر، وبوابات الدفع.
        </LegalDisclaimer>
      </div>
    </SiteShell>
  );
}
