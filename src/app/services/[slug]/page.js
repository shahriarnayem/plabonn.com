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
  return buildMetadata(service, {
    title: service.title,
    description: service.shortDescription,
  });
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = await getBySlug("services", slug);
  if (!service) notFound();

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.title,
          description: service.shortDescription,
          provider: { "@type": "ProfessionalService", name: "shahriarr." },
          url: `${base}/services/${service.slug}`,
        })}
      />
      <Breadcrumbs
        items={[
          { label: "Services", href: "/services" },
          { label: service.title },
        ]}
      />
      <section className="mb-[14px] grid grid-flow-dense grid-cols-1 gap-[14px] sm:grid-cols-2 sm:auto-rows-[calc(50cqw_-_7px)] lg:grid-cols-4 lg:auto-rows-[calc(25cqw_-_10.5px)]">
        <header className="relative col-span-1 row-span-1 min-w-0 overflow-hidden rounded-[12px] bg-[var(--card)] p-[30px] sm:col-span-2">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-soft)]">
            Service
          </p>
          <h1 className="text-[clamp(24px,4vw,32px)] font-bold uppercase leading-[1.16] tracking-[-0.03em]">
            {service.title}
          </h1>
          <p className="mt-4 max-w-[70ch] text-sm text-[var(--text-soft)]">
            {service.shortDescription}
          </p>
        </header>

        <article className="relative col-span-1 row-span-1 grid min-w-0 place-items-center overflow-hidden rounded-[12px] bg-[var(--card)] text-[var(--accent)]">
          <Icon name={service.icon || "code"} size={64} />
        </article>

        <article className="relative col-span-1 row-span-1 flex min-w-0 flex-col justify-between gap-5 overflow-hidden rounded-[12px] bg-[var(--card)] p-[22px]">
          <div>
            <p className="mb-3 text-xs font-bold lowercase tracking-[0.04em]">
              start a conversation.
            </p>
            <p className="text-sm text-[var(--text-soft)]">
              Share your goals, current website and preferred timeline.
            </p>
          </div>
          <Link
            className="inline-flex min-h-[38px] w-fit items-center justify-center gap-2.5 rounded-[7px] bg-[var(--accent)] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.015em] text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            href={`${service.ctaUrl || "/contact"}?service=${encodeURIComponent(service.title)}`}
          >
            {service.ctaText || "Discuss this service"}
            <Icon name="arrow" size={15} />
          </Link>
        </article>

        <article className="relative col-span-1 row-span-1 min-w-0 overflow-auto rounded-[12px] bg-[var(--card)] p-7 sm:col-span-2">
          <p className="mb-3 text-xs font-bold lowercase tracking-[0.04em]">
            what is included.
          </p>
          <h2 className="mb-3 text-lg font-bold leading-[1.16] tracking-[-0.03em]">
            A focused service shaped around the project.
          </h2>
          <p className="text-sm text-[var(--text-soft)]">{service.fullDescription}</p>
        </article>

        <article className="relative col-span-1 row-span-1 min-w-0 overflow-auto rounded-[12px] bg-[var(--card)] p-7 sm:col-span-2">
          <p className="mb-3 text-xs font-bold lowercase tracking-[0.04em]">
            deliverables.
          </p>
          <ul className="grid list-none gap-3 p-0 text-sm text-[var(--text-soft)]">
            {(service.features || []).map((feature) => (
              <li className="flex items-start gap-2.5" key={feature}>
                <span className="mt-0.5 text-[var(--accent)]">
                  <Icon name="check" size={15} />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </article>

        <article className="relative col-span-1 row-span-1 grid min-h-[200px] min-w-0 grid-cols-1 items-center gap-7 overflow-hidden rounded-[12px] bg-[var(--accent)] p-[clamp(28px,5vw,54px)] text-center text-white sm:col-span-2 lg:col-span-4 lg:grid-cols-[1fr_minmax(240px,.55fr)]">
          <div>
            <h2 className="mx-auto mb-2 max-w-[850px] text-[clamp(24px,3vw,32px)] font-bold uppercase leading-[1.16] tracking-[-0.03em]">
              Ready to move this project forward?
            </h2>
            <p className="text-sm text-white/80">
              Get a clear scope, realistic timeline and practical next step.
            </p>
          </div>
          <Link
            className="inline-flex min-h-[38px] w-full items-center justify-center gap-2.5 rounded-[7px] bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-[0.015em] text-[#9a000f] transition-colors duration-150 hover:bg-[#e9ecef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            href={`${service.ctaUrl || "/contact"}?service=${encodeURIComponent(service.title)}`}
          >
            Get a quote
            <Icon name="arrow" size={15} />
          </Link>
        </article>
      </section>
    </PublicShell>
  );
}
