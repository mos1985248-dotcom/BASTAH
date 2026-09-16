// components/auth/PasswordStrengthBar.tsx
import { t } from "@/theme";

export default function PasswordStrengthBar({
  password,
}: {
  password: string;
}) {
  if (!password) return null;

  const weak = password.length < 8;
  const medium = password.length >= 8 && password.length < 12;

  const color = weak
    ? t.colors.semantic.danger
    : medium
      ? t.colors.gold[600]
      : t.colors.semantic.success;

  const width = weak ? "30%" : medium ? "65%" : "100%";

  const label = weak
    ? "ضعيفة"
    : medium
      ? "متوسطة"
      : "قوية";

  return (
    <div
      style={{
        width: "100%",
        marginTop: 2,
      }}
    >
      {/* شريط القوة */}
      <div
        style={{
          height: 5,
          borderRadius: t.radius.full,
          background: t.colors.cream.borderLight,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width,
            background: color,
            borderRadius: t.radius.full,
            transition:
              "width 250ms ease, background-color 250ms ease",
          }}
        />
      </div>

      {/* حالة كلمة المرور */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 5,
        }}
      >
        <span
          style={{
            fontSize: t.typography.fontSize.xs,
            color,
            fontWeight: t.typography.fontWeight.medium,
          }}
        >
          قوة كلمة المرور: {label}
        </span>

        {weak && (
          <span
            style={{
              fontSize: "11px",
              color: t.colors.text.light,
            }}
          >
            استخدم 8 أحرف أو أكثر
          </span>
        )}
      </div>
    </div>
  );
}