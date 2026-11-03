// components/orders/types.ts
export interface OrderDetail {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  codFee: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  shippingCity: string;
  shippingAddress: string;
  store: { nameAr: string; slug: string };
  items: { nameAr: string; quantity: number; total: number }[];
  bankAccount?: { iban: string | null; accountHolder: string | null; bankName: string | null };
  pickupInfo?: { city: string | null; region: string | null; latitude: number | null; longitude: number | null };
  bankTransferSubmittedAt: string | null;
}
