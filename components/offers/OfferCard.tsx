// components/offers/OfferCard.tsx
import { t } from "@/theme";

export interface Offer {
  id: string; code: string; discountType: string; discountValue: number;
  minOrderAmt: number | null; expiresAt: string | null;
  store: { nameAr: string; slug: string };
}

export default function OfferCard({ offer }: { offer: Offer }) {
  const discountLabel = offer.discountType === "percentage" ? `خصم ${offer.discountValue}٪` : `خصم ${offer.discountValue} ر.س`;

  return (
    <a href={`/store/${offer.store.slug}`} style={{ textDecoration: "none" }}>
      <div style={{ background: t.colors.white, border: `1.5px dashed ${t.colors.gold[600]}`, borderRadius: t.radius.lg, padding: t.spacing["4"] }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: t.spacing["2"] }}>
          <span style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.gold[700] }}>{discountLabel}</span>
          <span style={{ fontFamily: "monospace", fontSize: t.typography.fontSize.sm, background: t.colors.cream.warm, padding: "3px 10px", borderRadius: t.radius.sm, color: t.colors.text.dark }}>
            {offer.code}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid }}>{offer.store.nameAr}</p>
        {offer.minOrderAmt && (
          <p style={{ margin: `${t.spacing["1"]} 0 0`, fontSize: t.typography.fontSize.xs, color: t.colors.text.light }}>
            بحد أدنى {offer.minOrderAmt} ر.س للطلب
          </p>
        )}
        {offer.expiresAt && (
          <p style={{ margin: `${t.spacing["1"]} 0 0`, fontSize: t.typography.fontSize.xs, color: t.colors.text.light }}>
            ينتهي في {new Date(offer.expiresAt).toLocaleDateString("ar-SA")}
          </p>
        )}
      </div>
    </a>
  );
}
