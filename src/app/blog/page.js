import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { BlogCard, PageIntroCard } from "@/components/cards/portfolio-cards";
import { Icon } from "@/components/icon";
import {
  countPublished,
  getCategories,
  getPageBySlug,
  getPublished,
  getTags,
} from "@/lib/data/content";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("blog");
  return buildMetadata(page || {}, {
    title: "Blog",
    description:
      "Practical WordPress, Elementor, WooCommerce, performance and website development articles.",
  });
}

export default async function BlogPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category || "";
  const tag = params?.tag || "";
  const search = params?.search || "";
  const page = Math.max(1, Number(params?.page) || 1);
  const limit = 10;

  const [posts, featuredPosts, categories, tags, total, pageContent] =
    await Promise.all([
      getPublished("posts", { limit, page, category, tag, search }),
      getPublished("posts", { limit: 1, featured: true }),
      getCategories("post"),
      getTags(),
      countPublished("posts", {
        ...(category ? { category } : {}),
        ...(tag ? { tags: tag } : {}),
        ...(search ? { search } : {}),
      }),
      getPageBySlug("blog"),
    ]);

  const featured = featuredPosts[0];
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <PublicShell>
      <Breadcrumbs items={[{ label: "Blog" }]} />
      <section className="mb-[14px] grid grid-flow-dense grid-cols-1 gap-[14px] sm:grid-cols-2 sm:auto-rows-[calc(50cqw_-_7px)] lg:grid-cols-4 lg:auto-rows-[calc(25cqw_-_10.5px)]">
        <PageIntroCard
          eyebrow="Blog"
          title={
            pageContent?.heading ||
            "Useful notes for building and managing better websites."
          }
          description={
            pageContent?.excerpt ||
            "Clear, practical articles about WordPress, Elementor, performance, security and content workflows."
          }
        />

        <article className="relative col-span-1 row-span-1 flex min-w-0 flex-col justify-center gap-[18px] overflow-hidden rounded-[12px] bg-[var(--card)] p-5 sm:col-span-2">
          <form
            className="grid grid-cols-1 items-end gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto]"
            action="/blog"
          >
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase text-[var(--text-soft)]">
                Search articles
              </span>
              <input
                className="w-full rounded-[8px] bg-[var(--card-soft)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                name="search"
                defaultValue={search}
                placeholder="Search the blog"
              />
            </label>
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
                !category && !tag
                  ? "bg-[var(--text)] text-[var(--page)]"
                  : "bg-[var(--card-soft)] text-[var(--text-soft)]"
              }`}
              href="/blog"
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
                href={`/blog?category=${item.slug}`}
                key={item.slug}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </article>

        {featured ? (
          <Link
            href={`/blog/${featured.slug}`}
            className="relative col-span-1 row-span-1 grid min-h-[260px] min-w-0 grid-cols-1 overflow-hidden rounded-[12px] bg-[var(--card)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:col-span-2 lg:col-span-4 lg:grid-cols-[1fr_260px]"
          >
            <div className="flex flex-col items-start justify-center p-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-soft)]">
                Featured article · {formatDate(featured.publishedAt)}
              </p>
              <h2 className="mb-3 max-w-[700px] text-[clamp(22px,2.6vw,32px)] font-bold uppercase leading-[1.16] tracking-[-0.03em]">
                {featured.title}
              </h2>
              <p className="text-sm text-[var(--text-soft)]">{featured.excerpt}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold">
                Read article
                <Icon name="arrow" size={15} />
              </span>
            </div>
            <div
              className="grid min-h-[180px] place-items-center text-white"
              style={{ backgroundColor: featured.iconColor || "#9a000f" }}
            >
              <Icon name={featured.icon || "file"} size={62} />
            </div>
          </Link>
        ) : null}

        {posts.length ? (
          posts.map((post) => <BlogCard key={post.id || post.slug} post={post} />)
        ) : (
          <article className="relative col-span-1 row-span-1 flex min-h-[250px] min-w-0 flex-col items-start justify-center overflow-hidden rounded-[12px] bg-[var(--card)] p-9 sm:col-span-2 lg:col-span-4">
            <h2 className="text-xl font-bold">No articles found.</h2>
            <p className="mt-3 text-sm text-[var(--text-soft)]">
              Try a different search or filter.
            </p>
          </article>
        )}

        <aside className="relative col-span-1 row-span-1 flex min-w-0 flex-col justify-center overflow-hidden rounded-[12px] bg-[var(--card)] p-6 sm:col-span-2">
          <p className="mb-3 text-xs font-bold lowercase tracking-[0.04em]">
            browse by tag.
          </p>
          <div className="flex flex-wrap gap-2">
            {tags.map((item) => (
              <Link
                className={`rounded-full px-2.5 py-1.5 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                  tag === item.slug
                    ? "bg-[var(--text)] text-[var(--page)]"
                    : "bg-[var(--card-soft)] text-[var(--text-soft)]"
                }`}
                href={`/blog?tag=${item.slug}`}
                key={item.slug}
              >
                #{item.name}
              </Link>
            ))}
          </div>
        </aside>
      </section>

      {totalPages > 1 ? (
        <nav
          className="my-[18px] flex items-center justify-center gap-2"
          aria-label="Blog pages"
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
                href={`/blog?page=${number}${category ? `&category=${category}` : ""}${tag ? `&tag=${tag}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
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
