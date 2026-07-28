import { getPublished } from "@/lib/data/content";

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [pages, projects, posts] = await Promise.all([
    getPublished("pages", { limit: 500 }),
    getPublished("projects", { limit: 500 }),
    getPublished("posts", { limit: 500, sort: { publishedAt: -1 } }),
  ]);

  const now = new Date();
  const pageEntries = pages
    .filter((item) => !item.noindex)
    .map((item) => {
      const path = item.route || (item.slug === "home" ? "/" : `/${item.slug}`);
      return {
        url: `${base}${path === "/" ? "" : path}`,
        lastModified: item.updatedAt || item.publishedAt || now,
        changeFrequency: path === "/" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : 0.7,
      };
    });

  return [
    ...pageEntries,
    ...projects.filter((item) => !item.noindex).map((item) => ({
      url: `${base}/works/${item.slug}`,
      lastModified: item.updatedAt || item.publishedAt || now,
      changeFrequency: "monthly",
      priority: 0.8,
    })),
    ...posts.filter((item) => !item.noindex).map((item) => ({
      url: `${base}/blog/${item.slug}`,
      lastModified: item.updatedAt || item.publishedAt || now,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];
}
