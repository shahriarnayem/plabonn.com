# Plabonn code editing guide

This project intentionally keeps the UI in normal JavaScript component files. There is no Bootstrap, hidden theme package, generated page builder, or component dependency that you must edit elsewhere.

## Global design settings

- `src/app/globals.css`
  - Tailwind import
  - light/dark CSS variables
  - accent fallback
  - global reset only
- `src/app/layout.js`
  - IBM Plex Mono
  - root metadata
  - theme initialization
  - global body Tailwind classes

Do not move component styling into `globals.css`. Keep Tailwind utilities on the JSX elements where they are used.

## Public layout

- `src/components/layout/public-shell.js` — 1200px site container
- `src/components/layout/site-header.js` — logo, desktop/mobile navigation
- `src/components/layout/site-footer.js` — footer content
- `src/components/theme/theme-toggle.js` — light/dark/system control

## Homepage and bento cards

- `src/app/page.js` — homepage section order and responsive four-column bento grid
- `src/components/cards/portfolio-cards.js` — hero, image, about, technology, work, review, CTA, blog, service, statistic, and page-intro cards

The desktop bento grid is created directly with Tailwind:

```jsx
<div className="grid grid-flow-dense grid-cols-1 gap-[14px] sm:grid-cols-2 sm:auto-rows-[calc(50cqw_-_7px)] lg:grid-cols-4 lg:auto-rows-[calc(25cqw_-_10.5px)]">
```

Card ratios come from grid spans instead of fixed card widths or heights:

- `col-span-1 row-span-1` — 1 × 1
- `sm:col-span-2 row-span-1` — 2 × 1 including the grid gap
- `col-span-1 sm:row-span-2` — 1 × 2 including the grid gap
- `lg:col-span-4 row-span-1` — 4 × 1

## Public pages

- `src/app/about/page.js`
- `src/app/services/page.js`
- `src/app/services/[slug]/page.js`
- `src/app/works/page.js`
- `src/app/works/[slug]/page.js`
- `src/app/blog/page.js`
- `src/app/blog/[slug]/page.js`
- `src/app/contact/page.js`
- `src/app/privacy/page.js`
- `src/app/terms/page.js`
- `src/app/[slug]/page.js` — CMS-created custom pages

## Forms and content rendering

- `src/components/forms/contact-form.js`
- `src/components/forms/login-form.js`
- `src/components/content/blocks-renderer.js`
- `src/components/content/breadcrumbs.js`

## Dashboard

- `src/components/dashboard/dashboard-shell.js` — dashboard sidebar/top bar
- `src/components/dashboard/homepage-editor.js` — homepage fields
- `src/components/dashboard/resource-manager.js` — reusable CRUD screen
- `src/components/dashboard/block-editor.js` — page/article block editor
- `src/components/dashboard/media-manager.js` — GridFS media UI
- `src/components/dashboard/message-manager.js` — contact messages
- `src/components/dashboard/user-manager.js` — administrators/editors
- `src/components/dashboard/settings-editor.js` — website settings and SEO
- `src/components/dashboard/profile-editor.js` — current account profile

## Database and authentication

- `src/lib/mongodb.js` — MongoDB connection pool and ping helper
- `src/lib/auth.js` — Better Auth configuration
- `src/lib/data/bootstrap.js` — automatic insertion of missing system pages/content
- `src/lib/data/content.js` — public database queries
- `src/app/api/health/database/route.js` — deployment connection status
- `scripts/check-database.js` — local MongoDB test
- `scripts/seed-admin.js` — create/reset the administrator

## Design rules currently enforced

- IBM Plex Mono globally
- Accent `#9a000f`
- 1200px maximum public width
- Four-column desktop bento grid
- 12px minimum and 32px maximum typography
- No visible borders
- No card/image hover effects
- Hover styles only on buttons and navigation controls
- Simple dark palette: `#000000`, `#111111`, `#222222`, `#333333`

## Blog images and single article layout

- Blog card markup: `src/components/cards/portfolio-cards.js` → `BlogCard`
- Blog listing featured article: `src/app/blog/page.js`
- Single blog page and right sidebar: `src/app/blog/[slug]/page.js`
- Blog featured image field: Dashboard → Blog → Cover image URL
- Missing cover images are backfilled from the local placeholder images without replacing images you already selected.

## Contact form

- Form UI: `src/components/forms/contact-form.js`
- Submission API: `src/app/api/contact/route.js`
- Saved collection: `contactMessages`
- Test MongoDB before deployment with: `npm run db:check`
