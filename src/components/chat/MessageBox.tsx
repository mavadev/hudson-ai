import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";

import assets from "@/assets";
import { MessageRole } from "@/interfaces/Message";
import { CodeBlockHeader } from "./CodeBlockHeader";

const MAX_USER_MSG_LENGTH = 300;
interface MessageProps {
  role: MessageRole;
  content: string;
}

export const MessageBox = ({ role, content }: MessageProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Mensaje copiado al portapapeles");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al copiar");
    }
  };

  // Renderizado para mensajes del usuario
  if (role === "user") {
    const isLongMessage = content.length > MAX_USER_MSG_LENGTH;
    const displayedContent =
      isLongMessage && !isExpanded
        ? `${content.slice(0, MAX_USER_MSG_LENGTH)}...`
        : content;

    return (
      <div className="w-full flex flex-col items-end">
        <div className="group relative rounded-2xl bg-bg-card border border-white/10 px-5 py-3.5 max-w-[85%] sm:max-w-[75%] transition-colors">
          {/* Botón flotante para copiar */}
          <div className="opacity-0 group-hover:opacity-100 absolute -left-8 bottom-3 transition-opacity">
            <button
              type="button"
              onClick={copyMessage}
              title="Copiar mensaje"
              className="p-1 cursor-pointer rounded-md transition-colors"
            >
              <Image
                alt="Copiar"
                src={assets.copy}
                className="w-4 h-4 opacity-70 hover:opacity-100"
              />
            </button>
          </div>

          {/* Texto del mensaje */}
          <p className="text-text-main text-base leading-relaxed whitespace-pre-wrap break-words">
            {displayedContent}
          </p>

          {/* Opción Ver más / Ver menos */}
          {isLongMessage && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="mt-3 text-xs font-medium text-text-muted hover:text-text-main transition-colors cursor-pointer block uppercase"
            >
              {isExpanded ? "Ver menos..." : "Ver más..."}
            </button>
          )}
        </div>
      </div>
    );
  }

  const isGeneratingOrEmpty = !content || content.length === 0;

  // Función helper para extraer texto plano de los nodos React
  const extractText = (node: React.ReactNode): string => {
    if (typeof node === "string" || typeof node === "number") {
      return String(node);
    }
    if (Array.isArray(node)) {
      return node.map(extractText).join("");
    }
    if (node && typeof node === "object" && "props" in node) {
      return extractText(
        (node as React.ReactElement<{ children?: React.ReactNode }>).props
          .children,
      );
    }
    return "";
  };

  // Renderizado para respuestas de la IA
  return (
    <div className="w-full">
      <div className="group py-0 flex gap-4">
        {/* Logo de la IA */}
        <div className="h-10 w-10 p-1.5 border border-accent-primary rounded-full bg-accent-primary items-center justify-center shrink-0 hidden sm:flex">
          <Image
            alt="Hudson AI Logo"
            src={assets.hudson_logo}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Contenido / Indicador de Carga */}
        <div className="space-y-3 w-full text-text-main text-base leading-relaxed relative prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
          {isGeneratingOrEmpty ? (
            <div className="flex items-center gap-1.5 py-2">
              <span className="h-2 w-2 animate-bounce rounded-full bg-text-muted" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-text-muted [animation-delay:0.2s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-text-muted [animation-delay:0.4s]" />
            </div>
          ) : (
            <>
              <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                  rehypeHighlight,
                  [
                    rehypeSanitize,
                    {
                      attributes: {
                        "*": ["className"],
                      },
                    },
                  ],
                ]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-text-main mt-4 mb-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-text-main mt-5 mb-2 border-b border-white/10 pb-1">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-text-main mt-4 mb-1">
                      {children}
                    </h3>
                  ),
                  code: ({ className, children, ...props }) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code
                          className="bg-bg-card text-text-main px-1.5 py-0.5 rounded text-sm font-mono border border-white/10"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code
                        className={`${className} font-mono md:!text-base whitespace-pre block`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children, ...props }) => {
                    const childArray = Array.isArray(children)
                      ? children
                      : [children];
                    const codeElement = childArray[0] as React.ReactElement<{
                      className?: string;
                      children?: React.ReactNode;
                    }>;

                    const className = codeElement?.props?.className || "";
                    const match = /hljs language-(\w+)|language-(\w+)/.exec(
                      className,
                    );
                    const language = match ? match[1] || match[2] : "";
                    const rawCode = extractText(
                      codeElement?.props?.children,
                    ).replace(/\n$/, "");

                    return (
                      <div className="relative my-4 rounded-xl border border-white/10 bg-bg-card overflow-hidden shadow-md group/code">
                        <CodeBlockHeader
                          language={language}
                          rawCode={rawCode}
                        />
                        <pre
                          className="overflow-x-auto text-sm leading-relaxed font-mono "
                          {...props}
                        >
                          {children}
                        </pre>
                      </div>
                    );
                  },
                  p: ({ children }) => (
                    <p className="mb-3 text-text-main leading-relaxed">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-text-main">
                      {children}
                    </strong>
                  ),
                  hr: () => <hr className="border-white/10 my-4" />,
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1.5 my-3 text-text-main pl-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1.5 my-3 text-text-main pl-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 rounded-lg border border-white/10">
                      <table className="table-auto w-full text-left text-sm">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-bg-card text-text-main font-semibold">
                      {children}
                    </thead>
                  ),
                  th: ({ children }) => (
                    <th className="border-b border-white/10 px-4 py-2.5">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border-b border-white/5 px-4 py-2.5 text-text-muted">
                      {children}
                    </td>
                  ),
                }}
              >
                {content}
              </Markdown>

              {/* Acciones para el mensaje de la IA */}
              <div className="opacity-0 group-hover:opacity-100 absolute left-0 -bottom-6 transition-opacity">
                <div className="flex items-center gap-2 opacity-70">
                  <button
                    type="button"
                    onClick={copyMessage}
                    className="p-1 cursor-pointer hover:bg-white/10 rounded transition-colors"
                    title="Copiar respuesta"
                  >
                    <Image alt="Copy" src={assets.copy} className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-1 cursor-pointer hover:bg-white/10 rounded transition-colors"
                    title="Me gusta"
                  >
                    <Image alt="Like" src={assets.like} className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-1 cursor-pointer hover:bg-white/10 rounded transition-colors"
                    title="No me gusta"
                  >
                    <Image
                      alt="Dislike"
                      src={assets.dislike}
                      className="w-4 h-4"
                    />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
