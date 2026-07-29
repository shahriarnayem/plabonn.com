import Link from "next/link";

export function SiteFooter({ settings }) {
  const year = new Date().getFullYear();
  const socials = settings?.socialLinks || {};

  return (
    <footer className="mt-[14px] flex min-h-[58px] flex-col items-start justify-between gap-4 rounded-[12px] bg-[var(--card)] px-[18px] py-4 sm:flex-row sm:items-center">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-7">
        <Link
          href="/"
          className="rounded-md text-base font-bold lowercase tracking-[-0.03em] text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          {settings?.textLogo || settings?.siteName || "portfolio..."}
        </Link>
        <div className="flex flex-wrap gap-3.5 text-sm lowercase text-[var(--text-soft)] sm:text-base">
          {Object.entries(socials)
            .filter(([, url]) => Boolean(url))
            .map(([label, url]) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                {label}
              </a>
            ))}
          <Link
            className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            href="/privacy"
          >
            privacy
          </Link>
          <Link
            className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            href="/terms"
          >
            terms
          </Link>
        </div>
      </div>
      <p className="m-0 text-sm lowercase text-[var(--text-soft)] sm:text-base">
        {settings?.footerCopyright || "All rights reserved."} © {year}
      </p>
    </footer>
  );
}
