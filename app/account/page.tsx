// app/account/page.tsx
// ⚠️ نسخة واقعية من Image 1 المرجعية: حذفت/استبدلت العناصر التي لا يوجد
// لها backend حقيقي ("نقاط بسطة"، "عضو ذهبي"، "محفظتي"، "متاجر المفضلة")
// بدل تلفيق بيانات، ووضعتها كـ"قريباً" بالسايدبار. الباقي (الاسم، الطلبات،
// العناوين، المفضلة، الكوبونات) بيانات حقيقية من الـ API الفعلي.
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api-client";
import { useCurrentUser } from "../providers";
import { t } from "@/theme";
import SiteShell from "@/components/layout/SiteShell";
import AccountHeroCard from "@/components/account/AccountHeroCard";
import StatsRow from "@/components/account/StatsRow";
import OrderStatusSummary from "@/components/account/OrderStatusSummary";
import QuickActions from "@/components/account/QuickActions";
import RecentOrdersList, { BuyerOrder } from "@/components/account/RecentOrdersList";
import AddressesList, { BuyerAddress } from "@/components/account/AddressesList";
import AccountSidebar from "@/components/account/AccountSidebar";
import HelpCard from "@/components/account/HelpCard";

export default function AccountPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [addresses, setAddresses] = useState<BuyerAddress[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(false);
  const [addressesError, setAddressesError] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get<{ orders: BuyerOrder[] }>("/api/orders?view=buyer&limit=20").then((d) => setOrders(d.orders)).catch(() => setOrdersError(true)).finally(() => setOrdersLoading(false));
    api.get<{ addresses: BuyerAddress[] }>("/api/addresses").then((d) => setAddresses(d.addresses)).catch(() => setAddressesError(true)).finally(() => setAddressesLoading(false));
    api.get<{ items: unknown[] }>("/api/wishlist").then((d) => setFavoritesCount(d.items.length)).catch(() => {});
  }, [user]);

  if (userLoading) {
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
          <p style={{ color: t.colors.text.mid, marginBottom: t.spacing["3"] }}>سجّلي دخولك لعرض ملفك الشخصي</p>
          <a href="/login?redirect=/account" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: t.colors.gold[600], fontWeight: t.typography.fontWeight.bold }}>
            تسجيل الدخول
            <ArrowLeft size={15} strokeWidth={2} />
          </a>
        </div>
      </SiteShell>
    );
  }

  const totalSpent = orders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);

  return (
    <SiteShell>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: t.spacing["5"], display: "grid", gridTemplateColumns: "260px 1fr", gap: t.spacing["5"] }} className="basita-account-grid">
        <aside style={{ display: "flex", flexDirection: "column", gap: t.spacing["4"] }}>
          <AccountSidebar />
          <HelpCard />
        </aside>

        <main style={{ display: "flex", flexDirection: "column", gap: t.spacing["5"] }}>
          <AccountHeroCard name={user.name} email={user.email} />
          <StatsRow totalSpent={totalSpent} ordersCount={orders.length} addressesCount={addresses.length} favoritesCount={favoritesCount} />
          <OrderStatusSummary orders={orders} />
          <QuickActions />

          <div id="orders">
            <h2 style={{ fontSize: t.typography.fontSize.lg, color: t.colors.text.dark, marginBottom: t.spacing["3"] }}>طلباتي الأخيرة</h2>
            <RecentOrdersList orders={orders} loading={ordersLoading} error={ordersError} />
          </div>

          <div id="addresses">
            <h2 style={{ fontSize: t.typography.fontSize.lg, color: t.colors.text.dark, marginBottom: t.spacing["3"] }}>عناويني</h2>
            <AddressesList addresses={addresses} loading={addressesLoading} error={addressesError} />
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .basita-account-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </SiteShell>
  );
}
