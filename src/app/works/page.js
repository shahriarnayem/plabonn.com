import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { PageIntroCard, ProjectCard } from "@/components/cards/portfolio-cards";
import {
  getCategories,
  getPageBySlug,
  getPublished,
  countPublished,
} from "@/lib/data/content";
import { buildMetadata } from "@/lib/seo";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("works");
  return buildMetadata(page || {}, {
    title: "Works",
    description:
      "Selected website design and development projects across business, e-commerce and membership experiences.",
  });
}

export default async function WorksPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category || "";
  const search = params?.search || "";
  const page = Math.max(1, Number(params?.page) || 1);
  const limit = 8;

  const [projects, categories, total, pageContent] = await Promise.all([
    getPublished("projects", { limit, page, category, search }),
    getCategories("project"),
    countPublished("projects", {
      ...(category ? { category } : {}),
      ...(search ? { search } : {}),
    }),
    getPageBySlug("works"),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <PublicShell>
      <Breadcrumbs items={[{ label: "Works" }]} />
      <section className="mb-[14px] grid grid-flow-dense grid-cols-1 gap-[14px] sm:grid-cols-2 sm:auto-rows-[calc(50cqw_-_7px)] lg:grid-cols-4 lg:auto-rows-[calc(25cqw_-_10.5px)]">
        <PageIntroCard
          eyebrow="Selected works"
          title={
            pageContent?.heading ||
            "Websites designed to look credible, communicate clearly and work properly."
          }
          description={
            pageContent?.excerpt ||
            "Browse recent projects and filter them by the type of experience."
          }
        />

        <article className="relative col-span-1 row-span-1 flex min-w-0 flex-col justify-center gap-[18px] overflow-hidden rounded-[12px] bg-[var(--card)] p-5 sm:col-span-2">
          <form
            className="grid grid-cols-1 items-end gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto]"
            action="/works"
          >
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
                Search projects
              </span>
              <input
                className="w-full rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                name="search"
                defaultValue={search}
                placeholder="Search by project name"
              />
            </label>
            {category ? <input type="hidden" name="category" value={category} /> : null}
            <button
              className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2.5 rounded-[7px] bg-[var(--accent)] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.015em] text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              type="submit"
            >
              <Icon name="search" size={16} />
              Search
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            <Link
              className={`rounded-full px-2.5 py-1.5 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                !category
                  ? "bg-[var(--text)] text-[var(--page)]"
                  : "bg-[var(--card-soft)] text-[var(--text-soft)]"
              }`}
              href="/works"
            >
              All
            </Link>
            {categories.map((item) => (
              <Link
                className={`rounded-full px-2.5 py-1.5 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                  category === item.slug
                    ? "bg-[var(--text)] text-[var(--page)]"
                    : "bg-[var(--card-soft)] text-[var(--text-soft)]"
                }`}
                href={`/works?category=${item.slug}`}
                key={item.slug}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </article>

        {projects.length ? (
          projects.map((project, index) => (
            <ProjectCard
              key={project.id || project.slug}
              project={project}
              variant={index % 5 === 4 ? "wide" : "tall"}
            />
          ))
        ) : (
          <article className="relative col-span-1 row-span-1 flex min-h-[250px] min-w-0 flex-col items-start justify-center overflow-hidden rounded-[12px] bg-[var(--card)] p-9 sm:col-span-2 lg:col-span-4">
            <h2 className="text-xl font-bold">No projects found.</h2>
            <p className="mt-3 text-sm text-[var(--text-soft)]">
              Try another category or search term.
            </p>
          </article>
        )}
      </section>

      {totalPages > 1 ? (
        <nav
          className="my-[18px] flex items-center justify-center gap-2"
          aria-label="Project pages"
        >
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (number) => (
              <Link
                className={`grid h-[38px] min-w-[38px] place-items-center rounded-[7px] px-2.5 text-xs transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                  page === number
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--card)] text-[var(--text-soft)] hover:bg-[var(--accent)] hover:text-white"
                }`}
                key={number}
                href={`/works?page=${number}${category ? `&category=${category}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
              >
                {number}
              </Link>
            ),
          )}
        </nav>
      ) : null}
    </PublicShell>
  );
}
