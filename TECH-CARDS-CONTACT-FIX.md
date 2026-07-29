# Tech Cards and Contact Form Fix

## Hero technology cards

The homepage cards are rendered from `homepage.techCards`.

- Frontend card: `src/components/cards/portfolio-cards.js`
- Homepage mapping: `src/app/page.js`
- Dashboard editor: `src/components/dashboard/homepage-editor.js`
- CMS API: `src/app/api/cms/homepage/route.js`
- Defaults: `src/lib/data/demo-data.js`
- Default images: `public/tech/`

Open **Dashboard → Hero** to edit each card's image, label, alt text and link. Uploaded images use the existing media API and MongoDB GridFS.

## Contact form

The form is outside the fixed bento row grid and uses natural height.

- Page layout: `src/app/contact/page.js`
- Client form: `src/components/forms/contact-form.js`
- Submission API: `src/app/api/contact/route.js`
