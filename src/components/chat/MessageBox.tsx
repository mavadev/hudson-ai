import Prism from "prismjs";
import Image from "next/image";
import { useEffect } from "react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

import assets from "@/assets";
import { MessageRole } from "@/interfaces/Message";

interface MessageProps {
  role: MessageRole;
  content: string;
}

export const MessageBox = ({ role, content }: MessageProps) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [content]);

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Mensaje copiado al portapapeles");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al copiar");
    }
  };

  if (role === "user")
    return (
      <div className="w-full flex flex-col items-end">
        <div className="group relative rounded-3xl bg-yellow-950 px-6 py-4 max-w-2/3">
          <div className="opacity-0 group-hover:opacity-100 absolute -left-6 top-4 transition-all">
            <Image
              alt="Copy"
              src={assets.copy}
              onClick={copyMessage}
              className="w-4 cursor-pointer"
            />
          </div>
          <span className="text-white/90 text-base leading-6">{content}</span>
        </div>
      </div>
    );

  return (
    <div className="w-full">
      <div className="group py-0 flex gap-4">
        {/*Logo*/}
        <Image
          alt="Hudson AI Logo"
          src={assets.hudson_logo}
          className="h-10 w-10 p-2 border border-amber-900 rounded-full bg-amber-800 hidden sm:block"
        />
        {/*Loading*/}
        <div
          className={`flex items-center gap-1 ${!content.length ? "" : "hidden"}`}
        >
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300 [animation-delay:0.2s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300 [animation-delay:0.4s]" />
        </div>

        {/*Contenido*/}
        <div className="space-y-3 w-full text-slate-200 text-base leading-relaxed relative prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
          <Markdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              // Encabezados
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-white mt-4 mb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold text-slate-100 mt-5 mb-2 border-b border-slate-800 pb-1">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold text-slate-100 mt-4 mb-1">
                  {children}
                </h3>
              ),
              // Bloques de código
              code: ({ className, children, ...props }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code
                      className="bg-slate-800 text-amber-200 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-700/50"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }
                return (
                  <code
                    className={`${className} font-mono text-2xl`}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <div className="relative my-4 rounded-xl border border-slate-800 bg-[#1e1e1e] overflow-hidden shadow-lg">
                  <pre className="p-4 overflow-x-auto leading-6 ">
                    {children}
                  </pre>
                </div>
              ),

              // Párrafos y texto estructurado
              p: ({ children }) => (
                <p className="mb-3 text-slate-300 leading-relaxed">
                  {children}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-white">{children}</strong>
              ),
              hr: () => <hr className="border-slate-800 my-4" />,

              // Listas
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1.5 my-3 text-slate-300 pl-1">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1.5 my-3 text-slate-300 pl-1">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-normal">{children}</li>
              ),

              // Tablas
              table: ({ children }) => (
                <div className="overflow-x-auto my-4 rounded-lg border border-slate-800">
                  <table className="table-auto w-full text-left text-sm">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-slate-800/80 text-amber-400 font-semibold">
                  {children}
                </thead>
              ),
              th: ({ children }) => (
                <th className="border-b border-slate-700 px-4 py-2.5">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border-b border-slate-800/60 px-4 py-2.5 text-slate-300">
                  {children}
                </td>
              ),
            }}
          >
            {content}
          </Markdown>

          {/*Acciones*/}
          <div
            className={`opacity-0 group-hover:opacity-100 absolute left-0 -bottom-6 transition-all ${!content.length && "hidden"}`}
          >
            <div className="flex items-center gap-2 opacity-70">
              <Image
                alt="Copy"
                src={assets.copy}
                onClick={copyMessage}
                className="w-4.5 cursor-pointer"
              />
              <Image
                alt="Like"
                src={assets.like}
                className="w-4.5 cursor-pointer"
              />
              <Image
                alt="Dislike"
                src={assets.dislike}
                className="w-4.5 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
