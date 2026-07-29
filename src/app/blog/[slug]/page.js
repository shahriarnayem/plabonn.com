import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout/public-shell";
import { BlocksRenderer } from "@/components/content/blocks-renderer";
import { BlogCard } from "@/components/cards/portfolio-cards";
import { Icon } from "@/components/icon";
import { getAdjacent, getBySlug, getPublished } from "@/lib/data/content";
import { absoluteUrl, buildMetadata, jsonLd } from "@/lib/seo";
import { formatDate, getPostFeaturedImage } from "@/lib/utils";

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

  const [adjacent, related, recentPosts] = await Promise.all([
    getAdjacent("posts", post),
    getPublished("posts", { limit: 4, category: post.category }),
    getPublished("posts", { limit: 6 }),
  ]);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const coverImage = getPostFeaturedImage(post);

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
          image: absoluteUrl(coverImage, base),
          author: { "@type": "Person", name: "shahriarr." },
          mainEntityOfPage: `${base}/blog/${post.slug}`,
        })}
      />
      <article className="grid gap-[14px]">
        <div className="grid items-start gap-[14px] lg:grid-cols-[minmax(0,1fr)_310px]">
          <div className="relative overflow-hidden rounded-[12px] bg-[var(--card)]">
            <div className="h-[240px] overflow-hidden bg-[var(--card-soft)] sm:h-[320px] lg:h-[420px]">
              <img
                className="h-full w-full object-cover"
                src={coverImage}
                alt={post.title}
                width="1600"
                height="900"
                loading="eager"
              />
            </div>

            <div className="p-[clamp(20px,4vw,34px)]">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-soft)]">
                {String(post.category || "Article").replaceAll("-", " ")} · {formatDate(post.publishedAt)} · {post.readingTime || 5} min read
              </p>
              <h1 className="mb-4 max-w-[980px] text-[clamp(24px,4vw,32px)] font-bold lowercase leading-[1.16] tracking-[-0.03em]">
                {post.title}
              </h1>
              <p className="max-w-[760px] text-sm text-[var(--text-soft)] sm:text-base">
                {post.excerpt}
              </p>

              {(post.tags || []).length ? (
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
              ) : null}

              <div className="mt-7">
                <BlocksRenderer blocks={post.content || []} />
              </div>
            </div>
          </div>

          <aside className="grid gap-[14px] lg:sticky lg:top-[86px]">
            <div className="rounded-[12px] bg-[var(--card)] p-[10px]">
              <form action="/blog" className="relative">
                <input
                  className="h-[44px] w-full rounded-[8px] bg-[var(--card-soft)] pl-3 pr-10 text-xs text-[var(--text)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  type="search"
                  name="search"
                  placeholder="Type to start searching..."
                  aria-label="Search blog articles"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[6px] bg-[var(--page)] text-[var(--text)] transition-colors duration-150 hover:bg-[var(--accent)] hover:text-white"
                  aria-label="Search"
                >
                  <Icon name="search" size={14} />
                </button>
              </form>
            </div>

            <div className="grid gap-[7px]">
              {recentPosts
                .filter((item) => item.slug !== post.slug)
                .slice(0, 6)
                .map((item) => (
                  <Link
                    key={item.id || item.slug}
                    href={`/blog/${item.slug}`}
                    className="flex min-h-[76px] flex-col justify-between rounded-[12px] bg-[var(--card)] px-[15px] py-[12px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    <p
                      className="text-[12px] font-bold lowercase leading-[1.35] text-[var(--text)]"
                      style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                    >
                      {item.title}
                    </p>
                    <p className="mt-2 text-[12px] leading-none text-[var(--text-faint)]">
                      plabonn · {formatDate(item.publishedAt)}
                    </p>
                  </Link>
                ))}
            </div>
          </aside>
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
          <h2 className="mb-3.5 text-xl font-bold lowercase tracking-[-0.03em]">
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
