import { PublicShell } from "@/components/layout/public-shell";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { PageIntroCard } from "@/components/cards/portfolio-cards";
import { ContactForm } from "@/components/forms/contact-form";
import { Icon } from "@/components/icon";
import {
  getPageBySlug,
  getPublished,
  getSettings,
} from "@/lib/data/content";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("contact");
  return buildMetadata(page || {}, {
    title: "Contact",
    description:
      "Share your website project, redesign, WooCommerce, Elementor or WordPress requirements.",
  });
}

export default async function ContactPage({ searchParams }) {
  const params = await searchParams;
  const [settings, services, page] = await Promise.all([
    getSettings(),
    getPublished("services", { limit: 50 }),
    getPageBySlug("contact"),
  ]);

  return (
    <PublicShell>
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <section className="mb-[14px] grid grid-flow-dense grid-cols-1 gap-[14px] sm:grid-cols-2 sm:auto-rows-[calc(50cqw_-_7px)] lg:grid-cols-4 lg:auto-rows-[calc(25cqw_-_10.5px)]">
        <PageIntroCard
          eyebrow="Contact"
          title={page?.heading || "Tell me what you are planning."}
          description={
            page?.excerpt ||
            "Share the current situation, the outcome you need and any deadline. You will receive a clear response with the next practical step."
          }
        />

        <aside className="relative col-span-1 row-span-1 grid min-w-0 grid-cols-1 content-center gap-5 overflow-hidden rounded-[12px] bg-[var(--card)] p-6 sm:col-span-2 sm:grid-cols-2">
          <div className="grid grid-cols-[24px_1fr] gap-x-3 gap-y-1">
            <span className="row-span-2 text-[var(--accent)]">
              <Icon name="mail" size={20} />
            </span>
            <span className="text-xs uppercase text-[var(--text-faint)]">Email</span>
            <a
              className="break-all text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              href={`mailto:${settings.contactEmail}`}
            >
              {settings.contactEmail}
            </a>
          </div>
          {settings.phone ? (
            <div className="grid grid-cols-[24px_1fr] gap-x-3 gap-y-1">
              <span className="row-span-2 text-[var(--accent)]">
                <Icon name="phone" size={20} />
              </span>
              <span className="text-xs uppercase text-[var(--text-faint)]">Phone</span>
              <a
                className="text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                href={`tel:${settings.phone}`}
              >
                {settings.phone}
              </a>
            </div>
          ) : null}
          {settings.location ? (
            <div className="grid grid-cols-[24px_1fr] gap-x-3 gap-y-1">
              <span className="row-span-2 text-[var(--accent)]">
                <Icon name="location" size={20} />
              </span>
              <span className="text-xs uppercase text-[var(--text-faint)]">Location</span>
              <strong className="text-sm">{settings.location}</strong>
            </div>
          ) : null}
          <div className="grid grid-cols-[24px_1fr] gap-x-3 gap-y-1">
            <i className="row-span-2 mt-1 h-[7px] w-[7px] rounded-full bg-[var(--success)]" />
            <span className="text-xs uppercase text-[var(--text-faint)]">Availability</span>
            <strong className="text-sm">Open for selected projects</strong>
          </div>
        </aside>

        <article className="relative col-span-1 row-span-1 min-w-0 overflow-hidden rounded-[12px] bg-[var(--card)] p-[clamp(22px,4vw,44px)] sm:col-span-2 lg:col-span-4">
          <ContactForm services={services} defaultService={params?.service || ""} />
        </article>
      </section>
    </PublicShell>
  );
}
