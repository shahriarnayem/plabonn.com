# Plabonn Portfolio CMS

A deploy-ready full-stack portfolio and CMS built with Next.js, React, JavaScript, MongoDB, Better Auth, and Tailwind CSS.

## Stack

- Next.js App Router
- React
- JavaScript only
- Tailwind CSS v4 with PostCSS
- MongoDB native driver
- MongoDB GridFS media storage
- Better Auth with Administrator and Editor roles
- IBM Plex Mono through `next/font/google`

## Styling architecture

Bootstrap is not installed or used.

Tailwind utility classes are written directly on JSX elements throughout the public website and dashboard. `src/app/globals.css` is intentionally limited to:

- `@import "tailwindcss"`
- theme variables
- light/dark color variables
- basic reset rules
- selection styling

See [`EDITING-GUIDE.md`](./EDITING-GUIDE.md) for the exact file to edit for every section and component.

## Design system

- Maximum content width: `1200px`
- Responsive four-column bento grid
- Responsive `1×1`, `2×1`, `1×2`, `2×2`, and `4×1` cards
- Card proportions use CSS Grid tracks and spans, not fixed card dimensions
- Font sizes limited to `12px–32px`
- Accent color: `#9a000f`
- No visible borders
- No card or image hover effects
- Hover styling only on buttons and navigation controls
- Simple dark palette: `#000000`, `#111111`, `#222222`, `#333333`
- Light palette: `#f8f9fa`, `#e9ecef`, `#dee2e6`, `#ced4da`

## Requirements

- Node.js 20.9 or newer
- MongoDB Atlas or a local MongoDB server

## Local setup

```bash
cp .env.example .env.local
npm install
npm run db:check
npm run seed:admin
npm run dev
```

Open:

- Website: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- CMS: `http://localhost:3000/dashboard`
- Database health: `http://localhost:3000/api/health/database`

## Environment variables

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=plabonn_portfolio
BETTER_AUTH_SECRET=replace-with-a-long-random-secret-at-least-32-characters
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_NAME=Site Administrator
ADMIN_EMAIL=admin@portfolio.local
ADMIN_PASSWORD=Admin@12345
```

Never commit `.env.local`.

For production, set `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the real HTTPS domain. Add the same variables in Vercel before deploying.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run db:check
npm run seed:admin
npm run seed:content
npm run auth:check
```

## Automatic database content

The application automatically inserts missing core records without overwriting existing CMS edits.

The `pages` collection automatically includes:

- Home
- About
- Services
- Works
- Blog
- Contact
- Privacy
- Terms

The bootstrap also ensures the homepage settings, navigation, initial services, projects, reviews, posts, categories, and tags are present in a fresh database.

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

## Vercel deployment

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add every variable from `.env.example` under Project Settings → Environment Variables.
4. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the production domain.
5. Make sure the MongoDB Atlas database user has read/write permission.
6. Allow the deployment to reach Atlas through Network Access.
7. Deploy.
8. Open `/api/health/database` and confirm `connected: true`.
9. Run `npm run seed:admin` locally with the production environment variables once.

Uploaded images are stored in MongoDB GridFS and not on Vercel’s temporary filesystem.
