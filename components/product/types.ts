// components/product/types.ts
// يطابق حرفياً استجابة GET /api/products/[id] (بعد حذف userId/subscription من store).
// نوع Address انتقل لـ components/shared/address-types.ts (مشترك مع صفحة الدفع).

export interface ProductImageItem {
  id: string;
  url: string;
  thumbnailUrl: string;
  isCover: boolean;
  position: number;
}

export interface ProductVariantItem {
  id: string;
  nameAr: string;
  options: { name: string; value: string }[];
  price: number | null;
  quantity: number;
  sku: string | null;
  image: string | null;
}

export interface ProductStorePublicInfo {
  workingHours: string | null;
  returnPolicyDays: number;
  shippingCoverage: string;
  deliveryPartner: string | null;
  paymentMethods: string[];
  prepTimeDays: string;
}

export interface ProductStore {
  id: string;
  nameAr: string;
  slug: string;
  city: string | null;
  whatsapp: string | null;
  isVerified: boolean;
  logo: string | null;
  avgRating: number;
  totalReviews: number;
  totalFollowers: number;
  publicInfo: ProductStorePublicInfo | null;
  isFollowing?: boolean; // undefined لو زائر غير مسجّل
}

export interface ProductDetail {
  id: string;
  nameAr: string;
  descAr: string | null;
  price: number;
  comparePrice: number | null;
  quantity: number;
  mainImage: string | null;
  videoUrl: string | null;
  avgRating: number;
  totalReviews: number;
  totalSold: number;
  isHandmade: boolean;
  isFeatured: boolean;
  tags: string[];
  productImages: ProductImageItem[];
  variants: ProductVariantItem[];
  category: { nameAr: string; slug: string } | null;
  store: ProductStore;
  subscriptionWarning?: string;
}

export interface ProductReview {
  id: string;
  rating: number;
  comment: string | null;
  images: string[];
  sellerReply: string | null;
  createdAt: string;
  user: { name: string; avatar: string | null };
}

export interface ProductReviewsResponse {
  reviews: ProductReview[];
  total: number;
  page: number;
  limit: number;
  distribution: Record<"5" | "4" | "3" | "2" | "1", number>;
  avgRating: number;
  totalReviews: number;
}
