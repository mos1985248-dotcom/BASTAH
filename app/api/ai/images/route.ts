import { AuthError, authErrorResponse, requireActiveStore } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateStudioImage, imageInput, imageQuota, studioSettings } from "@/lib/munira/image-studio";
import { planDisplayName } from "@/lib/entitlements";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
  try {
    const { storeId } = await requireActiveStore();
    const [quota, config, images] = await Promise.all([
      imageQuota(storeId), studioSettings(),
      prisma.muniraImage.findMany({
        where: { scope: `store:${storeId}`, state: "COMPLETE", deletedAt: null },
        select: { id: true, createdAt: true, saved: true }, orderBy: { createdAt: "desc" }, take: 100,
      }),
    ]);
    return Response.json({ quota, requiredPlan: await planDisplayName(quota.requiredPlan), enabled: config.enabled, images }, { headers });
  } catch (error) { return authErrorResponse(error); }
}

export async function POST(req: Request) {
  try {
    const { storeId } = await requireActiveStore();
    const input = imageInput.safeParse(await req.json().catch(() => null));
    if (!input.success) throw new AuthError("أدخل وصفًا صالحًا واختر نوع الصورة ومقاسها.", 400);
    const id = await generateStudioImage(`store:${storeId}`, input.data, storeId);
    return Response.json({ id, quota: await imageQuota(storeId) }, { headers });
  } catch (error) { return authErrorResponse(error); }
}
