// components/product/ProductDescription.tsx
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import Badge from "@/components/ui/Badge";
import type { ProductDetail } from "./types";
import p from "./product.module.css";
import s from "./extras.module.css";

export default function ProductDescription({ product }: { product: ProductDetail }) {
  if (!product.descAr && product.tags.length === 0) return null;
  return (
    <section aria-label="عن المنتج" className={s.desc} style={uiVars}>
      <p className={p.sectionKicker}>تفاصيل</p>
      <h2 className={p.sectionTitle} style={{ fontFamily: t.typography.fontFamily.display }}>عن المنتج</h2>
      {product.descAr && <p className={s.descText}>{product.descAr}</p>}
      {product.tags.length > 0 && (
        <ul className={s.tags}>
          {product.tags.map((tag) => (
            <li key={tag}><Badge tone="sand">{tag}</Badge></li>
          ))}
        </ul>
      )}
    </section>
  );
}
