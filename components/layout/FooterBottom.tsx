
// components/layout/FooterBottom.tsx

import { SOCIAL_LINKS, SocialLinks } from "@/lib/social-links";
import SocialIcon, { SocialPlatform } from "./SocialIcon";
import styles from "./FooterBottom.module.css";

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

export default function FooterBottom() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        {/* حقوق النشر */}
        <span className={styles.copyright}>
          بسطة مارت © 2026 — جميع الحقوق محفوظة
        </span>

        {/* وسائل التواصل الرسمية */}
        {ACTIVE_SOCIALS.length > 0 && (
          <div
            className={styles.socials}
            aria-label="حسابات بسطة على وسائل التواصل"
          >
            {ACTIVE_SOCIALS.map((s) => (
              <a
                key={s.key}
                href={SOCIAL_LINKS[s.key] as string}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.label}
                className={styles.social}
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
