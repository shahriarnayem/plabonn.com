"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function SiteHeader({ settings, navigation }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const logo = settings?.textLogo || settings?.siteName || "portfolio...";

  return (
    <header className={`site-header card ${settings?.headerSticky ? "is-sticky" : ""}`}>
      <Link href="/" className="site-logo" aria-label={`${settings?.siteName || "Portfolio"} homepage`} onClick={() => setOpen(false)}>
        {(settings?.logoImage || settings?.lightLogo || settings?.darkLogo) ? <>
          <img className="logo-image logo-light" src={settings.lightLogo || settings.logoImage || settings.darkLogo} alt="" width="180" height="48" />
          <img className="logo-image logo-dark" src={settings.darkLogo || settings.logoImage || settings.lightLogo} alt="" width="180" height="48" />
        </> : <span className="text-logo">{logo}</span>}
      </Link>
      <nav id="site-navigation" className={`site-nav ${open ? "is-open" : ""}`} aria-label="Primary navigation">
        {navigation.map((item) => {
          const active = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
          return (
            <Link key={`${item.url}-${item.label}`} href={item.url} className={active ? "active" : ""} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="header-actions">
        <ThemeToggle compact defaultTheme={settings?.defaultTheme} />
        <button type="button" className="icon-button mobile-menu-button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="site-navigation" aria-label="Toggle navigation">
          <Icon name={open ? "close" : "menu"} size={19} />
        </button>
      </div>
    </header>
  );
}
