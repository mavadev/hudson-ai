import { useEffect, useRef } from "react";

import { Message } from "@/interfaces/Message";
import { MessageBox } from "./MessageBox";

interface ConversationProps {
  messages: Message[];
  isLoading: boolean;
}

export const Conversation = ({ messages, isLoading }: ConversationProps) => {
  const shouldAutoScrollRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < 120;
  };

  const scrollKey = [
    messages.length,
    messages.at(-1)?.content.length ?? 0,
    isLoading ? "loading" : "idle",
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
      className="mt-20 min-h-0 w-full flex-1 overflow-y-auto px-4"
    >
      <div className="pb-16 mx-auto w-full max-w-4xl flex flex-col gap-6">
        {messages.map((message, index) => (
          <MessageBox
            key={`${message.timestamp}-${message.role}-${index}`}
            role={message.role}
            content={message.content}
          />
        ))}
      </div>
    </section>
  );
};
