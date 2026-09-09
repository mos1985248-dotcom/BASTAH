
// app/dashboard/subscription/return/page.tsx
// صفحة العودة من Moyasar بعد الدفع.
// useSearchParams موجود داخل Client Component منفصل حتى لا يفشل
// Next.js أثناء prerendering.

import { Suspense } from "react";
import LoadingState from "@/components/admin/ui/LoadingState";
import SubscriptionReturnClient from "./SubscriptionReturnClient";

export default function SubscriptionReturnPage() {
  return (
    <Suspense
      fallback={
        <LoadingState label="جاري تحميل صفحة الدفع..." />
      }
    >
      <SubscriptionReturnClient />
    </Suspense>
  );
}


