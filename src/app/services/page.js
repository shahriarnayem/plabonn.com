import { PublicShell } from "@/components/layout/public-shell";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { CtaCard, PageIntroCard, ServiceCard } from "@/components/cards/portfolio-cards";
import { getHomepage, getPageBySlug, getPublished } from "@/lib/data/content";
import { BlocksRenderer } from "@/components/content/blocks-renderer";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("services");
  return buildMetadata(page || {}, { title: "Services", description: "WordPress, Elementor, WooCommerce, redesign, speed optimization and website support services." });
}

export default async function ServicesPage() {
  const [services, homepage, page] = await Promise.all([getPublished("services", { limit: 50 }), getHomepage(), getPageBySlug("services")]);
  return (
    <PublicShell>
      <Breadcrumbs items={[{ label: "Services" }]} />
      <section className="bento-grid page-grid">
        <PageIntroCard eyebrow="Services" title={page?.heading || "Website services built around real business needs."} description={page?.excerpt || "From design and development to optimization and ongoing support, every service is shaped around a clear outcome."} />
        {/* <article className="card span-2x1 page-note-card"><p className="mini-heading">how it works.</p><BlocksRenderer blocks={page?.blocks || []} /></article> */}
        {services.map((service) => <ServiceCard key={service.id || service.slug} service={service} />)}
        <CtaCard homepage={homepage} />
      </section>
    </PublicShell>
  );
}
