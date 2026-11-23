// GET / PATCH — إعدادات المركز المالي: وضع الضريبة، التكلفة المباشرة للشحنة المحلية، افتراض السيناريو المختلط.
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminRoute, parseBody } from "@/lib/finance/http";
import { getLocalDirectCostSar, getShipmentGapSharePct, getVatMode, setLocalDirectCostSar, setShipmentGapSharePct, setVatMode } from "@/lib/finance/settings";
import { auditTx, serializable, type Tx } from "@/lib/finance/tx";

export const dynamic = "force-dynamic";

async function read(db?: Tx) {
  const [vatMode, localDirectCostSar, shipmentGapSharePct] = await Promise.all([
    getVatMode(db), getLocalDirectCostSar(db), getShipmentGapSharePct(db),
  ]);
  return { vatMode, localDirectCostSar, shipmentGapSharePct };
}

export const GET = adminRoute(async () => NextResponse.json(await read()));

export const PATCH = adminRoute(async ({ user, req }) => {
  const body = await parseBody(req, z.object({
    vatMode: z.enum(["UNSET", "INCLUSIVE", "EXCLUDED_FROM_CHARGE"]).optional(),
    localDirectCostSar: z.coerce.number().min(0).max(1000).optional(),
    shipmentGapSharePct: z.coerce.number().min(0).max(100).optional(),
  }).refine((v) => Object.keys(v).length > 0, { message: "لا تغييرات" }));
  const settings = await serializable(async (tx) => {
    const before = await read(tx);
    if (body.vatMode !== undefined) await setVatMode(body.vatMode, tx);
    if (body.localDirectCostSar !== undefined) await setLocalDirectCostSar(body.localDirectCostSar, tx);
    if (body.shipmentGapSharePct !== undefined) await setShipmentGapSharePct(body.shipmentGapSharePct, tx);
    const after = await read(tx);
    await auditTx(tx, {
      actorId: user.id, action: "FINANCE_SETTINGS_UPDATED", targetType: "FinanceSettings",
      targetId: "finance", metadata: { before, after },
    });
    return after;
  });
  return NextResponse.json(settings);
});
