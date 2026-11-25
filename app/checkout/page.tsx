// app/checkout/page.tsx
"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { useCurrentUser } from "../providers";
import { useCheckoutCoupon } from "@/hooks/useCheckoutCoupon";
import CheckoutCouponField from "@/components/checkout/CheckoutCouponField";
import { useAddressBook } from "@/hooks/useAddressBook";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import SiteShell from "@/components/layout/SiteShell";
import AddressSelector from "@/components/shared/AddressSelector";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentMethodSelect from "@/components/checkout/PaymentMethodSelect";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import CheckoutConfirmPanel from "@/components/checkout/CheckoutConfirmPanel";
import TrustSidebar from "@/components/checkout/TrustSidebar";
import { CartItemData } from "@/components/cart/types";
import { CheckoutPreview } from "@/components/checkout/OrderPricingSummary";
import { CheckoutEmpty, CheckoutLoading, CheckoutLogin, NoStore } from "@/components/checkout/CheckoutStates";
import c from "@/components/checkout/checkout.module.css";

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const storeId = useSearchParams().get("store");
  const { user, loading: userLoading } = useCurrentUser();
  const addressBook = useAddressBook(!!user);

  const [couponsAvailable, setCouponsAvailable] = useState(false);
  const [items, setItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [fulfillmentMethod, setFulfillmentMethod] = useState<"SHIPPING" | "PICKUP">("SHIPPING");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");

  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const orderItems = useMemo(() => items.map(({ product, quantity, variantId }) => ({
    productId: product.id,
    quantity,
    variantId: variantId ?? undefined,
  })), [items]);

  const coupon = useCheckoutCoupon(storeId, orderItems, couponsAvailable);
  const couponCode = coupon.quote?.couponCode;
  const [previewError, setPreviewError] = useState("");

  const bankTransferAvailable = items[0]?.product.store.subscription?.bankTransferEnabled ?? false;
  const pickupAvailable = items[0]?.product.store.pickupEnabled ?? false;
  const isPickup = fulfillmentMethod === "PICKUP";

  useEffect(() => {
    if (!user) return;
    api
      .get<{ items: CartItemData[]; couponStores: string[] }>("/api/cart")
      .then((d) => { setItems(d.items.filter((i) => i.product.store.id === storeId)); setCouponsAvailable(!!storeId && d.couponStores.includes(storeId)); })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [user, storeId]);

  // ⚠️ معاينة سعرية حقيقية من الـbackend (نفس دوال /api/checkout بالضبط) —
  // تتحدّث تلقائياً عند تغيير العنوان أو طريقة الدفع، بدون أي رقم تقريبي
  useEffect(() => {
    setPreview(null);
    setPreviewError("");
    if (!storeId || !orderItems.length || (!isPickup && !addressBook.selectedAddressId)) {
      setPreviewLoading(false);
      return;
    }
    let current = true;
    setPreviewLoading(true);
    api.post<CheckoutPreview>("/api/checkout/preview", {
      storeId, items: orderItems, couponCode,
      addressId: isPickup ? undefined : addressBook.selectedAddressId,
      paymentMethod, fulfillmentMethod,
    }).then(value => { if (current) setPreview(value); })
      .catch(error => { if (current && couponCode) setPreviewError(error instanceof Error ? error.message : "تعذّرت معاينة سعر الكوبون."); })
      .finally(() => { if (current) setPreviewLoading(false); });
    return () => { current = false; };
  }, [storeId, orderItems, couponCode, addressBook.selectedAddressId, paymentMethod, fulfillmentMethod, isPickup]);

  const handleConfirm = async () => {
    if (!storeId || items.length === 0) return;
    if (!isPickup && !addressBook.selectedAddressId) {
      setPlaceError("اختر عنوان شحن أولاً");
      return;
    }
    if (!agreedToTerms) {
      setPlaceError("يجب الموافقة على الشروط والأحكام وسياسة الخصوصية أولاً");
      return;
    }
    if (coupon.busy || (coupon.savedCode && (!couponCode || previewLoading ||
      preview?.discountAmount !== coupon.quote?.discountAmount))) {
      setPlaceError("انتظري معاينة سعر الكوبون أو أزيليه قبل إتمام الطلب.");
      return;
    }
    setPlacing(true);
    setPlaceError("");
    try {
      const result = await api.post<{ orderId: string; paymentUrl: string | null }>("/api/checkout", {
        storeId,
        items: orderItems,
        couponCode,
        addressId: isPickup ? undefined : addressBook.selectedAddressId,
        paymentMethod,
        fulfillmentMethod,
      });
      // الطلب أُنشئ فعلياً في هذه اللحظة — نُفرّغ هذه العناصر من السلة
      await Promise.all(items.map(({ product, variantId }) => {
        const query = variantId ? `?variantId=${encodeURIComponent(variantId)}` : "";
        return api.delete(`/api/cart/${product.id}${query}`).catch(() => {});
      }));
      coupon.clear();
      window.location.href = result.paymentUrl ?? `/orders/${result.orderId}`;
    } catch (err) {
      setPlaceError(err instanceof ApiError ? err.message : "تعذّر إتمام الطلب");
    } finally {
      setPlacing(false);
    }
  };

  const shell = (children: React.ReactNode) => (
    <SiteShell>
      <div style={{ background: t.colors.heritage.sand }}>{children}</div>
    </SiteShell>
  );

  if (!storeId) return shell(<NoStore />);
  if (userLoading) return shell(<CheckoutLoading />);
  if (!user) return shell(<CheckoutLogin storeId={storeId} />);
  if (loading) return shell(<CheckoutLoading />);
  if (loadError || items.length === 0) return shell(<CheckoutEmpty loadError={loadError} />);

  return (
    <SiteShell>
      <div style={{ background: t.colors.heritage.sand }}>
        <CheckoutStepper current="payment" />
        <main className={c.page} style={{ ...uiVars, maxWidth: 1160 }}>
          <h1 className={c.title} style={{ fontFamily: t.typography.fontFamily.display }}>إتمام الدفع</h1>

          <div className={c.grid}>
            {/* العمود الرئيسي (يمين بالـRTL): العنوان + طريقة الدفع + التأكيد */}
            <div className={c.main}>
              {isPickup ? (
                <p className={c.note}>
                  اخترت الاستلام الشخصي من موقع التاجر — ستظهر بيانات الموقع الدقيقة في صفحة طلبك بعد التأكيد، ولا تحتاج إلى عنوان شحن.
                </p>
              ) : (
                <AddressSelector
                  hasUser={!!user}
                  userLoading={userLoading}
                  addresses={addressBook.addresses}
                  selectedAddressId={addressBook.selectedAddressId}
                  onSelect={addressBook.setSelectedAddressId}
                  showForm={addressBook.showAddressForm}
                  onShowForm={() => addressBook.setShowAddressForm(true)}
                  form={addressBook.addrForm}
                  onFormChange={(k, v) => addressBook.setAddrForm((p) => ({ ...p, [k]: v }))}
                  onSave={addressBook.handleAddAddress}
                />
              )}
              <PaymentMethodSelect
                value={paymentMethod}
                onChange={setPaymentMethod}
                bankTransferAvailable={bankTransferAvailable}
                pickupAvailable={pickupAvailable}
                fulfillmentMethod={fulfillmentMethod}
                onFulfillmentChange={setFulfillmentMethod}
              />
              {(couponsAvailable || coupon.savedCode) && <CheckoutCouponField coupon={coupon} disabled={placing} />}
              {previewError && <p role="alert">{previewError}</p>}
              <CheckoutConfirmPanel
                agreedToTerms={agreedToTerms}
                onAgreeChange={setAgreedToTerms}
                placing={placing}
                placeError={placeError}
                paymentMethod={paymentMethod}
                onConfirm={handleConfirm}
              />
            </div>

            {/* العمود الجانبي: ملخص الطلب + الثقة والدعم */}
            <div className={c.side}>
              <div className={c.sideSummary}>
                <OrderSummary items={items} storeName={items[0].product.store.nameAr} preview={preview} previewLoading={previewLoading} />
              </div>
              <div className={c.sideTrust}>
                <TrustSidebar whatsapp={items[0].product.store.whatsapp} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </SiteShell>
  );
}
