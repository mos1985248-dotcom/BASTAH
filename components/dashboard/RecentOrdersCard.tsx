// components/dashboard/RecentOrdersCard.tsx
import { ArrowLeft, Receipt } from "lucide-react";
import { t } from "@/theme";
import RecentOrderRow, { DashboardOrder } from "./RecentOrderRow";

export default function RecentOrdersCard({
  orders,
}: {
  orders: DashboardOrder[];
}) {
  return (
    <section
      className="basita-recent-orders-card"
      style={{
        background: t.colors.cream.card,
        borderRadius: 18,
        border: `1px solid ${t.colors.cream.border}`,
        padding: 18,
        direction: "rtl",
        boxShadow: "0 6px 18px rgba(67,48,29,0.045)",
        minWidth: 0,
      }}
    >
      {/* رأس القسم */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: t.colors.primary[50],
              border: `1px solid ${t.colors.primary[100]}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Receipt
              size={19}
              strokeWidth={1.8}
              color={t.colors.primary[800]}
            />
          </div>

          <div>
            <h3
              style={{
                margin: 0,
                fontFamily: t.typography.fontFamily.heading,
                fontSize: t.typography.fontSize.lg,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.primary[800],
                lineHeight: 1.35,
              }}
            >
              أحدث الطلبات
            </h3>

            <p
              style={{
                margin: "3px 0 0",
                fontSize: t.typography.fontSize.xs,
                color: t.colors.text.mid,
                lineHeight: 1.4,
              }}
            >
              متابعة آخر الطلبات في متجرك
            </p>
          </div>
        </div>

        <a
          href="/dashboard/orders"
          className="basita-recent-orders-view-all basita-btn-interactive"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            minHeight: 34,
            padding: "0 11px",
            borderRadius: t.radius.full,
            background: t.colors.primary[50],
            color: t.colors.primary[800],
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.bold,
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          عرض الكل
          <ArrowLeft
            size={13}
            strokeWidth={2}
            style={{
              transform: "rotate(180deg)",
            }}
          />
        </a>
      </div>

      {/* محتوى الطلبات */}
      {orders.length === 0 ? (
        <div
          style={{
            minHeight: 150,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: `${t.spacing["5"]} 0`,
            color: t.colors.text.mid,
            fontSize: t.typography.fontSize.sm,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: t.colors.cream.warm,
              border: `1px solid ${t.colors.cream.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Receipt
              size={19}
              strokeWidth={1.7}
              color={t.colors.text.light}
            />
          </div>

          <span
            style={{
              fontWeight: t.typography.fontWeight.medium,
            }}
          >
            لا توجد طلبات بعد
          </span>

          <span
            style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.text.light,
            }}
          >
            ستظهر الطلبات الجديدة هنا
          </span>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {orders.map((order) => (
            <RecentOrderRow
              key={order.id}
              order={order}
            />
          ))}
        </div>
      )}
    </section>
  );
}