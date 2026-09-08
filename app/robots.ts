// app/robots.ts
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://basita.sa";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/admin", "/account", "/cart", "/checkout", "/api", "/login", "/register", "/reset-password"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
