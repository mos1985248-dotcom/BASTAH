// components/dashboard/StorePreviewCard.tsx
import { ExternalLink, Eye, Store } from "lucide-react";
import { t } from "@/theme";

interface StorePreview {
  nameAr: string;
  shortDesc: string | null;
  logo: string | null;
  coverImage: string | null;
  whatsapp: string | null;
  slug: string;
}

export default function StorePreviewCard({
  store,
}: {
  store: StorePreview;
}) {
  return (
    <section
      className="basita-store-preview-card"
      style={{
        background: t.colors.cream.card,
        borderRadius: 18,
        border: `1px solid ${t.colors.cream.border}`,
        overflow: "hidden",
        direction: "rtl",
        boxShadow: "0 6px 18px rgba(67,48,29,0.045)",
      }}
    >
      {/* رأس البطاقة */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "16px 18px 0",
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
            <Eye
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
              معاينة واجهة المتجر
            </h3>

            <p
              style={{
                margin: "3px 0 0",
                fontSize: t.typography.fontSize.xs,
                color: t.colors.text.mid,
              }}
            >
              نظرة سريعة على شكل متجرك
            </p>
          </div>
        </div>

        <a
          href={`/store/${store.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="basita-store-preview-link basita-btn-interactive"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            minHeight: 34,
            padding: "0 11px",
            borderRadius: t.radius.full,
            color: t.colors.primary[800],
            background: t.colors.primary[50],
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.bold,
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          فتح المتجر
          <ExternalLink size={13} strokeWidth={1.8} />
        </a>
      </div>

      {/* المعاينة */}
      <div
        style={{
          padding: 18,
        }}
      >
        {/* الغلاف */}
        <div
          className="basita-store-preview-cover"
          style={{
            height: 150,
            borderRadius: 16,
            overflow: "hidden",
            position: "relative",
            background: store.coverImage
              ? `url("${store.coverImage}") center / cover no-repeat`
              : `linear-gradient(
                  135deg,
                  ${t.colors.primary[700]},
                  ${t.colors.primary[950]}
                )`,
            boxShadow: "0 8px 20px rgba(67,48,29,0.08)",
          }}
        >
          {/* طبقة خفيفة على الغلاف */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(15,61,46,0.02), rgba(15,61,46,0.22))",
            }}
          />

          {/* العلامة */}
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 8px",
              borderRadius: t.radius.full,
              background: "rgba(15,61,46,0.78)",
              color: t.colors.white,
              fontSize: "10px",
              fontWeight: t.typography.fontWeight.semibold,
              backdropFilter: "blur(4px)",
            }}
          >
            <Store size={12} strokeWidth={1.8} />
            متجرك
          </div>
        </div>

        {/* الشعار والمعلومات */}
        <div
          style={{
            position: "relative",
            marginTop: -28,
            padding: "0 14px",
          }}
        >
          <div
            className="basita-store-preview-logo"
            style={{
              width: 60,
              height: 60,
              borderRadius: 17,
              overflow: "hidden",
              background: store.logo
                ? `url("${store.logo}") center / cover no-repeat`
                : t.colors.gold[100],
              border: `4px solid ${t.colors.cream.card}`,
              boxShadow: "0 6px 16px rgba(67,48,29,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!store.logo && (
              <Store
                size={23}
                strokeWidth={1.7}
                color={t.colors.gold[700]}
              />
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: 10,
            padding: "0 2px",
          }}
        >
          <p
            style={{
              margin: "0 0 5px",
              fontFamily: t.typography.fontFamily.heading,
              fontSize: t.typography.fontSize.lg,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.primary[800],
              lineHeight: 1.4,
            }}
          >
            {store.nameAr}
          </p>

          <p
            style={{
              margin: 0,
              fontSize: t.typography.fontSize.sm,
              color: t.colors.text.mid,
              fontWeight: t.typography.fontWeight.medium,
              lineHeight: t.typography.lineHeight.relaxed,
              minHeight: 44,
            }}
          >
            {store.shortDesc ?? "لا يوجد وصف مختصر بعد"}
          </p>
        </div>
      </div>
    </section>
  );
}