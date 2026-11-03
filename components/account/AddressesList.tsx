// components/account/AddressesList.tsx
import { AlertTriangle } from "lucide-react";
import s from "./account.module.css";

export interface BuyerAddress {
  id: string; label: string; name: string; city: string; address: string; isDefault: boolean;
}

export default function AddressesList({ addresses, loading, error }: { addresses: BuyerAddress[]; loading: boolean; error?: boolean }) {
  if (loading) return <p className={s.note} role="status">جاري التحميل...</p>;
  if (error) return (
    <p className={s.error} role="alert">
      <AlertTriangle size={16} strokeWidth={1.8} />
      تعذّر تحميل العناوين، حاول تحديث الصفحة
    </p>
  );
  if (addresses.length === 0) return <p className={s.note}>لا توجد عناوين محفوظة — تُضاف تلقائياً عند أول عملية شراء</p>;

  return (
    <ul className={s.rows}>
      {addresses.map((a) => (
        <li key={a.id} className={`${s.addr} ${a.isDefault ? s.addrDefault : ""}`}>
          <p className={s.rowTitle}>
            {a.label} {a.isDefault && <span className={s.addrTag}>(افتراضي)</span>}
          </p>
          <p className={s.rowMeta}>{a.name} — {a.city}، {a.address}</p>
        </li>
      ))}
    </ul>
  );
}
