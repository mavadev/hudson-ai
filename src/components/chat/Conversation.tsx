import { useEffect, useRef, useState } from "react";
import { Message } from "@/interfaces/Message";
import { MessageBox } from "./MessageBox";

interface ConversationProps {
  messages: Message[];
  isGenerating: boolean;
}

export const Conversation = ({ messages, isGenerating }: ConversationProps) => {
  const shouldAutoScrollRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    // Se activa la auto-navegación solo si estamos cerca del fondo
    const isNearBottom = distanceFromBottom < 120;
    shouldAutoScrollRef.current = isNearBottom;

    // Mostrar el botón cuando la distancia al fondo sea mayor a 200px
    setShowScrollButton(distanceFromBottom > 200);
  };

  const scrollToBottom = () => {
    const container = containerRef.current;
    if (!container) return;

    shouldAutoScrollRef.current = true;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  };

  const scrollKey = [
    messages.length,
    messages.at(-1)?.content.length ?? 0,
    isGenerating ? "loading" : "idle",
  ].join(":");

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !shouldAutoScrollRef.current) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [scrollKey]);

  return (
    <section
      ref={containerRef}
      onScroll={handleScroll}
      aria-label="Conversación actual"
      className="relative mt-20 min-h-0 w-full flex-1 overflow-y-auto px-4 scroll-smooth"
    >
      {/* Listado de Mensajes */}
      <div className="pb-20 mx-auto w-full max-w-4xl flex flex-col gap-8">
        {messages.map((message, index) => (
          <MessageBox
            key={`${message.timestamp}-${message.role}-${index}`}
            role={message.role}
            content={message.content}
          />
        ))}
      </div>

      {/* Botón Flotante para ir abajo */}
      {showScrollButton && (
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Ir al final de la conversación"
          className="fixed bottom-40 right-5 md:right-16 z-20 flex h-12 md:h-14 w-12 md:w-14 items-center justify-center rounded-full border border-white/10 bg-bg-card/90 text-text-main shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-bg-card hover:border-white/20 active:scale-95 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5 opacity-80 transition-opacity hover:opacity-100"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
            />
          </svg>
        </button>
      )}
    </section>
  );
};
