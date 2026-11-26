const bundledCovers: Readonly<Record<string, string>> = {
  "start-home-business-online": "/images/blog/startup.webp",
  "pricing-homemade-products": "/images/blog/pricing.webp",
  "simple-inventory-management": "/images/blog/inventory.webp",
  "handmade-product-photography": "/images/blog/photography.webp",
};

export function blogCoverImage(slug: string, coverImage: string | null) {
  if (coverImage?.trim()) return coverImage;
  return Object.prototype.hasOwnProperty.call(bundledCovers, slug) ? bundledCovers[slug] : null;
}
