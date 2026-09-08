// components/legal/LegalDisclaimer.tsx
import { AlertTriangle } from "lucide-react";
import { t } from "@/theme";

export default function LegalDisclaimer({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: t.spacing["8"], padding: t.spacing["4"], background: t.colors.cream.warm, borderRadius: t.radius.lg, borderRight: `3px solid ${t.colors.gold[600]}` }}>
      <p style={{ display: "flex", alignItems: "flex-start", gap: 6, margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, lineHeight: t.typography.lineHeight.relaxed }}>
        <AlertTriangle size={14} strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 2 }} />
        <span><strong>ملاحظة:</strong> {children}</span>
      </p>
    </div>
  );
}
