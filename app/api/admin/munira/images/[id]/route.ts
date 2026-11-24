import { authErrorResponse, requireRole } from "@/lib/auth";
import { studioFile } from "@/lib/munira/image-studio";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");
    return await studioFile(`admin:${admin.id}`, params.id, false);
  } catch (error) { return authErrorResponse(error); }
}
