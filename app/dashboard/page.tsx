// app/dashboard/page.tsx
// المنطق (جلب الملخص والمتجر وحالات الدخول) كما كان حرفياً؛ التغيير في التخطيط والعرض فقط.
"use client";

import { useEffect, useState } from "react";
import { Wallet, Receipt, PackageCheck, Eye, Star, AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useCurrentUser } from "../providers";
import { uiVars } from "@/components/ui/vars";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import KpiGridSkeleton from "@/components/dashboard/KpiGridSkeleton";
import SalesTrendChart, { SalesPoint } from "@/components/dashboard/SalesTrendChart";
import RecentOrdersCard from "@/components/dashboard/RecentOrdersCard";
import QuickActionsBar from "@/components/dashboard/QuickActionsBar";
import DaftariDashboardCard from "@/components/dashboard/DaftariDashboardCard";
import StoreSettingsQuickEdit from "@/components/dashboard/StoreSettingsQuickEdit";
import StorePreviewCard from "@/components/dashboard/StorePreviewCard";
import { DashboardOrder } from "@/components/dashboard/RecentOrderRow";
import s from "@/components/dashboard/home.module.css";

interface Summary {
  totalSales: { value: number; changePct: number };
  totalOrders: { value: number; changePct: number };
  totalProducts: { value: number; changePct: number };
  totalVisitors: { value: number; changePct: number };
  rating: { avg: number; count: number };
  salesTrend: SalesPoint[];
  recentOrders: DashboardOrder[];
}

interface FullStore {
  nameAr: string; slug: string; shortDesc: string | null; logo: string | null; coverImage: string | null;
  whatsapp: string | null; city: string | null;
  latitude: number | null; longitude: number | null; pickupEnabled: boolean;
  publicInfo: {
    storyAr: string | null; videoUrl: string | null; storyTags: string[];
    workingHours: string | null; licenseNumber: string | null;
    deliveryPartner: string | null; paymentMethods: string[]; returnPolicyDays: number;
  } | null;
  subscription: { plan: string; status: string } | null;
}

export default function SellerDashboard() {
  const { user, loading: userLoading } = useCurrentUser();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [store, setStore] = useState<FullStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user?.store) return;
    Promise.all([
      api.get<Summary>("/api/dashboard/summary"),
      api.get<{ store: FullStore }>(`/api/stores/${user.store.slug}`),
    ])
      .then(([s, storeRes]) => {
        setSummary(s);
        setStore(storeRes.store);
      })
      .catch((err) => { if (err instanceof ApiError) setError(true); })
      .finally(() => setLoading(false));
  }, [user]);

  const wrap = (children: React.ReactNode) => <div className={s.page} style={uiVars}>{children}</div>;

  if (userLoading) return wrap(<p className={s.muted} role="status">جاري التحميل...</p>);
  if (!user) {
    return wrap(
      <div className={s.empty}>
        <p className={s.emptyTitle}>يجب تسجيل الدخول أولاً</p>
        <a href="/login?redirect=/dashboard" className={s.cta}>تسجيل الدخول</a>
      </div>,
    );
  }
  if (!user.store) {
    return wrap(
      <div className={s.empty}>
        <p className={s.emptyTitle}>لا يوجد متجر مرتبط بحسابك بعد</p>
        <a href="/dashboard/create-store" className={s.cta}>إنشاء متجر</a>
      </div>,
    );
  }

  return (
    <div className={s.page} style={uiVars}>
      <DashboardHeader storeName={store?.nameAr ?? "متجرك"} storeSlug={user.store.slug} subscriptionStatus={store?.subscription?.status} />

      {error && (
        <p className={s.err} role="alert">
          <AlertTriangle size={15} strokeWidth={1.8} aria-hidden="true" />
          تعذّر تحميل بيانات اللوحة، حاول تحديث الصفحة
        </p>
      )}

      {loading ? (
        <KpiGridSkeleton />
      ) : summary ? (
        <div className={s.kpis}>
          <KpiCard icon={Wallet} value={`${summary.totalSales.value.toFixed(0)} ر.س`} label="إجمالي المبيعات (هذا الشهر)" changePct={summary.totalSales.changePct} highlighted />
          <KpiCard icon={Receipt} value={String(summary.totalOrders.value)} label="عدد الطلبات" changePct={summary.totalOrders.changePct} />
          <KpiCard icon={PackageCheck} value={String(summary.totalProducts.value)} label="عدد المنتجات" changePct={summary.totalProducts.changePct} />
          <KpiCard icon={Eye} value={String(summary.totalVisitors.value)} label="الزوار (٣٠ يوم)" changePct={summary.totalVisitors.changePct} />
          <KpiCard icon={Star} value={summary.rating.avg.toFixed(1)} label={`التقييمات (${summary.rating.count})`} />
        </div>
      ) : null}

      <QuickActionsBar />

      {summary && (
        <div className={s.row2}>
          <SalesTrendChart data={summary.salesTrend} />
          <RecentOrdersCard orders={summary.recentOrders} />
        </div>
      )}

      {store && (
        <div className={s.pair}>
          <DaftariDashboardCard plan={store.subscription?.plan ?? "FREE"} />
          <StorePreviewCard store={{ nameAr: store.nameAr, shortDesc: store.shortDesc, logo: store.logo, coverImage: store.coverImage, whatsapp: store.whatsapp, slug: store.slug }} />
        </div>
      )}

      {store && (
        <div id="settings">
          <StoreSettingsQuickEdit
              store={{
                slug: store.slug, nameAr: store.nameAr, logo: store.logo, coverImage: store.coverImage, whatsapp: store.whatsapp, city: store.city,
                storyAr: store.publicInfo?.storyAr ?? null, videoUrl: store.publicInfo?.videoUrl ?? null,
                storyTags: store.publicInfo?.storyTags ?? [], workingHours: store.publicInfo?.workingHours ?? null,
                licenseNumber: store.publicInfo?.licenseNumber ?? null, deliveryPartner: store.publicInfo?.deliveryPartner ?? null,
                paymentMethods: store.publicInfo?.paymentMethods ?? [], returnPolicyDays: store.publicInfo?.returnPolicyDays ?? null,
                latitude: store.latitude, longitude: store.longitude, pickupEnabled: store.pickupEnabled,
              }}
              onSaved={({ nameAr }) => setStore((prev) => (prev ? { ...prev, nameAr } : prev))}
          />
        </div>
      )}
    </div>
  );
}
