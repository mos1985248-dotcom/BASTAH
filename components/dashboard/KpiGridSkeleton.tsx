// components/dashboard/KpiGridSkeleton.tsx
import { uiVars } from "@/components/ui/vars";
import Skeleton from "@/components/ui/Skeleton";
import s from "./home.module.css";

export default function KpiGridSkeleton() {
  return (
    <div className={s.kpis} style={uiVars} aria-busy="true" aria-label="جاري تحميل المؤشرات">
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} height={74} radius="18px" />
      ))}
    </div>
  );
}
