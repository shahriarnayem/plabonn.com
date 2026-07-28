import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getSession } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/content";

export const metadata = { title: "CMS Login", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const [session, settings] = await Promise.all([getSession(), getSettings()]);
  if (session) redirect("/dashboard");
  return (
    <main id="main" className="login-page">
      <section className="card login-card">
        <div className="login-card-head"><Link href="/" className="text-logo">{settings.textLogo}</Link><ThemeToggle compact defaultTheme={settings?.defaultTheme} /></div>
        <div><p className="eyebrow">Portfolio CMS</p><h1>Welcome back.</h1><p>Sign in with your administrator or editor account.</p></div>
        <LoginForm />
        <Link className="text-link" href="/">← Return to website</Link>
      </section>
    </main>
  );
}
