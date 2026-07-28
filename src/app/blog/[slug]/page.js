import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout/public-shell";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { BlocksRenderer } from "@/components/content/blocks-renderer";
import { BlogCard } from "@/components/cards/portfolio-cards";
import { getAdjacent, getBySlug, getPublished } from "@/lib/data/content";
import { absoluteUrl, buildMetadata, jsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBySlug("posts", slug);
  if (!post) return {};
  return buildMetadata(post, { title: post.title, description: post.excerpt, type: "article" });
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const post = await getBySlug("posts", slug);
  if (!post) notFound();
  const [adjacent, related] = await Promise.all([
    getAdjacent("posts", post),
    getPublished("posts", { limit: 4, category: post.category }),
  ]);
  const headings = (post.content || []).filter((block) => block.type === "heading" && block.data?.text);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        image: absoluteUrl(post.coverImage, base),
        author: { "@type": "Person", name: "shahriarr." },
        mainEntityOfPage: `${base}/blog/${post.slug}`,
      })} />
      <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />
      <article className="article-layout">
        <header className="card article-header">
          <p className="eyebrow">{String(post.category || "Article").replaceAll("-", " ")} · {formatDate(post.publishedAt)} · {post.readingTime || 5} min read</p>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="tag-list">{(post.tags || []).map((tag) => <span key={tag}>#{tag}</span>)}</div>
        </header>
        <div className="article-body-grid">
          <aside className="card article-toc">
            <p className="mini-heading">on this page.</p>
            {headings.length ? <ol>{headings.map((heading, index) => <li key={`${heading.data.text}-${index}`}>{heading.data.text}</li>)}</ol> : <p>A focused reading guide.</p>}
            <div className="share-links"><span>Share</span><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${base}/blog/${post.slug}`)}`} target="_blank" rel="noreferrer">LinkedIn</a><a href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(`${base}/blog/${post.slug}`)}`}>Email</a></div>
          </aside>
          <div className="card article-content"><BlocksRenderer blocks={post.content || []} /></div>
        </div>
        <nav className="adjacent-nav" aria-label="Other articles">
          {adjacent.previous ? <Link href={`/blog/${adjacent.previous.slug}`}><span>Previous article</span><strong>{adjacent.previous.title}</strong></Link> : <span />}
          {adjacent.next ? <Link href={`/blog/${adjacent.next.slug}`}><span>Next article</span><strong>{adjacent.next.title}</strong></Link> : <span />}
        </nav>
        <section className="related-section"><h2>Related articles</h2><div className="bento-grid">{related.filter((item) => item.slug !== post.slug).slice(0, 4).map((item) => <BlogCard key={item.id || item.slug} post={item} />)}</div></section>
      </article>
    </PublicShell>
  );
}
