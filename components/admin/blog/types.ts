// components/admin/blog/types.ts

export interface BlogPostListItem {
  id: string;
  titleAr: string;
  slug: string;
  category: string;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
}

export interface BlogPostFull {
  id: string;
  titleAr: string;
  slug: string;
  excerptAr: string | null;
  contentAr: string;
  coverImage: string | null;
  category: string;
  tags: string[];
  authorName: string | null;
  isPublished: boolean;
  isFeatured: boolean;
}

export const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  {
    value: "platform-news",
    label: "أخبار المنصة",
  },
  {
    value: "success-stories",
    label: "قصص نجاح",
  },
  {
    value: "store-management",
    label: "إدارة المتجر",
  },
  {
    value: "crafts",
    label: "حرف يدوية",
  },
];