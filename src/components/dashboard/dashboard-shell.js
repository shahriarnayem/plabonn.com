"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Icon } from "@/components/icon";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const groups = [
  {
    label: "Content",
    items: [
      ["/dashboard", "Overview", "dashboard"],
      ["/dashboard/hero", "Homepage", "layout"],
      ["/dashboard/pages", "Pages", "file"],
      ["/dashboard/services", "Services", "settings"],
      ["/dashboard/works", "Works", "layout"],
      ["/dashboard/reviews", "Reviews", "message"],
      ["/dashboard/blog", "Blog", "edit"],
      ["/dashboard/categories", "Categories", "file"],
      ["/dashboard/tags", "Tags", "file"],
    ],
  },
  {
    label: "Website",
    items: [
      ["/dashboard/media", "Media", "image"],
      ["/dashboard/messages", "Messages", "mail"],
      ["/dashboard/navigation", "Navigation", "menu"],
      ["/dashboard/seo", "SEO", "search"],
      ["/dashboard/settings", "Settings", "settings"],
      ["/dashboard/users", "Users", "users"],
      ["/dashboard/profile", "Profile", "users"],
    ],
  },
];

export function DashboardShell({ children, session, settings }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div
      className="min-h-screen bg-[var(--page)] text-[var(--text)]"
      style={{ "--accent-custom": settings?.accentColor || "#9a000f" }}
    >
      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex w-[260px] flex-col bg-[var(--card)] p-3 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex min-h-[54px] items-center justify-between gap-3 px-2">
          <Link
            href="/"
            className="rounded-md text-base font-bold lowercase tracking-[-0.03em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            {settings?.textLogo || "portfolio..."}
          </Link>
          <button
            className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-[var(--card-soft)] transition-colors duration-150 hover:bg-[var(--card-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close dashboard menu"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <nav className="mt-4 flex-1 overflow-y-auto" aria-label="Dashboard navigation">
          {groups.map((group) => (
            <div className="mb-5" key={group.label}>
              <p className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-faint)]">
                {group.label}
              </p>
              <div className="grid gap-1">
                {group.items.map(([href, label, icon]) => {
                  const active =
                    href === "/dashboard"
                      ? pathname === href
                      : pathname.startsWith(href);

                  return (
                    <Link
                      key={href}
                      className={`flex min-h-[40px] items-center gap-3 rounded-[8px] px-3 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                        active
                          ? "bg-[var(--accent)] text-white"
                          : "text-[var(--text-soft)] hover:bg-[var(--card-soft)] hover:text-[var(--text)]"
                      }`}
                      href={href}
                      onClick={() => setOpen(false)}
                    >
                      <Icon name={icon} size={17} />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="flex items-center justify-between gap-3 rounded-[10px] bg-[var(--card-soft)] p-3">
          <div className="min-w-0">
            <strong className="block truncate text-sm">{session.user.name}</strong>
            <span className="block text-xs uppercase text-[var(--text-faint)]">
              {session.user.cmsRole ||
                (session.user.role === "admin" ? "ADMIN" : "EDITOR")}
            </span>
          </div>
          <button
            type="button"
            className="inline-grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg bg-[var(--card-strong)] transition-colors duration-150 hover:bg-[var(--accent)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            onClick={signOut}
            aria-label="Sign out"
          >
            <Icon name="logout" size={17} />
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[260px]">
        <header className="sticky top-0 z-40 flex min-h-[66px] items-center justify-between gap-4 bg-[var(--page)] px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="inline-grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg bg-[var(--card)] transition-colors duration-150 hover:bg-[var(--card-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open dashboard menu"
            >
              <Icon name="menu" size={18} />
            </button>
            <div className="min-w-0">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-faint)]">
                Portfolio CMS
              </p>
              <span className="hidden truncate text-xs text-[var(--text-soft)] sm:block">
                Manage content, enquiries and website settings.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              className="hidden min-h-[38px] items-center justify-center gap-2 rounded-[7px] bg-[var(--card)] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.015em] transition-colors duration-150 hover:bg-[var(--card-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:inline-flex"
              href="/"
              target="_blank"
            >
              View website
              <Icon name="external" size={14} />
            </Link>
            <ThemeToggle compact defaultTheme={settings?.defaultTheme} />
          </div>
        </header>

        <main id="main" className="px-4 pb-8 pt-2 sm:px-6">
          {children}
        </main>
      </div>

      {open ? (
        <button
          className="fixed inset-0 z-[60] bg-black/60 lg:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
