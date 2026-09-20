
// components/pricing/PricingFAQ.tsx
import { ChevronDown, HelpCircle } from "lucide-react";
import { t } from "@/theme";
import styles from "./PricingFAQ.module.css";

const FAQS = [
  {
    q: "ليش بسطة ما تاخذ عمولة على مبيعاتي؟",
    a: "نؤمن أن إيرادك من تعبك يرجع لك بالكامل — لهذا موديل بسطة اشتراك شهري ثابت فقط، بدون أي نسبة من مبيعاتك.",
  },
  {
    q: "هل أقدر أغيّر باقتي بأي وقت؟",
    a: "نعم، تقدرين ترقّي أو تنزّلي باقتك من لوحة تحكم متجرك مباشرة، وتُطبَّق التغييرات على دورة الفوترة القادمة.",
  },
  {
    q: "شنو رسوم الشحن؟",
    a: "رسوم شحن ثابتة 3 ريال على كل طلب، توزّع حسب اتفاقك مع شركة الشحن — بدون أي رسوم إضافية من بسطة.",
  },
  {
    q: "متى أقدر أستخدم منيرة، المساعدة الذكية؟",
    a: "منيرة متاحة تلقائياً لباقتي نماء وبرو، وتساعدك في الرد على استفسارات العملاء وإدارة متجرك بذكاء.",
  },
];

export default function PricingFAQ() {
  return (
    <section
      id="faq"
      dir="rtl"
      className={styles.faq}
    >
      <div className={styles.container}>
        {/* رأس القسم */}
        <div className={styles.header}>
          <div
            aria-hidden="true"
            className={styles.icon}
          >
            <HelpCircle
              size={22}
              strokeWidth={1.8}
            />
          </div>

          <h2 className={styles.title}>
            أسئلة شائعة
          </h2>

          <p className={styles.subtitle}>
            كل ما تحتاجين معرفته عن باقات بسطة
          </p>
        </div>

        {/* الأسئلة */}
        <div className={styles.list}>
          {FAQS.map((f, index) => (
            <div
              key={f.q}
              className={styles.item}
            >
              {/* الرقم */}
              <span
                aria-hidden="true"
                className={`${styles.number} ${
                  index === 0 ? styles.numberFeatured : ""
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* النص */}
              <div className={styles.content}>
                <p className={styles.question}>
                  {f.q}
                </p>

                <p className={styles.answer}>
                  {f.a}
                </p>
              </div>

              {/* المؤشر */}
              <span
                aria-hidden="true"
                className={styles.chevron}
              >
                <ChevronDown
                  size={17}
                  strokeWidth={1.8}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
