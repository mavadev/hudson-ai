"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useClerk, UserButton } from "@clerk/nextjs";

import assets from "@/assets";
import { ChatLabel } from "./ChatLabel";
import { useAppContext } from "@/context/AppContext";

interface SidebarProps {
  expand: boolean;
  onToggleSidebar: () => void;
}

export const Sidebar = ({ expand, onToggleSidebar }: SidebarProps) => {
  const { openSignIn, user } = useClerk();
  const { chats, createNewChat } = useAppContext();
  const [openMenuChat, setOpenMenuChat] = useState<string | null>(null);

  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [chats]);

  return (
    <aside
      className={`flex flex-col gap-8 justify-between bg-[#212327] py-7 transition-all z-50 max-md:absolute max-md:h-screen ${
        expand ? "p-4 w-72" : "md:w-20 w-0 max-md:overflow-hidden"
      }`}
    >
      {/* Contenido */}
      {/* Logo / Botón de Cerrar Sidebar */}
      <header
        className={`flex items-center justify-between ${expand ? "flex-row gap-10" : "flex-col gap-8"}`}
      >
        <Image
          alt="logo"
          src={assets.hudson_logo}
          className={`transition-all h-10 w-12 object-contain px-2 `}
        />
        <button
          onClick={onToggleSidebar}
          className="group relative flex items-center justify-center hover:bg-gray-500/20 transition-all duration-300 h-9 w-9 rounded-lg cursor-pointer"
        >
          <Image
            alt="menu"
            className="block w-7"
            src={expand ? assets.sidebar_close : assets.sidebar_open}
          />
          <div
            className={`absolute w-max ${
              expand ? "left-1/2 -translate-x-1/2 top-12" : "-top-12 left-0"
            } opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none`}
          >
            {expand ? "Cerrar Sidebar" : "Abrir Sidebar"}
            <div
              className={`w-3 h-3 absolute bg-black rotate-45 ${
                expand
                  ? "left-1/2 -top-1.5 -translate-x-1/2"
                  : "left-4 -bottom-1.5"
              }`}
            ></div>
          </div>
        </button>
      </header>

      {/* Nuevo chat */}
      <button
        onClick={createNewChat}
        className={`flex items-center cursor-pointer mb-auto ${
          expand
            ? "bg-amber-800 hover:opacity-90 rounded-2xl gap-2 py-2.5 px-3 w-full"
            : "justify-center group relative h-9 w-9 mx-auto hover:bg-gray-500/30 rounded-lg"
        }`}
      >
        <Image
          alt="Nuevo Chat"
          className={expand ? "w-6" : "w-7"}
          src={expand ? assets.new_chat : assets.new_chat_disabled}
        />
        {expand ? (
          <p className="text-white font-medium text-ellipsis line-clamp-1">
            Nuevo Chat
          </p>
        ) : (
          <span className="absolute w-max -top-12 -right-12 opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none">
            Nuevo Chat
            <div className="w-3 h-3 absolute bg-black rotate-45 left-4 -bottom-1.5"></div>
          </span>
        )}
      </button>

      {/* Lista de chats */}
      <main
        className={`h-full overflow-hidden flex flex-col ${expand ? "block" : "hidden"}`}
      >
        <p className="my-1 text-white/25 text-sm">Recientes</p>
        <div className="h-full overflow-y-auto overflow-x-hidden">
          {sortedChats.map((chat) => (
            <ChatLabel
              key={chat._id}
              id={chat._id}
              title={chat.name}
              chats={chats}
              openMenuChat={openMenuChat}
              setOpenMenuChat={setOpenMenuChat}
            />
          ))}
        </div>
      </main>

      {/* Perfil / Autenticación */}
      <div
        className={`flex items-center ${
          expand ? "hover:bg-white/10 rounded-lg p-2" : "justify-center w-full"
        } gap-3 text-white/80 text-sm mt-2 transition-colors`}
      >
        {user ? (
          <>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8",
                },
              }}
            />
            {expand && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium text-white truncate">
                  {user.fullName || user.username || "Usuario"}
                </span>
                <span className="text-xs text-white/50 truncate">
                  {user.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={() => openSignIn()}
            className="flex items-center justify-center gap-3 w-full cursor-pointer focus:outline-none"
          >
            <Image
              alt="profile"
              className="w-7 h-7 opacity-75"
              src={assets.profile}
            />
            {expand && (
              <span className="text-white/80 font-medium w-full text-left">
                Iniciar Sesión
              </span>
            )}
          </button>
        )}
      </div>
    </aside>
  );
};
