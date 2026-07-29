import { PublicShell } from "@/components/layout/public-shell";
import {
  AboutSummaryCard,
  BlogCard,
  CtaCard,
  HeroHeadingCard,
  ProfileImageCard,
  ProjectCard,
  SectionHeadingCard,
  TechCard,
  TestimonialCard,
} from "@/components/cards/portfolio-cards";
import {
  getHomepage,
  getPageBySlug,
  getPublished,
  getSettings,
} from "@/lib/data/content";
import { absoluteUrl, buildMetadata, jsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("home");
  return buildMetadata(page || {}, {
    title: "Home",
    description: "WordPress, Elementor and website development portfolio.",
  });
}

export default async function HomePage() {
  const [settings, homepage] = await Promise.all([getSettings(), getHomepage()]);
  const [projects, testimonials, posts] = await Promise.all([
    getPublished("projects", { limit: settings.homeProjectCount || 5 }),
    getPublished("testimonials", {
      limit: settings.homeTestimonialCount || 5,
    }),
    getPublished("posts", { limit: settings.homePostCount || 10 }),
  ]);

  const visibility = settings.sectionVisibility || {};
  const order = settings.sectionOrder?.length
    ? settings.sectionOrder
    : ["hero", "works", "reviews", "cta", "blog"];
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const sectionMap = {
    hero:
      visibility.hero === false ? null : (
        <section className="grid grid-flow-dense grid-cols-1 gap-[14px] sm:grid-cols-2 sm:auto-rows-[calc(50cqw_-_7px)] lg:grid-cols-4 lg:auto-rows-[calc(25cqw_-_10.5px)]" aria-label="Introduction" key="hero">
          <HeroHeadingCard hero={homepage.hero} />
          <ProfileImageCard hero={homepage.hero} />
          <AboutSummaryCard about={homepage.about} />
          <TechCard
            name="wordpress"
            label="WordPress"
            href="/services#wordpress-development"
          />
          <TechCard
            name="elementor"
            label="Elementor"
            href="/services#elementor-website-design"
          />
          <TechCard name="crocoblock" label="Crocoblock" href="/services" />
        </section>
      ),
    works:
      visibility.works === false ? null : (
        <section className="mt-[14px]" aria-label="Selected works" key="works">
          <div className="grid grid-flow-dense grid-cols-1 gap-[14px] sm:grid-cols-2 sm:auto-rows-[calc(50cqw_-_7px)] lg:grid-cols-4 lg:auto-rows-[calc(25cqw_-_10.5px)]">
            <SectionHeadingCard
              title={homepage.worksHeading}
              description={homepage.worksDescription}
              ctaText="More works"
              ctaUrl="/works"
              highlightWords={["works"]}
            />
            {projects.slice(0, 4).map((project) => (
              <ProjectCard
                key={project.id || project.slug}
                project={project}
                variant="tall"
              />
            ))}
            {projects[4] ? (
              <ProjectCard project={projects[4]} variant="wide" />
            ) : (
              <div className="relative col-span-1 row-span-1 min-w-0 overflow-hidden rounded-[12px] bg-[var(--card)] sm:col-span-2" />
            )}
          </div>
        </section>
      ),
    reviews:
      visibility.reviews === false ? null : (
        <section className="mt-[14px]" aria-label="Client reviews" key="reviews">
          <div className="grid grid-flow-dense grid-cols-1 gap-[14px] sm:grid-cols-2 sm:auto-rows-[calc(50cqw_-_7px)] lg:grid-cols-4 lg:auto-rows-[calc(25cqw_-_10.5px)]">
            <SectionHeadingCard
              title={homepage.reviewsHeading}
              description={homepage.reviewsDescription}
              ctaText="Let's connect"
              ctaUrl="/contact"
              highlightWords={["clients"]}
            />
            {testimonials.slice(0, 4).map((testimonial) => (
              <TestimonialCard
                key={testimonial.id || testimonial.clientName}
                testimonial={testimonial}
                variant="tall"
              />
            ))}
            {testimonials[4] ? (
              <TestimonialCard testimonial={testimonials[4]} variant="wide" />
            ) : (
              <div className="relative col-span-1 row-span-1 min-w-0 overflow-hidden rounded-[12px] bg-[var(--card)] sm:col-span-2" />
            )}
          </div>
        </section>
      ),
    cta:
      visibility.cta === false ? null : (
        <section className="mt-[24px]" aria-label="Start a project" key="cta">
          <div className="grid grid-flow-dense grid-cols-1 gap-[14px] sm:grid-cols-2 sm:auto-rows-[calc(50cqw_-_7px)] lg:grid-cols-4 lg:auto-rows-[calc(25cqw_-_10.5px)]">
            <CtaCard homepage={homepage} />
          </div>
        </section>
      ),
    blog:
      visibility.blog === false ? null : (
        <section className="mt-[24px]" aria-label="Latest articles" key="blog">
          <div className="grid grid-flow-dense grid-cols-1 gap-[14px] sm:grid-cols-2 sm:auto-rows-[calc(50cqw_-_7px)] lg:grid-cols-4 lg:auto-rows-[calc(25cqw_-_10.5px)]">
            <SectionHeadingCard
              title={homepage.blogHeading}
              description={homepage.blogDescription}
              ctaText="Read more"
              ctaUrl="/blog"
              highlightWords={["blog"]}
            />
            {posts.slice(0, 10).map((post) => (
              <BlogCard key={post.id || post.slug} post={post} />
            ))}
          </div>
        </section>
      ),
  };

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": ["Person", "ProfessionalService"],
          name: settings.siteName,
          url: base,
          image: absoluteUrl(homepage.hero.image, base),
          email: settings.contactEmail,
          address: settings.location,
          description: settings.defaultSeoDescription,
        })}
      />
      {order.map((key) => sectionMap[key]).filter(Boolean)}
    </PublicShell>
  );
}
