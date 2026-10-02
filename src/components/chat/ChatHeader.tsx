"use client";
import Image from "next/image";
import assets from "@/assets";

interface ChatHeaderProps {
  chatName?: string;
  onToggleSidebar: () => void;
}

export const ChatHeader = ({ chatName, onToggleSidebar }: ChatHeaderProps) => {
  return (
    <>
      {/* Encabezado Móvil */}
      <header className="absolute top-6 left-0 z-20 md:hidden w-full px-4 flex items-center justify-start gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Abrir menú lateral"
          className="cursor-pointer p-1 hover:opacity-80 transition-opacity "
        >
          <Image alt="Menú" src={assets.menu} className="rotate-180" />
        </button>
        <h3>HudsonAI</h3>
      </header>

      {/* Nombre del Chat Actual */}
      {chatName && (
        <div className="absolute left-1/2 top-7 z-10 -translate-x-1/2 hidden md:block">
          <p className="max-w-xs truncate text-base font-medium text-gray-200">
            {chatName}
          </p>
        </div>
      )}
    </>
  );
};
