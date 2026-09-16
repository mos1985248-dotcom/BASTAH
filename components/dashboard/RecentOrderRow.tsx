// components/dashboard/RecentOrderRow.tsx
import { ShoppingBag, ChevronLeft } from "lucide-react";
import { t } from "@/theme";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
} from "@/lib/order-status";

export interface DashboardOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  buyer: {
    name: string;
  };
  items: {
    nameAr: string;
  }[];
}

export default function RecentOrderRow({
  order,
}: {
  order: DashboardOrder;
}) {
  const statusStyle =
    ORDER_STATUS_COLOR[order.status] ??
    ORDER_STATUS_COLOR.PENDING;

  const firstItem = order.items[0]?.nameAr ?? "منتج";
  const itemCount = order.items.length;

  return (
    <a
      href={`/dashboard/orders/${order.id}`}
      className="basita-recent-order-link"
      style={{
        display: "block",
        width: "100%",
        textDecoration: "none",
      }}
    >
      <div
        className="basita-card-interactive basita-recent-order"
        style={{
          background: t.colors.cream.card,
          borderRadius: 16,
          border: `1px solid ${t.colors.cream.border}`,
          padding: "13px 15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
          direction: "rtl",
          boxSizing: "border-box",
          minWidth: 0,
        }}
      >
        {/* معلومات الطلب */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            minWidth: 0,
            flex: 1,
          }}
        >
          {/* أيقونة الطلب */}
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
            <ShoppingBag
              size={18}
              strokeWidth={1.8}
              color={t.colors.primary[800]}
            />
          </div>

          {/* النص */}
          <div
            style={{
              minWidth: 0,
            }}
          >
            <p
              style={{
                margin: "0 0 4px",
                fontFamily: t.typography.fontFamily.base,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.primary[800],
                lineHeight: 1.4,
              }}
            >
              {order.orderNumber}
            </p>

            <p
              style={{
                margin: 0,
                fontFamily: t.typography.fontFamily.base,
                fontSize: t.typography.fontSize.xs,
                color: t.colors.text.mid,
                fontWeight: t.typography.fontWeight.medium,
                lineHeight: 1.6,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 360,
              }}
            >
              {order.buyer.name} · {firstItem}
              {itemCount > 1 ? ` + ${itemCount - 1}` : ""}
            </p>
          </div>
        </div>

        {/* السعر والحالة */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              textAlign: "left",
            }}
          >
            <p
              style={{
                margin: "0 0 5px",
                fontFamily: t.typography.fontFamily.base,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.text.dark,
                direction: "ltr",
                whiteSpace: "nowrap",
              }}
            >
              {order.total} ر.س
            </p>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 25,
                padding: "0 9px",
                borderRadius: t.radius.full,
                background: statusStyle.bg,
                color: statusStyle.color,
                fontFamily: t.typography.fontFamily.base,
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.bold,
                whiteSpace: "nowrap",
              }}
            >
              {ORDER_STATUS_LABEL[order.status] ??
                order.status}
            </span>
          </div>

          {/* سهم الانتقال */}
          <ChevronLeft
            size={17}
            strokeWidth={1.8}
            color={t.colors.text.light}
            style={{
              flexShrink: 0,
            }}
          />
        </div>
      </div>
    </a>
  );
}