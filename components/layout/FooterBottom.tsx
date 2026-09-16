// components/layout/FooterBottom.tsx
import { t } from "@/theme";
import { SOCIAL_LINKS, SocialLinks } from "@/lib/social-links";
import SocialIcon, { SocialPlatform } from "./SocialIcon";

const SOCIAL_META: {
  key: keyof SocialLinks;
  platform: SocialPlatform;
  label: string;
}[] = [
  { key: "instagram", platform: "instagram", label: "إنستقرام" },
  { key: "tiktok", platform: "tiktok", label: "تيك توك" },
  { key: "snapchat", platform: "snapchat", label: "سناب شات" },
  { key: "x", platform: "x", label: "إكس" },
  { key: "whatsapp", platform: "whatsapp", label: "واتساب" },
];

const ACTIVE_SOCIALS = SOCIAL_META.filter((s) =>
  Boolean(SOCIAL_LINKS[s.key]),
);

const PAYMENT_METHODS = ["Visa", "Mastercard", "مدى", "Apple Pay", "STC Pay"];

export default function FooterBottom() {
  return (
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div
        className="basita-footer-bottom-inner"
        style={{
          maxWidth: t.layout.containerMaxWidth,
          margin: "0 auto",
          padding: `${t.spacing["6"]} ${t.spacing["4"]}`,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: t.spacing["4"],
        }}
      >
        <span
          style={{
            color: t.colors.text.onDarkMuted,
            fontSize: t.typography.fontSize.sm,
          }}
        >
          بسطة © 2026 — جميع الحقوق محفوظة
        </span>

        <div
          style={{
            display: "flex",
            gap: t.spacing["2"],
            flexWrap: "wrap",
          }}
        >
          {PAYMENT_METHODS.map((m) => (
            <span
              key={m}
              style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.text.onDarkMuted,
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: t.radius.sm,
                padding: `${t.spacing["1"]} ${t.spacing["3"]}`,
              }}
            >
              {m}
            </span>
          ))}
        </div>

        {ACTIVE_SOCIALS.length > 0 && (
          <div
            className="basita-footer-socials"
            style={{
              display: "flex",
              gap: t.spacing["3"],
            }}
          >
            {ACTIVE_SOCIALS.map((s) => (
              <a
                key={s.key}
                href={SOCIAL_LINKS[s.key] as string}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="basita-social-icon"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 38,
                  height: 38,
                  borderRadius: t.radius.full,
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: t.colors.text.onDarkMuted,
                  transition:
                    `color ${t.motion.fast} ${t.motion.ease}, ` +
                    `border-color ${t.motion.fast} ${t.motion.ease}`,
                }}
              >
                <SocialIcon platform={s.platform} size={18} />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}