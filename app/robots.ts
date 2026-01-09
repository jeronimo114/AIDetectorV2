import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://veridict.xyz";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/api/", "/suspended", "/maintenance"]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
