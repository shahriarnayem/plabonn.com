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
  return buildMetadata(post, {
    title: post.title,
    description: post.excerpt,
    type: "article",
  });
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const post = await getBySlug("posts", slug);
  if (!post) notFound();

  const [adjacent, related] = await Promise.all([
    getAdjacent("posts", post),
    getPublished("posts", { limit: 4, category: post.category }),
  ]);
  const headings = (post.content || []).filter(
    (block) => block.type === "heading" && block.data?.text,
  );
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt || post.publishedAt,
          image: absoluteUrl(post.coverImage, base),
          author: { "@type": "Person", name: "shahriarr." },
          mainEntityOfPage: `${base}/blog/${post.slug}`,
        })}
      />
      <Breadcrumbs
        items={[
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />

      <article className="grid gap-[14px]">
        <header className="relative overflow-hidden rounded-[12px] bg-[var(--card)] p-[clamp(30px,6vw,70px)]">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-soft)]">
            {String(post.category || "Article").replaceAll("-", " ")} ·{" "}
            {formatDate(post.publishedAt)} · {post.readingTime || 5} min read
          </p>
          <h1 className="mb-4 max-w-[980px] text-[clamp(24px,4vw,32px)] font-bold uppercase leading-[1.16] tracking-[-0.03em]">
            {post.title}
          </h1>
          <p className="max-w-[750px] text-base text-[var(--text-soft)]">
            {post.excerpt}
          </p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {(post.tags || []).map((tag) => (
              <span
                className="inline-flex rounded-full bg-[var(--card-soft)] px-2 py-1.5 text-xs leading-none text-[var(--text-soft)]"
                key={tag}
              >
                #{tag}
              </span>
            ))}
          </div>
        </header>

        <div className="grid items-start gap-[14px] lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="relative rounded-[12px] bg-[var(--card)] p-[22px] lg:sticky lg:top-[86px]">
            <p className="mb-3 text-xs font-bold lowercase tracking-[0.04em]">
              on this page.
            </p>
            {headings.length ? (
              <ol className="m-0 grid gap-3 pl-5 text-xs text-[var(--text-soft)]">
                {headings.map((heading, index) => (
                  <li key={`${heading.data.text}-${index}`}>{heading.data.text}</li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-[var(--text-soft)]">A focused reading guide.</p>
            )}
            <div className="mt-6 flex flex-wrap gap-2.5 pt-[18px]">
              <span className="w-full text-xs uppercase text-[var(--text-faint)]">
                Share
              </span>
              <a
                className="rounded-md text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${base}/blog/${post.slug}`)}`}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              <a
                className="rounded-md text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(`${base}/blog/${post.slug}`)}`}
              >
                Email
              </a>
            </div>
          </aside>

          <div className="relative overflow-hidden rounded-[12px] bg-[var(--card)] p-[clamp(28px,5vw,70px)]">
            <BlocksRenderer blocks={post.content || []} />
          </div>
        </div>

        <nav
          className="grid grid-flow-dense grid-cols-1 gap-[14px] sm:grid-cols-2"
          aria-label="Other articles"
        >
          {adjacent.previous ? (
            <Link
              className="grid min-h-[95px] gap-1.5 rounded-[12px] bg-[var(--card)] p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              href={`/blog/${adjacent.previous.slug}`}
            >
              <span className="text-xs uppercase text-[var(--text-faint)]">Previous article</span>
              <strong className="text-xs">{adjacent.previous.title}</strong>
            </Link>
          ) : (
            <span />
          )}
          {adjacent.next ? (
            <Link
              className="grid min-h-[95px] gap-1.5 rounded-[12px] bg-[var(--card)] p-5 text-right focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              href={`/blog/${adjacent.next.slug}`}
            >
              <span className="text-xs uppercase text-[var(--text-faint)]">Next article</span>
              <strong className="text-xs">{adjacent.next.title}</strong>
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <section className="mt-[18px]">
          <h2 className="mb-3.5 text-xl font-bold uppercase tracking-[-0.03em]">
            Related articles
          </h2>
          <div className="grid grid-flow-dense grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-4">
            {related
              .filter((item) => item.slug !== post.slug)
              .slice(0, 4)
              .map((item) => (
                <BlogCard key={item.id || item.slug} post={item} />
              ))}
          </div>
        </section>
      </article>
    </PublicShell>
  );
}
