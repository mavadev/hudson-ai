import "./prism.css";
import "./globals.css";
import "highlight.js/styles/github-dark.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

import { AppContextProvider } from "@/context/AppContext";
import { GoogleOneTap, ClerkThemeProvider } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Hudson AI",
    template: "%s | Hudson AI",
  },
  description:
    "Modern conversational AI assistant powered by Gemini with specialized QA analysis, authentication, and persistent chat history.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-96x96.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        suppressHydrationWarning
        className={`${inter.variable} antialiased bg-bg-main text-text-main min-h-screen`}
      >
        <ClerkThemeProvider>
          <AppContextProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                className: "hudson-toast",
              }}
            />
            {children}
            <GoogleOneTap />
            <div id="clerk-captcha" />
          </AppContextProvider>
        </ClerkThemeProvider>
      </body>
    </html>
  );
}
