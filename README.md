# Plabonn Portfolio CMS

A full-stack portfolio website rebuilt from the supplied project archive and styled around the supplied four-column bento-grid reference. The public website, CMS dashboard, authentication, content APIs, media library, SEO routes, light/dark themes, and demonstration content are included in one Next.js application.

## Stack

- Next.js App Router
- React
- JavaScript only
- MongoDB native driver
- MongoDB GridFS for media
- Better Auth with Admin and Editor roles
- Plain global CSS and CSS variables
- Native SVG icon component

No Prisma, Mongoose, NextAuth, Tailwind, component framework, state-management library, animation package, or external CMS is used.

## Requirements

- Node.js 20.9 or newer
- A local MongoDB instance or MongoDB Atlas database

## Local setup

```bash
cp .env.example .env
npm install
npm run seed:content
npm run seed:admin
npm run dev
```

Open:

- Website: `http://localhost:3000`
- CMS: `http://localhost:3000/dashboard`
- Login: `http://localhost:3000/login`

Set a secure `BETTER_AUTH_SECRET`, database URI, website URL, and administrator credentials in `.env` before seeding.

Development login after running `npm run seed:admin`:

- Email: `admin@portfolio.local`
- Password: `Admin@12345`

Rerunning `npm run seed:admin` now resets the configured administrator password as well as the role. Change these values before production.

## Environment variables

```env
MONGODB_URI=mongodb://127.0.0.1:27017/portfolio_cms
MONGODB_DB=portfolio_cms
BETTER_AUTH_SECRET=replace-with-a-long-random-secret-at-least-32-characters
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_NAME=Site Administrator
ADMIN_EMAIL=admin@portfolio.local
ADMIN_PASSWORD=Admin@12345
```

## Commands

```bash
npm run dev
npm run build
npm run start
npm run seed:content
npm run seed:admin
```

## Public routes

- `/`
- `/about`
- `/services`
- `/services/[slug]`
- `/works`
- `/works/[slug]`
- `/blog`
- `/blog/[slug]`
- `/contact`
- `/privacy`
- `/terms`
- `/login`

## CMS routes

- `/dashboard`
- `/dashboard/pages`
- `/dashboard/hero`
- `/dashboard/services`
- `/dashboard/works`
- `/dashboard/reviews`
- `/dashboard/blog`
- `/dashboard/categories`
- `/dashboard/tags`
- `/dashboard/media`
- `/dashboard/messages`
- `/dashboard/navigation`
- `/dashboard/seo`
- `/dashboard/users`
- `/dashboard/settings`
- `/dashboard/profile`

## CMS capabilities

- Create, edit, publish, unpublish, duplicate, search, filter, paginate, reorder, preview, and delete content
- Structured block editor for pages and articles
- Homepage content editor
- Site branding, text logo, image logos, favicon, theme, accent, section order, section visibility, and content-count controls
- Project, service, testimonial, page, article, category, tag, and navigation management
- GridFS media uploads, previews, filename editing, alt text, URL copying, search, pagination, and deletion
- Contact inbox with read/unread state and deletion
- Admin and Editor role enforcement on the server
- User creation, role changes, password reset by administrator, suspension, and deletion
- Activity log and dashboard statistics

## SEO and accessibility

- Dynamic metadata and per-content SEO fields
- Canonical, Open Graph, Twitter card, index/noindex, and follow/nofollow options
- Dynamic `sitemap.xml` and `robots.txt`
- Person, ProfessionalService, Service, Article, CreativeWork, and breadcrumb-friendly structure
- Semantic HTML, keyboard focus, skip link, accessible controls, labels, reduced-motion support, and responsive layouts

## Deployment

The project is configured for a standalone Next.js production build and is suitable for Vercel or a Node.js server. Add the environment variables to the deployment platform, run both seed commands once against the production database, and then deploy.

Uploaded files are stored in MongoDB GridFS, not the temporary deployment filesystem.

## Responsive bento aspect ratios

The homepage bento layout does not use fixed pixel card widths or heights. It derives a square grid unit from the actual content-container width with CSS container query units. Desktop uses four columns, tablet uses two columns, and mobile applies direct `aspect-ratio` values for `1x1`, `2x1`, `1x2`, `2x2`, and `4x1` cards.

## Reliable administrator reset

The seed script loads `.env.local` as well as `.env`, recreates the configured administrator through Better Auth, and verifies the password before it reports success.

```bash
npm run seed:admin
npm run auth:check
npm run dev
```

Default development credentials, unless overridden in `.env.local` or `.env`:

- Email: `admin@portfolio.local`
- Password: `Admin@12345`

Use the exact login URL printed by `npm run seed:admin`. Open the site using the same hostname (`localhost` or `127.0.0.1`) shown there.

## Automatic database content

On the first successful request with `MONGODB_URI` configured, the app performs a one-time database initialization and inserts any missing default settings, homepage content, navigation, public page records, services, projects, reviews, blog posts, categories and tags. A versioned database marker prevents deleted or edited content from being recreated on later server restarts.

All built-in public pages appear in **Dashboard → Pages**, including Home, About, Services, Works, Blog, Contact, Privacy and Terms. Additional pages created there are available at `/<slug>` and use the same bento visual system.

The global font is IBM Plex Mono through `next/font/google`, and the default accent is `#9a000f`.
