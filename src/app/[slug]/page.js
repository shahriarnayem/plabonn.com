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
  return buildMetadata(page, { title: page.title, description: page.excerpt });
}

export default async function CmsPage({ params }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page || page.systemPage) notFound();

  return (
    <PublicShell>
      <Breadcrumbs items={[{ label: page.title }]} />
      <section className="bento-grid page-grid">
        <PageIntroCard eyebrow="Page" title={page.heading || page.title} description={page.excerpt} />
        {page.coverImage ? <figure className="card generic-page-cover span-2x1"><img src={page.coverImage} alt={page.title} width="1200" height="600" /></figure> : null}
        <article className="card rich-content-card span-4x1"><BlocksRenderer blocks={page.blocks || []} /></article>
      </section>
    </PublicShell>
  );
}
