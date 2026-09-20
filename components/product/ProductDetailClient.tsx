// components/product/ProductDetailClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useProductPurchase } from "@/hooks/useProductPurchase";
import { t } from "@/theme";
import SiteShell from "@/components/layout/SiteShell";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductPurchasePanel from "@/components/product/ProductPurchasePanel";
import ProductStoreCard from "@/components/product/ProductStoreCard";
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
        const { product } = await api.get<{ product: ProductDetail }>(
          `/api/products/${id}`
        );
        setProduct(product);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "تعذّر تحميل المنتج"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const purchase = useProductPurchase(product, id);

  if (loading) {
    return (
      <SiteShell>
        <div
          dir="rtl"
          className="basita-product-state"
          style={{
            minHeight: 420,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: t.spacing["8"],
          }}
        >
          <div
            style={{
              minWidth: 180,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: t.spacing["3"],
              padding: `${t.spacing["6"]} ${t.spacing["6"]}`,
              background: t.colors.white,
              border: `1px solid ${t.colors.cream.border}`,
              borderRadius: t.radius.xl,
              boxShadow: "0 12px 35px rgba(25, 45, 35, 0.06)",
              textAlign: "center",
            }}
          >
            <span
              style={{
                width: 42,
                height: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: t.radius.full,
                background: t.colors.primary[100],
                color: t.colors.primary[700],
              }}
            >
              <Loader2
                size={20}
                strokeWidth={2}
                className="basita-product-spinner"
              />
            </span>

            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.text.dark,
                }}
              >
                جاري تحميل المنتج
              </p>

              <p
                style={{
                  margin: `${t.spacing["1"]} 0 0`,
                  fontSize: t.typography.fontSize.xs,
                  color: t.colors.text.light,
                }}
              >
                لحظات ونجهز لك تفاصيل المنتج
              </p>
            </div>
          </div>
        </div>

        <style>{`
          .basita-product-spinner {
            animation: basitaProductSpin 0.9s linear infinite;
          }

          @keyframes basitaProductSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @media (prefers-reduced-motion: reduce) {
            .basita-product-spinner {
              animation: none;
            }
          }
        `}</style>
      </SiteShell>
    );
  }

  if (error || !product) {
    return (
      <SiteShell>
        <div
          dir="rtl"
          className="basita-product-state"
          style={{
            minHeight: 420,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: t.spacing["8"],
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: t.spacing["3"],
              padding: `${t.spacing["6"]} ${t.spacing["6"]}`,
              background: t.colors.white,
              border: `1px solid ${t.colors.semantic.dangerBg}`,
              borderRadius: t.radius.xl,
              boxShadow: "0 12px 35px rgba(25, 45, 35, 0.06)",
              textAlign: "center",
            }}
          >
            <span
              style={{
                width: 46,
                height: 46,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: t.radius.full,
                background: t.colors.semantic.dangerBg,
                color: t.colors.semantic.danger,
              }}
            >
              <AlertTriangle size={21} strokeWidth={1.9} />
            </span>

            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: t.typography.fontSize.base,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.text.dark,
                }}
              >
                تعذّر تحميل المنتج
              </p>

              <p
                style={{
                  margin: `${t.spacing["2"]} 0 0`,
                  fontSize: t.typography.fontSize.sm,
                  lineHeight: 1.8,
                  color: t.colors.semantic.danger,
                }}
              >
                {error || "المنتج غير متاح حالياً"}
              </p>
            </div>
          </div>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div
        dir="rtl"
        className="basita-product-page"
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: `${t.spacing["6"]} ${t.spacing["5"]} 120px`,
        }}
      >
        {product.subscriptionWarning && (
          <div
            role="status"
            className="basita-product-warning"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: t.spacing["2"],
              background: t.colors.semantic.warningBg,
              color: t.colors.semantic.warning,
              padding: `${t.spacing["3"]} ${t.spacing["4"]}`,
              borderRadius: t.radius.lg,
              border: "1px solid rgba(180, 130, 30, 0.16)",
              fontSize: t.typography.fontSize.sm,
              lineHeight: 1.75,
              marginBottom: t.spacing["5"],
              boxShadow: "0 5px 18px rgba(25, 45, 35, 0.03)",
            }}
          >
            <span
              style={{
                width: 30,
                height: 30,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: t.radius.full,
                background: "rgba(255,255,255,0.55)",
              }}
            >
              <AlertTriangle size={15} strokeWidth={1.9} />
            </span>

            <span style={{ paddingTop: 2 }}>
              {product.subscriptionWarning}
            </span>
          </div>
        )}

        <div
          className="basita-product-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.05fr) minmax(360px, 0.95fr)",
            gap: t.spacing["6"],
            alignItems: "start",
          }}
        >
          <div className="basita-product-gallery-column">
            <ProductGallery
              images={product.productImages}
              mainImage={product.mainImage}
              videoUrl={product.videoUrl}
              nameAr={product.nameAr}
              isFeatured={product.isFeatured}
            />
          </div>

          <div
            className="basita-product-info-column"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: t.spacing["4"],
              minWidth: 0,
            }}
          >
            <section
              className="basita-product-section"
              aria-label="معلومات المنتج"
            >
              <ProductInfo
                product={product}
                isFavorite={purchase.isFavorite}
                onToggleFavorite={purchase.toggleFavorite}
              />
            </section>

            <section
              className="basita-product-section basita-product-purchase-section"
              aria-label="شراء المنتج"
            >
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
            </section>

            <section
              className="basita-product-section"
              aria-label="المتجر"
            >
              <ProductStoreCard
                store={product.store}
                redirectPath={`/products/${id}`}
              />
            </section>
          </div>
        </div>

        <div className="basita-product-lower-content">
          <section
            className="basita-product-address-section"
            aria-label="عنوان التوصيل"
          >
            <AddressSelector
              hasUser={!!purchase.user}
              userLoading={purchase.userLoading}
              addresses={purchase.addresses}
              selectedAddressId={purchase.selectedAddressId}
              onSelect={purchase.setSelectedAddressId}
              showForm={purchase.showAddressForm}
              onShowForm={() => purchase.setShowAddressForm(true)}
              form={purchase.addrForm}
              onFormChange={(k, v) =>
                purchase.setAddrForm((p) => ({ ...p, [k]: v }))
              }
              onSave={purchase.handleAddAddress}
            />
          </section>

          <section
            className="basita-product-reviews-section"
            aria-label="مراجعات المنتج"
          >
            <ProductReviewsSection product={product} />
          </section>

          <section
            className="basita-product-related-section"
            aria-label="منتجات مرتبطة"
          >
            <RelatedProducts product={product} />
          </section>
        </div>
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
        .basita-product-page {
          box-sizing: border-box;
        }

        .basita-product-section {
          min-width: 0;
        }

        .basita-product-warning {
          transition:
            box-shadow 180ms ease,
            transform 180ms ease;
        }

        .basita-product-lower-content {
          display: flex;
          flex-direction: column;
          gap: ${t.spacing["6"]};
          margin-top: ${t.spacing["6"]};
        }

        .basita-product-address-section,
        .basita-product-reviews-section,
        .basita-product-related-section {
          min-width: 0;
        }

        @media (max-width: 980px) {
          .basita-product-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .basita-product-info-column {
            max-width: 760px;
            width: 100%;
            margin: 0 auto;
          }
        }

        @media (max-width: 700px) {
          .basita-product-page {
            padding:
              ${t.spacing["4"]}
              ${t.spacing["3"]}
              105px !important;
          }

          .basita-product-grid {
            gap: ${t.spacing["4"]} !important;
          }

          .basita-product-info-column {
            gap: ${t.spacing["3"]} !important;
          }

          .basita-product-lower-content {
            gap: ${t.spacing["5"]};
            margin-top: ${t.spacing["5"]};
          }

          .basita-product-warning {
            margin-bottom: ${t.spacing["4"]} !important;
            padding: ${t.spacing["3"]} !important;
          }
        }

        @media (max-width: 480px) {
          .basita-product-page {
            padding-inline: 12px !important;
            padding-bottom: 100px !important;
          }

          .basita-product-warning {
            font-size: 12px !important;
            line-height: 1.8 !important;
          }

          .basita-product-warning > span:first-child {
            width: 28px !important;
            height: 28px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-product-warning {
            transition: none;
          }
        }
      `}</style>
    </SiteShell>
  );
}