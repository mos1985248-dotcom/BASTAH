import { prisma } from "@/lib/prisma";
import { normalizeArabic, publicKnowledge } from "./public-guide";
import type { FAQItem } from "@/components/faq/faq-data";

type Published = { question: string; answer: string; aliases: string[] };
export function mergeKnowledge(rows: Published[]) {
  const byKey = new Map<string, FAQItem>(publicKnowledge.map(item => [normalizeArabic(item.question), item]));
  for (const row of rows) {
    const key = normalizeArabic(row.question);
    const original = byKey.get(key);
    byKey.set(key, { ...original, question: original?.question ?? row.question, answer: row.answer });
  }
  return { items: [...byKey.values()], rows };
}
export async function loadPublicKnowledge() {
  try {
    const rows = await prisma.muniraKnowledgeArticle.findMany({
      where: { published: true }, select: { question: true, answer: true, aliases: true },
      orderBy: { questionKey: "asc" }, take: 100,
    });
    return mergeKnowledge(rows);
  } catch {
    // Allows the old public FAQ to work before the additive migration is deployed.
    return mergeKnowledge([]);
  }
}
export function matchPublishedAlias(message: string, knowledge: ReturnType<typeof mergeKnowledge>) {
  const key = normalizeArabic(message);
  const matches = knowledge.rows.filter(row => [row.question, ...row.aliases].some(text => normalizeArabic(text) === key));
  if (matches.length !== 1) return null;
  return knowledge.items.find(item => normalizeArabic(item.question) === normalizeArabic(matches[0].question)) ?? null;
}
