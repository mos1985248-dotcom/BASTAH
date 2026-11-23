import { requireRole, authErrorResponse } from "@/lib/auth";
import { getFeature, planDisplayName } from "@/lib/entitlements";
import { featureCatalog } from "@/lib/feature-catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireRole("SELLER");
    if (!user.store) return Response.json({ error: "لا يوجد متجر مرتبط بحسابك." }, { status: 403 });
    const storeId = user.store.id;
    const rows = await Promise.all(Object.keys(featureCatalog).map(async key => {
      const access = await getFeature(storeId, key);
      return [key, { allowed: access.allowed, requiredPlan: await planDisplayName(access.requiredPlan), reason: access.reason }];
    }));
    return Response.json({ features: Object.fromEntries(rows) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return authErrorResponse(error); }
}
