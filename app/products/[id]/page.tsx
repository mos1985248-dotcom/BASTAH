// app/products/[id]/page.tsx
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "@/components/product/ProductDetailClient";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: { nameAr: true, shortDescAr: true, price: true, mainImage: true, store: { select: { nameAr: true } } },
  });

  if (!product) {
    return { title: "المنتج غير موجود | بسطة" };
  }

  const description = product.shortDescAr ?? `${product.nameAr} من ${product.store.nameAr} — ${product.price} ر.س، منصة بسطة`;

  return {
    title: `${product.nameAr} | ${product.store.nameAr} | بسطة`,
    description,
    openGraph: {
      title: product.nameAr,
      description,
      images: product.mainImage ? [product.mainImage] : undefined,
      type: "website",
    },
  };
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
