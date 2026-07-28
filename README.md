# Plabonn Portfolio CMS

A full-stack portfolio and CMS built with Next.js, React, JavaScript, MongoDB, Better Auth and Tailwind CSS.

## Stack

- Next.js App Router
- React
- JavaScript only
- MongoDB native driver
- MongoDB GridFS media storage
- Better Auth with Admin and Editor roles
- Tailwind CSS v4 with PostCSS
- IBM Plex Mono through `next/font/google`

## Design system

The public website and dashboard use one consistent visual system:

- Maximum content width: `1200px`
- Four-column responsive bento grid
- Responsive `1x1`, `2x1`, `1x2`, `2x2`, and `4x1` cards
- Font sizes from `12px` to `32px`
- Accent color: `#9a000f`
- Borderless cards, forms, dashboard tables, and modal panels
- Hover styling only on buttons and navigation controls
- Light palette: `#F8F9FA`, `#E9ECEF`, `#DEE2E6`, `#CED4DA`, `#ADB5BD`
- Dark palette: `#6C757D`, `#495057`, `#343A40`, `#212529`

## Requirements

- Node.js 20.9 or newer
- MongoDB Atlas or a local MongoDB server

## Local setup

```bash
cp .env.example .env.local
npm install
npm run seed:admin
npm run dev
```

Open:

- Website: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- CMS: `http://localhost:3000/dashboard`

The site automatically checks MongoDB and inserts any missing built-in pages, navigation, homepage settings and initial CMS content. Running `npm run seed:content` is optional.

## Environment variables

```env
MONGODB_URI=
MONGODB_DB=plabonn_portfolio
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_NAME=Site Administrator
ADMIN_EMAIL=admin@portfolio.local
ADMIN_PASSWORD=Admin@12345
```

For Vercel, set `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the production domain, for example:

```env
BETTER_AUTH_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

The authentication configuration also supports Vercel preview URLs and derives the current forwarded host safely.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run seed:admin
npm run seed:content
npm run auth:check
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
- `/<custom-page-slug>`

## CMS routes

- `/dashboard`
- `/dashboard/hero`
- `/dashboard/pages`
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

## Automatic database pages

Every built-in public route is represented in the `pages` collection:

- Home
- About
- Services
- Works
- Blog
- Contact
- Privacy
- Terms

The bootstrap process checks these core records on every fresh server instance without overwriting existing CMS edits. Missing pages are restored with `$setOnInsert`, while edited records remain unchanged.

## Deployment

1. Push the project to GitHub.
2. Import it into Vercel.
3. Add all variables from `.env.example`.
4. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the real production URL.
5. Deploy.
6. Run `npm run seed:admin` once against the production database from a trusted local environment.

Uploaded images are stored in MongoDB GridFS rather than the temporary deployment filesystem.
