import Link from "next/link";

export function SiteFooter({ settings }) {
  const year = new Date().getFullYear();
  const socials = settings?.socialLinks || {};
  return (
    <footer className="site-footer card">
      <div className="footer-main">
        <Link href="/" className="text-logo">{settings?.textLogo || settings?.siteName || "portfolio..."}</Link>
        <div className="footer-links">
          {Object.entries(socials).filter(([, url]) => Boolean(url)).map(([label, url]) => (
            <a key={label} href={url} target="_blank" rel="noreferrer">{label}</a>
          ))}
          <Link href="/privacy">privacy</Link>
          <Link href="/terms">terms</Link>
        </div>
      </div>
      <p>{settings?.footerCopyright || "All rights reserved."} © {year}</p>
    </footer>
  );
}
