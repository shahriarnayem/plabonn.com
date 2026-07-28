import { getSettings } from "@/lib/data/content";

export default async function robots() {
  const settings = await getSettings();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (settings.maintenanceMode) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
      sitemap: `${base}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/login", "/api/cms/", "/api/auth/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
