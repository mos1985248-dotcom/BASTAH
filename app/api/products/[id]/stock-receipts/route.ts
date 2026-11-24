import { AuthError, authErrorResponse, requireActiveStore } from "@/lib/auth";
import { listStockReceipts, receiveStock, stockReceiptInput } from "@/lib/stock-receipts";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { storeId } = await requireActiveStore();
    const cursor = new URL(req.url).searchParams.get("cursor") ?? undefined;
    if (cursor && cursor.length > 100) throw new AuthError("مؤشر السجل غير صالح.", 400);
    return Response.json(await listStockReceipts(storeId, params.id, cursor), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) { return authErrorResponse(error); }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { storeId } = await requireActiveStore();
    const input = stockReceiptInput.safeParse(await req.json().catch(() => null));
    if (!input.success) throw new AuthError("أدخل كمية صحيحة وسعر شراء للوحدة حتى منزلتين عشريتين.", 400);
    const result = await receiveStock(storeId, params.id, input.data);
    return Response.json(result, { status: result.replayed ? 200 : 201 });
  } catch (error) { return authErrorResponse(error); }
}
