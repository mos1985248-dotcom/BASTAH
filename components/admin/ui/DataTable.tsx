// components/admin/ui/DataTable.tsx
// جدول عام: عرض <table> حقيقي بالديسكتوب/التابلت، ويتحول لبطاقات مكدَّسة
// بالجوال (بنفس البيانات بالضبط) بدل تصغير الجدول أفقياً — يمنع أي
// overflow أفقي على الشاشات الصغيرة.
import { t } from "@/theme";

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  hideOnMobile?: boolean;
  width?: string;
}

export default function DataTable<T extends { id: string }>({ columns, rows }: { columns: Column<T>[]; rows: T[] }) {
  return (
    <>
      {/* عرض الجدول — ديسكتوب/تابلت */}
      <div className="basita-admin-table-wrap" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: t.typography.fontSize.sm }}>
          <thead>
            <tr style={{ borderBottom: `1.5px solid ${t.colors.cream.border}` }}>
              {columns.map((c) => (
                <th key={c.key} style={{ textAlign: "start", padding: "10px 12px", color: t.colors.text.mid, fontWeight: t.typography.fontWeight.semibold, fontSize: t.typography.fontSize.xs, width: c.width }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: `1px solid ${t.colors.cream.borderLight}` }}>
                {columns.map((c) => (
                  <td key={c.key} style={{ padding: "12px", color: t.colors.text.body, verticalAlign: "middle" }}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* عرض البطاقات — جوال */}
      <div className="basita-admin-cards-wrap" style={{ display: "none", flexDirection: "column", gap: t.spacing["2"] }}>
        {rows.map((row) => (
          <div key={row.id} style={{ background: t.colors.white, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, padding: t.spacing["3"] }}>
            {columns.filter((c) => !c.hideOnMobile).map((c) => (
              <div key={c.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", gap: t.spacing["2"] }}>
                <span style={{ fontSize: 11, color: t.colors.text.light, flexShrink: 0 }}>{c.label}</span>
                <span style={{ textAlign: "end" }}>{c.render(row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 720px) {
          .basita-admin-table-wrap { display: none !important; }
          .basita-admin-cards-wrap { display: flex !important; }
        }
      `}</style>
    </>
  );
}
