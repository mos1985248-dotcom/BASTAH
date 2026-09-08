// components/auth/PasswordStrengthBar.tsx
import { t } from "@/theme";

export default function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const weak = password.length < 8;
  const medium = password.length >= 8 && password.length < 12;
  const color = weak ? t.colors.semantic.danger : medium ? t.colors.gold[600] : t.colors.semantic.success;
  const width = weak ? "30%" : medium ? "65%" : "100%";
  const label = weak ? "ضعيفة" : medium ? "متوسطة" : "قوية";

  return (
    <div>
      <div style={{ height: 3, borderRadius: t.radius.none, background: t.colors.cream.borderLight, overflow: "hidden" }}>
        <div style={{ height: "100%", width, background: color, transition: "all 0.3s" }} />
      </div>
      <p style={{ margin: `${t.spacing["1"]} 0 0`, fontSize: t.typography.fontSize.xs, color }}>{label}</p>
    </div>
  );
}
