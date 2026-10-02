import "./prism.css";
import "./globals.css";

import type { Metadata } from "next";
import { dark } from "@clerk/themes";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";

import { AppContextProvider } from "@/context/AppContext";

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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#d97706",
          colorBackground: "#18191c",
          colorInputBackground: "#212327",
          colorInputText: "#ffffff",
          colorText: "#ffffff",
        },
        elements: {
          card: "border border-white/10 shadow-2xl rounded-2xl",
          headerTitle: "text-white font-bold",
          headerSubtitle: "text-white/60",
          socialButtonsBlockButton:
            "border-white/10 hover:bg-white/5 text-white",
          formButtonPrimary:
            "bg-amber-700 hover:bg-amber-600 text-white font-medium",
          footerActionLink: "text-amber-500 hover:text-amber-400",
        },
      }}
    >
      <html lang="es">
        <body className={`${inter.variable} antialiased`}>
          <AppContextProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                className: "hudson-toast",
              }}
            />
          </AppContextProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
