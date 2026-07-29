import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout/public-shell";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { getAdjacent, getBySlug } from "@/lib/data/content";
import { absoluteUrl, buildMetadata, jsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await getBySlug("projects", slug);
  if (!project) return {};
  return buildMetadata(project, {
    title: project.title,
    description: project.excerpt,
    type: "article",
  });
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = await getBySlug("projects", slug);
  if (!project) notFound();

  const adjacent = await getAdjacent("projects", project);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: project.excerpt,
          image: absoluteUrl(project.featuredImage, base),
          dateCreated: project.completionDate,
          url: `${base}/works/${project.slug}`,
        })}
      />
      <Breadcrumbs
        items={[
          { label: "Works", href: "/works" },
          { label: project.title },
        ]}
      />

      <article>
        <section className="mb-[14px] grid grid-flow-dense grid-cols-1 gap-[14px] sm:grid-cols-2 sm:auto-rows-[calc(50cqw_-_7px)] lg:grid-cols-4 lg:auto-rows-[calc(25cqw_-_10.5px)]">
          <header className="relative col-span-1 row-span-1 min-w-0 overflow-hidden rounded-[12px] bg-[var(--card)] p-[30px] sm:col-span-2">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-soft)]">
              {String(project.category || "Project").replaceAll("-", " ")}
            </p>
            <h1 className="mb-3 text-[clamp(24px,4vw,32px)] font-bold uppercase leading-[1.16] tracking-[-0.03em]">
              {project.title}
            </h1>
            <p className="text-sm text-[var(--text-soft)]">{project.excerpt}</p>
          </header>

          <aside className="relative col-span-1 row-span-1 flex min-w-0 flex-col justify-between gap-5 overflow-auto rounded-[12px] bg-[var(--card)] p-[22px]">
            <dl className="m-0 grid gap-[15px]">
              <div className="grid gap-1">
                <dt className="text-xs uppercase text-[var(--text-faint)]">Client</dt>
                <dd className="m-0 text-xs">{project.clientName || "Confidential"}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-xs uppercase text-[var(--text-faint)]">Completed</dt>
                <dd className="m-0 text-xs">{formatDate(project.completionDate)}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-xs uppercase text-[var(--text-faint)]">Services</dt>
                <dd className="m-0 text-xs">{(project.services || []).join(", ")}</dd>
              </div>
            </dl>
          </aside>

          <aside className="relative col-span-1 row-span-1 flex min-w-0 flex-col justify-between gap-5 overflow-auto rounded-[12px] bg-[var(--card)] p-[22px]">
            <dl className="m-0 grid gap-[15px]">
              <div className="grid gap-1">
                <dt className="text-xs uppercase text-[var(--text-faint)]">Technology</dt>
                <dd className="m-0 text-xs">{(project.technologies || []).join(", ")}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-xs uppercase text-[var(--text-faint)]">Category</dt>
                <dd className="m-0 text-xs">
                  {String(project.category || "").replaceAll("-", " ")}
                </dd>
              </div>
            </dl>
            {project.projectUrl ? (
              <a
                className="inline-flex min-h-[38px] w-fit items-center justify-center gap-2.5 rounded-[7px] bg-[var(--accent)] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.015em] text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                href={project.projectUrl}
                target="_blank"
                rel="noreferrer"
              >
                Visit website
                <Icon name="external" size={15} />
              </a>
            ) : null}
          </aside>

          <figure className="relative col-span-1 row-span-1 min-h-[350px] min-w-0 overflow-hidden rounded-[12px] bg-[var(--card-soft)] sm:col-span-2 lg:col-span-4">
            <img
              className="h-full w-full object-cover"
              src={project.featuredImage}
              alt={`${project.title} project presentation`}
              width="1344"
              height="768"
            />
          </figure>

          {[
            ["challenge.", "What needed to be solved", project.challenge],
            ["solution.", "How the experience was shaped", project.solution],
            ["result.", "What the final direction achieved", project.results],
          ].map(([label, title, text]) => (
            <section
              className="relative col-span-1 row-span-1 min-w-0 overflow-auto rounded-[12px] bg-[var(--card)] p-7 sm:col-span-2"
              key={label}
            >
              <p className="mb-3 text-xs font-bold lowercase tracking-[0.04em]">{label}</p>
              <h2 className="mb-3 text-lg font-bold leading-[1.16] tracking-[-0.03em]">
                {title}
              </h2>
              <p className="text-sm text-[var(--text-soft)]">{text}</p>
            </section>
          ))}

          {project.testimonial ? (
            <blockquote className="relative col-span-1 row-span-1 flex min-w-0 items-center overflow-hidden rounded-[12px] bg-[var(--card)] p-[30px] text-sm leading-[1.6] text-[var(--text-soft)] sm:col-span-2">
              “{project.testimonial}”
            </blockquote>
          ) : (
            <div className="relative col-span-1 row-span-1 min-w-0 overflow-hidden rounded-[12px] bg-[var(--card)] sm:col-span-2" />
          )}

          {(project.gallery || []).map((image, index) => (
            <figure
              key={`${image}-${index}`}
              className="relative col-span-1 row-span-1 min-h-[350px] min-w-0 overflow-hidden rounded-[12px] bg-[var(--card-soft)] sm:col-span-2"
            >
              <img
                className="h-full w-full object-cover"
                src={image}
                alt={`${project.title} project screen ${index + 1}`}
                width="1344"
                height="768"
                loading="lazy"
              />
            </figure>
          ))}
        </section>

        <nav
          className="mt-[14px] grid grid-flow-dense grid-cols-1 gap-[14px] sm:grid-cols-2"
          aria-label="Other projects"
        >
          {adjacent.previous ? (
            <Link
              className="grid min-h-[95px] gap-1.5 rounded-[12px] bg-[var(--card)] p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              href={`/works/${adjacent.previous.slug}`}
            >
              <span className="text-xs uppercase text-[var(--text-faint)]">Previous project</span>
              <strong className="text-xs">{adjacent.previous.title}</strong>
            </Link>
          ) : (
            <span />
          )}
          {adjacent.next ? (
            <Link
              className="grid min-h-[95px] gap-1.5 rounded-[12px] bg-[var(--card)] p-5 text-right focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              href={`/works/${adjacent.next.slug}`}
            >
              <span className="text-xs uppercase text-[var(--text-faint)]">Next project</span>
              <strong className="text-xs">{adjacent.next.title}</strong>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </PublicShell>
  );
}
