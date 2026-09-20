
import { t } from "@/theme";
import styles from "./PricingHeader.module.css";

export default function PricingHeader({
  billing,
  onBillingChange,
}: {
  billing: "monthly" | "yearly";
  onBillingChange: (v: "monthly" | "yearly") => void;
}) {
  return (
    <section
      className={styles.header}
      dir="rtl"
    >
      <div className={styles.inner}>
        <div
          aria-hidden="true"
          className={styles.mark}
        >
          <span className={styles.markDot} />
        </div>

        <h1 className={styles.title}>
          باقات تناسب كل أسرة منتجة
        </h1>

        <p className={styles.description}>
          بدون عمولة على مبيعاتك مهما كانت باقتك — رسوم اشتراك ثابتة فقط
        </p>

        <div
          className={styles.billingSwitch}
          role="group"
          aria-label="دورة الفوترة"
        >
          {(["monthly", "yearly"] as const).map((opt) => {
            const active = billing === opt;

            return (
              <button
                key={opt}
                type="button"
                onClick={() => onBillingChange(opt)}
                aria-pressed={active}
                className={`${styles.billingButton} ${
                  active ? styles.billingButtonActive : ""
                }`}
              >
                {opt === "monthly"
                  ? "شهري"
                  : "سنوي (وفّري ٢٠٪)"}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
