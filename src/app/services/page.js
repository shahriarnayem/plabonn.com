import { PublicShell } from "@/components/layout/public-shell";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { CtaCard, PageIntroCard, ServiceCard } from "@/components/cards/portfolio-cards";
import { getHomepage, getPageBySlug, getPublished } from "@/lib/data/content";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("services");
  return buildMetadata(page || {}, {
    title: "Services",
    description:
      "WordPress, Elementor, WooCommerce, redesign, speed optimization and website support services.",
  });
}

export default async function ServicesPage() {
  const [services, homepage, page] = await Promise.all([
    getPublished("services", { limit: 50 }),
    getHomepage(),
    getPageBySlug("services"),
  ]);

  return (
    <PublicShell>
      <Breadcrumbs items={[{ label: "Services" }]} />
      <section className="mb-[14px] grid grid-flow-dense grid-cols-1 gap-[14px] sm:grid-cols-2 sm:auto-rows-[calc(50cqw_-_7px)] lg:grid-cols-4 lg:auto-rows-[calc(25cqw_-_10.5px)]">
        <PageIntroCard
          eyebrow="Services"
          title={page?.heading || "Website services built around real business needs."}
          description={
            page?.excerpt ||
            "From design and development to optimization and ongoing support, every service is shaped around a clear outcome."
          }
        />
        {services.map((service) => (
          <ServiceCard key={service.id || service.slug} service={service} />
        ))}
        <CtaCard homepage={homepage} />
      </section>
    </PublicShell>
  );
}
