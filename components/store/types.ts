// components/store/types.ts

// يطابق select في GET /api/stores/[slug] حرفيًا.
// لا نضيف حقولًا غير موجودة في استجابة الـAPI.

export interface StorePublicInfo {
  licenseNumber: string | null;
  workingHours: string | null;

  responseTimeHours: number;

  returnPolicyDays: number;
  shippingCoverage: string;
  deliveryPartner: string | null;
  paymentMethods: string[];

  storyAr: string | null;
  storyTags: string[];

  videoUrl: string | null;

  satisfactionRate: number;
  completedOrders: number;
  prepTimeDays: string;
  responseSpeed: string;
  yearsActive: number;
}

export interface StoreDetail {
  id: string;

  nameAr: string;
  nameEn: string | null;
  slug: string;

  description: string | null;
  shortDesc: string | null;

  logo: string | null;
  coverImage: string | null;
  bannerImages: string[];

  whatsapp: string | null;
  instagram: string | null;

  city: string | null;
  region: string | null;

  isVerified: boolean;
  isFeatured: boolean;

  avgRating: number;
  totalReviews: number;
  totalProducts: number;
  totalOrders: number;
  totalFollowers: number;

  createdAt: string;

  publicInfo: StorePublicInfo | null;
  subscription: {
    plan: string;
  } | null;

  // undefined عندما يكون الزائر غير مسجّل الدخول.
  isFollowing?: boolean;

  // متاحة للعامة بعكس latitude / longitude الخام.
  // راجع تعليق الخصوصية في GET /api/stores/[slug].
  pickupEnabled: boolean;
}

export interface StoreReview {
  id: string;
  rating: number;
  comment: string | null;
  sellerReply: string | null;
  createdAt: string;

  user: {
    name: string;
    avatar: string | null;
  };

  product: {
    nameAr: string;
  } | null;
}

export interface StoreReviewsResponse {
  reviews: StoreReview[];

  total: number;
  page: number;
  limit: number;

  distribution: Record<
    "5" | "4" | "3" | "2" | "1",
    number
  >;

  avgRating: number;
  totalReviews: number;
}