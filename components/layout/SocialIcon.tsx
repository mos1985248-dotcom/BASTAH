// components/layout/SocialIcon.tsx
// أيقونات SVG بسيطة (خط واحد، currentColor) بدل الإيموجي — أخف، أوضح
// بأي مقاس، وتتلوّن تلقائياً بلون النص الممرَّر (تتماشى مع هوية بسطة
// بدل الاعتماد على ألوان الإيموجي الثابتة من نظام التشغيل).
// تمت مراجعة الدقة والخصائص لتتوافق تماماً مع المعايير الاحترافية لثيم المنصة.

export type SocialPlatform = "instagram" | "tiktok" | "snapchat" | "x" | "whatsapp";

const PATHS: Record<SocialPlatform, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  tiktok: (
    <path d="M14 3v10.5a3 3 0 1 1-2-2.83V8.6a5 5 0 1 0 5 5V8.2a6.5 6.5 0 0 0 3.5 1.02V6.7A4 4 0 0 1 17 3h-3Z" />
  ),
  snapchat: (
    <path d="M12 3c-2.9 0-4.7 2-4.8 4.6-.02.9 0 1.7-.1 2.1-.1.3-.6 1-1.6 1.3-.4.1-.5.6-.2.9.4.5 1.2 1 1.2 1.5 0 .3-.2.6-.7.9-.9.5-.3 1.1.3 1.2.7.1 1.4.3 1.7 1 .4.9 1.4 1.5 2.4 1.5s2-.6 2.4-1.5c.3-.7.6-.9 1.7-1 .6-.1 1.2-.7.3-1.2-.5-.3-.7-.6-.7-.9 0-.5.8-1 1.2-1.5.3-.3.2-.8-.2-.9-1-.3-1.5-1-1.6-1.3-.1-.4-.08-1.2-.1-2.1C16.7 5 14.9 3 12 3Z" />
  ),
  x: <path d="M4 4l7.2 9.6L4.4 20H6l6-6.5 4 6.5h4l-7.5-10L19.5 4H18l-5.5 6-3.7-6H4Z" fill="currentColor" stroke="none" />,
  whatsapp: (
    <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Zm4.6 12.7c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1.1-1.4-1.1-2.7s.7-1.9 1-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.1.1.3 0 .5-.1.2-.2.3-.3.4l-.5.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.2.4-.2.6-.1l1.7.8c.2.1.4.2.4.3.1.2.1.6-.1 1.2Z" />
  ),
};

export default function SocialIcon({ platform, size = 18 }: { platform: SocialPlatform; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {PATHS[platform]}
    </svg>
  );
}