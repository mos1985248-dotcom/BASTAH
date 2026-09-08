// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Wallet, Receipt, PackageCheck, Eye, Star, AlertTriangle, ArrowLeft } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useCurrentUser } from "../providers";
import { t } from "@/theme";
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

  if (userLoading) {
    return <p style={{ textAlign: "center", padding: t.spacing["12"], color: t.colors.text.mid }}>جاري التحميل...</p>;
  }
  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: t.spacing["12"] }}>
        <p style={{ color: t.colors.text.mid }}>يجب تسجيل الدخول أولاً</p>
        <a href="/login?redirect=/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: t.colors.gold[600] }}>
          تسجيل الدخول
          <ArrowLeft size={15} strokeWidth={2} />
        </a>
      </div>
    );
  }
  if (!user.store) {
    return (
      <div style={{ textAlign: "center", padding: t.spacing["12"] }}>
        <p style={{ color: t.colors.text.mid }}>لا يوجد متجر مرتبط بحسابك بعد</p>
        <a href="/dashboard/create-store" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: t.colors.gold[600] }}>
          إنشاء متجر
          <ArrowLeft size={15} strokeWidth={2} />
        </a>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader storeName={store?.nameAr ?? "متجرك"} storeSlug={user.store.slug} subscriptionStatus={store?.subscription?.status} />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: t.spacing["5"], display: "flex", flexDirection: "column", gap: t.spacing["5"] }}>
        {error && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, color: t.colors.semantic.danger }}>
            <AlertTriangle size={15} strokeWidth={1.8} />
            تعذّر تحميل بيانات اللوحة، حاول تحديث الصفحة
          </p>
        )}

        {loading ? (
          <KpiGridSkeleton />
        ) : summary ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: t.spacing["3"] }}>
            <KpiCard icon={Wallet} value={`${summary.totalSales.value.toFixed(0)} ر.س`} label="إجمالي المبيعات (هذا الشهر)" changePct={summary.totalSales.changePct} highlighted />
            <KpiCard icon={Receipt} value={String(summary.totalOrders.value)} label="عدد الطلبات" changePct={summary.totalOrders.changePct} />
            <KpiCard icon={PackageCheck} value={String(summary.totalProducts.value)} label="عدد المنتجات" changePct={summary.totalProducts.changePct} />
            <KpiCard icon={Eye} value={String(summary.totalVisitors.value)} label="الزوار (٣٠ يوم)" changePct={summary.totalVisitors.changePct} />
            <KpiCard icon={Star} value={summary.rating.avg.toFixed(1)} label={`التقييمات (${summary.rating.count})`} />
          </div>
        ) : null}

        <QuickActionsBar />

        {summary && <SalesTrendChart data={summary.salesTrend} />}

        {store && <DaftariDashboardCard plan={store.subscription?.plan ?? "FREE"} />}

        {summary && <RecentOrdersCard orders={summary.recentOrders} />}

        {store && (
          <div id="settings" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: t.spacing["4"] }} className="basita-dashboard-settings-grid">
            <StoreSettingsQuickEdit
              store={{
                slug: store.slug, logo: store.logo, coverImage: store.coverImage, whatsapp: store.whatsapp, city: store.city,
                storyAr: store.publicInfo?.storyAr ?? null, videoUrl: store.publicInfo?.videoUrl ?? null,
                storyTags: store.publicInfo?.storyTags ?? [], workingHours: store.publicInfo?.workingHours ?? null,
                licenseNumber: store.publicInfo?.licenseNumber ?? null, deliveryPartner: store.publicInfo?.deliveryPartner ?? null,
                paymentMethods: store.publicInfo?.paymentMethods ?? [], returnPolicyDays: store.publicInfo?.returnPolicyDays ?? null,
                latitude: store.latitude, longitude: store.longitude, pickupEnabled: store.pickupEnabled,
              }}
            />
            <StorePreviewCard store={{ nameAr: store.nameAr, shortDesc: store.shortDesc, logo: store.logo, coverImage: store.coverImage, whatsapp: store.whatsapp, slug: store.slug }} />
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 760px) {
          .basita-dashboard-settings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
