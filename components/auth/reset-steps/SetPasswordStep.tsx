// components/auth/reset-steps/SetPasswordStep.tsx
import { Lock, Check } from "lucide-react";
import { t } from "@/theme";
import AuthField from "../AuthField";
import AuthButton from "../AuthButton";
import AuthError from "../AuthError";
import PasswordStrengthBar from "../PasswordStrengthBar";

export default function SetPasswordStep({
  password,
  confirm,
  onPasswordChange,
  onConfirmChange,
  error,
  loading,
  onSubmit,
}: {
  password: string;
  confirm: string;
  onPasswordChange: (v: string) => void;
  onConfirmChange: (v: string) => void;
  error: string;
  loading: boolean;
  onSubmit: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: t.spacing["4"],
        direction: "rtl",
      }}
    >
      {/* العنوان */}
      <div
        style={{
          textAlign: "center",
          marginBottom: t.spacing["1"],
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            margin: `0 auto ${t.spacing["3"]}`,
            borderRadius: 16,
            background: t.colors.primary[50],
            border: `1px solid ${t.colors.primary[100]}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Lock
            size={26}
            strokeWidth={1.8}
            color={t.colors.primary[800]}
          />
        </div>

        <h1
          style={{
            fontFamily: t.typography.fontFamily.heading,
            margin: `0 0 ${t.spacing["2"]}`,
            fontSize: t.typography.fontSize.xl,
            fontWeight: t.typography.fontWeight.bold,
            lineHeight: 1.4,
            color: t.colors.primary[800],
          }}
        >
          كلمة مرور جديدة
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: t.typography.fontSize.sm,
            color: t.colors.text.mid,
            lineHeight: t.typography.lineHeight.relaxed,
          }}
        >
          أنشئ كلمة مرور قوية وآمنة لحسابك.
        </p>
      </div>

      {/* كلمة المرور الجديدة */}
      <div>
        <AuthField
          label="كلمة المرور الجديدة"
          type="password"
          value={password}
          onChange={onPasswordChange}
          placeholder="8 أحرف أو أكثر"
        />

        <PasswordStrengthBar password={password} />
      </div>

      {/* تأكيد كلمة المرور */}
      <AuthField
        label="تأكيد كلمة المرور"
        type="password"
        value={confirm}
        onChange={onConfirmChange}
        placeholder="أعد كتابة كلمة المرور"
      />

      {/* الخطأ */}
      <AuthError message={error} />

      {/* حفظ */}
      <AuthButton
        onClick={onSubmit}
        loading={loading}
        idleLabel={
          <>
            حفظ كلمة المرور الجديدة
            <Check size={15} strokeWidth={2.2} />
          </>
        }
        loadingLabel="جاري المعالجة..."
      />
    </div>
  );
}