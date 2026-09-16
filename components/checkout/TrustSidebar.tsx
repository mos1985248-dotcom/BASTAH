// components/checkout/TrustSidebar.tsx

// شارات منصّة ثابتة (نفس مبدأ PLATFORM_BADGES بصفحة المتجر) — قدرات
// حقيقية للمنصة (تشفير AES-256-GCM لمفاتيح الدفع فعلياً — lib/crypto.ts،
// وسياسة الإرجاع الفعلية تُعرض بملخص الطلب لو الحقل مضبوط) وليست أرقاماً
// مُلفَّقة لكل طلب.

import {
  Lock,
  ShieldCheck,
  RotateCcw,
  Star,
  MessageCircle,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { t } from "@/theme";

const TRUST_ITEMS: {
  Icon: LucideIcon;
  title: string;
  body: string;
}[] = [
  {
    Icon: Lock,
    title: "تشفير البيانات",
    body: "تشفير AES 256-bit لكل معاملة",
  },
  {
    Icon: ShieldCheck,
    title: "حماية المعلومات",
    body: "لا نشارك بياناتك مع أي طرف",
  },
  {
    Icon: RotateCcw,
    title: "ضمان الاسترجاع",
    body: "استرجاع سهل حسب سياسة كل متجر",
  },
];

const PAYMENT_BADGES = [
  "VISA",
  "Mastercard",
  "مدى",
  "STC Pay",
  "Apple Pay",
];

export default function TrustSidebar({
  whatsapp,
}: {
  whatsapp?: string | null;
}) {
  return (
    <aside
      dir="rtl"
      className="basita-trust-sidebar"
      aria-label="معلومات الأمان والدعم"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: t.spacing["4"],
      }}
    >
      {/* Trust card */}
      <div
        className="basita-trust-main"
        style={{
          position: "relative",
          overflow: "hidden",
          background: t.colors.primary[900],
          borderRadius: t.radius.lg,
          padding: t.spacing["5"],
          boxShadow: "0 8px 24px rgba(35, 27, 18, 0.14)",
        }}
      >
        {/* Decorative glow */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 130,
            height: 130,
            top: -70,
            insetInlineEnd: -45,
            borderRadius: t.radius.full,
            background: "rgba(255, 255, 255, 0.04)",
          }}
        />

        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 80,
            height: 80,
            bottom: -45,
            insetInlineStart: -25,
            borderRadius: t.radius.full,
            background: "rgba(255, 255, 255, 0.025)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: t.spacing["4"],
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: t.radius.full,
                background: "rgba(255, 255, 255, 0.08)",
                color: t.colors.gold[400],
              }}
            >
              <Star
                size={16}
                strokeWidth={1.8}
                fill={t.colors.gold[400]}
              />
            </span>

            <p
              style={{
                margin: 0,
                color: t.colors.gold[400],
                fontSize: t.typography.fontSize.base,
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.45,
              }}
            >
              تسوّق بثقة وأمان
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: t.spacing["4"],
            }}
          >
            {TRUST_ITEMS.map((it) => {
              const Icon = it.Icon;

              return (
                <div
                  key={it.title}
                  className="basita-trust-item"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: t.spacing["3"],
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 34,
                      height: 34,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: t.radius.md,
                      background: "rgba(255, 255, 255, 0.07)",
                      color: t.colors.gold[400],
                    }}
                  >
                    <Icon
                      size={17}
                      strokeWidth={1.7}
                    />
                  </span>

                  <div
                    style={{
                      minWidth: 0,
                    }}
                  >
                    <p
                      style={{
                        margin: "1px 0 2px",
                        color: t.colors.text.onDark,
                        fontSize: t.typography.fontSize.sm,
                        fontWeight:
                          t.typography.fontWeight.bold,
                        lineHeight: 1.5,
                      }}
                    >
                      {it.title}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        color: t.colors.text.onDarkMuted,
                        fontSize: t.typography.fontSize.xs,
                        lineHeight: 1.7,
                      }}
                    >
                      {it.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* WhatsApp support */}
      {whatsapp && (
        <div
          className="basita-trust-support"
          style={{
            background: t.colors.cream.warm,
            border: `1px solid ${t.colors.cream.border}`,
            borderRadius: t.radius.lg,
            padding: t.spacing["5"],
            textAlign: "center",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 38,
              height: 38,
              margin: `0 auto ${t.spacing["2"]}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: t.radius.full,
              background: t.colors.white,
              color: t.colors.brand.whatsapp,
              boxShadow: "0 3px 10px rgba(75, 56, 34, 0.06)",
            }}
          >
            <MessageCircle
              size={19}
              strokeWidth={1.7}
            />
          </span>

          <p
            style={{
              margin: `0 0 ${t.spacing["1"]}`,
              color: t.colors.text.dark,
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
            }}
          >
            تحتاجين مساعدة؟
          </p>

          <p
            style={{
              margin: `0 0 ${t.spacing["3"]}`,
              color: t.colors.text.mid,
              fontSize: t.typography.fontSize.xs,
              lineHeight: 1.6,
            }}
          >
            تواصلي مع المتجر مباشرة
          </p>

          <a
            href={`https://wa.me/${whatsapp.replace("+", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="التواصل مع المتجر عبر واتساب"
            className="basita-whatsapp-button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              minHeight: 40,
              padding: "8px 18px",
              background: t.colors.brand.whatsapp,
              color: t.colors.white,
              borderRadius: t.radius.full,
              textDecoration: "none",
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.bold,
              transition:
                "transform 160ms ease, box-shadow 160ms ease",
            }}
          >
            <MessageCircle
              size={15}
              strokeWidth={1.8}
            />
            واتساب
          </a>
        </div>
      )}

      {/* Payment badges */}
      <div
        className="basita-trust-payments"
        style={{
          background: t.colors.white,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.lg,
          padding: t.spacing["5"],
          boxShadow: "0 4px 16px rgba(75, 56, 34, 0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: t.spacing["3"],
          }}
        >
          <CheckCircle2
            size={16}
            strokeWidth={1.7}
            color={t.colors.primary[800]}
          />

          <p
            style={{
              margin: 0,
              color: t.colors.text.dark,
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
            }}
          >
            وسائل دفع آمنة ومعتمدة
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {PAYMENT_BADGES.map((b) => (
            <span
              key={b}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 30,
                padding: "4px 10px",
                color: t.colors.text.mid,
                background: t.colors.cream.warm,
                border: `1px solid ${t.colors.cream.border}`,
                borderRadius: t.radius.sm,
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.medium,
              }}
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .basita-whatsapp-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 14px rgba(75, 56, 34, 0.14);
        }

        .basita-whatsapp-button:focus-visible {
          outline: 3px solid ${t.colors.gold[600]};
          outline-offset: 3px;
        }

        @media (max-width: 900px) {
          .basita-trust-sidebar {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .basita-trust-main {
            grid-row: span 2;
          }
        }

        @media (max-width: 600px) {
          .basita-trust-sidebar {
            display: flex !important;
          }

          .basita-trust-main,
          .basita-trust-support,
          .basita-trust-payments {
            padding: ${t.spacing["4"]} !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-whatsapp-button {
            transition: none !important;
          }
        }
      `}</style>
    </aside>
  );
}