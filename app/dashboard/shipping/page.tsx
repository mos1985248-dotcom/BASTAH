// app/dashboard/shipping/page.tsx
// يجمع 3 endpoints جاهزة بلا تعديل: GET /api/stores/shipping (شركات +
// رسوم المنصة)، GET/POST /api/stores/shipping-zones (المناطق). كل التعديل/
// الحذف يمر عبر مكوّنات shipping/* التي تستدعي [id] routes الجاهزة.
// المنطق كما كان حرفياً؛ التغيير في التخطيط والعرض والصياغة فقط (مؤشرات + عمودان + بطاقات).
"use client";
import { useEffect, useState } from "react";
import { Truck, Map, MapPin, Plus, Info, CheckCircle2 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { uiVars } from "@/components/ui/vars";
import LoadingState from "@/components/dashboard/ui/LoadingState";
import ErrorState from "@/components/dashboard/ui/ErrorState";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import PlatformFeesInfo from "@/components/dashboard/shipping/PlatformFeesInfo";
import CarrierConnectCard from "@/components/dashboard/shipping/CarrierConnectCard";
import ConnectedCarrierRow from "@/components/dashboard/shipping/ConnectedCarrierRow";
import ShippingZoneForm, { ShippingZoneFormValues } from "@/components/dashboard/shipping/ShippingZoneForm";
import ShippingZoneRow, { ShippingZone } from "@/components/dashboard/shipping/ShippingZoneRow";
import ShipKpi from "@/components/dashboard/shipping/ShipKpi";
import f from "@/components/dashboard/forms.module.css";
import c from "@/components/dashboard/shipping/shipping.module.css";

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

  const wrap = (children: React.ReactNode) => <div className={c.page} style={uiVars}>{children}</div>;

  if (error) return wrap(<ErrorState message={error} onRetry={() => { setError(""); loadCarriers(); loadZones(); }} />);
  if (!data || !zones) return wrap(<LoadingState label="جاري تحميل إعدادات الشحن..." />);

  const connectedCarrierCodes = new Set(data.connected.map((c) => c.carrier));
  const connectedCustomProviderIds = new Set(data.connected.map((c) => c.customProviderId).filter(Boolean));
  const availableToConnect = data.supported.filter((s) => !connectedCarrierCodes.has(s.carrier));
  // ⚠️ شركة مخصَّصة (CUSTOM) تُميَّز بـcustomProviderId لا بكود carrier وحده
  const availableCustomToConnect = data.customProviders.filter((p) => !connectedCustomProviderIds.has(p.id));
  const availableCount = availableToConnect.length + availableCustomToConnect.length;

  const nameFor = (c: ConnectedCarrier) =>
    c.customProviderId
      ? data.customProviders.find((p) => p.id === c.customProviderId)?.displayNameAr ?? "شركة مخصَّصة"
      : data.supported.find((s) => s.carrier === c.carrier)?.displayNameAr ?? c.carrier;

  return wrap(
    <>
      <header className={c.head}>
        <span className={c.headIcon}>
          <Truck size={26} strokeWidth={1.7} aria-hidden="true" />
        </span>
        <div>
          <h1 className={c.title}>الشحن</h1>
          <p className={c.sub}>اربط شركات الشحن وحدّد أسعار التوصيل لمناطقك</p>
        </div>
      </header>

      <div className={c.kpis}>
        <ShipKpi icon={CheckCircle2} label="شركات الشحن المفعّلة" value={String(data.connected.filter((x) => x.isActive).length)} />
        <ShipKpi icon={MapPin} label="مناطق الشحن" value={String(zones.length)} />
        <PlatformFeesInfo basitaShippingFee={data.platformFees.basitaShippingFee} codFee={data.platformFees.codFee} />
      </div>

      <p className={c.note}>
        <Info size={17} strokeWidth={1.8} aria-hidden="true" />
        رسوم بسطة مارت التشغيلية ورسوم الدفع عند الاستلام تُضاف تلقائياً فوق سعر الشحن الفعلي بكل عملية، وتُضبط من قِبل إدارة المنصة ولا يمكن تعديلها من هنا.
      </p>

      <div className={c.cols}>
        <section className={c.panel} aria-labelledby="ship-carriers">
          <div className={c.panelHead}>
            <div className={c.panelLead}>
              <span className={c.panelIcon}><Truck size={21} strokeWidth={1.7} aria-hidden="true" /></span>
              <div>
                <h2 id="ship-carriers" className={c.panelTitle}>شركات الشحن</h2>
                <p className={c.panelSub}>فعّل أي شركة شحن متاحة لمتجرك بضغطة واحدة — سنستخدمها لحساب سعر الشحن الحقيقي عند العميل بصفحة الدفع.</p>
              </div>
            </div>
          </div>

          <div className={c.panelBody}>
            <div className={c.group}>
              <h3 className={c.groupTitle}>
                الشركات المفعّلة لمتجرك <span className={c.count}>{data.connected.length}</span>
              </h3>
              {data.connected.length === 0 ? (
                <EmptyState icon={Truck} message="لا توجد شركة شحن مربوطة بعد" />
              ) : (
                data.connected.map((x) => (
                  <ConnectedCarrierRow key={x.id} link={x} displayNameAr={nameFor(x)} onChange={loadCarriers} />
                ))
              )}
            </div>

            {availableCount > 0 && (
              <div className={c.group}>
                <h3 className={c.groupTitle}>
                  شركات متاحة للتفعيل <span className={c.count}>{availableCount}</span>
                </h3>
                {availableToConnect.map((sc) => (
                  <CarrierConnectCard key={sc.carrier} carrier={sc.carrier} displayNameAr={sc.displayNameAr} onConnected={loadCarriers} />
                ))}
                {availableCustomToConnect.map((p) => (
                  <CarrierConnectCard key={p.id} carrier="CUSTOM" customProviderId={p.id} displayNameAr={p.displayNameAr} onConnected={loadCarriers} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className={c.panel} aria-labelledby="ship-zones">
          <div className={c.panelHead}>
            <div className={c.panelLead}>
              <span className={c.panelIcon}><Map size={21} strokeWidth={1.7} aria-hidden="true" /></span>
              <div>
                <h2 id="ship-zones" className={c.panelTitle}>مناطق الشحن</h2>
                <p className={c.panelSub}>أسعار شحن يدوية حسب المدينة — تُستخدم إن لم تربط شركة شحن، أو كخيار موازٍ.</p>
              </div>
            </div>
            {!addingZone && (
              <button type="button" className={`${f.btnSm} ${f.btnPrimary}`} onClick={() => setAddingZone(true)}>
                <Plus size={15} strokeWidth={2.2} aria-hidden="true" />
                منطقة جديدة
              </button>
            )}
          </div>

          <div className={c.panelBody}>
            {addingZone && <ShippingZoneForm submitLabel="إنشاء المنطقة" onSubmit={createZone} onCancel={() => setAddingZone(false)} />}
            {zones.length === 0 && !addingZone ? (
              <EmptyState icon={Map} message="لا توجد مناطق شحن بعد" />
            ) : (
              zones.map((z) => <ShippingZoneRow key={z.id} zone={z} onChange={loadZones} />)
            )}
          </div>
        </section>
      </div>
    </>,
  );
}
