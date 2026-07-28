import "./globals.css";
import { IBM_Plex_Mono } from "next/font/google";
import { getSettings } from "@/lib/data/content";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
  preload: true,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
});


export async function generateMetadata() {
  const settings = await getSettings();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(base),
    title: { default: settings.defaultSeoTitle, template: `%s — ${settings.siteName}` },
    description: settings.defaultSeoDescription,
    icons: { icon: settings.favicon || "/favicon.svg" },
    openGraph: {
      title: settings.defaultSeoTitle,
      description: settings.defaultSeoDescription,
      siteName: settings.siteName,
      images: settings.defaultSocialImage ? [{ url: settings.defaultSocialImage }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.defaultSeoTitle,
      description: settings.defaultSeoDescription,
      images: settings.defaultSocialImage ? [settings.defaultSocialImage] : undefined,
    },
  };
}

function buildThemeScript(defaultTheme = "system") {
  const safeDefault = ["light", "dark", "system"].includes(defaultTheme) ? defaultTheme : "system";
  return `(function(){try{var t=localStorage.getItem('portfolio-theme')||'${safeDefault}';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=t;document.documentElement.classList.toggle('dark',d);document.documentElement.classList.toggle('light',!d);}catch(e){document.documentElement.classList.add('${safeDefault === "light" ? "light" : "dark"}')}})();`;
}

export default async function RootLayout({ children }) {
  const settings = await getSettings();
  const themeScript = buildThemeScript(settings.defaultTheme);
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className={`${ibmPlexMono.variable} ${ibmPlexMono.className}`}>
        <a className="skip-link" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
