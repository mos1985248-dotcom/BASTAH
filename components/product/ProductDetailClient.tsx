// components/product/ProductDetailClient.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useProductPurchase } from "@/hooks/useProductPurchase";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import SiteShell from "@/components/layout/SiteShell";
import AddressSelector from "@/components/shared/AddressSelector";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductPurchasePanel from "./ProductPurchasePanel";
import ProductStoreCard from "./ProductStoreCard";
import ProductDescription from "./ProductDescription";
import ProductPolicyCards from "./ProductPolicyCards";
import ProductReviewsSection from "./ProductReviewsSection";
import RelatedProducts from "./RelatedProducts";
import StickyBuyBar from "./StickyBuyBar";
import { ProductError, ProductLoading } from "./ProductStates";
import type { ProductDetail } from "./types";
import s from "./product.module.css";

export default function ProductDetailClient() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { product } = await api.get<{ product: ProductDetail }>(
          `/api/products/${id}${typeof window !== "undefined" ? window.location.search : ""}`,
        );
        setProduct(product);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "تعذّر تحميل المنتج");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const purchase = useProductPurchase(product, id);

  if (loading) return <SiteShell><ProductLoading /></SiteShell>;
  if (error || !product) return <SiteShell><ProductError message={error} /></SiteShell>;

  return (
    <SiteShell>
      <div style={{ background: t.colors.heritage.sand }}>
        <main className={s.page} style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}>
          <nav aria-label="مسار التصفح">
            <ol className={s.crumbs}>
              <li><a href="/">الرئيسية</a></li>
              <li className={s.sep} aria-hidden="true">›</li>
              <li><a href="/marketplace">السوق</a></li>
              {product.category && (
                <>
                  <li className={s.sep} aria-hidden="true">›</li>
                  <li><a href={`/marketplace?category=${encodeURIComponent(product.category.slug)}`}>{product.category.nameAr}</a></li>
                </>
              )}
              <li className={s.sep} aria-hidden="true">›</li>
              <li className={s.current} aria-current="page">{product.nameAr}</li>
            </ol>
          </nav>

          {product.subscriptionWarning && (
            <div className={s.warning} role="status">
              <AlertTriangle size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>{product.subscriptionWarning}</span>
            </div>
          )}

          <div className={s.grid}>
            <div className={s.galleryCol}>
              <ProductGallery
                images={product.productImages}
                mainImage={product.mainImage}
                videoUrl={product.videoUrl}
                nameAr={product.nameAr}
                isFeatured={product.isFeatured}
              />
            </div>

            <div className={s.infoCol}>
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
            </div>
          </div>

          <div className={s.lower}>
            <ProductDescription product={product} />
            <ProductPolicyCards product={product} />
            <div>
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
            </div>
            <ProductReviewsSection product={product} />
            <RelatedProducts product={product} />
          </div>
        </main>
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
    </SiteShell>
  );
}
