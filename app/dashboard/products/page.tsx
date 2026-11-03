// app/dashboard/products/page.tsx
// الجلب (/api/products?view=seller) كما كان؛ أُضيف بحث وتصفية بالحالة محلياً في الواجهة فقط.
"use client";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, PackageOpen, Plus, Search } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { uiVars } from "@/components/ui/vars";
import ProductStatusBadge from "@/components/dashboard/ProductStatusBadge";
import s from "@/components/dashboard/forms.module.css";

interface ProductRow {
  id: string; nameAr: string; mainImage: string | null; price: number;
  quantity: number; status: string; totalSold: number;
  variants: { id: string; nameAr: string; quantity: number }[];
}

const FILTERS = [
  { value: "", label: "الكل" },
  { value: "ACTIVE", label: "نشط" },
  { value: "DRAFT", label: "مسودة" },
  { value: "OUT_OF_STOCK", label: "نفدت الكمية" },
  { value: "ARCHIVED", label: "مؤرشف" },
];

function Variants({ p }: { p: ProductRow }) {
  if (p.variants.length === 0) return <span className={s.qty}>{p.quantity}</span>;
  return (
    <div>
      <span className={s.qty}>{p.quantity} (كلية)</span>
      <div className={s.vchips}>
        {p.variants.map((v) => (
          <span key={v.id} className={`${s.vchip} ${v.quantity > 0 ? "" : s.vchipOut}`}>{v.nameAr}: {v.quantity}</span>
        ))}
      </div>
    </div>
  );
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .get<{ products: ProductRow[] }>("/api/products?view=seller")
      .then(({ products }) => setProducts(products))
      .catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل المنتجات"))
      .finally(() => setLoading(false));
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () => products.filter((p) => (!filter || p.status === filter) && (!q || p.nameAr.toLowerCase().includes(q))),
    [products, filter, q],
  );
  const countFor = (value: string) => (value ? products.filter((p) => p.status === value).length : products.length);

  return (
    <div className={s.page} style={uiVars}>
      <div className={s.head}>
        <div>
          <h1 className={s.title}>منتجاتي</h1>
          <p className={s.sub}>أدر منتجات متجرك وكمياتها وحالتها</p>
        </div>
        <a href="/dashboard/products/new" className={s.cta}>
          <Plus size={17} strokeWidth={2.2} aria-hidden="true" />
          إضافة منتج
        </a>
      </div>

      {products.length > 0 && (
        <>
          <label className={s.search} style={{ marginBottom: 12 }}>
            <Search size={17} strokeWidth={1.8} aria-hidden="true" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث باسم المنتج" aria-label="بحث في المنتجات" />
          </label>
          <div className={s.chips} role="group" aria-label="تصفية حسب الحالة">
            {FILTERS.map((f) => (
              <button key={f.value} type="button" className={`${s.chip} ${filter === f.value ? s.chipOn : ""}`} aria-pressed={filter === f.value} onClick={() => setFilter(f.value)}>
                {f.label}<span className={s.count}>{countFor(f.value)}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {loading && <p className={s.state} role="status">جاري التحميل...</p>}
      {error && (
        <p className={s.err} role="alert">
          <AlertTriangle size={15} strokeWidth={1.8} aria-hidden="true" />
          {error}
        </p>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className={s.state}>
          <PackageOpen size={32} strokeWidth={1.5} aria-hidden="true" />
          <p className={s.stateTitle}>{products.length === 0 ? "لا توجد منتجات بعد" : "لا توجد منتجات مطابقة"}</p>
          {products.length === 0 && <a href="/dashboard/products/new" className={s.cta}>أضف أول منتج لك</a>}
        </div>
      )}

      {filtered.length > 0 && (
        <>
          <div className={s.table} role="table" aria-label="قائمة المنتجات">
            <div className={`${s.cols} ${s.th}`} role="row">
              <span role="columnheader">المنتج</span>
              <span role="columnheader">السعر</span>
              <span role="columnheader">المخزون</span>
              <span role="columnheader">المبيعات</span>
              <span role="columnheader">الحالة</span>
            </div>
            {filtered.map((p) => (
              <a key={p.id} href={`/dashboard/products/${p.id}/edit`} className={`${s.cols} ${s.row}`} role="row">
                <span className={s.prod}>
                  <span className={s.thumb} style={p.mainImage ? { backgroundImage: `url(${p.mainImage})` } : undefined} aria-hidden="true" />
                  <span className={s.pname}>{p.nameAr}</span>
                </span>
                <span className={s.money}>{p.price} ر.س</span>
                <Variants p={p} />
                <span className={s.qty}>{p.totalSold}</span>
                <span><ProductStatusBadge status={p.status} /></span>
              </a>
            ))}
          </div>
          <ul className={s.cards}>
            {filtered.map((p) => (
              <li key={p.id}>
                <a href={`/dashboard/products/${p.id}/edit`} className={s.card}>
                  <span className={s.thumb} style={p.mainImage ? { backgroundImage: `url(${p.mainImage})` } : undefined} aria-hidden="true" />
                  <span className={s.cardBody}>
                    <span className={s.pname} style={{ display: "block" }}>{p.nameAr}</span>
                    <span className={s.cardMeta} style={{ display: "block" }}>{p.price} ر.س · {p.variants.length > 0 ? `الكمية الكلية: ${p.quantity}` : `الكمية: ${p.quantity}`}</span>
                  </span>
                  <ProductStatusBadge status={p.status} />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
