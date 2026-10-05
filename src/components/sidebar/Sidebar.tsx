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
  // 1. Extraemos isLoading del contexto
  const {
    chats,
    prepareNewChat,
    selectedChat,
    clearChatGuest,
    isGenerating,
    fetchingChats,
  } = useAppContext();
  const [openMenuChat, setOpenMenuChat] = useState<string | null>(null);

  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [chats]);

  // 2. Incluimos isLoading en las deshabilitaciones
  const disabledResetChatGuest = (!user && !selectedChat) || isGenerating;

  return (
    <aside
      className={`flex flex-col gap-8 justify-between bg-bg-sidebar py-7 transition-all z-50 max-md:absolute max-md:h-screen ${
        expand ? "p-4 w-72" : "md:w-20 w-0 max-md:overflow-hidden"
      }`}
    >
      {/* Header */}
      <header
        className={`flex items-center justify-between ${expand ? "flex-row gap-10" : "flex-col gap-8"}`}
      >
        <Image
          alt="logo"
          src={assets.hudson_logo}
          className="transition-all h-10 w-12 object-contain px-2 contrast-0"
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
            className={`z-50 absolute w-max ${
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

      {/* Botón Nuevo chat */}
      <button
        onClick={user ? prepareNewChat : clearChatGuest}
        disabled={disabledResetChatGuest}
        className={`flex items-center mb-auto transition ${
          disabledResetChatGuest
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
        } ${
          expand
            ? "bg-accent-primary hover:bg-accent-hover rounded-2xl gap-2 py-2.5 px-3 w-full shadow-md"
            : "justify-center group relative h-9 w-9 mx-auto hover:bg-white/10 rounded-lg"
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
        {user ? (
          <>
            <p className="mb-2 text-text-muted text-xs font-semibold uppercase tracking-wider">
              Recientes
            </p>
            {/* 3. Bloqueamos interacciones en la lista de chats mientras responde */}
            <div
              className={`h-full overflow-y-auto overflow-x-hidden transition-opacity ${
                isGenerating ? "pointer-events-none opacity-60" : ""
              }`}
            >
              {fetchingChats ? (
                <div className="flex flex-col gap-2 py-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-9 w-full bg-white/5 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : sortedChats.length > 0 ? (
                sortedChats.map((chat, index) => (
                  <ChatLabel
                    key={`${chat._id}-${index}`}
                    id={chat._id}
                    title={chat.name}
                    chats={sortedChats}
                    openMenuChat={openMenuChat}
                    setOpenMenuChat={setOpenMenuChat}
                  />
                ))
              ) : (
                <div className="flex flex-col px-3 py-6">
                  <p className="text-text-main font-medium text-xs mb-1">
                    Sin conversaciones
                  </p>
                  <p className="text-text-muted text-xs leading-relaxed">
                    Aquí aparecerán tus chats guardados una vez que inicies una
                    conversación.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-4 my-auto bg-white/5 rounded-2xl border border-white/10">
            <p className="text-text-main font-medium text-sm mb-1">
              Guarda tu historial
            </p>
            <p className="text-text-muted text-xs leading-relaxed">
              Inicia sesión o crea una cuenta para guardar tus conversaciones y
              acceder a múltiples chats.
            </p>
          </div>
        )}
      </main>

      {/* Perfil / Autenticación */}
      <div
        className={`flex items-center ${
          expand ? "hover:bg-bg-card rounded-lg p-2" : "justify-center w-full"
        } gap-3 text-text-muted text-sm mt-2 transition-colors`}
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
                <span className="text-sm font-medium text-text-main truncate">
                  {user.fullName || user.username || "Usuario"}
                </span>
                <span className="text-xs text-text-muted truncate">
                  {user.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            )}
          </>
        ) : (
          <button
            disabled={isGenerating}
            onClick={() => openSignIn()}
            className="flex items-center justify-center gap-3 w-full cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Image
              alt="profile"
              className="w-7 h-7 opacity-75"
              src={assets.profile}
            />
            {expand && (
              <span className="text-text-main font-medium w-full text-left">
                Iniciar Sesión
              </span>
            )}
          </button>
        )}
      </div>
    </aside>
  );
};
