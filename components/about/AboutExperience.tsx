// components/about/AboutExperience.tsx
// يجسّد فكرة "المتجر ليس مجرد قائمة منتجات" — بلا أرقام أو ادعاءات، فقط
// وصف لما تتيحه بسطة فعلياً بصفحة كل متجر (قصة، صور/فيديو، هوية، ذاكرة).
import { BookOpen, Film, Palette, History, type LucideIcon } from "lucide-react";
import { t } from "@/theme";

const PILLARS: { Icon: LucideIcon; title: string; desc: string }[] = [
  { Icon: BookOpen, title: "قصة", desc: "لكل أسرة مساحة تروي فيها من هي ولماذا تصنع ما تصنع، بكلماتها الخاصة" },
  { Icon: Film, title: "صور وفيديو", desc: "معرض صور حقيقي، وفيديو قصير إن رغبت الأسرة يُظهر لمسة الصنعة اليدوية" },
  { Icon: Palette, title: "هوية بصرية", desc: "شارات ثقة وتفاصيل تعكس شخصية المتجر، لا قالباً موحّداً لكل التجار" },
  { Icon: History, title: "ذاكرة", desc: "وصفة أو حرفة توارثتها الأجيال — مساحة لتُروى كما هي، بلا مبالغة" },
];

export default function AboutExperience() {
  return (
    <section style={{ background: t.colors.cream?.warm || "#fdfbf7", padding: `${t.spacing["16"]} ${t.spacing["4"]}`, direction: "rtl" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: t.typography.fontSize["2xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
          المتجر ليس مجرد قائمة منتجات
        </h2>
        <p style={{ margin: `0 auto ${t.spacing["10"]}`, maxWidth: 580, fontSize: t.typography.fontSize.base, color: t.colors.text.mid, lineHeight: t.typography.lineHeight.relaxed }}>
          كل متجر على بسطة مساحة كاملة — قصة وصور وذاكرة وهوية، لا صفحة سعر واحدة
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: t.spacing["6"] }}>
          {PILLARS.map((p) => (
            <div
              key={p.title}
              style={{
                background: t.colors.white,
                border: `1px solid ${t.colors.cream.border}`,
                borderRadius: t.radius.lg,
                padding: t.spacing["6"],
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                boxShadow: t.shadows.sm,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: t.radius.full,
                  background: t.colors.primary[150] || t.colors.primary[100],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: t.spacing["4"],
                }}
              >
                <p.Icon size={24} strokeWidth={1.8} color={t.colors.primary[800]} />
              </div>
              <h3 style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
                {p.title}
              </h3>
              <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.body, lineHeight: t.typography.lineHeight.relaxed }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}