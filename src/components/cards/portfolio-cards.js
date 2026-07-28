import Link from "next/link";
import { Icon } from "@/components/icon";
import { formatDate } from "@/lib/utils";

function highlightText(text = "", words = []) {
  if (!words.length) return text;
  const pattern = new RegExp(`(${words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return text.split(pattern).map((part, index) =>
    words.some((word) => word.toLowerCase() === part.toLowerCase())
      ? <strong key={`${part}-${index}`}>{part}</strong>
      : part,
  );
}

export function HeroHeadingCard({ hero }) {
  return (
    <article className="card hero-heading-card span-2x1">
      <div>
        {hero.eyebrow ? <p className="eyebrow">{hero.eyebrow}</p> : null}
        <h1>{highlightText(hero.heading, ["WordPress", "Elementor"])}</h1>
        {hero.paragraph ? <p className="card-description">{hero.paragraph}</p> : null}
      </div>
      <div className="card-bottom-row">
        <Link className="button button-primary" href={hero.ctaUrl || "/contact"}>{hero.ctaText || "Contact me"}<Icon name="arrow" size={15} /></Link>
        {hero.availability ? <span className="availability"><i />{hero.availability}</span> : null}
      </div>
    </article>
  );
}

export function ProfileImageCard({ hero }) {
  return (
    <figure className="card profile-card span-1x1">
      <img src={hero.image || "/placeholders/portrait.png"} alt={hero.imageAlt || "Developer portrait"} width="864" height="1152" loading="eager" />
    </figure>
  );
}

export function AboutSummaryCard({ about }) {
  return (
    <article className="card about-summary-card span-1x2">
      <div>
        <p className="mini-heading">{about.label || "about me."}</p>
        <p>{about.bio}</p>
        {about.secondary ? <p>{about.secondary}</p> : null}
      </div>
      <div className="about-meta">
        {about.experience ? <strong>{about.experience}</strong> : null}
        <div className="tag-list">{(about.skills || []).map((skill) => <span key={skill}>{skill}</span>)}</div>
      </div>
    </article>
  );
}

export function TechCard({ name, label, href }) {
  return (
    <Link href={href || "/services"} className={`card tech-card span-1x1 tech-${name}`} aria-label={`${label} services`}>
      <Icon name={name} size={52} />
    </Link>
  );
}

export function SectionHeadingCard({ title, description, ctaText, ctaUrl, highlightWords = [] }) {
  return (
    <article className="card section-heading-card span-2x1">
      <div>
        <h2>{highlightText(title, highlightWords)}</h2>
        {description ? <p className="card-description">{description}</p> : null}
      </div>
      {ctaText ? <Link className="button button-primary" href={ctaUrl || "#"}>{ctaText}<Icon name="arrow" size={15} /></Link> : null}
    </article>
  );
}

export function ProjectCard({ project, variant = "square" }) {
  const className = variant === "tall" ? "span-1x2" : variant === "wide" ? "span-2x1" : "span-1x1";
  return (
    <Link href={`/works/${project.slug}`} className={`card project-card ${className}`}>
      <img src={project.featuredImage || "/placeholders/project-1.png"} alt={`${project.title} website project`} width="1344" height="768" loading="lazy" />
      <div className="project-overlay">
        <span>{project.title}</span>
        <Icon name="arrow" size={16} />
      </div>
      {project.category ? <small>{String(project.category).replaceAll("-", " ")}</small> : null}
    </Link>
  );
}

export function TestimonialCard({ testimonial, variant = "square" }) {
  const className = variant === "tall" ? "span-1x2" : variant === "wide" ? "span-2x1" : "span-1x1";
  return (
    <article className={`card testimonial-card ${className}`}>
      <blockquote>“{testimonial.reviewText}”</blockquote>
      <footer>
        <strong>{testimonial.clientName}</strong>
        <span>{[testimonial.clientPosition, testimonial.clientCompany].filter(Boolean).join(" · ")}</span>
      </footer>
    </article>
  );
}

export function CtaCard({ homepage }) {
  return (
    <article className="card cta-card span-4x1">
      <div>
        <h2>{homepage.ctaHeading}</h2>
        {homepage.ctaSupporting ? <p>{homepage.ctaSupporting}</p> : null}
      </div>
      <Link className="button button-light" href={homepage.ctaUrl || "/contact"}>{homepage.ctaText || "Get a quote"}<Icon name="arrow" size={15} /></Link>
    </article>
  );
}

export function BlogCard({ post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="card blog-card span-1x1">
      <div className="blog-icon-panel" style={{ backgroundColor: post.iconColor || "var(--highlight)" }}>
        <Icon name={post.icon || "file"} size={38} />
      </div>
      <div className="blog-card-copy">
        <p>{post.title}</p>
        <span>{post.category ? String(post.category).replaceAll("-", " ") : "Article"}{post.publishedAt ? ` · ${formatDate(post.publishedAt)}` : ""}</span>
      </div>
    </Link>
  );
}

export function ServiceCard({ service }) {
  return (
    <article className="card service-card span-1x1">
      <div className="service-icon"><Icon name={service.icon || "code"} size={30} /></div>
      <div>
        <h3>{service.title}</h3>
        <p>{service.shortDescription}</p>
      </div>
      <Link href={`/services/${service.slug}`} className="text-link">View service<Icon name="arrow" size={15} /></Link>
    </article>
  );
}

export function StatCard({ value, label }) {
  return <article className="card stat-card span-1x1"><strong>{value}</strong><span>{label}</span></article>;
}

export function PageIntroCard({ eyebrow, title, description, className = "span-2x1" }) {
  return (
    <article className={`card page-intro-card ${className}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
    </article>
  );
}
