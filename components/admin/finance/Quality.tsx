// components/admin/finance/Quality.tsx — وسم جودة الرقم: مؤكَّد / تقديري / ناقص (لا نعرض تقديراً كأنه رقم دقيق).
import s from "./finance.module.css";

export type Q = "OK" | "EST" | "BAD";
const LABEL: Record<Q, string> = { OK: "مؤكَّد", EST: "تقديري", BAD: "ناقص" };
const CLS: Record<Q, string> = { OK: s.qOk, EST: s.qEst, BAD: s.qBad };

export default function Quality({ q, title }: { q: Q; title?: string }) {
  return <span className={`${s.q} ${CLS[q]}`} title={title}>{LABEL[q]}</span>;
}
