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
  return buildMetadata(project, { title: project.title, description: project.excerpt, type: "article" });
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = await getBySlug("projects", slug);
  if (!project) notFound();
  const adjacent = await getAdjacent("projects", project);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.title,
        description: project.excerpt,
        image: absoluteUrl(project.featuredImage, base),
        dateCreated: project.completionDate,
        url: `${base}/works/${project.slug}`,
      })} />
      <Breadcrumbs items={[{ label: "Works", href: "/works" }, { label: project.title }]} />
      <article className="project-detail">
        <section className="bento-grid page-grid">
          <header className="card project-title-card span-2x1"><p className="eyebrow">{String(project.category || "Project").replaceAll("-", " ")}</p><h1>{project.title}</h1><p>{project.excerpt}</p></header>
          <aside className="card project-meta-card span-1x1"><dl><div><dt>Client</dt><dd>{project.clientName || "Confidential"}</dd></div><div><dt>Completed</dt><dd>{formatDate(project.completionDate)}</dd></div><div><dt>Services</dt><dd>{(project.services || []).join(", ")}</dd></div></dl></aside>
          <aside className="card project-meta-card span-1x1"><dl><div><dt>Technology</dt><dd>{(project.technologies || []).join(", ")}</dd></div><div><dt>Category</dt><dd>{String(project.category || "").replaceAll("-", " ")}</dd></div></dl>{project.projectUrl ? <a className="button button-primary" href={project.projectUrl} target="_blank" rel="noreferrer">Visit website<Icon name="external" size={15} /></a> : null}</aside>
          <figure className="card project-hero-image span-4x1"><img src={project.featuredImage} alt={`${project.title} project presentation`} width="1344" height="768" /></figure>
          <section className="card case-study-card span-2x1"><p className="mini-heading">challenge.</p><h2>What needed to be solved</h2><p>{project.challenge}</p></section>
          <section className="card case-study-card span-2x1"><p className="mini-heading">solution.</p><h2>How the experience was shaped</h2><p>{project.solution}</p></section>
          <section className="card case-study-card span-2x1"><p className="mini-heading">result.</p><h2>What the final direction achieved</h2><p>{project.results}</p></section>
          {project.testimonial ? <blockquote className="card project-quote span-2x1">“{project.testimonial}”</blockquote> : <div className="card span-2x1 empty-card" />}
          {(project.gallery || []).map((image, index) => <figure key={`${image}-${index}`} className="card gallery-card span-2x1"><img src={image} alt={`${project.title} project screen ${index + 1}`} width="1344" height="768" loading="lazy" /></figure>)}
        </section>
        <nav className="adjacent-nav" aria-label="Other projects">
          {adjacent.previous ? <Link href={`/works/${adjacent.previous.slug}`}><span>Previous project</span><strong>{adjacent.previous.title}</strong></Link> : <span />}
          {adjacent.next ? <Link href={`/works/${adjacent.next.slug}`}><span>Next project</span><strong>{adjacent.next.title}</strong></Link> : <span />}
        </nav>
      </article>
    </PublicShell>
  );
}
