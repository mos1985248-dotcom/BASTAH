// components/marketplace/Pagination.tsx
import s from "./market.module.css";

// يعرض: الأولى، الأخيرة، والصفحة الحالية وجارتيها — بدل كل الصفحات
function windowed(page: number, pages: number): (number | "gap")[] {
  const keep = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = [...keep].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export default function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <nav className={s.pager} aria-label="الصفحات">
      <button type="button" className={s.pageBtn} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        السابق
      </button>
      {windowed(page, pages).map((p, i) =>
        p === "gap" ? (
          <span key={`g${i}`} className={s.gap} aria-hidden="true">…</span>
        ) : (
          <button
            key={p}
            type="button"
            className={`${s.pageBtn} ${p === page ? s.pageOn : ""}`}
            aria-current={p === page ? "page" : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button type="button" className={s.pageBtn} disabled={page >= pages} onClick={() => onChange(page + 1)}>
        التالي
      </button>
    </nav>
  );
}
