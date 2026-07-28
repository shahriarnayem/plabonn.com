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
    <div className="dashboard-shell" style={{ "--accent-custom": settings?.accentColor || "#9a000f" }}>
      <aside className={`dashboard-sidebar ${open ? "is-open" : ""}`}>
        <div className="dashboard-brand"><Link href="/" className="text-logo">{settings?.textLogo || "portfolio..."}</Link><button className="icon-button sidebar-close" onClick={() => setOpen(false)} aria-label="Close dashboard menu"><Icon name="close" size={18} /></button></div>
        <nav aria-label="Dashboard navigation">
          {groups.map((group) => <div className="dashboard-nav-group" key={group.label}><p>{group.label}</p>{group.items.map(([href, label, icon]) => {
            const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
            return <Link key={href} className={active ? "active" : ""} href={href} onClick={() => setOpen(false)}><Icon name={icon} size={17} /><span>{label}</span></Link>;
          })}</div>)}
        </nav>
        <div className="dashboard-user">
          <div><strong>{session.user.name}</strong><span>{session.user.cmsRole || (session.user.role === "admin" ? "ADMIN" : "EDITOR")}</span></div>
          <button type="button" className="icon-button" onClick={signOut} aria-label="Sign out"><Icon name="logout" size={17} /></button>
        </div>
      </aside>
      <div className="dashboard-content-wrap">
        <header className="dashboard-topbar">
          <button className="icon-button dashboard-menu" onClick={() => setOpen(true)} aria-label="Open dashboard menu"><Icon name="menu" size={18} /></button>
          <div><p className="eyebrow">Portfolio CMS</p><span>Manage content, enquiries and website settings.</span></div>
          <div className="dashboard-topbar-actions"><Link className="button button-secondary" href="/" target="_blank">View website<Icon name="external" size={14} /></Link><ThemeToggle compact defaultTheme={settings?.defaultTheme} /></div>
        </header>
        <main id="main" className="dashboard-main">{children}</main>
      </div>
      {open ? <button className="dashboard-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
    </div>
  );
}
