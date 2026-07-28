import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { BlogCard, PageIntroCard } from "@/components/cards/portfolio-cards";
import { Icon } from "@/components/icon";
import { countPublished, getCategories, getPageBySlug, getPublished, getTags } from "@/lib/data/content";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("blog");
  return buildMetadata(page || {}, { title: "Blog", description: "Practical WordPress, Elementor, WooCommerce, performance and website development articles." });
}

export default async function BlogPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category || "";
  const tag = params?.tag || "";
  const search = params?.search || "";
  const page = Math.max(1, Number(params?.page) || 1);
  const limit = 10;
  const [posts, featuredPosts, categories, tags, total, pageContent] = await Promise.all([
    getPublished("posts", { limit, page, category, tag, search }),
    getPublished("posts", { limit: 1, featured: true }),
    getCategories("post"),
    getTags(),
    countPublished("posts", { ...(category ? { category } : {}), ...(tag ? { tags: tag } : {}), ...(search ? { search } : {}) }),
    getPageBySlug("blog"),
  ]);
  const featured = featuredPosts[0];
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <PublicShell>
      <Breadcrumbs items={[{ label: "Blog" }]} />
      <section className="bento-grid page-grid">
        <PageIntroCard eyebrow="Blog" title={pageContent?.heading || "Useful notes for building and managing better websites."} description={pageContent?.excerpt || "Clear, practical articles about WordPress, Elementor, performance, security and content workflows."} />
        <article className="card filter-card span-2x1">
          <form className="search-form" action="/blog">
            <label><span>Search articles</span><input name="search" defaultValue={search} placeholder="Search the blog" /></label>
            <button className="button button-primary" type="submit"><Icon name="search" size={16} />Search</button>
          </form>
          <div className="filter-links"><Link className={!category && !tag ? "active" : ""} href="/blog">All</Link>{categories.map((item) => <Link className={category === item.slug ? "active" : ""} href={`/blog?category=${item.slug}`} key={item.slug}>{item.name}</Link>)}</div>
        </article>
        {featured ? <Link href={`/blog/${featured.slug}`} className="card featured-post span-4x1"><div><p className="eyebrow">Featured article · {formatDate(featured.publishedAt)}</p><h2>{featured.title}</h2><p>{featured.excerpt}</p><span className="text-link">Read article<Icon name="arrow" size={15} /></span></div><div className="featured-post-icon" style={{ backgroundColor: featured.iconColor || "var(--highlight)" }}><Icon name={featured.icon || "file"} size={62} /></div></Link> : null}
        {posts.length ? posts.map((post) => <BlogCard key={post.id || post.slug} post={post} />) : <article className="card empty-state span-4x1"><h2>No articles found.</h2><p>Try a different search or filter.</p></article>}
        <aside className="card tags-card span-2x1"><p className="mini-heading">browse by tag.</p><div className="filter-links">{tags.map((item) => <Link className={tag === item.slug ? "active" : ""} href={`/blog?tag=${item.slug}`} key={item.slug}>#{item.name}</Link>)}</div></aside>
      </section>
      {totalPages > 1 ? <nav className="pagination" aria-label="Blog pages">{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <Link className={page === number ? "active" : ""} key={number} href={`/blog?page=${number}${category ? `&category=${category}` : ""}${tag ? `&tag=${tag}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`}>{number}</Link>)}</nav> : null}
    </PublicShell>
  );
}
