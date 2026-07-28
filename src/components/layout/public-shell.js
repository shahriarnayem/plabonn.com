import { getNavigation, getSettings } from "@/lib/data/content";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export async function PublicShell({ children }) {
  const [settings, navigation] = await Promise.all([getSettings(), getNavigation()]);
  return (
    <div className="site-shell" style={{ "--accent-custom": settings?.accentColor || "#9a000f" }}>
      <SiteHeader settings={settings} navigation={navigation} />
      <main id="main" className="site-main">{settings?.maintenanceMode ? <section className="card maintenance-card"><p className="eyebrow">Maintenance</p><h1>The website is receiving a quick update.</h1><p>Please check back shortly. The CMS remains available to authorized users.</p></section> : children}</main>
      <SiteFooter settings={settings} />
    </div>
  );
}
