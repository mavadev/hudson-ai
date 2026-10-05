"use client";
import Image from "next/image";
import assets from "@/assets";
import { ThemeToggle } from "../ui";

interface ChatHeaderProps {
  chatName?: string;
  openSidebar: () => void;
}

export const ChatHeader = ({ chatName, openSidebar }: ChatHeaderProps) => {
  return (
    <>
      {/* Encabezado Móvil */}
      <header className="absolute top-0 left-0 h-20 z-10 md:hidden w-full px-4 flex items-center gap-3">
        <button
          type="button"
          onClick={openSidebar}
          aria-label="Abrir menú lateral"
          className="cursor-pointer p-2 hover:bg-bg-card/60 border border-white/5 rounded-lg transition-colors"
        >
          <Image alt="Menú" src={assets.menu} className="w-5 h-5 rotate-180" />
        </button>
        <h3 className="text-text-main font-semibold text-base tracking-tight mr-auto">
          HudsonAI
        </h3>
        <ThemeToggle />
      </header>

      {/* Nombre del Chat Actual */}
      {chatName && (
        <div className="absolute top-0 left-0 w-full z-10 px-4 hidden md:block">
          <div className="max-w-4xl mx-auto h-20 flex items-center justify-end">
            <div className="absolute left-1/2 top-6 -translate-x-1/2  bg-bg-sidebar/80 backdrop-blur-md border border-white/5 px-4 py-1 rounded-full shadow-sm">
              <p className="max-w-xs truncate text-base font-medium text-text-main">
                {chatName}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      )}
    </>
  );
};
