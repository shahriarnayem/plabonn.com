import { PublicShell } from "@/components/layout/public-shell";
import { BlocksRenderer } from "@/components/content/blocks-renderer";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { PageIntroCard, StatCard } from "@/components/cards/portfolio-cards";
import { getHomepage, getPageBySlug } from "@/lib/data/content";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("about");
  return buildMetadata(page || {}, { title: "About", description: "About my website design and development experience." });
}

export default async function AboutPage() {
  const [page, homepage] = await Promise.all([getPageBySlug("about"), getHomepage()]);
  return (
    <PublicShell>
      <Breadcrumbs items={[{ label: "About" }]} />
      <section className="bento-grid page-grid">
        <PageIntroCard eyebrow="About" title={page?.heading || page?.title || "About me"} description={page?.excerpt || "Design care, practical development and clear communication."} />
        <figure className="card about-profile-card span-1x2"><img src={page?.coverImage || homepage.hero.image} alt={homepage.hero.imageAlt || "Developer portrait"} width="864" height="1152" /></figure>
        <article className="card about-process-card span-1x2">
          <p className="mini-heading">working style.</p>
          <h2>Clear planning. Careful execution. Reliable handover.</h2>
          <ol className="process-list">
            <li><span>01</span><div><strong>Discover</strong><p>Understand the business, users, content and technical limits.</p></div></li>
            <li><span>02</span><div><strong>Design</strong><p>Create a consistent direction for layout, type, color and interaction.</p></div></li>
            <li><span>03</span><div><strong>Build</strong><p>Develop responsive pages with clean content management.</p></div></li>
            <li><span>04</span><div><strong>Launch</strong><p>Test, optimize, hand over and support the website after delivery.</p></div></li>
          </ol>
        </article>
        <StatCard value="200+" label="Websites delivered" />
        <StatCard value="5+" label="Years of experience" />
        <StatCard value="15 days" label="Post-launch support" />
        <article className="card skill-card span-1x1"><p className="mini-heading">core tools.</p><div className="tag-list">{homepage.about.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></article>
        <article className="card rich-content-card span-4x1"><BlocksRenderer blocks={page?.blocks || []} /></article>
      </section>
    </PublicShell>
  );
}
