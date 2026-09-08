// components/account/AddressesList.tsx
import { AlertTriangle } from "lucide-react";
import { t } from "@/theme";

export interface BuyerAddress {
  id: string; label: string; name: string; city: string; address: string; isDefault: boolean;
}

export default function AddressesList({ addresses, loading, error }: { addresses: BuyerAddress[]; loading: boolean; error?: boolean }) {
  if (loading) return <p style={{ color: t.colors.text.mid, fontSize: t.typography.fontSize.sm }}>جاري التحميل...</p>;
  if (error) return (
    <p style={{ display: "flex", alignItems: "center", gap: 6, color: t.colors.semantic.danger, fontSize: t.typography.fontSize.sm }}>
      <AlertTriangle size={15} strokeWidth={1.8} />
      تعذّر تحميل العناوين، حاولي تحديث الصفحة
    </p>
  );
  if (addresses.length === 0) return <p style={{ color: t.colors.text.mid, fontSize: t.typography.fontSize.sm }}>لا توجد عناوين محفوظة — تُضاف تلقائياً عند أول عملية شراء</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
      {addresses.map((a) => (
        <div key={a.id} style={{ background: t.colors.white, borderRadius: t.radius.md, padding: "12px 16px", border: `1px solid ${a.isDefault ? t.colors.primary[800] : t.colors.cream.border}` }}>
          <p style={{ margin: "0 0 2px", fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
            {a.label} {a.isDefault && <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.primary[800] }}>(افتراضي)</span>}
          </p>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>{a.name} — {a.city}، {a.address}</p>
        </div>
      ))}
    </div>
  );
}
