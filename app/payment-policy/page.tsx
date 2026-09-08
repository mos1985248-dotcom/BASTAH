// app/payment-policy/page.tsx
// ⚠️ نسخة أولية عامة — تعتمد على حقائق نظام الدفع الفعلي (Moyasar Invoices
// API لكل تاجر بحسابه الخاص، لا عمولة على المبيعات، VAT 15% خلفياً فقط
// للتجّار المسجّلين ضريبياً، رسوم COD منفصلة). ليست صياغة قانونية معتمدة.
import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import LegalSection from "@/components/legal/LegalSection";
import { t } from "@/theme";

export const metadata: Metadata = {
  title: "سياسة الدفع | بسطة",
  description: "طرق الدفع المتاحة بمنصة بسطة، وكيف تُعالَج المدفوعات",
};

export default function PaymentPolicyPage() {
  return (
    <SiteShell>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: t.spacing["6"] }}>
        <h1 style={{ fontSize: t.typography.fontSize["2xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], marginBottom: t.spacing["1"] }}>
          سياسة الدفع
        </h1>
        <p style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.light, marginBottom: t.spacing["6"] }}>
          آخر تحديث: هذا نص أولي يحتاج مراجعة قانونية قبل النشر الرسمي
        </p>

        <LegalSection title="1. طرق الدفع المتاحة">
          <p>
            بطاقات الائتمان (Visa/Mastercard)، مدى، Apple Pay، STC Pay، أو
            الدفع عند الاستلام إن فعَّله التاجر لمتجره. تظهر الطرق المتاحة
            فعلياً عند الدفع حسب إعدادات المتجر الذي تشترين منه.
          </p>
        </LegalSection>

        <LegalSection title="2. من يستقبل مبلغ الدفع">
          <p>
            كل تاجر على بسطة يملك حساب دفع إلكتروني خاص به. عند الدفع
            الإلكتروني، يذهب المبلغ مباشرة لحساب التاجر عبر بوابة الدفع
            المرتبطة بمتجره — بسطة لا تستقبل ولا تحتفظ بأموال المشترين في
            أي مرحلة، ولا تتوسط بالتحويلات المالية بين الطرفين.
          </p>
          <p>
            لهذا السبب، إن كانت سلّتك تحتوي منتجات من أكثر من متجر، يُنشأ
            طلب ودفعة منفصلة لكل متجر على حدة.
          </p>
        </LegalSection>

        <LegalSection title="3. الدفع عند الاستلام">
          <p>
            إن اختار التاجر إتاحة الدفع عند الاستلام، تُضاف رسوم ثابتة لهذه
            الخدمة تظهر بوضوح قبل تأكيد الطلب — ولا تُفرض إطلاقاً على
            الطلبات المدفوعة إلكترونياً.
          </p>
        </LegalSection>

        <LegalSection title="4. ضريبة القيمة المضافة">
          <p>
            تُحتسب ضريبة القيمة المضافة (15%) تلقائياً على المنتجات فقط عند
            الحاجة، وفق تسجيل التاجر الضريبي — تظهر بوضوح ضمن تفاصيل الفاتورة
            عند الدفع إن كانت مستحقة.
          </p>
        </LegalSection>

        <LegalSection title="5. أمان بيانات الدفع">
          <p>
            لا تُحفظ بيانات بطاقتك على خوادم بسطة — تُعالَج المدفوعات
            بالكامل عبر بوابة دفع مرخَّصة ومتوافقة مع معايير أمان صناعة
            البطاقات (PCI DSS).
          </p>
        </LegalSection>

        <LegalSection title="6. فشل الدفع أو الاسترداد">
          <p>
            في حال فشل عملية الدفع، لا يُنشأ الطلب ولا يُحجز أي مبلغ. في حال
            استحقاق استرداد بعد قبول إرجاع (راجعي{" "}
            <a href="/returns-policy" style={{ color: t.colors.gold[600] }}>سياسة الإلغاء والاسترجاع</a>)، يتم الاسترداد من التاجر مباشرة
            عبر نفس وسيلة الدفع الأصلية.
          </p>
        </LegalSection>

        <LegalSection title="7. التواصل">
          <p>
            لأي مشكلة متعلقة بالدفع، تواصلي معنا عبر صفحة{" "}
            <a href="/dashboard/support" style={{ color: t.colors.gold[600] }}>الدعم والمساعدة</a>.
          </p>
        </LegalSection>
      </div>
    </SiteShell>
  );
}
