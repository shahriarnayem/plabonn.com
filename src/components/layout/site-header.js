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
    <header
      className={`relative z-50 grid min-h-[58px] grid-cols-[1fr_auto] items-center overflow-visible rounded-[12px] bg-[var(--card)] px-3.5 py-2.5 pl-[18px] lg:grid-cols-[1fr_auto_auto] ${
        settings?.headerSticky ? "sticky top-2.5" : ""
      }`}
    >
      <Link
        href="/"
        className="inline-flex min-w-0 items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        aria-label={`${settings?.siteName || "Portfolio"} homepage`}
        onClick={() => setOpen(false)}
      >
        {settings?.logoImage || settings?.lightLogo || settings?.darkLogo ? (
          <>
            <img
              className="block h-[30px] w-auto max-w-[150px] object-contain dark:hidden"
              src={settings.lightLogo || settings.logoImage || settings.darkLogo}
              alt=""
              width="180"
              height="48"
            />
            <img
              className="hidden h-[30px] w-auto max-w-[150px] object-contain dark:block"
              src={settings.darkLogo || settings.logoImage || settings.lightLogo}
              alt=""
              width="180"
              height="48"
            />
          </>
        ) : (
          <span className="whitespace-nowrap text-base font-bold lowercase tracking-[-0.03em] text-[var(--text)]">
            {logo}
          </span>
        )}
      </Link>

      <nav
        id="site-navigation"
        className={`${
          open ? "flex" : "hidden"
        } absolute left-0 right-0 top-[calc(100%+8px)] flex-col gap-5 rounded-[12px] lg:static lg:flex lg:flex-row lg:items-center lg:bg-transparent lg:p-0`}
        aria-label="Primary navigation"
      >
        {navigation.map((item) => {
          const active =
            item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);

          return (
            <Link
              key={`${item.url}-${item.label}`}
              href={item.url}
              className={`rounded-md text-[18px] font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] lg:text-base ${
                active
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-soft)] hover:text-[var(--text)]"
              }`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-2 flex items-center gap-1.5">
        <ThemeToggle compact defaultTheme={settings?.defaultTheme} />
        <button
          type="button"
          className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-[var(--card-soft)] text-[var(--text)] transition-colors duration-150 hover:bg-[var(--card-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="site-navigation"
          aria-label="Toggle navigation"
        >
          <Icon name={open ? "close" : "menu"} size={19} />
        </button>
      </div>
    </header>
  );
}
