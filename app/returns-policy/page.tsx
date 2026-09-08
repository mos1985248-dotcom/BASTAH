// app/returns-policy/page.tsx
// محتوى مقدَّم مباشرة من أحمد (ملف سياسة-الاسترجاع.md المرفوع) — نُقل هنا
// حرفياً بصيغة مبدئية. المدد بين قوسين [٣-٧ أيام]، [٢٤ ساعة]... إلخ لم
// تُحسم بعد — مميَّزة بمكوّن LegalPlaceholder ليسهل ضبطها لاحقاً.
import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import LegalSection from "@/components/legal/LegalSection";
import LegalPlaceholder from "@/components/legal/LegalPlaceholder";
import LegalDisclaimer from "@/components/legal/LegalDisclaimer";
import { t } from "@/theme";

export const metadata: Metadata = {
  title: "سياسة الاسترجاع والإلغاء | بسطة",
  description: "كيف يعمل الاسترجاع والإلغاء لطلبات بسطة",
};

export default function ReturnsPolicyPage() {
  return (
    <SiteShell>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: t.spacing["6"] }}>
        <h1 style={{ fontSize: t.typography.fontSize["2xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], marginBottom: t.spacing["1"] }}>
          سياسة الاسترجاع والإلغاء
        </h1>
        <p style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.light, marginBottom: t.spacing["2"] }}>
          آخر تحديث: <LegalPlaceholder>التاريخ</LegalPlaceholder>
        </p>
        <p style={{ fontSize: t.typography.fontSize.sm, color: t.colors.text.body, marginBottom: t.spacing["6"] }}>
          نظراً لطبيعة منتجات الأسر المنتجة (منتجات يدوية أو غذائية غالباً)، تختلف سياسة الاسترجاع حسب نوع المنتج.
          يُرجى قراءة هذه السياسة بعناية قبل الشراء.
        </p>

        <LegalSection title="١. إلغاء الطلب قبل الشحن">
          <p>يمكن للمشتري إلغاء الطلب مجاناً طالما لم يبدأ التاجر بتجهيزه أو شحنه.</p>
          <p>بعد بدء التجهيز أو الشحن، لا يمكن الإلغاء إلا بالتنسيق المباشر مع التاجر.</p>
        </LegalSection>

        <LegalSection title="٢. المنتجات القابلة للاسترجاع">
          <p>
            <strong>منتجات غير قابلة للتلف</strong> (حرف يدوية، ديكور، أزياء): يحق للمشتري طلب استرجاع خلال{" "}
            <LegalPlaceholder>٣-٧ أيام</LegalPlaceholder> من الاستلام، بشرط أن يكون المنتج بحالته الأصلية دون
            استخدام.
          </p>
          <p>
            <strong>منتجات قابلة للتلف</strong> (مأكولات، حلويات منزلية): لا تُقبل عمليات الاسترجاع إلا في حال وجود
            عيب واضح في المنتج أو عدم مطابقته للوصف، ويجب الإبلاغ خلال <LegalPlaceholder>٢٤ ساعة</LegalPlaceholder>{" "}
            من الاستلام مع إرفاق صور.
          </p>
        </LegalSection>

        <LegalSection title="٣. حالات الاسترجاع الإلزامي">
          <p>يحق للمشتري طلب استرجاع كامل المبلغ في الحالات التالية بغض النظر عن نوع المنتج:</p>
          <p>استلام منتج تالف أو مختلف عن الوصف المعروض.</p>
          <p>عدم استلام الطلب نهائياً خلال المدة المعلنة (بعد التحقق من حالة الشحنة).</p>
        </LegalSection>

        <LegalSection title="٤. آلية الاسترجاع">
          <p>١. يتواصل المشتري مع التاجر مباشرة عبر المنصة (رسائل/واتساب المتجر) لطلب الاسترجاع.</p>
          <p>
            ٢. في حال عدم التوصل لحل خلال <LegalPlaceholder>٤٨ ساعة</LegalPlaceholder>، يمكن للمشتري تصعيد الطلب
            لدعم بسطة.
          </p>
          <p>
            ٣. عند الموافقة على الاسترجاع للمدفوعات الإلكترونية، تتم إعادة المبلغ عبر بوابة الدفع الأصلية
            (Moyasar) خلال <LegalPlaceholder>٥-١٤ يوم عمل</LegalPlaceholder> حسب سياسة البنك المُصدر للبطاقة.
          </p>
          <p>٤. لطلبات الدفع عند الاستلام (COD)، تتم إعادة المبلغ عبر تحويل بنكي أو وسيلة أخرى يتفق عليها الطرفان.</p>
        </LegalSection>

        <LegalSection title="٥. تكلفة الشحن في حالة الاسترجاع">
          <p>إذا كان سبب الاسترجاع خطأً من التاجر (منتج تالف/مختلف)، يتحمّل التاجر تكلفة شحن الإرجاع.</p>
          <p>إذا كان الاسترجاع برغبة المشتري (وليس بسبب عيب)، يتحمّل المشتري تكلفة الشحن ذهاباً وإياباً.</p>
        </LegalSection>

        <LegalSection title="٦. دور بسطة في النزاعات">
          <p>
            تسعى بسطة للوساطة بين المشتري والتاجر في حال نشوء خلاف، وقد تطلب أدلة (صور، محادثات) لاتخاذ قرار عادل.
            القرار النهائي في حالات النزاع يعود لتقدير فريق دعم بسطة بناءً على الأدلة المقدمة.
          </p>
        </LegalSection>

        <LegalSection title="٧. التواصل">
          <p>
            لأي استفسار أو تصعيد بخصوص الاسترجاع، تواصل معنا عبر{" "}
            <LegalPlaceholder>البريد الإلكتروني / واتساب الدعم</LegalPlaceholder>، أو صفحة{" "}
            <a href="/dashboard/support" style={{ color: t.colors.gold[600] }}>الدعم والمساعدة</a>.
          </p>
        </LegalSection>

        <LegalDisclaimer>
          هذه مسودة أولية للمراجعة، وليست استشارة قانونية. يُنصح بمراجعتها مع محامٍ مرخّص للتأكد من توافقها مع
          نظام التجارة الإلكترونية السعودي ونظام حماية المستهلك.
        </LegalDisclaimer>
      </div>
    </SiteShell>
  );
}
