// import { PublicShell } from "@/components/layout/public-shell";
// import { PageIntroCard } from "@/components/cards/portfolio-cards";
// import { ContactForm } from "@/components/forms/contact-form";
// import { Icon } from "@/components/icon";
// import {
//   getPageBySlug,
//   getPublished,
//   getSettings,
// } from "@/lib/data/content";
// import { buildMetadata } from "@/lib/seo";

// export const dynamic = "force-dynamic";

// export async function generateMetadata() {
//   const page = await getPageBySlug("contact");
//   return buildMetadata(page || {}, {
//     title: "Contact",
//     description:
//       "Share your website project, redesign, WooCommerce, Elementor or WordPress requirements.",
//   });
// }

// export default async function ContactPage({ searchParams }) {
//   const params = await searchParams;
//   const [settings, services, page] = await Promise.all([
//     getSettings(),
//     getPublished("services", { limit: 50 }),
//     getPageBySlug("contact"),
//   ]);

//   return (
//     <PublicShell>
//       <section className="mb-[14px] grid grid-flow-dense grid-cols-1 items-stretch gap-[14px] sm:grid-cols-2 lg:grid-cols-4">
//         <PageIntroCard
//           className="col-span-1 min-h-[280px] sm:col-span-2"
//           eyebrow="Contact"
//           title={page?.heading || "Tell me what you are planning."}
//           description={
//             page?.excerpt ||
//             "Share the current situation, the outcome you need and any deadline. You will receive a clear response with the next practical step."
//           }
//         />

//         <aside className="relative col-span-1 flex flex-row flex-wrap min-h-[280px] min-w-0 grid-cols-1 content-center gap-5 overflow-hidden rounded-[12px] bg-[var(--card)] p-6 sm:col-span-2 sm:grid-cols-2">
//           <div className="">
//             <a
//               className="break-all text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
//               href={`mailto:${settings.contactEmail}`}
//             >
//               {settings.contactEmail}
//             </a>
//           </div>
//           <div className="">
//             <a
//               className="break-all text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
//               href={`mailto:plabonn.com@gmail.com`}
//             >
//               plabonn.com@gmail.com
//             </a>
//           </div>
//           {settings.phone ? (
//             <div className="">
//               <a
//                 className="text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
//                 href={`tel:${settings.phone}`}
//               >
//                 {settings.phone}
//               </a>
//             </div>
//           ) : null}
//           {settings.location ? (
//             <div className="">
//               <strong className="text-[14px]">{settings.location}</strong>
//             </div>
//           ) : null}
//             <div className="">
//               <strong className="text-[14px]">gtm 6+</strong>
//             </div>
//         </aside>

//       </section>

//       <section className="mb-[14px] w-full overflow-visible rounded-[12px] bg-[var(--card)] p-[clamp(22px,4vw,44px)]" aria-label="Project enquiry form">
//         <ContactForm services={services} defaultService={params?.service || ""} />
//       </section>
//     </PublicShell>
//   );
// }




import { PublicShell } from "@/components/layout/public-shell";
import { ContactForm } from "@/components/forms/contact-form";
import {
  getPageBySlug,
  getPublished,
  getSettings,
} from "@/lib/data/content";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("contact");

  return buildMetadata(page || {}, {
    title: "Contact",
    description:
      "Share your website project, redesign, WooCommerce, Elementor or WordPress requirements.",
  });
}

function getSocialUrl(socialLinks, names) {
  const keys = Array.isArray(names) ? names : [names];

  if (Array.isArray(socialLinks)) {
    const item = socialLinks.find((social) => {
      const platform = String(
        social.platform ||
          social.name ||
          social.label ||
          "",
      ).toLowerCase();

      return keys.includes(platform);
    });

    return item?.url || "";
  }

  for (const key of keys) {
    if (socialLinks?.[key]) {
      return socialLinks[key];
    }
  }

  return "";
}

export default async function ContactPage({ searchParams }) {
  const params = await searchParams;

  const [settings, services, page] = await Promise.all([
    getSettings(),
    getPublished("services", { limit: 50 }),
    getPageBySlug("contact"),
  ]);

  const contactEmail =
    settings.contactEmail || "hello@plabonn.com";

  const secondaryEmail =
    settings.secondaryEmail || "plabonn.com@gmail.com";

  const phone =
    settings.phone || "+8801818887856";

  const location =
    settings.location || "dhaka, bangladesh.";

  const timezone =
    settings.timezone || "gmt +6";

  const cvUrl =
    settings.cvUrl ||
    settings.resumeUrl ||
    settings.resume ||
    "/cv.pdf";

  const socialItems = [
    {
      label: "linkedin.",
      url: getSocialUrl(settings.socialLinks, [
        "linkedin",
      ]),
    },
    {
      label: "github.",
      url: getSocialUrl(settings.socialLinks, [
        "github",
      ]),
    },
    {
      label: "x.",
      url: getSocialUrl(settings.socialLinks, [
        "x",
        "twitter",
      ]),
    },
    {
      label: "facebook.",
      url: getSocialUrl(settings.socialLinks, [
        "facebook",
      ]),
    },
    {
      label: "instagram.",
      url: getSocialUrl(settings.socialLinks, [
        "instagram",
      ]),
    },
  ];

  return (
    <PublicShell>
      {/* Dynamic contact-page heading */}
      <section className="mb-[14px] flex min-h-[270px] items-center justify-center rounded-[12px] bg-[var(--card)] px-6 py-16 text-center md:min-h-[300px]">
        <h1 className="max-w-[760px] whitespace-pre-line text-[clamp(24px,4vw,32px)] font-bold uppercase leading-[1.18] tracking-[-0.03em] text-[var(--text-soft)]">
          {page?.heading ||
            "Have any project?\nFeel free to contact."}
        </h1>
      </section>

      {/* Form and contact information */}
      <section className="mb-[14px] grid grid-cols-1 items-stretch gap-[14px] lg:grid-cols-[1fr_1.06fr]">
        {/* Contact form */}
        <div className="min-w-0 rounded-[12px] bg-[var(--card)] p-[clamp(20px,4vw,34px)]">
          <ContactForm
            services={services}
            defaultService={params?.service || ""}
          />
        </div>

        {/* Right-side cards */}
        <div className="grid min-w-0 gap-[14px]">
          {/* Contact details */}
          <aside className="flex min-h-[270px] items-center rounded-[12px] bg-[var(--card)] p-[clamp(24px,4vw,38px)]">
            <div className="flex flex-wrap items-center gap-x-7 gap-y-5 text-[14px] font-semibold leading-[1.6] text-[var(--text-soft)]">
              {phone ? (
                <a
                  href={`tel:${phone.replace(
                    /\s+/g,
                    "",
                  )}`}
                  className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  {phone}
                </a>
              ) : null}

              {contactEmail ? (
                <a
                  href={`mailto:${contactEmail}`}
                  className="break-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  {contactEmail}
                </a>
              ) : null}

              {secondaryEmail ? (
                <a
                  href={`mailto:${secondaryEmail}`}
                  className="break-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  {secondaryEmail}
                </a>
              ) : null}

              {timezone ? (
                <span>{timezone}</span>
              ) : null}

              {location ? (
                <span className="lowercase">
                  {location}
                </span>
              ) : null}
            </div>
          </aside>

          {/* Social links and CV */}
          <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
            {/* Social links */}
            <aside className="flex min-h-[270px] items-center rounded-[12px] bg-[var(--card)] p-[clamp(24px,4vw,38px)]">
              <div className="flex max-w-[250px] flex-wrap gap-x-7 gap-y-5 text-[15px] font-semibold lowercase leading-[1.5] text-[var(--text-soft)]">
                {socialItems.map((item) =>
                  item.url ? (
                    <a
                      key={item.label}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span key={item.label}>
                      {item.label}
                    </span>
                  ),
                )}
              </div>
            </aside>

            {/* Download CV */}
            <aside className="flex min-h-[270px] items-center rounded-[12px] bg-[var(--card)] p-[clamp(24px,4vw,38px)]">
              <a
                href={cvUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[15px] font-semibold lowercase text-[var(--text-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                download cv.
              </a>
            </aside>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
