import type { ReactNode } from "react";
import SiteShell from "@/components/layout/SiteShell";
import { t } from "@/theme";
import styles from "./legal-page.module.css";

export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SiteShell>
      <main className={styles.content} dir="rtl" style={{ maxWidth: 760, margin: "0 auto", padding: t.spacing["6"] }}>
        <h1 style={{ fontSize: t.typography.fontSize["2xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], marginBottom: t.spacing["1"] }}>
          {title}
        </h1>
        <p style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.light, marginBottom: t.spacing["6"] }}>
          تاريخ المراجعة <time dateTime="2026-11-25">٢٥ نوفمبر ٢٠٢٦</time>
        </p>
        {children}
      </main>
    </SiteShell>
  );
}
