import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getSession } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/content";

export const metadata = {
  title: "CMS Login",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const [session, settings] = await Promise.all([getSession(), getSettings()]);
  if (session) redirect("/dashboard");

  return (
    <main
      id="main"
      className="grid min-h-screen place-items-center bg-[var(--page)] px-4 py-8 [container-type:inline-size]"
      style={{ "--accent-custom": settings?.accentColor || "#9a000f" }}
    >
      <section className="relative grid w-full max-w-[520px] gap-8 overflow-hidden rounded-[12px] bg-[var(--card)] p-[clamp(24px,6vw,48px)]">
        <div className="flex items-center justify-between gap-5">
          <Link
            href="/"
            className="rounded-md text-base font-bold lowercase tracking-[-0.03em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            {settings.textLogo}
          </Link>
          <ThemeToggle compact defaultTheme={settings?.defaultTheme} />
        </div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-soft)]">
            Portfolio CMS
          </p>
          <h1 className="text-[clamp(24px,4vw,32px)] font-bold uppercase leading-[1.16] tracking-[-0.03em]">
            Welcome back.
          </h1>
          <p className="mt-3 text-sm text-[var(--text-soft)]">
            Sign in with your administrator or editor account.
          </p>
        </div>
        <LoginForm />
        <Link
          className="inline-flex w-fit items-center gap-2 rounded-md text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          href="/"
        >
          ← Return to website
        </Link>
      </section>
    </main>
  );
}
