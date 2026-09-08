// components/cart/types.ts
// ⚠️ لا تغيير على /api/cart — فقط تصحيح النوع ليطابق CART_ITEM_SELECT
// الفعلي بالـAPI (كان ناقص variantId/variant رغم أن الـAPI يُرجعهما أصلاً).
export interface CartItemVariant {
  id: string;
  nameAr: string;
  options: { name: string; value: string }[];
  price: number | null;
  quantity: number;
  image: string | null;
}

export interface CartItemData {
  id: string;
  quantity: number;
  variantId: string | null;
  variant: CartItemVariant | null;
  product: {
    id: string;
    nameAr: string;
    mainImage: string | null;
    price: number;
    quantity: number;
    status: string;
    store: {
      id: string; nameAr: string; slug: string; city: string; whatsapp: string | null;
      pickupEnabled: boolean;
      subscription: { bankTransferEnabled: boolean } | null;
    };
  };
}
