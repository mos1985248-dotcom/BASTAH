// components/checkout/CheckoutStepper.tsx
// صفحة /checkout تجمع "إتمام الطلب" (العنوان) و"الدفع" في صفحة واحدة (نفس تدفق /api/checkout)،
// لذا نُبرز الخطوتين معاً كمرحلة نشطة واحدة. خطوة السلة مكتملة دائماً (المستخدم جاء منها).
import { Check } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import s from "./checkout.module.css";

const STEPS = [
  { key: "cart", label: "سلة المشتريات" },
  { key: "details", label: "إتمام الطلب" },
  { key: "payment", label: "الدفع" },
  { key: "confirm", label: "تأكيد الطلب" },
];

export default function CheckoutStepper({ current }: { current: "payment" | "confirm" }) {
  const activeKeys = current === "confirm" ? ["confirm"] : ["details", "payment"];

  return (
    <nav className={s.stepper} style={uiVars} aria-label="مراحل إتمام الطلب">
      <ol className={s.steps}>
        {STEPS.map((step, i) => {
          const isActive = activeKeys.includes(step.key);
          const isDone = step.key === "cart" || (current === "confirm" && step.key !== "confirm");
          const cls = isActive ? s.stepActive : isDone ? s.stepDone : "";
          return (
            <li key={step.key} className={`${s.step} ${cls}`} aria-current={isActive ? "step" : undefined}>
              <span className={s.dot}>
                {isDone && !isActive ? <Check size={17} strokeWidth={2.6} aria-hidden="true" /> : i + 1}
              </span>
              <span className={s.stepLabel}>{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
