// components/admin/ui/DataTable.tsx
// جدول عام: عرض <table> حقيقي بالكمبيوتر والتابلت، ويتحول لبطاقات مكدَّسة
// بالجوال (بنفس البيانات بالضبط) بدل تصغير الجدول أفقياً — يمنع أي
// overflow أفقي على الشاشات الصغيرة. التبديل بين العرضين بـCSS فقط.
import s from "../admin-ui.module.css";

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
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" style={c.width ? { width: c.width } : undefined}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((c) => (
                  <td key={c.key}>{c.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={s.cards}>
        {rows.map((row) => (
          <div key={row.id} className={s.card}>
            {columns.filter((c) => !c.hideOnMobile).map((c) => (
              <div key={c.key} className={s.cardRow}>
                <span className={s.cardLabel}>{c.label}</span>
                <span className={s.cardValue}>{c.render(row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
