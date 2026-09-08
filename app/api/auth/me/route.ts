// app/api/auth/me/route.ts
// يرجع بيانات المستخدم الحالي + ملخص متجره إن وُجد.
// يُستخدم عند تحميل أي صفحة محمية لمعرفة "من المستخدم؟ هل له متجر؟".

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "غير مسجّل الدخول" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      store: user.store, // { id, slug, status } أو null
    },
  });
}
