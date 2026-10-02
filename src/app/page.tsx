"use client";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { EmptyState } from "@/components/chat/EmptyState";
import { Conversation } from "@/components/chat/Conversation";
import { PromptBox } from "@/components/chat/PromptBox";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  const { selectedChat, isLoading } = useAppContext();

  const [expand, setExpand] = useState(false);
  const messages = selectedChat?.messages ?? [];

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar
        expand={expand}
        onToggleSidebar={() => setExpand((exp) => !exp)}
      />

      <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[#141414] text-white">
        {/* Encabezado móvil */}
        <ChatHeader
          chatName={selectedChat?.name}
          onToggleSidebar={() => setExpand((exp) => !exp)}
        />

        {/* Contenido central */}
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <Conversation messages={messages} isLoading={isLoading} />
        )}

        <PromptBox />
        <Footer />
      </main>
    </div>
  );
}
