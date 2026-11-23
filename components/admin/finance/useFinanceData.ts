// components/admin/finance/useFinanceData.ts — يجلب ملخص الشهر ويعيد الجلب عند الطلب.
"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import type { SummaryResponse } from "./api-types";

export function useFinanceData(year: number, month: number) {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(await api.get<SummaryResponse>(`/api/admin/finance/summary?year=${year}&month=${month}`)); }
    catch (err) { setError(err instanceof ApiError ? err.message : "تعذّر تحميل المركز المالي"); }
    finally { setLoading(false); }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);
  return { data, error, loading, reload: load };
}
