import { PublicShell } from "@/components/layout/public-shell";
import { BlocksRenderer } from "@/components/content/blocks-renderer";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { PageIntroCard, StatCard } from "@/components/cards/portfolio-cards";
import { getHomepage, getPageBySlug } from "@/lib/data/content";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("about");
  return buildMetadata(page || {}, {
    title: "About",
    description: "About my website design and development experience.",
  });
}

export default async function AboutPage() {
  const [page, homepage] = await Promise.all([
    getPageBySlug("about"),
    getHomepage(),
  ]);

  return (
    <PublicShell>
      <Breadcrumbs items={[{ label: "About" }]} />
      <section className="mb-[14px] grid grid-flow-dense grid-cols-1 gap-[14px] sm:grid-cols-2 sm:auto-rows-[calc(50cqw_-_7px)] lg:grid-cols-4 lg:auto-rows-[calc(25cqw_-_10.5px)]">
        <PageIntroCard
          eyebrow="About"
          title={page?.heading || page?.title || "About me"}
          description={
            page?.excerpt ||
            "Design care, practical development and clear communication."
          }
        />

        <figure className="relative col-span-1 row-span-1 min-w-0 overflow-hidden rounded-[12px] bg-[var(--card-soft)] sm:row-span-2">
          <img
            className="h-full w-full object-cover object-top"
            src={page?.coverImage || homepage.hero.image}
            alt={homepage.hero.imageAlt || "Developer portrait"}
            width="864"
            height="1152"
          />
        </figure>

        <article className="relative col-span-1 row-span-1 min-w-0 overflow-auto rounded-[12px] bg-[var(--card)] p-6 sm:row-span-2">
          <p className="mb-3 text-xs font-bold lowercase tracking-[0.04em]">
            working style.
          </p>
          <h2 className="mb-6 text-xl font-bold leading-[1.16] tracking-[-0.03em]">
            Clear planning. Careful execution. Reliable handover.
          </h2>
          <ol className="m-0 grid list-none gap-[18px] p-0">
            {[
              ["01", "Discover", "Understand the business, users, content and technical limits."],
              ["02", "Design", "Create a consistent direction for layout, type, color and interaction."],
              ["03", "Build", "Develop responsive pages with clean content management."],
              ["04", "Launch", "Test, optimize, hand over and support the website after delivery."],
            ].map(([number, title, text]) => (
              <li className="grid grid-cols-[36px_1fr] gap-2.5" key={number}>
                <span className="text-xs font-bold text-[var(--accent)]">{number}</span>
                <div>
                  <strong className="text-xs uppercase">{title}</strong>
                  <p className="mb-0 mt-1 text-xs leading-[1.5] text-[var(--text-soft)]">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </article>

        <StatCard value="200+" label="Websites delivered" />
        <StatCard value="5+" label="Years of experience" />
        <StatCard value="15 days" label="Post-launch support" />

        <article className="relative col-span-1 row-span-1 min-w-0 overflow-hidden rounded-[12px] bg-[var(--card)] p-6">
          <p className="mb-3 text-xs font-bold lowercase tracking-[0.04em]">
            core tools.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {homepage.about.skills.map((skill) => (
              <span
                className="inline-flex rounded-full bg-[var(--card-soft)] px-2 py-1.5 text-xs leading-none text-[var(--text-soft)]"
                key={skill}
              >
                {skill}
              </span>
            ))}
          </div>
        </article>

        {/* <article className="relative col-span-1 row-span-1 min-w-0 overflow-hidden rounded-[12px] bg-[var(--card)] p-[clamp(26px,5vw,60px)] sm:col-span-2 lg:col-span-4">
          <BlocksRenderer blocks={page?.blocks || []} />
        </article> */}
      </section>
    </PublicShell>
  );
}
