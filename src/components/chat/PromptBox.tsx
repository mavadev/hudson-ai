"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

import assets from "@/assets";
import { useAppContext } from "@/context/AppContext";

export const PromptBox = () => {
  const { isLoading, sendPrompt } = useAppContext();

  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const handleSend = async () => {
    const normalizedPrompt = prompt.trim();

    if (!normalizedPrompt) {
      toast.error("No puedes enviar un mensaje vacío");
      return;
    }

    if (isLoading) {
      toast.error("Debes esperar a que termine tu petición");
      return;
    }

    setPrompt("");
    textareaRef.current?.focus();

    try {
      await sendPrompt(normalizedPrompt);
    } catch (error) {
      // Restaurar el prompt si falla el envío
      setPrompt(normalizedPrompt);
      toast.error(
        error instanceof Error ? error.message : "Error al enviar el mensaje",
      );
    }
  };

  return (
    <div className="flex shrink-0 justify-center">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend();
        }}
        className="mb-4 w-full max-w-2xl rounded-2xl bg-[#404045] px-7 py-3.5 transition-all flex flex-col items-end gap-2"
      >
        <textarea
          ref={textareaRef}
          value={prompt}
          onKeyDown={handleKeyDown}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Envía tu mensaje a Hudson AI"
          className="w-full resize-none overflow-auto break-words leading-6 outline-none field-sizing-content max-h-48"
        />
        <div className="flex items-center justify-end w-max">
          <div className="flex items-center gap-4">
            <Image alt="Búsqueda" className="h-5" src={assets.search} />

            <button
              type="submit"
              aria-label="Enviar mensaje"
              disabled={!prompt.trim() || isLoading}
              className={`cursor-pointer rounded-full p-2 transition disabled:cursor-not-allowed ${
                prompt.trim() && !isLoading ? "bg-amber-800" : "bg-[#71717a]"
              }`}
            >
              <Image
                alt="Enviar mensaje"
                className="aspect-square w-3.5"
                src={
                  prompt.trim() && !isLoading
                    ? assets.send
                    : assets.send_disabled
                }
              />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
