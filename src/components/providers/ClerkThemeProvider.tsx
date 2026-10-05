"use client";

import { useEffect, useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark, light } from "@clerk/themes";

export const ClerkThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const checkIsDark = () =>
      document.documentElement.classList.contains("dark");
    setIsDark(checkIsDark());

    const observer = new MutationObserver(() => {
      setIsDark(checkIsDark());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <ClerkProvider
      appearance={{
        baseTheme: isDark ? dark : light,
        elements: {
          card: "border border-black/10 dark:border-white/10 shadow-2xl rounded-2xl bg-bg-sidebar",
          headerTitle: "text-text-main font-bold",
          headerSubtitle: "text-text-muted",
          socialButtonsBlockButton:
            "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-text-main",
          formButtonPrimary:
            "bg-accent-primary hover:bg-accent-hover text-white font-medium transition-colors",
          footerActionLink:
            "text-accent-primary hover:text-accent-hover font-medium",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
};
