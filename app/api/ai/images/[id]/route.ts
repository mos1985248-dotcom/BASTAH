import { AuthError, authErrorResponse, requireActiveStore } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ownedStudioImage, studioFile, studioStorage } from "@/lib/munira/image-studio";

export const dynamic = "force-dynamic";
type Params = { params: { id: string } };

export async function GET(req: Request, { params }: Params) {
  try {
    const { storeId } = await requireActiveStore();
    return await studioFile(`store:${storeId}`, params.id, new URL(req.url).searchParams.get("download") === "1");
  } catch (error) { return authErrorResponse(error); }
}

export async function PATCH(_req: Request, { params }: Params) {
  try {
    const { storeId } = await requireActiveStore();
    const image = await ownedStudioImage(`store:${storeId}`, params.id);
    await prisma.muniraImage.updateMany({ where: { id: image.id, deletedAt: null }, data: { saved: true } });
    return Response.json({ ok: true });
  } catch (error) { return authErrorResponse(error); }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { storeId } = await requireActiveStore();
    const image = await ownedStudioImage(`store:${storeId}`, params.id);
    // Product/store usage creates a separate copy via the existing upload flows.
    const removed = await studioStorage().remove([image.objectPath]);
    if (removed.error) throw new AuthError("تعذّر حذف الصورة حاليًا.", 502);
    await prisma.muniraImage.update({ where: { id: image.id }, data: { deletedAt: new Date(), objectPath: null, saved: false } });
    return Response.json({ ok: true });
  } catch (error) { return authErrorResponse(error); }
}
