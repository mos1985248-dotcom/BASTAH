// app/api/ai/voice/route.ts
// تحويل الصوت إلى نص — لا يستورد أي SDK مباشرة، يمرّ عبر lib/ai/provider.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkAiRateLimit } from "@/lib/rate-limit";
import { detectLanguageFromText } from "@/lib/munira/language";
import { transcribeAudio } from "@/lib/ai/provider";

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = new Set(["audio/webm","audio/mp4","audio/mpeg","audio/wav","audio/ogg"]);

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rateLimitKey = currentUser?.id ?? ip;
  const role = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN" ? "admin"
    : currentUser?.role === "SELLER" ? "seller"
    : currentUser ? "buyer" : "guest";

  const { allowed } = await checkAiRateLimit(role, `voice:${rateLimitKey}`);
  if (!allowed) {
    return NextResponse.json({ error: "وصلتِ للحد اليومي من الرسائل الصوتية" }, { status: 429 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "multipart/form-data مطلوب" }, { status: 400 });

  const audioFile = formData.get("audio");
  if (!(audioFile instanceof File)) return NextResponse.json({ error: "حقل audio مطلوب" }, { status: 400 });
  if (audioFile.size > MAX_AUDIO_BYTES) return NextResponse.json({ error: "الملف الصوتي أكبر من 25MB" }, { status: 413 });
  if (!ALLOWED_AUDIO_TYPES.has(audioFile.type)) return NextResponse.json({ error: "نوع الملف غير مدعوم" }, { status: 400 });

  try {
    const { transcript, whisperLanguage } = await transcribeAudio({
      audioFile,
      userId: currentUser?.id,
      storeId: currentUser?.store?.id ?? undefined,
      route: "/api/ai/voice",
    });

    const textDetection = detectLanguageFromText(transcript);
    return NextResponse.json({
      transcript,
      detectedLanguage: textDetection.primary,
      whisperLanguage,
      isMixed: textDetection.isMixed,
    });
  } catch (err: any) {
    console.error("[voice-transcription-error]", err);
    return NextResponse.json({ error: "تعذّر تحويل الصوت إلى نص" }, { status: 502 });
  }
}
