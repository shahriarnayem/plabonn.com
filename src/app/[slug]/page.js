import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout/public-shell";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { BlocksRenderer } from "@/components/content/blocks-renderer";
import { PageIntroCard } from "@/components/cards/portfolio-cards";
import { getPageBySlug } from "@/lib/data/content";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page || page.systemPage) return {};
  return buildMetadata(page, {
    title: page.title,
    description: page.excerpt,
  });
}

export default async function CmsPage({ params }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page || page.systemPage) notFound();

  return (
    <PublicShell>
      <Breadcrumbs items={[{ label: page.title }]} />
      <section className="mb-[14px] grid grid-flow-dense grid-cols-1 gap-[14px] sm:grid-cols-2 sm:auto-rows-[calc(50cqw_-_7px)] lg:grid-cols-4 lg:auto-rows-[calc(25cqw_-_10.5px)]">
        <PageIntroCard
          eyebrow="Page"
          title={page.heading || page.title}
          description={page.excerpt}
        />
        {page.coverImage ? (
          <figure className="relative col-span-1 row-span-1 min-w-0 overflow-hidden rounded-[12px] bg-[var(--card-soft)] sm:col-span-2">
            <img
              className="h-full w-full object-cover"
              src={page.coverImage}
              alt={page.title}
              width="1200"
              height="600"
            />
          </figure>
        ) : null}
        <article className="relative col-span-1 row-span-1 min-w-0 overflow-hidden rounded-[12px] bg-[var(--card)] p-[clamp(26px,5vw,60px)] sm:col-span-2 lg:col-span-4">
          <BlocksRenderer blocks={page.blocks || []} />
        </article>
      </section>
    </PublicShell>
  );
}
