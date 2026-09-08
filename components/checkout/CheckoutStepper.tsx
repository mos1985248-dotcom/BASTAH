// components/checkout/CheckoutStepper.tsx
import { t } from "@/theme";
import { ShoppingCart, FileEdit, CreditCard, Check, type LucideIcon } from "lucide-react";

const STEPS: { key: string; num: number; label: string; Icon: LucideIcon }[] = [
  { key: "cart", num: 1, label: "سلة المشتريات", Icon: ShoppingCart },
  { key: "details", num: 2, label: "إتمام الطلب", Icon: FileEdit },
  { key: "payment", num: 3, label: "الدفع", Icon: CreditCard },
  { key: "confirm", num: 4, label: "تأكيد الطلب", Icon: Check },
];

/**
 * صفحة /checkout الحالية تجمع "إتمام الطلب" (العنوان) و"الدفع" بصفحة واحدة
 * (نفس تدفق /api/checkout الفعلي) — لذا نُبرز الخطوتين معاً كمرحلة نشطة
 * واحدة بدل بناء صفحتين منفصلتين لمرحلة لا تحتاجها الدورة الخلفية فعلياً.
 */
export default function CheckoutStepper({ current }: { current: "payment" | "confirm" }) {
  const activeKeys = current === "confirm" ? ["confirm"] : ["details", "payment"];

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: t.spacing["2"], flexWrap: "wrap", padding: `${t.spacing["4"]} 0` }}>
      {[...STEPS].reverse().map((step, i, arr) => {
        const isActive = activeKeys.includes(step.key);
        const isDone = current === "confirm" && step.key !== "confirm";
        return (
          <div key={step.key} style={{ display: "flex", alignItems: "center", gap: t.spacing["2"] }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: t.radius.full,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isDone ? t.colors.primary[800] : isActive ? t.colors.primary[800] : t.colors.white,
                  border: `2px solid ${isDone || isActive ? t.colors.primary[800] : t.colors.cream.border}`,
                  color: isDone || isActive ? t.colors.white : t.colors.text.light,
                }}
              >
                {isDone ? <Check size={15} strokeWidth={2.2} /> : <step.Icon size={15} strokeWidth={1.8} />}
              </div>
              <span style={{ fontSize: t.typography.fontSize.xs, color: isActive ? t.colors.primary[800] : t.colors.text.light, fontWeight: isActive ? t.typography.fontWeight.bold : t.typography.fontWeight.regular }}>
                {step.label}
              </span>
            </div>
            {i < arr.length - 1 && <div style={{ width: 28, height: 2, background: t.colors.cream.border }} />}
          </div>
        );
      })}
    </div>
  );
}
