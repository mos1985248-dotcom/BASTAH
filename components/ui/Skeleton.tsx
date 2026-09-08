// components/ui/Skeleton.tsx
// الأنيميشن (@keyframes basita-shimmer) معرّف مرة وحدة بـ app/globals.css —
// هذا المكوّن يستخدمه فقط، ما يكرّره.
import { t } from "@/theme";

export default function Skeleton({
  width = "100%",
  height = 16,
  radius = t.radius.sm,
  style,
}: {
  width?: string | number;
  height?: string | number;
  radius?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: `linear-gradient(90deg, ${t.colors.cream.borderLight} 25%, ${t.colors.cream.border} 50%, ${t.colors.cream.borderLight} 75%)`,
        backgroundSize: "200% 100%",
        animation: "basita-shimmer 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  );
}
