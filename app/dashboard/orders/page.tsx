// app/dashboard/orders/page.tsx
// المنطق (جلب /api/orders?view=seller&limit=50 والتصفية بالحالة) كما كان؛ أُضيف بحث محلي وعدّادات في الواجهة فقط.
"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Receipt, Search } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";
import { uiVars } from "@/components/ui/vars";
import s from "@/components/dashboard/orders.module.css";

interface SellerOrder {
  id: string; orderNumber: string; status: string; paymentStatus: string; total: number;
  createdAt: string; buyer: { name: string }; items: { nameAr: string }[];
}

const STATUS_FILTERS = [
  { value: "", label: "الكل" },
  { value: "PENDING", label: "بانتظار الدفع" },
  { value: "CONFIRMED", label: "مؤكد" },
  { value: "PROCESSING", label: "قيد التجهيز" },
  { value: "SHIPPED", label: "تم الشحن" },
  { value: "DELIVERED", label: "تم التسليم" },
  { value: "CANCELLED", label: "ملغي" },
];

const PAYMENT_LABEL: Record<string, string> = { PAID: "مدفوع", PENDING: "بانتظار الدفع", FAILED: "فشل الدفع", REFUNDED: "مسترجع" };
const payClass = (st: string) => (st === "PAID" ? s.paid : st === "FAILED" ? s.failed : s.unpaid);
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("ar-SA-u-ca-gregory", { day: "numeric", month: "short" });

function StatusBadge({ status }: { status: string }) {
  const color = ORDER_STATUS_COLOR[status] ?? ORDER_STATUS_COLOR.PENDING;
  return <span className={s.badge} style={{ color: color.color, background: color.bg }}>{ORDER_STATUS_LABEL[status] ?? status}</span>;
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get<{ orders: SellerOrder[] }>("/api/orders?view=seller&limit=50")
      .then((d) => setOrders(d.orders))
      .catch((err) => { if (err instanceof ApiError) setError(true); })
      .finally(() => setLoading(false));
  }, []);

  const q = query.trim().toLowerCase();
  const byStatus = filter ? orders.filter((o) => o.status === filter) : orders;
  const filtered = useMemo(
    () => (q ? byStatus.filter((o) => `${o.orderNumber} ${o.buyer.name} ${o.items[0]?.nameAr ?? ""}`.toLowerCase().includes(q)) : byStatus),
    [byStatus, q],
  );
  // العدّادات من الطلبات المحمّلة فقط (آخر 50)؛ لا نعرضها لو بلغنا الحد لأنها ستصبح ناقصة
  const showCounts = orders.length < 50;
  const countFor = (value: string) => (value ? orders.filter((o) => o.status === value).length : orders.length);

  return (
    <div className={s.page} style={uiVars}>
      <div className={s.head}>
        <div>
          <h1 className={s.title}>الطلبات</h1>
          <p className={s.sub}>تابع طلبات متجرك وحدّث حالتها</p>
        </div>
        <label className={s.search}>
          <Search size={17} strokeWidth={1.8} aria-hidden="true" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث برقم الطلب أو اسم العميل" aria-label="بحث في الطلبات" />
        </label>
      </div>

      <div className={s.chips} role="group" aria-label="تصفية حسب الحالة">
        {STATUS_FILTERS.map((f) => (
          <button key={f.value} type="button" className={`${s.chip} ${filter === f.value ? s.chipOn : ""}`} aria-pressed={filter === f.value} onClick={() => setFilter(f.value)}>
            {f.label}
            {showCounts && !loading && <span className={s.count}>{countFor(f.value)}</span>}
          </button>
        ))}
      </div>

      {loading && <p className={s.state} role="status">جاري التحميل...</p>}
      {error && (
        <p className={s.err} role="alert">
          <AlertTriangle size={15} strokeWidth={1.8} aria-hidden="true" />
          تعذّر تحميل الطلبات
        </p>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className={s.state}>
          <Receipt size={32} strokeWidth={1.5} aria-hidden="true" />
          <p className={s.stateTitle}>{q || filter ? "لا توجد طلبات مطابقة" : "لا توجد طلبات بعد"}</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <>
          <div className={s.table} role="table" aria-label="قائمة الطلبات">
            <div className={`${s.cols} ${s.th}`} role="row">
              <span role="columnheader">رقم الطلب</span>
              <span role="columnheader">العميل</span>
              <span role="columnheader">المنتج</span>
              <span role="columnheader">التاريخ</span>
              <span role="columnheader">الدفع</span>
              <span role="columnheader">الحالة</span>
              <span role="columnheader">الإجمالي</span>
            </div>
            {filtered.map((o) => (
              <a key={o.id} href={`/dashboard/orders/${o.id}`} className={`${s.cols} ${s.row}`} role="row">
                <span className={s.num}>{o.orderNumber}</span>
                <span className={s.cell}>{o.buyer.name}</span>
                <span className={`${s.cell} ${s.muted}`}>{o.items[0]?.nameAr}{o.items.length > 1 ? ` +${o.items.length - 1}` : ""}</span>
                <span className={`${s.cell} ${s.muted}`}>{fmtDate(o.createdAt)}</span>
                <span className={`${s.pay} ${payClass(o.paymentStatus)}`}>{PAYMENT_LABEL[o.paymentStatus] ?? o.paymentStatus}</span>
                <span><StatusBadge status={o.status} /></span>
                <span className={s.money}>{o.total} ر.س</span>
              </a>
            ))}
          </div>

          <ul className={s.cards}>
            {filtered.map((o) => (
              <li key={o.id}>
                <a href={`/dashboard/orders/${o.id}`} className={s.card}>
                  <span className={s.cardTop}>
                    <span className={s.num}>{o.orderNumber}</span>
                    <StatusBadge status={o.status} />
                  </span>
                  <span className={s.cardMid} style={{ display: "-webkit-box" }}>{o.buyer.name} · {o.items[0]?.nameAr}</span>
                  <span className={s.cardBot}>
                    <span className={s.money}>{o.total} ر.س</span>
                    <span className={`${s.pay} ${payClass(o.paymentStatus)}`}>{PAYMENT_LABEL[o.paymentStatus] ?? o.paymentStatus}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
