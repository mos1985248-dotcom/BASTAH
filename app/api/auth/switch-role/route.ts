// app/api/auth/switch-role/route.ts
// تبديل حساب تاجر ↔ مشتري — يغيّر User.role فقط، لا يمسّ Store إطلاقاً.
// ⚠️ ADMIN/SUPER_ADMIN غير مسموح لهما بالتبديل (ليسا جزءاً من نظام
// الوضعين BUYER/SELLER أصلاً). BUYER→SELLER بلا متجر سابق لا يُفعَّل هنا —
// يرجع upgradeRequired ليوجَّه التاجر لإنشاء متجر (وهناك يُضبط role=SELLER
// تلقائياً عند الإنشاء، راجع POST /api/stores).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

const SWITCHABLE = ["BUYER", "SELLER"] as const;

export async function PATCH() {
  try {
    const user = await requireUser();

    if (!SWITCHABLE.includes(user.role as (typeof SWITCHABLE)[number])) {
      return NextResponse.json({ error: "هذا الحساب لا يدعم التبديل بين وضعي تاجر ومشتري" }, { status: 403 });
    }

    const target = user.role === "SELLER" ? "BUYER" : "SELLER";

    if (target === "SELLER" && !user.store) {
      return NextResponse.json(
        { error: "لا يوجد متجر مرتبط بحسابك بعد", needsStore: true },
        { status: 409 }
      );
    }

    await prisma.user.update({ where: { id: user.id }, data: { role: target } });

    return NextResponse.json({ role: target });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[PATCH /api/auth/switch-role]", err);
    return NextResponse.json({ error: "تعذّر تبديل الحساب" }, { status: 500 });
  }
}
