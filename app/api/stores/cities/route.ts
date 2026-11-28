import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GOOD_STANDING_STATUSES } from "@/lib/subscription-limits";

export async function GET() {
  try {
    const rows = await prisma.store.findMany({
      where: { status: "ACTIVE", subscription: { status: { in: GOOD_STANDING_STATUSES } }, city: { not: null } },
      distinct: ["city"], select: { city: true }, orderBy: { city: "asc" },
    });
    const cities = [...new Set(rows.flatMap(row => row.city ? [row.city] : []).filter(city => city.trim().length > 0))].sort((a,b) => a.localeCompare(b,"ar"));
    return NextResponse.json({ cities }, { headers: { "Cache-Control": "public, max-age=0, must-revalidate", "Vercel-CDN-Cache-Control": "public, s-maxage=30" } });
  } catch {
    return NextResponse.json({ error: "تعذّر تحميل المدن" }, { status: 500 });
  }
}
