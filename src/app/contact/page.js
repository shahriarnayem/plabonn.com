import { PublicShell } from "@/components/layout/public-shell";
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
      <section className="mb-[14px] grid grid-flow-dense grid-cols-1 items-stretch gap-[14px] sm:grid-cols-2 lg:grid-cols-4">
        <PageIntroCard
          className="col-span-1 min-h-[280px] sm:col-span-2"
          eyebrow="Contact"
          title={page?.heading || "Tell me what you are planning."}
          description={
            page?.excerpt ||
            "Share the current situation, the outcome you need and any deadline. You will receive a clear response with the next practical step."
          }
        />

        <aside className="relative col-span-1 flex flex-row flex-wrap min-h-[280px] min-w-0 grid-cols-1 content-center gap-5 overflow-hidden rounded-[12px] bg-[var(--card)] p-6 sm:col-span-2 sm:grid-cols-2">
          <div className="">
            <a
              className="break-all text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              href={`mailto:${settings.contactEmail}`}
            >
              {settings.contactEmail}
            </a>
          </div>
          <div className="">
            <a
              className="break-all text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              href={`mailto:plabonn.com@gmail.com`}
            >
              plabonn.com@gmail.com
            </a>
          </div>
          {settings.phone ? (
            <div className="">
              <a
                className="text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                href={`tel:${settings.phone}`}
              >
                {settings.phone}
              </a>
            </div>
          ) : null}
          {settings.location ? (
            <div className="">
              <strong className="text-[14px]">{settings.location}</strong>
            </div>
          ) : null}
            <div className="">
              <strong className="text-[14px]">gtm 6+</strong>
            </div>
        </aside>

      </section>

      <section className="mb-[14px] w-full overflow-visible rounded-[12px] bg-[var(--card)] p-[clamp(22px,4vw,44px)]" aria-label="Project enquiry form">
        <ContactForm services={services} defaultService={params?.service || ""} />
      </section>
    </PublicShell>
  );
}
