import { PublicShell } from "@/components/layout/public-shell";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { PageIntroCard } from "@/components/cards/portfolio-cards";
import { ContactForm } from "@/components/forms/contact-form";
import { Icon } from "@/components/icon";
import { getPageBySlug, getPublished, getSettings } from "@/lib/data/content";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("contact");
  return buildMetadata(page || {}, { title: "Contact", description: "Share your website project, redesign, WooCommerce, Elementor or WordPress requirements." });
}

export default async function ContactPage({ searchParams }) {
  const params = await searchParams;
  const [settings, services, page] = await Promise.all([getSettings(), getPublished("services", { limit: 50 }), getPageBySlug("contact")]);
  return (
    <PublicShell>
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <section className="bento-grid page-grid">
        <PageIntroCard eyebrow="Contact" title={page?.heading || "Tell me what you are planning."} description={page?.excerpt || "Share the current situation, the outcome you need and any deadline. You will receive a clear response with the next practical step."} />
        <aside className="card contact-details span-2x1">
          <div><Icon name="mail" size={20} /><span>Email</span><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></div>
          {settings.phone ? <div><Icon name="phone" size={20} /><span>Phone</span><a href={`tel:${settings.phone}`}>{settings.phone}</a></div> : null}
          {settings.location ? <div><Icon name="location" size={20} /><span>Location</span><strong>{settings.location}</strong></div> : null}
          <div><i className="status-dot" /><span>Availability</span><strong>Open for selected projects</strong></div>
        </aside>
        <article className="card contact-form-card span-4x1"><ContactForm services={services} defaultService={params?.service || ""} /></article>
      </section>
    </PublicShell>
  );
}
