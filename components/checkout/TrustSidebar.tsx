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
        gap: t.spacing["2"],
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
          padding: t.spacing["4"],
          boxShadow: "0 5px 16px rgba(35, 27, 18, 0.10)",
        }}
      >
        {/* Decorative glow */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 110,
            height: 110,
            top: -60,
            insetInlineEnd: -40,
            borderRadius: t.radius.full,
            background: "rgba(255, 255, 255, 0.04)",
          }}
        />

        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 65,
            height: 65,
            bottom: -38,
            insetInlineStart: -20,
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
              gap: 7,
              marginBottom: t.spacing["3"],
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 29,
                height: 29,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: t.radius.full,
                background: "rgba(255, 255, 255, 0.08)",
                color: t.colors.gold[400],
              }}
            >
              <Star
                size={14}
                strokeWidth={1.8}
                fill={t.colors.gold[400]}
              />
            </span>

            <p
              style={{
                margin: 0,
                color: t.colors.gold[400],
                fontSize: t.typography.fontSize.sm,
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
              gap: t.spacing["3"],
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
                    gap: 9,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 31,
                      height: 31,
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
                      size={15}
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
                        margin: "1px 0 1px",
                        color: t.colors.text.onDark,
                        fontSize: 13,
                        fontWeight:
                          t.typography.fontWeight.bold,
                        lineHeight: 1.45,
                      }}
                    >
                      {it.title}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        color: t.colors.text.onDarkMuted,
                        fontSize: 11,
                        lineHeight: 1.6,
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
            padding: t.spacing["4"],
            textAlign: "center",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 34,
              height: 34,
              margin: `0 auto ${t.spacing["2"]}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: t.radius.full,
              background: t.colors.white,
              color: t.colors.brand.whatsapp,
              boxShadow: "0 2px 7px rgba(75, 56, 34, 0.045)",
            }}
          >
            <MessageCircle
              size={17}
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
              margin: `0 0 ${t.spacing["2"]}`,
              color: t.colors.text.mid,
              fontSize: 11,
              lineHeight: 1.55,
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
              gap: 6,
              minHeight: 37,
              padding: "7px 16px",
              background: t.colors.brand.whatsapp,
              color: t.colors.white,
              borderRadius: t.radius.full,
              textDecoration: "none",
              fontSize: 11,
              fontWeight: t.typography.fontWeight.bold,
              transition:
                "transform 160ms ease, box-shadow 160ms ease",
            }}
          >
            <MessageCircle
              size={14}
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
          padding: t.spacing["4"],
          boxShadow: "0 3px 12px rgba(75, 56, 34, 0.035)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: t.spacing["2"],
          }}
        >
          <CheckCircle2
            size={15}
            strokeWidth={1.7}
            color={t.colors.primary[800]}
          />

          <p
            style={{
              margin: 0,
              color: t.colors.text.dark,
              fontSize: 13,
              fontWeight: t.typography.fontWeight.bold,
            }}
          >
            وسائل دفع آمنة ومعتمدة
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 5,
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
                minHeight: 27,
                padding: "3px 8px",
                color: t.colors.text.mid,
                background: t.colors.cream.warm,
                border: `1px solid ${t.colors.cream.border}`,
                borderRadius: t.radius.sm,
                fontSize: 10,
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
          box-shadow: 0 4px 12px rgba(75, 56, 34, 0.12);
        }

        .basita-whatsapp-button:focus-visible {
          outline: 3px solid ${t.colors.gold[600]};
          outline-offset: 3px;
        }

        @media (max-width: 900px) {
          .basita-trust-sidebar {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: ${t.spacing["2"]} !important;
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
            padding: ${t.spacing["3"]} !important;
          }
        }

        @media (max-width: 400px) {
          .basita-trust-item {
            gap: 8px !important;
          }

          .basita-trust-item > span:first-child {
            width: 29px !important;
            height: 29px !important;
          }

          .basita-trust-item p:first-child {
            font-size: 12px !important;
          }

          .basita-trust-item p:last-child {
            font-size: 10px !important;
          }

          .basita-trust-payments > div:first-child p {
            font-size: 12px !important;
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