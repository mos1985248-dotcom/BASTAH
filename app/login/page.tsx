
// app/login/page.tsx

import { Suspense } from "react";
import LoadingState from "@/components/admin/ui/LoadingState";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <LoadingState label="جاري تحميل صفحة تسجيل الدخول..." />
      }
    >
      <LoginClient />
    </Suspense>
  );
}
