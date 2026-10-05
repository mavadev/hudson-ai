// src/components/CodeBlockHeader.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import assets from "@/assets";

interface CodeBlockHeaderProps {
  language: string;
  rawCode: string;
}

export const CodeBlockHeader = ({
  language,
  rawCode,
}: CodeBlockHeaderProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Error al copiar el código");
    }
  };

  return (
    <div className="flex items-center justify-between bg-bg-sidebar/90 border-b border-white/10 px-4 py-1.5 text-xs text-text-muted select-none">
      <span className="font-mono lowercase text-text-muted">
        {language || "code"}
      </span>
      <button
        type="button"
        onClick={handleCopyCode}
        className="flex items-center gap-1 hover:text-text-main transition-colors cursor-pointer"
        title="Copiar bloque de código"
      >
        <Image
          alt="Copiar código"
          src={assets.copy}
          className="w-3.5 h-3.5 opacity-70"
        />
        <span>{copied ? "¡Copiado!" : "Copiar código"}</span>
      </button>
    </div>
  );
};
