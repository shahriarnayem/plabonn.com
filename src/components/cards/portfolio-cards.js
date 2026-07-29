import Link from "next/link";
import { Icon } from "@/components/icon";
import { formatDate, getPostFeaturedImage } from "@/lib/utils";

function highlightText(text = "", words = []) {
  if (!words.length) return text;

  const pattern = new RegExp(
    `(${words
      .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")})`,
    "gi",
  );

  return text.split(pattern).map((part, index) =>
    words.some((word) => word.toLowerCase() === part.toLowerCase()) ? (
      <strong key={`${part}-${index}`} className="text-[var(--text)]">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

export function HeroHeadingCard({ hero }) {
  return (
    <article className="relative col-span-1 row-span-1 flex min-w-0 flex-col justify-between overflow-hidden rounded-[12px] bg-[var(--card)] p-[clamp(20px,3vw,24px)] sm:col-span-2">
      <div>
        {/* {hero.eyebrow ? (
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-soft)]">
            {hero.eyebrow}
          </p>
        ) : null} */}
                {/* {hero.availability ? (
          <span className="mb-3 inline-flex items-center gap-2 text-xs uppercase text-[var(--text-faint)]">
            <i className="h-[7px] w-[7px] rounded-full bg-[var(--success)]" />
            {hero.availability}
          </span>
        ) : null} */}
        <h1 className="mb-3.5 max-w-[780px] text-[clamp(20px,2.5vw,28px)] font-bold uppercase leading-[1.16] tracking-[-0.03em] text-[var(--text-soft)]">
          {highlightText(hero.heading, ["WordPress", "Elementor"])}
        </h1>
        {hero.paragraph ? (
          <p className="max-w-[58ch] text-[14px] text-[var(--text-soft)]">
            {hero.paragraph}
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <Link
          className="inline-flex min-h-[38px] items-center justify-center gap-2.5 rounded-[7px] bg-[var(--accent)] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.015em] text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          href={hero.ctaUrl || "/contact"}
        >
          {hero.ctaText || "Contact me"}
          <Icon name="arrow" size={15} />
        </Link>
        {/* {hero.availability ? (
          <span className="inline-flex items-center gap-2 text-xs uppercase text-[var(--text-faint)]">
            <i className="h-[7px] w-[7px] rounded-full bg-[var(--success)]" />
            {hero.availability}
          </span>
        ) : null} */}
      </div>
    </article>
  );
}

export function ProfileImageCard({ hero }) {
  return (
    <figure className="relative col-span-1 row-span-1 min-w-0 overflow-hidden rounded-[12px] bg-[var(--card-soft)]">
      <img
        className="h-full w-full object-cover object-top"
        src={hero.image || "/placeholders/portrait.png"}
        alt={hero.imageAlt || "Developer portrait"}
        width="864"
        height="1152"
        loading="eager"
      />
    </figure>
  );
}

export function AboutSummaryCard({ about }) {
  return (
    <article className="relative col-span-1 row-span-1 flex min-w-0 flex-col justify-between gap-7 overflow-hidden rounded-[12px] bg-[var(--card)] p-[22px] sm:row-span-2">
      <div>
        <p className="mb-3 text-[18px] font-bold lowercase tracking-[0.04em] text-[var(--text)]">
          {about.label || "about me."}
        </p>
        <p className="text-[14px] leading-[1.65] text-[var(--text-soft)]">{about.bio}</p>
        {about.secondary ? (
          <p className="mt-4 text-[14px] leading-[1.65] text-[var(--text-soft)]">
            {about.secondary}
          </p>
        ) : null}
      </div>
      <div className="grid gap-3.5">
        {about.experience ? <strong className="text-[18px]">{about.experience}</strong> : null}
        <div className="flex flex-wrap gap-3">
          {(about.skills || []).map((skill) => (
            <span
              className="inline-flex rounded-full text-[14px] leading-none text-[var(--text-soft)]"
              key={skill}
            >
              • {skill}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function TechCard({ card = {} }) {
  const image = card.image || "/placeholders/tech-wordpress.svg";
  const label = card.label || "Technology";

  return (
    <Link
      href={card.href || "/services"}
      className="relative col-span-1 row-span-1 aspect-square min-w-0 overflow-hidden rounded-[12px] bg-[var(--card-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:aspect-auto"
      aria-label={label}
    >
      <img
        className="h-full w-full object-cover"
        src={image}
        alt={card.imageAlt || label}
        width="900"
        height="900"
        loading="eager"
      />
    </Link>
  );
}

export function SectionHeadingCard({
  title,
  description,
  ctaText,
  ctaUrl,
  highlightWords = [],
}) {
  return (
    <article className="relative col-span-1 row-span-1 flex min-w-0 flex-col justify-between overflow-hidden rounded-[12px] bg-[var(--card)] p-[clamp(20px,3vw,28px)] sm:col-span-2">
      <div>
        <h2 className="mb-3.5 max-w-[780px] text-[clamp(20px,2.5vw,28px)] font-bold uppercase leading-[1.16] tracking-[-0.03em] text-[var(--text-soft)]">
          {highlightText(title, highlightWords)}
        </h2>
        {description ? (
          <p className="max-w-[58ch] text-sm text-[var(--text-soft)]">{description}</p>
        ) : null}
      </div>
      {ctaText ? (
        <Link
          className="mt-6 inline-flex min-h-[38px] w-fit items-center justify-center gap-2.5 rounded-[7px] bg-[var(--accent)] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.015em] text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          href={ctaUrl || "#"}
        >
          {ctaText}
          <Icon name="arrow" size={15} />
        </Link>
      ) : null}
    </article>
  );
}

export function ProjectCard({ project, variant = "square" }) {
  const spanClass =
    variant === "tall"
      ? "col-span-1 row-span-1 sm:row-span-2"
      : variant === "wide"
        ? "col-span-1 row-span-1 sm:col-span-2"
        : "col-span-1 row-span-1";

  return (
    <Link
      href={`/works/${project.slug}`}
      className={`relative flex min-h-[190px] min-w-0 overflow-hidden rounded-[12px] bg-[var(--card-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${spanClass}`}
    >
      <img
        className="h-full min-h-full w-full object-cover"
        src={project.featuredImage || "/placeholders/project-1.png"}
        alt={`${project.title} website project`}
        width="1344"
        height="768"
        loading="lazy"
      />
      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-[2] flex min-h-[42px] items-center justify-between gap-3 rounded-[7px] bg-[rgb(33_37_41/0.94)] px-3 py-2 text-xs font-bold lowercase text-white">
        <span>{project.title}</span>
        <Icon name="arrow" size={16} />
      </div>
      {project.category ? (
        <small className="absolute left-2.5 top-2.5 z-[2] rounded-md bg-[rgb(33_37_41/0.88)] px-2 py-1.5 text-xs uppercase text-white">
          {String(project.category).replaceAll("-", " ")}
        </small>
      ) : null}
    </Link>
  );
}

export function TestimonialCard({ testimonial, variant = "square" }) {
  const spanClass =
    variant === "tall"
      ? "col-span-1 row-span-1 sm:row-span-2"
      : variant === "wide"
        ? "col-span-1 row-span-1 sm:col-span-2"
        : "col-span-1 row-span-1";

  return (
    <article
      className={`relative flex min-w-0 flex-col justify-between gap-7 overflow-hidden rounded-[12px] bg-[var(--card)] p-[22px] ${spanClass}`}
    >
      <blockquote className="m-0 text-xs leading-[1.7] text-[var(--text-soft)]">
        “{testimonial.reviewText}”
      </blockquote>
      <footer className="grid gap-1">
        <strong className="text-xs">{testimonial.clientName}</strong>
        <span className="text-xs uppercase text-[var(--text-faint)]">
          {[testimonial.clientPosition, testimonial.clientCompany]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </footer>
    </article>
  );
}

export function CtaCard({ homepage }) {
  return (
    <article className="relative col-span-1 row-span-1 flex flex-col min-h-[200px] min-w-0 grid-cols-1 items-center gap-7 overflow-hidden rounded-[12px] bg-[var(--accent)] p-[clamp(28px,5vw,54px)] text-center text-white sm:col-span-2 lg:col-span-4 lg:grid-cols-[1fr_minmax(240px,.55fr)]">
      <div>
        <h2 className="mx-auto mb-2 max-w-[850px] text-[clamp(24px,3vw,32px)] font-bold uppercase leading-[1.16] tracking-[-0.03em]">
          {homepage.ctaHeading}
        </h2>
        {homepage.ctaSupporting ? (
          <p className="text-sm text-white/80">{homepage.ctaSupporting}</p>
        ) : null}
      </div>
      <Link
        className="inline-flex min-h-[38px] items-center justify-center gap-2.5 rounded-[7px] bg-white px-8 py-3 text-xs font-bold uppercase tracking-[0.015em] text-[#9a000f] transition-colors duration-150 hover:bg-[#e9ecef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        href={homepage.ctaUrl || "/contact"}
      >
        {homepage.ctaText || "Get a quote"}
        <Icon name="arrow" size={15} />
      </Link>
    </article>
  );
}

export function BlogCard({ post }) {
  const image = getPostFeaturedImage(post);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="p-2 relative col-span-1 row-span-1 flex h-full min-h-[264px] min-w-0 flex-col overflow-hidden rounded-[12px] bg-[var(--card)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      <div className="rounded-[4px] h-[156px] w-full overflow-hidden bg-[var(--card-soft)]">
        <img
          className="h-full w-full object-cover"
          src={image}
          alt={post.title}
          width="1200"
          height="900"
          loading="lazy"
        />
      </div>
      <div className="grid min-h-[108px] flex-1 content-between gap-2.5 p-2">
        <p
          className="m-0 overflow-hidden text-[18px] font-semibold lowercase leading-[1.45]"
          style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}
        >
          {post.title}
        </p>
        {/* <span className="text-xs uppercase text-[var(--text-faint)]">
          {post.category
            ? String(post.category).replaceAll("-", " ")
            : "Article"}
          {post.publishedAt ? ` · ${formatDate(post.publishedAt)}` : ""}
        </span> */}
      </div>
    </Link>
  );
}

export function ServiceCard({ service }) {
  return (
    <article className="relative col-span-1 row-span-1 flex min-h-[260px] min-w-0 flex-col justify-between gap-6 overflow-hidden rounded-[12px] bg-[var(--card)] p-[22px]">
      <div className="grid h-[52px] w-[52px] place-items-center rounded-[9px] bg-[var(--card-soft)] text-[var(--accent)]">
        <Icon name={service.icon || "code"} size={30} />
      </div>
      <div>
        <h3 className="mb-2.5 text-[15px] font-bold uppercase leading-[1.16] tracking-[-0.03em]">
          {service.title}
        </h3>
        <p className="text-[13px] text-[var(--text-soft)]">
          {service.shortDescription}
        </p>
      </div>
      <Link
        href={`/services/${service.slug}`}
        className="inline-flex w-fit items-center gap-2 rounded-md text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        View service
        <Icon name="arrow" size={15} />
      </Link>
    </article>
  );
}

export function StatCard({ value, label }) {
  return (
    <article className="gap-4 relative col-span-1 row-span-1 flex min-w-0 flex-col justify-center overflow-hidden rounded-[12px] bg-[var(--card)] p-6">
      <strong className="text-[clamp(20px,3vw,28px)] leading-[1.16] tracking-[-0.03em]">
        {value}
      </strong>
      <span className="text-[14px] text-[var(--text-soft)]">{label}</span>
    </article>
  );
}

export function PageIntroCard({
  eyebrow,
  title,
  description,
  className = "col-span-1 row-span-1 sm:col-span-4",
}) {
  return (
    <article
      className={`relative flex min-w-0 flex-col justify-center items-center overflow-hidden rounded-[12px] bg-[var(--card)] p-[clamp(20px,3vw,28px)] ${className}`}
    >
      <h1 className="text-center mb-3.5 max-w-[850px] text-[clamp(20px,4vw,28px)] font-bold uppercase leading-[1.16] tracking-[-0.03em]">
        {title}
      </h1>
      {/* {description ? (
        <p className="text-center max-w-[70ch] text-[14px] text-[var(--text-soft)]">{description}</p>
      ) : null} */}
    </article>
  );
}
