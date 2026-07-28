"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";

const themes = ["light", "dark", "system"];

function applyTheme(theme) {
  const root = document.documentElement;
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.dataset.theme = theme;
  root.classList.toggle("dark", isDark);
  root.classList.toggle("light", !isDark);
}

export function ThemeToggle({ compact = false, defaultTheme = "system" }) {
  const safeDefault = themes.includes(defaultTheme) ? defaultTheme : "system";
  const [theme, setTheme] = useState(safeDefault);

  useEffect(() => {
    const stored = localStorage.getItem("portfolio-theme") || safeDefault;
    setTheme(stored);
    applyTheme(stored);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => document.documentElement.dataset.theme === "system" && applyTheme("system");
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [safeDefault]);

  const cycle = () => {
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    localStorage.setItem("portfolio-theme", next);
    setTheme(next);
    applyTheme(next);
  };

  return (
    <button className={`icon-button ${compact ? "compact" : ""}`} type="button" onClick={cycle} aria-label={`Theme: ${theme}. Change theme`} title={`Theme: ${theme}`}>
      <Icon name={theme === "light" ? "sun" : theme === "dark" ? "moon" : "system"} size={17} />
    </button>
  );
}
