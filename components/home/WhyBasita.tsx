// components/home/WhyBasita.tsx
import { t } from "@/theme";
import {
  Megaphone,
  HandHeart,
  Wrench,
  Users,
  Headset,
  Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    Icon: Megaphone,
    title: "تسويق ودعم",
    desc: "لمتجرك ومنتجاتك",
  },
  {
    Icon: HandHeart,
    title: "بدون عمولات",
    desc: "على جميع الباقات",
  },
  {
    Icon: Wrench,
    title: "أدوات متكاملة",
    desc: "لإدارة متجرك بسهولة",
  },
  {
    Icon: Users,
    title: "وصول أكبر",
    desc: "لآلاف العملاء يوميًا",
  },
  {
    Icon: Headset,
    title: "دعم فني سريع",
    desc: "فريق يرافقك خطوة بخطوة",
  },
];

export default function WhyBasita() {
  return (
    <section
      style={{
        maxWidth: t.layout.containerMaxWidth,
        margin: "0 auto",
        padding: `${t.spacing["12"]} ${t.spacing["4"]} ${t.spacing["10"]}`,
        direction: "rtl",
      }}
    >
      {/* العنوان */}
      <div
        style={{
          textAlign: "center",
          marginBottom: t.spacing["6"],
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
            padding: "6px 11px",
            borderRadius: 999,
            background: "#FFFDF8",
            border: "1px solid rgba(166,124,45,0.16)",
            color: t.colors.gold[700],
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.semibold,
          }}
        >
          <Sparkles size={14} strokeWidth={1.8} />
          لماذا يختارون بسطة؟
        </div>

        <h2
          style={{
            fontFamily: t.typography.fontFamily.heading,
            margin: `0 0 ${t.spacing["2"]}`,
            fontSize: t.typography.fontSize.xl,
            fontWeight: t.typography.fontWeight.bold,
            color: t.colors.text.dark,
          }}
        >
          ليش بسطة؟
        </h2>

        <p
          style={{
            margin: 0,
            maxWidth: 620,
            marginInline: "auto",
            fontSize: t.typography.fontSize.sm,
            lineHeight: t.typography.lineHeight.relaxed,
            color: t.colors.text.mid,
          }}
        >
          كل ما تحتاجه الأسرة المنتجة لتبيع، تنمو، وتوصل منتجاتها لعملاء أكثر.
        </p>
      </div>

      {/* البطاقات */}
      <div
        className="basita-why-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: t.spacing["4"],
          alignItems: "stretch",
        }}
      >
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="basita-why-card"
            style={{
              minHeight: 170,
              padding: "20px 14px",
              borderRadius: 18,
              background: "#FFFDF8",
              border: "1px solid rgba(91,70,45,0.11)",
              boxShadow: "0 5px 16px rgba(67,48,29,0.045)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxSizing: "border-box",
              transition:
                `transform ${t.motion.base} ${t.motion.ease}, ` +
                `box-shadow ${t.motion.base} ${t.motion.ease}, ` +
                `border-color ${t.motion.base} ${t.motion.ease}`,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                marginBottom: 10,
                borderRadius: 14,
                background: t.colors.gold[100],
                border: "1px solid rgba(166,124,45,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <f.Icon
                size={23}
                strokeWidth={1.8}
                color={t.colors.gold[700]}
              />
            </div>

            <p
              style={{
                margin: `0 0 ${t.spacing["1"]}`,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.text.dark,
              }}
            >
              {f.title}
            </p>

            <p
              style={{
                margin: 0,
                fontSize: t.typography.fontSize.xs,
                color: t.colors.text.mid,
                lineHeight: t.typography.lineHeight.relaxed,
              }}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}