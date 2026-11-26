import { z } from "zod";
import { AuthError, authErrorResponse, requireActiveStore } from "@/lib/auth";
import { imageFeedback, imageQuota, reviseStudioImage, saveImageFeedback } from "@/lib/munira/image-studio";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
type Context = { params: { id: string } };
const headers = { "Cache-Control": "private, no-store" };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { storeId } = await requireActiveStore();
    const feedback = imageFeedback.safeParse(await request.json().catch(() => null));
    if (!feedback.success) throw new AuthError("أدخل تقييمًا أو سبب تعديل صالحًا.", 400);
    await saveImageFeedback(`store:${storeId}`, params.id, feedback.data);
    return Response.json({ ok: true }, { headers });
  } catch (error) { return authErrorResponse(error); }
}

const revisionInput = z.object({
  requestId: z.string().uuid(),
  reason: z.string().trim().min(3).max(240),
}).strict();

export async function POST(request: Request, { params }: Context) {
  try {
    const { storeId } = await requireActiveStore();
    const input = revisionInput.safeParse(await request.json().catch(() => null));
    if (!input.success) throw new AuthError("اذكر التعديل المطلوب في الصورة.", 400);
    const id = await reviseStudioImage(storeId, params.id, input.data.requestId, input.data.reason);
    return Response.json({ id, quota: await imageQuota(storeId) }, { headers });
  } catch (error) { return authErrorResponse(error); }
}
