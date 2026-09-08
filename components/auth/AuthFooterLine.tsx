// components/auth/AuthFooterLine.tsx
import { t } from "@/theme";

export default function AuthFooterLine({
  prompt,
  linkLabel,
  href,
}: {
  prompt: string;
  linkLabel: string;
  href: string;
}) {
  return (
    <p
      style={{
        textAlign: "center",
        fontSize: t.typography.fontSize.sm,
        color: t.colors.text.mid,
        margin: 0,
      }}
    >
      {prompt}{" "}
      <a href={href} style={{ color: t.colors.gold[600], fontWeight: t.typography.fontWeight.bold, textDecoration: "none" }}>
        {linkLabel}
      </a>
    </p>
  );
}
