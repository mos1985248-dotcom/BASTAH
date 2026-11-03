
// app/login/page.tsx

import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthShell title="تسجيل الدخول" subtitle="أهلاً بك مجدداً في بسطة" scene="heritage"><div /></AuthShell>}>
      <LoginClient />
    </Suspense>
  );
}
