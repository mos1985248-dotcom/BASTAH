// components/about/PillarIcon.tsx
// أيقونات خطية بسيطة (currentColor) لركائز بسطة الأربع بالـHero — رسم
// أصلي بسيط يعكس المعنى (خريطة/قلب، أيدي، سلة، هاتف آمن).

export type Pillar = "saudi" | "community" | "products" | "secure";

const PATHS: Record<Pillar, React.ReactNode> = {
  saudi: (
    <>
      <path d="M4 8c1-2 3-3 5-2s3 3 2 5-1 4 1 5 4 0 5-2 3-2 5-1" />
      <path
        d="M12 5.5v13"
        fill="none"
        stroke="currentColor"
        strokeWidth={0}
      />
      <path
        d="M12 8.5c.9-.7 1.6-.4 1.6.7s-.9 1.7-1.6 1.1c-.7.6-1.6.2-1.6-1s.7-1.4 1.6-.8Z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),

  community: (
    <path d="M9 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm6 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM4 19c0-2.5 2-4.5 5-4.5s5 2 5 4.5M11 19c0-2.2 1.8-4 4-4s4 1.8 4 4" />
  ),

  products: (
    <path d="M5 9h14l-1.2 9.5a2 2 0 0 1-2 1.5H8.2a2 2 0 0 1-2-1.5L5 9Zm3-2a4 4 0 0 1 8 0" />
  ),

  secure: (
    <>
      <rect x="7" y="4" width="10" height="17" rx="2" />
      <circle
        cx="12"
        cy="14"
        r="1.6"
        fill="currentColor"
        stroke="none"
      />
      <path d="M12 15.6V17" />
    </>
  ),
};

export default function PillarIcon({
  pillar,
  size = 26,
}: {
  pillar: Pillar;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0 }}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[pillar]}
    </svg>
  );
}