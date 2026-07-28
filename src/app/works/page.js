import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { PageIntroCard, ProjectCard } from "@/components/cards/portfolio-cards";
import { getCategories, getPageBySlug, getPublished, countPublished } from "@/lib/data/content";
import { buildMetadata } from "@/lib/seo";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("works");
  return buildMetadata(page || {}, { title: "Works", description: "Selected website design and development projects across business, e-commerce and membership experiences." });
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
    countPublished("projects", { ...(category ? { category } : {}), ...(search ? { search } : {}) }),
    getPageBySlug("works"),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <PublicShell>
      <Breadcrumbs items={[{ label: "Works" }]} />
      <section className="bento-grid page-grid">
        <PageIntroCard eyebrow="Selected works" title={pageContent?.heading || "Websites designed to look credible, communicate clearly and work properly."} description={pageContent?.excerpt || "Browse recent projects and filter them by the type of experience."} />
        <article className="card filter-card span-2x1">
          <form className="search-form" action="/works">
            <label><span>Search projects</span><input name="search" defaultValue={search} placeholder="Search by project name" /></label>
            {category ? <input type="hidden" name="category" value={category} /> : null}
            <button className="button button-primary" type="submit"><Icon name="search" size={16} />Search</button>
          </form>
          <div className="filter-links">
            <Link className={!category ? "active" : ""} href="/works">All</Link>
            {categories.map((item) => <Link className={category === item.slug ? "active" : ""} href={`/works?category=${item.slug}`} key={item.slug}>{item.name}</Link>)}
          </div>
        </article>
        {projects.length ? projects.map((project, index) => <ProjectCard key={project.id || project.slug} project={project} variant={index % 5 === 4 ? "wide" : "tall"} />) : <article className="card empty-state span-4x1"><h2>No projects found.</h2><p>Try another category or search term.</p></article>}
      </section>
      {totalPages > 1 ? <nav className="pagination" aria-label="Project pages">{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <Link className={page === number ? "active" : ""} key={number} href={`/works?page=${number}${category ? `&category=${category}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`}>{number}</Link>)}</nav> : null}
    </PublicShell>
  );
}
