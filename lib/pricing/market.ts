export type MarketBand = { lowerMinor: number; upperMinor: number };

type Sale = { orderId: string; storeId: string; categoryId: string; price: number };

function median(sorted: number[]) {
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

export function comparableMarket(sales: Sale[]): MarketBand | null {
  const seen = new Set<string>();
  const byStore = new Map<string, number[]>();
  for (const sale of sales) {
    const price = Math.round(sale.price * 100);
    if (!Number.isSafeInteger(price) || price <= 0 || seen.has(sale.orderId)) continue;
    seen.add(sale.orderId);
    const prices = byStore.get(sale.storeId) ?? [];
    prices.push(price);
    byStore.set(sale.storeId, prices);
  }
  if (seen.size < 15 || byStore.size < 5 || new Set(sales.map(sale => sale.categoryId)).size !== 1) return null;

  // Each store contributes equally, regardless of how many orders it received.
  const typical = [...byStore.values()].map(prices => median(prices.sort((a, b) => a - b))).sort((a, b) => a - b);
  const lower = typical[Math.floor((typical.length - 1) * 0.25)];
  const upper = typical[Math.ceil((typical.length - 1) * 0.75)];
  const middle = median(typical);
  if ((upper - lower) / middle > 0.6) return null;
  return { lowerMinor: Math.max(1, Math.floor(lower / 100) * 100), upperMinor: Math.ceil(upper / 100) * 100 };
}

export function marketPriceDirection(price: bigint, band: MarketBand | null) {
  if (!band) return null;
  const base = price * BigInt(100);
  if (base < BigInt(band.lowerMinor) * BigInt(80)) return "low";
  if (base > BigInt(band.upperMinor) * BigInt(120)) return "high";
  return null;
}
