// app/account/page.tsx
// ⚠️ نسخة واقعية من Image 1 المرجعية: عناصر لا يوجد لها backend حقيقي
// ("نقاط بسطة"، "عضو ذهبي"، "محفظتي"، "تقييماتي"، "محادثاتي") أُزيلت بالكامل
// (لا سايدبار "قريباً") بدل تلفيق بيانات أو وعد بميزة غير مجدولة. الباقي
// (الاسم، الطلبات، العناوين، المفضلة، الكوبونات) بيانات حقيقية من الـ API الفعلي.
// المنطق (الجلب والإجمالي) كما كان حرفياً؛ التغيير في العرض فقط.
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api-client";
import { useCurrentUser } from "../providers";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import SiteShell from "@/components/layout/SiteShell";
import AccountHeroCard from "@/components/account/AccountHeroCard";
import StatsRow from "@/components/account/StatsRow";
import OrderStatusSummary from "@/components/account/OrderStatusSummary";
import QuickActions from "@/components/account/QuickActions";
import RecentOrdersList, { BuyerOrder } from "@/components/account/RecentOrdersList";
import AddressesList, { BuyerAddress } from "@/components/account/AddressesList";
import AccountSidebar from "@/components/account/AccountSidebar";
import HelpCard from "@/components/account/HelpCard";
import RoleSwitchCard from "@/components/account/RoleSwitchCard";
import s from "@/components/account/account.module.css";

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

  const shell = (children: React.ReactNode) => (
    <SiteShell>
      <div className={s.bg} style={uiVars}>
        <main className={s.page} style={{ maxWidth: t.layout.containerMaxWidth }}>
          {children}
        </main>
      </div>
    </SiteShell>
  );

  if (userLoading) return shell(<p className={s.state} role="status">جاري التحميل...</p>);

  if (!user) {
    return shell(
      <div className={s.state}>
        <p>سجّل دخولك لعرض ملفك الشخصي</p>
        <a href="/login?redirect=/account" className={s.stateLink}>
          تسجيل الدخول
          <ArrowLeft size={15} strokeWidth={2} />
        </a>
      </div>,
    );
  }

  const totalSpent = orders.filter((o) => o.status !== "CANCELLED").reduce((sum, o) => sum + o.total, 0);

  return shell(
    <div className={s.layout}>
      <div className={s.side}>
        <AccountSidebar />
      </div>

      <div className={s.main}>
        <AccountHeroCard name={user.name} email={user.email} />
        <RoleSwitchCard role={user.role} />
        <StatsRow totalSpent={totalSpent} ordersCount={orders.length} addressesCount={addresses.length} favoritesCount={favoritesCount} />
        <OrderStatusSummary orders={orders} />
        <QuickActions />

        <section id="orders">
          <h2 className={s.h2}>طلباتي الأخيرة</h2>
          <RecentOrdersList orders={orders} loading={ordersLoading} error={ordersError} />
        </section>

        <section id="addresses">
          <h2 className={s.h2}>عناويني</h2>
          <AddressesList addresses={addresses} loading={addressesLoading} error={addressesError} />
        </section>
      </div>

      <div className={s.helpArea}>
        <HelpCard />
      </div>
    </div>,
  );
}
