// app/dashboard/shipping/page.tsx
// يجمع 3 endpoints جاهزة بلا تعديل: GET /api/stores/shipping (شركات +
// رسوم المنصة)، GET/POST /api/stores/shipping-zones (المناطق). كل التعديل/
// الحذف يمر عبر مكوّنات shipping/* التي تستدعي [id] routes الجاهزة.
"use client";

import { useEffect, useState } from "react";
import { Truck, Map } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import LoadingState from "@/components/admin/ui/LoadingState";
import ErrorState from "@/components/admin/ui/ErrorState";
import EmptyState from "@/components/admin/ui/EmptyState";
import PlatformFeesInfo from "@/components/dashboard/shipping/PlatformFeesInfo";
import CarrierConnectCard from "@/components/dashboard/shipping/CarrierConnectCard";
import ConnectedCarrierRow from "@/components/dashboard/shipping/ConnectedCarrierRow";
import ShippingZoneForm, { ShippingZoneFormValues } from "@/components/dashboard/shipping/ShippingZoneForm";
import ShippingZoneRow, { ShippingZone } from "@/components/dashboard/shipping/ShippingZoneRow";

interface ConnectedCarrier {
  id: string; carrier: string; isActive: boolean; connectedAt: string;
  lastTestedAt: string | null; lastTestOk: boolean | null; customProviderId: string | null;
}
interface SupportedCarrier { carrier: string; displayNameAr: string }
interface CustomProvider { id: string; carrierKey: string; displayNameAr: string }
interface ShippingData {
  connected: ConnectedCarrier[];
  supported: SupportedCarrier[];
  customProviders: CustomProvider[];
  platformFees: { basitaShippingFee: number; codFee: number };
}

export default function SellerShippingPage() {
  const [data, setData] = useState<ShippingData | null>(null);
  const [zones, setZones] = useState<ShippingZone[] | null>(null);
  const [error, setError] = useState("");
  const [addingZone, setAddingZone] = useState(false);

  const loadCarriers = () => {
    api.get<ShippingData>("/api/stores/shipping").then(setData).catch((err) => {
      setError(err instanceof ApiError ? err.message : "تعذّر تحميل بيانات الشحن");
    });
  };
  const loadZones = () => {
    api.get<{ zones: ShippingZone[] }>("/api/stores/shipping-zones").then((d) => setZones(d.zones)).catch((err) => {
      setError(err instanceof ApiError ? err.message : "تعذّر تحميل مناطق الشحن");
    });
  };

  useEffect(() => { loadCarriers(); loadZones(); }, []);

  const createZone = async (values: ShippingZoneFormValues) => {
    await api.post("/api/stores/shipping-zones", values);
    setAddingZone(false);
    loadZones();
  };

  if (error) return <div style={{ padding: t.spacing["4"] }}><ErrorState message={error} onRetry={() => { setError(""); loadCarriers(); loadZones(); }} /></div>;
  if (!data || !zones) return <LoadingState label="جاري تحميل إعدادات الشحن..." />;

  const connectedCarrierCodes = new Set(data.connected.map((c) => c.carrier));
  const connectedCustomProviderIds = new Set(data.connected.map((c) => c.customProviderId).filter(Boolean));
  const availableToConnect = data.supported.filter((s) => !connectedCarrierCodes.has(s.carrier));
  // ⚠️ شركة مخصَّصة (CUSTOM) تُميَّز بـcustomProviderId لا بكود carrier وحده
  const availableCustomToConnect = data.customProviders.filter((p) => !connectedCustomProviderIds.has(p.id));
  const nameFor = (c: ConnectedCarrier) =>
    c.customProviderId
      ? data.customProviders.find((p) => p.id === c.customProviderId)?.displayNameAr ?? "شركة مخصَّصة"
      : data.supported.find((s) => s.carrier === c.carrier)?.displayNameAr ?? c.carrier;

  return (
    <div style={{ padding: t.spacing["4"] }}>
      <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: t.spacing["6"] }}>
        <div>
          <h1 style={{ fontSize: t.typography.fontSize.xl, color: t.colors.primary[800], margin: `0 0 ${t.spacing["3"]}` }}>الشحن</h1>
          <PlatformFeesInfo basitaShippingFee={data.platformFees.basitaShippingFee} codFee={data.platformFees.codFee} />
        </div>

        <section>
          <h2 style={{ fontSize: t.typography.fontSize.base, color: t.colors.text.dark, margin: `0 0 ${t.spacing["2"]}` }}>شركات الشحن</h2>
          <p style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: 12, color: t.colors.text.mid }}>
            فعّلي أي شركة شحن متاحة لمتجرك بضغطة واحدة — سنستخدمها لحساب
            سعر الشحن الحقيقي عند العميل بصفحة الدفع.
          </p>

          {data.connected.length === 0 ? (
            <EmptyState icon={Truck} message="لا توجد شركة شحن مربوطة بعد" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"], marginBottom: (availableToConnect.length > 0 || availableCustomToConnect.length > 0) ? t.spacing["3"] : 0 }}>
              {data.connected.map((c) => (
                <ConnectedCarrierRow key={c.id} link={c} displayNameAr={nameFor(c)} onChange={loadCarriers} />
              ))}
            </div>
          )}

          {(availableToConnect.length > 0 || availableCustomToConnect.length > 0) && (
            <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
              {availableToConnect.map((s) => (
                <CarrierConnectCard key={s.carrier} carrier={s.carrier} displayNameAr={s.displayNameAr} onConnected={loadCarriers} />
              ))}
              {availableCustomToConnect.map((p) => (
                <CarrierConnectCard key={p.id} carrier="CUSTOM" customProviderId={p.id} displayNameAr={p.displayNameAr} onConnected={loadCarriers} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: t.spacing["2"] }}>
            <div>
              <h2 style={{ fontSize: t.typography.fontSize.base, color: t.colors.text.dark, margin: 0 }}>مناطق الشحن</h2>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: t.colors.text.mid }}>أسعار شحن يدوية حسب المدينة — تُستخدم إن لم تربطي شركة شحن، أو كخيار موازٍ.</p>
            </div>
            {!addingZone && (
              <button
                onClick={() => setAddingZone(true)}
                style={{ padding: "8px 16px", background: t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.full, fontSize: 12, fontWeight: t.typography.fontWeight.bold, cursor: "pointer", flexShrink: 0 }}
              >
                + منطقة جديدة
              </button>
            )}
          </div>

          {addingZone && (
            <div style={{ marginBottom: t.spacing["3"] }}>
              <ShippingZoneForm submitLabel="إنشاء المنطقة" onSubmit={createZone} onCancel={() => setAddingZone(false)} />
            </div>
          )}

          {zones.length === 0 && !addingZone ? (
            <EmptyState icon={Map} message="لا توجد مناطق شحن بعد" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
              {zones.map((z) => (
                <ShippingZoneRow key={z.id} zone={z} onChange={loadZones} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
