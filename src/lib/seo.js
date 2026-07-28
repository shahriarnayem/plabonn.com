import { getSettings } from "@/lib/data/content";

export async function buildMetadata(content = {}, defaults = {}) {
  const settings = await getSettings();
  const siteName = settings.siteName || "Portfolio";
  const title = content.seoTitle || defaults.title || content.title || settings.defaultSeoTitle || siteName;
  const description = content.seoDescription || defaults.description || content.excerpt || settings.defaultSeoDescription || "";
  const canonical = content.canonicalUrl || defaults.canonical;
  const image = content.ogImage || content.featuredImage || content.coverImage || settings.defaultSocialImage || undefined;
  const robots = {
    index: content.noindex !== true,
    follow: content.nofollow !== true,
  };

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: content.ogTitle || title,
      description: content.ogDescription || description,
      images: image ? [{ url: image }] : undefined,
      type: defaults.type || "website",
    },
    twitter: {
      card: "summary_large_image",
      title: content.ogTitle || title,
      description: content.ogDescription || description,
      images: image ? [image] : undefined,
    },
    robots,
  };
}

export function jsonLd(data) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}


export function absoluteUrl(value = "", base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") {
  if (!value) return undefined;
  try {
    return new URL(value, base).toString();
  } catch {
    return undefined;
  }
}
