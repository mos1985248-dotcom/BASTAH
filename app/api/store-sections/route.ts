import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatZodError } from "@/lib/validation";

const sectionId = z.string().cuid();
const sectionInput = z.object({
  name: z.string().trim().min(1, "اكتب اسم القسم").max(60),
  position: z.number().int().min(0).max(999),
}).strict();

async function ownedStoreId() {
  const user = await requireUser();
  if (!user.store) throw new AuthError("لا يوجد متجر مرتبط بحسابك", 403);
  return user.store.id;
}

async function handle(operation: () => Promise<NextResponse>) {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "يوجد قسم بهذا الاسم في متجرك" }, { status: 409 });
    }
    console.error("[store-sections]", error);
    return NextResponse.json({ error: "تعذّر تحديث أقسام المتجر" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const storeId = await ownedStoreId();
    const sections = await prisma.storeSection.findMany({
      where: { storeId },
      orderBy: [{ position: "asc" }, { id: "asc" }],
      select: { id: true, name: true, position: true },
    });
    return NextResponse.json({ sections }, { headers: { "Cache-Control": "private, no-store" } });
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const storeId = await ownedStoreId();
    const parsed = sectionInput.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    const section = await prisma.storeSection.create({ data: { storeId, ...parsed.data } });
    return NextResponse.json({ section }, { status: 201 });
  });
}

export async function PATCH(req: NextRequest) {
  return handle(async () => {
    const storeId = await ownedStoreId();
    const parsed = sectionInput.extend({ id: sectionId }).safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    const { id, ...data } = parsed.data;
    const updated = await prisma.storeSection.updateMany({ where: { id, storeId }, data });
    return updated.count ? NextResponse.json({ ok: true }) : missingSection();
  });
}

export async function DELETE(req: NextRequest) {
  return handle(async () => {
    const storeId = await ownedStoreId();
    const parsed = sectionId.safeParse(req.nextUrl.searchParams.get("id"));
    if (!parsed.success) return NextResponse.json({ error: "معرّف القسم غير صالح" }, { status: 400 });
    const id = parsed.data;
    const removed = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM store_sections WHERE id = ${id} AND "storeId" = ${storeId} FOR UPDATE`;
      if (!rows.length) return false;
      await tx.product.updateMany({ where: { storeId, storeSectionId: id }, data: { storeSectionId: null } });
      await tx.storeSection.delete({ where: { storeId_id: { storeId, id } } });
      return true;
    });
    return removed ? NextResponse.json({ ok: true }) : missingSection();
  });
}

function missingSection() {
  return NextResponse.json({ error: "القسم غير موجود" }, { status: 404 });
}
