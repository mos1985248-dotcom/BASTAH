
import Image from "next/image";
import { t } from "@/theme";
import { Store, ShoppingBag, Users } from "lucide-react";
import styles from "./CompanyEcosystem.module.css";

const ECOSYSTEM = [
  {
    icon: Store,
    number: "01",
    title: "أصحاب المشاريع",
    description:
      "أنشئ حضورك الرقمي، اعرض منتجاتك، وأدر متجرك من مساحة واحدة.",
  },
  {
    icon: ShoppingBag,
    number: "02",
    title: "العملاء",
    description:
      "اكتشف منتجات ومتاجر محلية متنوعة، ووصل إلى ما تبحث عنه بسهولة.",
  },
  {
    icon: Users,
    number: "03",
    title: "المجتمع المحلي",
    description:
      "نقرّب المشاريع المحلية من جمهورها ونمنح منتجاتها مساحة أكبر للظهور.",
  },
];

export default function CompanyEcosystem() {
  return (
    <section
      style={{
        background: t.colors.cream.warm,
        padding: `${t.spacing["16"]} ${t.spacing["5"]}`,
        direction: "rtl",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        <div className={styles.ecosystemLayout}>
          <div className={styles.ecosystemImage}>
            <Image
              src="/images/about/company-ecosystem.jpg"
              alt="منظومة بسطة التي تربط أصحاب المشاريع بالعملاء والمجتمع المحلي"
              fill
              sizes="(max-width: 900px) 100vw, 45vw"
              style={{
                objectFit: "cover",
              }}
            />
          </div>

          <div>
            <div
              style={{
                maxWidth: 680,
                marginBottom: t.spacing["8"],
              }}
            >
              <p
                style={{
                  margin: `0 0 ${t.spacing["3"]}`,
                  color: t.colors.gold[600],
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.bold,
                }}
              >
                منظومة بسطة
              </p>

              <h2
                style={{
                  margin: `0 0 ${t.spacing["4"]}`,
                  color: t.colors.primary[800],
                  fontSize: t.typography.fontSize["3xl"],
                  fontWeight: t.typography.fontWeight.bold,
                  lineHeight: 1.5,
                }}
              >
                بسطة تربط المشروع بالعميل
              </h2>

              <p
                style={{
                  margin: 0,
                  color: t.colors.text.body,
                  fontSize: t.typography.fontSize.base,
                  lineHeight: 2,
                }}
              >
                من إنشاء المتجر وعرض المنتجات، إلى اكتشافها وشرائها، تجمع بسطة
                أطراف التجربة في مساحة رقمية واحدة.
              </p>
            </div>

            <div>
              {ECOSYSTEM.map(
                ({ icon: Icon, number, title, description }) => (
                  <article
                    key={title}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "48px 1fr",
                      gap: t.spacing["4"],
                      alignItems: "start",
                      padding: `${t.spacing["5"]} 0`,
                      borderTop: "1px solid rgba(91,70,45,0.12)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: t.radius.full,
                          background: t.colors.primary[800],
                          color: t.colors.gold[400],
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={20} strokeWidth={1.8} />
                      </div>

                      <span
                        style={{
                          color: t.colors.gold[600],
                          fontSize: 11,
                          fontWeight: t.typography.fontWeight.bold,
                        }}
                      >
                        {number}
                      </span>
                    </div>

                    <div>
                      <h3
                        style={{
                          margin: `0 0 ${t.spacing["2"]}`,
                          color: t.colors.primary[800],
                          fontSize: t.typography.fontSize.xl,
                          fontWeight: t.typography.fontWeight.bold,
                          lineHeight: 1.5,
                        }}
                      >
                        {title}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: t.colors.text.body,
                          fontSize: t.typography.fontSize.base,
                          lineHeight: 2,
                        }}
                      >
                        {description}
                      </p>
                    </div>
                  </article>
                ),
              )}

              <div
                style={{
                  borderTop: "1px solid rgba(91,70,45,0.12)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

