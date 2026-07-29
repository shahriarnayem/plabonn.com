import { getNavigation, getSettings } from "@/lib/data/content";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export async function PublicShell({ children }) {
  const [settings, navigation] = await Promise.all([
    getSettings(),
    getNavigation(),
  ]);

  return (
    <div
      className="mx-auto w-[min(calc(100%_-_32px),1200px)] py-3 pb-[18px]"
      style={{ "--accent-custom": settings?.accentColor || "#9a000f" }}
    >
      <SiteHeader settings={settings} navigation={navigation} />
      <main id="main" className="pt-[14px] [container-type:inline-size]">
        {settings?.maintenanceMode ? (
          <section className="relative min-h-[260px] overflow-hidden rounded-[12px] bg-[var(--card)] p-8 sm:p-10">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-soft)]">
              Maintenance
            </p>
            <h1 className="max-w-[760px] text-[clamp(24px,4vw,32px)] font-bold uppercase leading-[1.16] tracking-[-0.03em]">
              The website is receiving a quick update.
            </h1>
            <p className="mt-4 max-w-[680px] text-sm text-[var(--text-soft)]">
              Please check back shortly. The CMS remains available to authorized users.
            </p>
          </section>
        ) : (
          children
        )}
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
