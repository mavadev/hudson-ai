"use client";

import Image from "next/image";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";

import assets from "@/assets";
import { useAppContext } from "@/context/AppContext";

export const PromptBox = () => {
  const { sendPrompt, isGenerating, stopGenerating } = useAppContext();
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-ajuste de altura dinámico
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`;
  }, [prompt]);

  // Enter para enviar, Shift+Enter para salto de línea
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      if (isGenerating) return;

      event.preventDefault();
      void handleSubmit();
    }
  };

  // Enviar el prompt al backend
  const handleSubmit = async () => {
    if (isGenerating) return;

    const normalizedPrompt = prompt.trim();
    if (!normalizedPrompt) return;

    setPrompt("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }

    try {
      await sendPrompt(normalizedPrompt);
    } catch (error) {
      setPrompt(normalizedPrompt);
      toast.error(
        error instanceof Error ? error.message : "Error al enviar el mensaje",
      );
    }
  };

  const isTextEmpty = !prompt.trim();
  const isSubmitDisabled = !isGenerating && isTextEmpty;

  return (
    <div className="relative w-full shrink-0 flex justify-center">
      {/* Degradado de transición conectado a --color-bg-main */}
      <div className="pointer-events-none absolute -top-12 left-0 right-0 h-12 bg-gradient-to-t from-bg-main via-bg-main/60 to-transparent" />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (isGenerating) {
            stopGenerating();
          } else {
            void handleSubmit();
          }
        }}
        className="mb-4 flex w-[calc(100%-2rem)] sm:w-full max-w-2xl flex-col items-end gap-2 rounded-2xl border border-white/5 bg-bg-input px-4 py-3 sm:px-5 shadow-2xl transition-all focus-within:border-accent-primary/60 relative z-10"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isGenerating
              ? "Hudson AI está respondiendo..."
              : "Envía tu mensaje a Hudson AI..."
          }
          className="max-h-48 w-full resize-none bg-transparent leading-6 text-text-main outline-none placeholder:text-text-muted overflow-y-auto"
        />

        <div className="flex w-max items-center justify-end">
          <div className="flex items-center gap-4">
            <Image
              alt="Búsqueda"
              className="h-5 w-auto cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
              src={assets.search}
            />

            <button
              type="submit"
              disabled={isSubmitDisabled}
              aria-label={
                isGenerating ? "Detener generación" : "Enviar mensaje"
              }
              className={`flex items-center justify-center rounded-full p-2.5 transition-all ${
                isGenerating
                  ? "bg-red-600/80 hover:bg-red-600 text-white cursor-pointer"
                  : !isTextEmpty
                    ? "bg-accent-primary hover:bg-accent-hover text-white cursor-pointer"
                    : "bg-disabled/60 text-text-muted/40 cursor-not-allowed"
              }`}
            >
              {isGenerating ? (
                <span className="h-3.5 w-3.5 rounded-sm bg-white" />
              ) : (
                <Image
                  alt="Enviar mensaje"
                  aria-hidden="true"
                  className="aspect-square w-3.5"
                  src={!isTextEmpty ? assets.send : assets.send_disabled}
                />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
