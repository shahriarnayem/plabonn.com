import "./globals.css";

import Script from "next/script";
import { IBM_Plex_Mono } from "next/font/google";
import { getSettings } from "@/lib/data/content";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
  preload: true,
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Menlo",
    "Monaco",
    "Consolas",
    "monospace",
  ],
});

function getSiteURL() {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.BETTER_AUTH_URL;

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  const candidate =
    configured ||
    (vercel
      ? `https://${vercel}`
      : "http://localhost:3000");

  try {
    return new URL(
      candidate.startsWith("http")
        ? candidate
        : `https://${candidate}`,
    );
  } catch {
    return new URL("http://localhost:3000");
  }
}

export async function generateMetadata() {
  const settings = await getSettings();

  return {
    metadataBase: getSiteURL(),

    title: {
      default:
        settings.defaultSeoTitle ||
        settings.siteName ||
        "Plabonn",
      template: `%s — ${settings.siteName || "Plabonn"}`,
    },

    description:
      settings.defaultSeoDescription ||
      "WordPress, Elementor and website development portfolio.",

    icons: {
      icon: settings.favicon || "/favicon.svg",
    },

    openGraph: {
      title:
        settings.defaultSeoTitle ||
        settings.siteName ||
        "Plabonn",

      description:
        settings.defaultSeoDescription ||
        "WordPress, Elementor and website development portfolio.",

      siteName:
        settings.siteName || "Plabonn",

      images: settings.defaultSocialImage
        ? [
            {
              url: settings.defaultSocialImage,
            },
          ]
        : undefined,

      type: "website",
    },

    twitter: {
      card: "summary_large_image",

      title:
        settings.defaultSeoTitle ||
        settings.siteName ||
        "Plabonn",

      description:
        settings.defaultSeoDescription ||
        "WordPress, Elementor and website development portfolio.",

      images: settings.defaultSocialImage
        ? [settings.defaultSocialImage]
        : undefined,
    },
  };
}

function buildThemeScript(defaultTheme = "system") {
  const safeDefault = [
    "light",
    "dark",
    "system",
  ].includes(defaultTheme)
    ? defaultTheme
    : "system";

  return `
    (function () {
      try {
        var selectedTheme =
          localStorage.getItem("portfolio-theme") ||
          "${safeDefault}";

        var prefersDark =
          window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;

        var isDark =
          selectedTheme === "dark" ||
          (
            selectedTheme === "system" &&
            prefersDark
          );

        document.documentElement.dataset.theme =
          selectedTheme;

        document.documentElement.classList.toggle(
          "dark",
          isDark
        );

        document.documentElement.classList.toggle(
          "light",
          !isDark
        );
      } catch (error) {
        var fallbackTheme =
          "${safeDefault}" === "light"
            ? "light"
            : "dark";

        document.documentElement.dataset.theme =
          fallbackTheme;

        document.documentElement.classList.add(
          fallbackTheme
        );
      }
    })();
  `;
}

export default async function RootLayout({
  children,
}) {
  const settings = await getSettings();

  const themeScript = buildThemeScript(
    settings.defaultTheme,
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${ibmPlexMono.variable}
          ${ibmPlexMono.className}
          min-w-[320px]
          bg-[var(--page)]
          font-mono
          text-sm
          leading-[1.65]
          tracking-[-0.01em]
          text-[var(--text)]
          antialiased
        `}
      >
        <a
          href="#main"
          className="
            fixed
            left-2.5
            top-2.5
            z-[10000]
            -translate-y-[160%]
            rounded-lg
            bg-[var(--accent)]
            px-3.5
            py-2.5
            text-xs
            font-semibold
            text-white
            focus:translate-y-0
            focus:outline-2
            focus:outline-offset-2
            focus:outline-white
          "
        >
          Skip to content
        </a>

        {children}
      </body>

      <Script
        id="portfolio-theme-initializer"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: themeScript,
        }}
      />
    </html>
  );
}