import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "ghcd-theme";

function getSystemLight() {
  return window.matchMedia("(prefers-color-scheme: light)").matches;
}

function applyTheme(theme: Theme) {
  const light = theme === "light" || (theme === "system" && getSystemLight());
  document.documentElement.classList.toggle("light", light);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(STORAGE_KEY) as Theme) ?? "system",
  );

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    applyTheme(t);
  }, []);

  useEffect(() => {
    applyTheme(theme);

    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => {
      if (theme === "system") applyTheme("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const cycleTheme = useCallback(() => {
    const next: Record<Theme, Theme> = {
      system: "light",
      light: "dark",
      dark: "system",
    };
    setTheme(next[theme]);
  }, [theme, setTheme]);

  return { theme, cycleTheme };
}
