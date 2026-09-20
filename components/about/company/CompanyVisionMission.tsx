
import { t } from "@/theme";
import { Eye, Target } from "lucide-react";

const ITEMS = [
  {
    icon: Eye,
    label: "رؤيتنا",
    title: "أن تكون المنتجات المحلية أقرب إلى عملائها",
    description:
      "نطمح إلى بناء مساحة رقمية تمنح المشاريع المحلية حضورًا واضحًا، وتساعد أصحابها على الوصول إلى عملائهم بطريقة أسهل وأكثر تنظيمًا.",
  },
  {
    icon: Target,
    label: "رسالتنا",
    title: "نبسّط التقنية لتخدم المشروع المحلي",
    description:
      "نوفر الأدوات والخدمات التي تساعد صاحب المشروع على عرض منتجاته وإدارة متجره وتنمية حضوره الرقمي، مع الحفاظ على تجربة واضحة وسهلة للعميل.",
  },
];

export default function CompanyVisionMission() {
  return (
    <section
      style={{
        background: t.colors.cream.bg,
        padding: `${t.spacing["16"]} ${t.spacing["5"]}`,
        direction: "rtl",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            maxWidth: 700,
            marginBottom: t.spacing["10"],
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
            ما الذي نؤمن به؟
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
            نبني التقنية حول احتياج المشروع المحلي
          </h2>

          <p
            style={{
              margin: 0,
              maxWidth: 640,
              color: t.colors.text.body,
              fontSize: t.typography.fontSize.base,
              lineHeight: 2,
            }}
          >
            نؤمن بأن التقنية تصبح أكثر قيمة عندما تكون بسيطة، واضحة، وقريبة من
            احتياجات أصحاب المشاريع وعملائهم.
          </p>
        </div>

        <div>
          {ITEMS.map(({ icon: Icon, label, title, description }) => (
            <article
              key={label}
              style={{
                display: "grid",
                gridTemplateColumns: "72px 1fr",
                gap: t.spacing["6"],
                alignItems: "start",
                padding: `${t.spacing["8"]} 0`,
                borderTop: "1px solid rgba(91,70,45,0.12)",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: t.radius.full,
                  background: t.colors.primary[800],
                  color: t.colors.gold[400],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={23} strokeWidth={1.8} />
              </div>

              <div>
                <p
                  style={{
                    margin: `0 0 ${t.spacing["2"]}`,
                    color: t.colors.gold[600],
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: t.typography.fontWeight.bold,
                  }}
                >
                  {label}
                </p>

                <h3
                  style={{
                    margin: `0 0 ${t.spacing["3"]}`,
                    color: t.colors.primary[800],
                    fontSize: t.typography.fontSize["2xl"],
                    fontWeight: t.typography.fontWeight.bold,
                    lineHeight: 1.5,
                  }}
                >
                  {title}
                </h3>

                <p
                  style={{
                    maxWidth: 760,
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
          ))}
        </div>
      </div>
    </section>
  );
}

