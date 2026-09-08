// components/store/MuniraAdviceCard.tsx
// منيرة هنا هي مساعدة العميل (المشتري) لاكتشاف منتجات هذا المتجر ومقارنتها
// والاستفسار عنها — ليست أداة تحليلات للبائع (تلك موجودة بلوحة التاجر).
import { t } from "@/theme";
import MuniraMiniPanel from "@/components/munira/MuniraMiniPanel";
import { StoreDetail } from "./types";

export default function MuniraAdviceCard({ store }: { store: StoreDetail }) {
  const suggestions = [
    `أهم منتجات ${store.nameAr}؟`,
    "قارني لي بين المنتجات المتوفرة",
    "أي منتج يناسب كهدية؟",
    "أخبريني عن سياسة الشحن والإرجاع هنا",
  ];

  return (
    <section style={{ maxWidth: 1080, margin: `${t.spacing["6"]} auto 0`, padding: `0 ${t.spacing["4"]}` }}>
      <MuniraMiniPanel
        title="منيرة — مساعدتك الذكية للتسوّق"
        subtitle={`اسأليني عن منتجات ${store.nameAr}، قارني بينها، أو استفسري عن المتجر`}
        suggestions={suggestions}
      />
    </section>
  );
}
