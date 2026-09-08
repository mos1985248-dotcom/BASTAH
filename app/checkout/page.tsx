// app/checkout/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useCurrentUser } from "../providers";
import { useAddressBook } from "@/hooks/useAddressBook";
import { t } from "@/theme";
import SiteShell from "@/components/layout/SiteShell";
import AddressSelector from "@/components/shared/AddressSelector";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentMethodSelect from "@/components/checkout/PaymentMethodSelect";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import CheckoutConfirmPanel from "@/components/checkout/CheckoutConfirmPanel";
import TrustSidebar from "@/components/checkout/TrustSidebar";
import { CartItemData } from "@/components/cart/types";
import { CheckoutPreview } from "@/components/checkout/OrderPricingSummary";

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

  const bankTransferAvailable = items[0]?.product.store.subscription?.bankTransferEnabled ?? false;
  const pickupAvailable = items[0]?.product.store.pickupEnabled ?? false;
  const isPickup = fulfillmentMethod === "PICKUP";

  useEffect(() => {
    if (!user) return;
    api
      .get<{ items: CartItemData[] }>("/api/cart")
      .then((d) => setItems(d.items.filter((i) => i.product.store.id === storeId)))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [user, storeId]);

  // ⚠️ معاينة سعرية حقيقية من الـbackend (نفس دوال /api/checkout بالضبط) —
  // تتحدّث تلقائياً عند تغيير العنوان أو طريقة الدفع، بدون أي رقم تقريبي
  useEffect(() => {
    if (!storeId || items.length === 0 || (!isPickup && !addressBook.selectedAddressId)) {
      setPreview(null);
      return;
    }
    setPreviewLoading(true);
    api
      .post<CheckoutPreview>("/api/checkout/preview", {
        storeId,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        addressId: isPickup ? undefined : addressBook.selectedAddressId,
        paymentMethod,
        fulfillmentMethod,
      })
      .then(setPreview)
      .catch(() => setPreview(null))
      .finally(() => setPreviewLoading(false));
  }, [storeId, items, addressBook.selectedAddressId, paymentMethod, fulfillmentMethod, isPickup]);

  const handleConfirm = async () => {
    if (!storeId || items.length === 0) return;
    if (!isPickup && !addressBook.selectedAddressId) {
      setPlaceError("اختاري عنوان شحن أولاً");
      return;
    }
    if (!agreedToTerms) {
      setPlaceError("يجب الموافقة على الشروط والأحكام وسياسة الخصوصية أولاً");
      return;
    }
    setPlacing(true);
    setPlaceError("");
    try {
      const result = await api.post<{ orderId: string; paymentUrl: string | null }>("/api/checkout", {
        storeId,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        addressId: isPickup ? undefined : addressBook.selectedAddressId,
        paymentMethod,
        fulfillmentMethod,
      });
      // الطلب اتنشأ فعلياً بهذي اللحظة — نفضّي هالعناصر من السلة
      await Promise.all(items.map((i) => api.delete(`/api/cart/${i.product.id}`).catch(() => {})));
      window.location.href = result.paymentUrl ?? `/orders/${result.orderId}`;
    } catch (err) {
      setPlaceError(err instanceof ApiError ? err.message : "تعذّر إتمام الطلب");
    } finally {
      setPlacing(false);
    }
  };

  if (!storeId) {
    return (
      <SiteShell>
        <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center", padding: t.spacing["16"], color: t.colors.semantic.danger }}>
          <AlertTriangle size={16} strokeWidth={1.8} />
          لم يتم تحديد المتجر — ارجعي للسلة
        </p>
      </SiteShell>
    );
  }
  if (userLoading || loading) {
    return (
      <SiteShell>
        <p style={{ textAlign: "center", padding: t.spacing["16"], color: t.colors.text.mid }}>جاري التحميل...</p>
      </SiteShell>
    );
  }
  if (!user) {
    return (
      <SiteShell>
        <div style={{ textAlign: "center", padding: t.spacing["16"] }}>
          <p style={{ color: t.colors.text.mid, marginBottom: t.spacing["3"] }}>سجّلي دخولك لإتمام الدفع</p>
          <a href={`/login?redirect=/checkout?store=${storeId}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: t.colors.gold[600], fontWeight: t.typography.fontWeight.bold }}>
            تسجيل الدخول
            <ArrowLeft size={15} strokeWidth={2} />
          </a>
        </div>
      </SiteShell>
    );
  }
  if (loadError || items.length === 0) {
    return (
      <SiteShell>
        <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center", padding: t.spacing["16"], color: t.colors.semantic.danger }}>
          <AlertTriangle size={16} strokeWidth={1.8} />
          {loadError ? "تعذّر تحميل السلة" : "لا توجد منتجات لهذا المتجر بسلتك"}
        </p>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <CheckoutStepper current="payment" />

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: `0 ${t.spacing["5"]} ${t.spacing["10"]}` }}>
        <h1 style={{ fontSize: t.typography.fontSize["2xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], margin: `0 0 ${t.spacing["4"]}` }}>
          إتمام الدفع
        </h1>

        <div className="basita-checkout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr 1fr", gap: t.spacing["5"], alignItems: "start" }}>
          {/* العمود الأول (يمين بالـRTL): ملخص الطلب */}
          <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["4"] }} className="basita-checkout-order">
            <OrderSummary items={items} storeName={items[0].product.store.nameAr} preview={preview} previewLoading={previewLoading} />
          </div>

          {/* العمود الأوسط: العنوان + طريقة الدفع + التأكيد */}
          <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["4"] }}>
            {isPickup ? (
              <div style={{ background: t.colors.cream.warm, borderRadius: t.radius.lg, padding: t.spacing["4"], fontSize: t.typography.fontSize.sm, color: t.colors.text.body }}>
                اخترتِ الاستلام الشخصي من موقع التاجر — بيانات الموقع الدقيقة راح تظهر بصفحة طلبك بعد التأكيد، ما تحتاجين عنوان شحن.
              </div>
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

            <CheckoutConfirmPanel
              agreedToTerms={agreedToTerms}
              onAgreeChange={setAgreedToTerms}
              placing={placing}
              placeError={placeError}
              paymentMethod={paymentMethod}
              onConfirm={handleConfirm}
            />
          </div>

          {/* العمود الثالث: الثقة والدعم */}
          <TrustSidebar whatsapp={items[0].product.store.whatsapp} />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .basita-checkout-grid { grid-template-columns: 1fr !important; }
          .basita-checkout-order { order: -1; }
        }
      `}</style>
    </SiteShell>
  );
}
