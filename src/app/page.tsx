"use client";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";

import { Sidebar } from "@/components/sidebar";
import {
  ChatHeader,
  EmptyState,
  Conversation,
  PromptBox,
} from "@/components/chat";
import { Footer } from "@/components/layout";

export default function Home() {
  const { selectedChat, isGenerating } = useAppContext();

  const [expand, setExpand] = useState(false);
  const messages = selectedChat?.messages ?? [];

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar
        expand={expand}
        onToggleSidebar={() => setExpand((exp) => !exp)}
      />

      <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-bg-main text-text-main">
        {/* Backdrop para cerrar la Sidebar en pantallas pequeñas */}
        {expand && (
          <div
            className="fixed inset-0 z-20 bg-black/50 md:hidden"
            onClick={() => setExpand(false)}
          />
        )}
        {/* Encabezado móvil */}
        <ChatHeader
          chatName={selectedChat?.name}
          openSidebar={() => setExpand(true)}
        />
        {/* Contenido central */}
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <Conversation messages={messages} isGenerating={isGenerating} />
        )}
        {/* PromptBox para enviar prompts al modelo */}
        <PromptBox />
        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}
