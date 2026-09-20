
import Image from "next/image";
import { t } from "@/theme";
import {
  Store,
  Package,
  ShoppingBag,
  CreditCard,
  Truck,
  LayoutDashboard,
} from "lucide-react";
import styles from "./CompanyServices.module.css";

const SERVICE_GROUPS = [
  {
    image: "/images/about/company-stores.jpg",
    imageAlt: "صاحبة مشروع محلي تدير متجرها",
    eyebrow: "01 — المتجر",
    title: "مساحة واضحة لعرض مشروعك ومنتجاتك",
    description:
      "نساعد صاحب المشروع على تقديم متجره بصورة مرتبة وواضحة، بحيث يستطيع العميل اكتشاف المنتجات وفهم تفاصيلها واتخاذ قرار الشراء بسهولة.",
    services: [
      {
        icon: Store,
        title: "متجر إلكتروني",
        description:
          "مساحة رقمية لعرض المنتجات وتقديم المتجر للعملاء بصورة واضحة.",
      },
      {
        icon: Package,
        title: "إدارة المنتجات",
        description:
          "تنظيم المنتجات والمعلومات والأسعار والصور من مكان واحد.",
      },
    ],
  },
  {
    image: "/images/about/company-orders.jpg",
    imageAlt: "تجهيز طلبات المنتجات المحلية",
    eyebrow: "02 — الطلبات",
    title: "من اختيار المنتج إلى تجهيز الطلب",
    description:
      "نجعل إدارة الطلبات أكثر وضوحًا لصاحب المتجر، مع أدوات تساعده على متابعة عملية البيع وتنظيم مراحلها.",
    services: [
      {
        icon: ShoppingBag,
        title: "إدارة الطلبات",
        description:
          "متابعة الطلبات وتنظيم مراحل البيع بطريقة أبسط.",
      },
      {
        icon: LayoutDashboard,
        title: "أدوات للبائع",
        description:
          "لوحة تساعد صاحب المتجر على إدارة نشاطه ومتابعة عملياته.",
      },
    ],
  },
  {
    image: "/images/about/company-shipping.jpg",
    imageAlt: "طلب محلي جاهز للشحن والتوصيل",
    eyebrow: "03 — الدفع والشحن",
    title: "رحلة شراء متكاملة حتى يصل المنتج إلى العميل",
    description:
      "نربط تجربة المتجر بالخطوات التي تأتي بعدها، من الدفع الإلكتروني إلى تنظيم خيارات الشحن والتوصيل.",
    services: [
      {
        icon: CreditCard,
        title: "الدفع",
        description:
          "دعم تجربة دفع إلكترونية ضمن رحلة الشراء في المنصة.",
      },
      {
        icon: Truck,
        title: "الشحن",
        description:
          "أدوات تساعد المتجر على تنظيم خيارات الشحن والتوصيل.",
      },
    ],
  },
];

export default function CompanyServices() {
  return (
    <section
      style={{
        background: t.colors.white,
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
        <div
          style={{
            maxWidth: 760,
            marginBottom: t.spacing["12"],
          }}
        >
          <p
            style={{
              margin: `0 0 ${t.spacing["2"]}`,
              color: t.colors.gold[600],
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
            }}
          >
            ماذا نقدم؟
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
            أدوات بسيطة تساعد المشروع على النمو من المتجر إلى العميل
          </h2>

          <p
            style={{
              margin: 0,
              color: t.colors.text.body,
              fontSize: t.typography.fontSize.base,
              lineHeight: 2,
            }}
          >
            جمعنا أهم مراحل التجارة الإلكترونية في تجربة واحدة، مع أدوات
            تساعد صاحب المشروع على التركيز على منتجه وعملائه.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: t.spacing["16"],
          }}
        >
          {SERVICE_GROUPS.map((group, index) => {
            const isReversed = index % 2 !== 0;

            return (
              <div
                key={group.title}
                className={styles.serviceRow}
              >
                <div
                  className={styles.serviceImage}
                  style={{
                    position: "relative",
                    width: "100%",
                    minHeight: 380,
                    overflow: "hidden",
                    borderRadius: t.radius.xl,
                    background: t.colors.cream.warm,
                    order: isReversed ? 2 : 1,
                  }}
                >
                  <Image
                    src={group.image}
                    alt={group.imageAlt}
                    fill
                    sizes="(max-width: 900px) 100vw, 50vw"
                    style={{
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div
                  className={styles.serviceContent}
                  style={{
                    order: isReversed ? 1 : 2,
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
                    {group.eyebrow}
                  </p>

                  <h3
                    style={{
                      margin: `0 0 ${t.spacing["4"]}`,
                      color: t.colors.primary[800],
                      fontSize: t.typography.fontSize["2xl"],
                      fontWeight: t.typography.fontWeight.bold,
                      lineHeight: 1.5,
                    }}
                  >
                    {group.title}
                  </h3>

                  <p
                    style={{
                      margin: `0 0 ${t.spacing["6"]}`,
                      color: t.colors.text.body,
                      fontSize: t.typography.fontSize.base,
                      lineHeight: 2,
                    }}
                  >
                    {group.description}
                  </p>

                  <div className={styles.serviceItems}>
                    {group.services.map(
                      ({ icon: Icon, title, description }) => (
                        <div key={title}>
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: t.radius.lg,
                              background: t.colors.primary[50],
                              color: t.colors.primary[700],
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginBottom: t.spacing["3"],
                            }}
                          >
                            <Icon size={20} strokeWidth={1.8} />
                          </div>

                          <h4
                            style={{
                              margin: `0 0 ${t.spacing["2"]}`,
                              color: t.colors.text.dark,
                              fontSize: t.typography.fontSize.base,
                              fontWeight: t.typography.fontWeight.bold,
                            }}
                          >
                            {title}
                          </h4>

                          <p
                            style={{
                              margin: 0,
                              color: t.colors.text.body,
                              fontSize: t.typography.fontSize.sm,
                              lineHeight: 1.8,
                            }}
                          >
                            {description}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

