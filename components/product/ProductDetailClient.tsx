// components/product/ProductDetailClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useProductPurchase } from "@/hooks/useProductPurchase";
import { t } from "@/theme";
import SiteShell from "@/components/layout/SiteShell";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductPurchasePanel from "@/components/product/ProductPurchasePanel";
import ProductStoreCard from "@/components/product/ProductStoreCard";
import ProductMuniraCTA from "@/components/product/ProductMuniraCTA";
import ProductReviewsSection from "@/components/product/ProductReviewsSection";
import RelatedProducts from "@/components/product/RelatedProducts";
import AddressSelector from "@/components/shared/AddressSelector";
import StickyBuyBar from "@/components/product/StickyBuyBar";
import { ProductDetail } from "@/components/product/types";

export default function ProductDetailClient() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { product } = await api.get<{ product: ProductDetail }>(`/api/products/${id}`);
        setProduct(product);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "تعذّر تحميل المنتج");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const purchase = useProductPurchase(product, id);

  if (loading) {
    return (
      <SiteShell>
        <p style={{ textAlign: "center", padding: t.spacing["16"], color: t.colors.text.mid }}>جاري التحميل...</p>
      </SiteShell>
    );
  }
  if (error || !product) {
    return (
      <SiteShell>
        <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center", padding: t.spacing["16"], color: t.colors.semantic.danger }}>
          <AlertTriangle size={16} strokeWidth={1.8} />
          {error}
        </p>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: t.spacing["5"], paddingBottom: 110 }}>
        {product.subscriptionWarning && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, background: t.colors.semantic.warningBg, color: t.colors.semantic.warning, padding: t.spacing["3"], borderRadius: t.radius.md, fontSize: t.typography.fontSize.sm, marginBottom: t.spacing["3"] }}>
            <AlertTriangle size={15} strokeWidth={1.8} />
            {product.subscriptionWarning}
          </p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: t.spacing["5"] }} className="basita-product-grid">
          <ProductGallery images={product.productImages} mainImage={product.mainImage} videoUrl={product.videoUrl} nameAr={product.nameAr} isFeatured={product.isFeatured} />

          <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["4"] }}>
            <ProductInfo product={product} isFavorite={purchase.isFavorite} onToggleFavorite={purchase.toggleFavorite} />
            <ProductPurchasePanel
              product={product}
              selectedVariant={purchase.selectedVariant}
              onSelectVariant={purchase.setSelectedVariantId}
              qty={purchase.qty}
              onQtyChange={purchase.setQty}
              maxQty={purchase.maxQty}
              effectivePrice={purchase.effectivePrice}
              onAddToCart={purchase.handleAddToCart}
              onBuyNow={purchase.handleBuyNow}
              addingToCart={purchase.addingToCart}
              addedToCart={purchase.addedToCart}
              checkingOut={purchase.checkingOut}
              error={purchase.checkoutError}
            />
            <ProductStoreCard store={product.store} redirectPath={`/products/${id}`} />
            <ProductMuniraCTA product={product} />
          </div>
        </div>

        <AddressSelector
          hasUser={!!purchase.user}
          userLoading={purchase.userLoading}
          addresses={purchase.addresses}
          selectedAddressId={purchase.selectedAddressId}
          onSelect={purchase.setSelectedAddressId}
          showForm={purchase.showAddressForm}
          onShowForm={() => purchase.setShowAddressForm(true)}
          form={purchase.addrForm}
          onFormChange={(k, v) => purchase.setAddrForm((p) => ({ ...p, [k]: v }))}
          onSave={purchase.handleAddAddress}
        />

        <ProductReviewsSection product={product} />
        <RelatedProducts product={product} />
      </div>

      <StickyBuyBar
        qty={purchase.qty}
        maxQty={purchase.maxQty}
        onQtyChange={purchase.setQty}
        price={purchase.effectivePrice}
        disabled={purchase.checkingOut || purchase.maxQty === 0}
        checkingOut={purchase.checkingOut}
        onBuyNow={purchase.handleBuyNow}
        error={purchase.checkoutError}
      />

      <style>{`
        @media (max-width: 700px) {
          .basita-product-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </SiteShell>
  );
}
