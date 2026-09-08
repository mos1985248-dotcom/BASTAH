// app/store/[slug]/page.tsx
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import StoreDetailClient from "@/components/store/StoreDetailClient";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    select: { nameAr: true, shortDesc: true, city: true, coverImage: true, logo: true },
  });

  if (!store) {
    return { title: "المتجر غير موجود | بسطة" };
  }

  const description = store.shortDesc ?? `${store.nameAr} — متجر سعودي من ${store.city} على منصة بسطة`;

  return {
    title: `${store.nameAr} | بسطة`,
    description,
    openGraph: {
      title: store.nameAr,
      description,
      images: store.coverImage ? [store.coverImage] : store.logo ? [store.logo] : undefined,
      type: "website",
    },
  };
}

export default function StorePage() {
  return <StoreDetailClient />;
}
