// app/api/internal/resolve-domain/route.ts
// يُستخدم من middleware.ts فقط (Edge runtime لا يشغّل Prisma مباشرة، راجع
// التعليق أعلى middleware.ts) لتحويل Host header إلى slug المتجر. لا حاجة
// لتسجيل دخول — النتيجة (slug فقط) هي بالضبط ما يراه أي زائر لهذا الدومين
// أصلاً، فلا معلومة حسّاسة هنا.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host")?.toLowerCase().trim();
  if (!host) return NextResponse.json({ slug: null });

  const store = await prisma.store.findFirst({
    where: { customDomain: host, customDomainEnabled: true, status: "ACTIVE" },
    select: { slug: true },
  });

  return NextResponse.json({ slug: store?.slug ?? null }, { headers: { "Cache-Control": "private, max-age=60" } });
}
