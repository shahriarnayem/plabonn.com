import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout/public-shell";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { Icon } from "@/components/icon";
import { getBySlug } from "@/lib/data/content";
import { buildMetadata, jsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = await getBySlug("services", slug);
  if (!service) return {};
  return buildMetadata(service, { title: service.title, description: service.shortDescription });
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = await getBySlug("services", slug);
  if (!service) notFound();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({
        "@context": "https://schema.org",
        "@type": "Service",
        name: service.title,
        description: service.shortDescription,
        provider: { "@type": "ProfessionalService", name: "shahriarr." },
        url: `${base}/services/${service.slug}`,
      })} />
      <Breadcrumbs items={[{ label: "Services", href: "/services" }, { label: service.title }]} />
      <section className="bento-grid page-grid">
        <header className="card service-detail-intro span-2x1">
          <p className="eyebrow">Service</p>
          <h1>{service.title}</h1>
          <p>{service.shortDescription}</p>
        </header>
        <article className="card service-detail-icon span-1x1"><Icon name={service.icon || "code"} size={64} /></article>
        <article className="card service-detail-action span-1x1"><p className="mini-heading">Start a conversation.</p><p>Share your goals, current website and preferred timeline.</p><Link className="button button-primary" href={`${service.ctaUrl || "/contact"}?service=${encodeURIComponent(service.title)}`}>{service.ctaText || "Discuss this service"}<Icon name="arrow" size={15} /></Link></article>
        <article className="card case-study-card span-2x1"><p className="mini-heading">What is included.</p><h2>A focused service shaped around the project.</h2><p>{service.fullDescription}</p></article>
        <article className="card service-features span-2x1"><p className="mini-heading">Deliverables.</p><ul>{(service.features || []).map((feature) => <li key={feature}><Icon name="check" size={15} />{feature}</li>)}</ul></article>
        <article className="card cta-card span-4x1"><div><h2>Ready to move this project forward?</h2><p>Get a clear scope, realistic timeline and practical next step.</p></div><Link className="button button-light" href={`${service.ctaUrl || "/contact"}?service=${encodeURIComponent(service.title)}`}>Get a quote<Icon name="arrow" size={15} /></Link></article>
      </section>
    </PublicShell>
  );
}
