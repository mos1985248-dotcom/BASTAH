import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guestBuyerId, guestOrderId, guestOrderIdPattern, guestSession } from "@/lib/guest-order-session";

export async function GET(req: NextRequest) {
  let id = req.nextUrl.searchParams.get("id") ?? "";
  const attempt = req.nextUrl.searchParams.get("attempt");
  const session = guestSession(req);
  if (session && attempt && /^[a-f0-9-]{36}$/i.test(attempt)) id = guestOrderId(attempt, session);
  const headers = { "Cache-Control": "no-store" };
  const denied = () => NextResponse.json({ error: "الطلب غير متاح" }, { status: 404, headers });
  const token = session ?? req.cookies.get("bastah_guest_" + id.slice(-24))?.value;
  if (!guestOrderIdPattern.test(id) || !token || !/^[a-f0-9]{64}$/.test(token)) return denied();
  const order = await prisma.order.findFirst({
    where: { id, buyerId: guestBuyerId(token) },
    select: { id: true, orderNumber: true, status: true, paymentStatus: true, total: true, createdAt: true },
  });
  return order ? NextResponse.json(order, { headers }) : denied();
}
