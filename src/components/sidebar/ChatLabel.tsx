import Image from "next/image";
import toast from "react-hot-toast";
import { memo, useCallback } from "react";

import assets from "@/assets";
import { Chat } from "@/interfaces/Chat";
import { useAppContext } from "@/context/AppContext";

interface ChatLabelProps {
  id: string;
  title: string;
  chats: Chat[];
  openMenuChat: string | null;
  setOpenMenuChat: React.Dispatch<React.SetStateAction<string | null>>;
}

const ChatLabelComponent = ({
  id,
  title,
  chats,
  openMenuChat,
  setOpenMenuChat,
}: ChatLabelProps) => {
  const {
    selectedChat,
    setSelectedChat,
    renameExistingChat,
    deleteExistingChat,
  } = useAppContext();

  const isSelected = selectedChat?._id === id;

  const handleSelectChat = useCallback(() => {
    const chatSelected = chats.find((chat) => chat._id === id);
    if (chatSelected) setSelectedChat(chatSelected);
  }, [chats, id, setSelectedChat]);

  const handleRename = useCallback(async () => {
    const newTitle = prompt("Ingresa un nuevo nombre:");
    if (!newTitle?.trim()) return;

    try {
      await renameExistingChat(id, newTitle.trim());
      setOpenMenuChat(null);
      toast.success("Chat renombrado correctamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ocurrió un error");
    }
  }, [id, renameExistingChat, setOpenMenuChat]);

  const handleDelete = useCallback(async () => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de eliminar este chat?",
    );
    if (!confirmDelete) return;

    try {
      await deleteExistingChat(id);
      setOpenMenuChat(null);
      toast.success("Chat eliminado correctamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ocurrió un error");
    }
  }, [id, deleteExistingChat, setOpenMenuChat]);

  return (
    <div
      onClick={handleSelectChat}
      className={`flex items-center justify-between p-2 rounded-xl text-sm cursor-pointer group transition-colors mb-1 ${
        isSelected
          ? "bg-bg-card text-text-main font-medium"
          : "text-text-muted hover:bg-bg-card/50 hover:text-text-main"
      }`}
    >
      {/* Título del chat */}
      <p className="truncate text-sm h-6 flex items-center">
        {title || "Nuevo Chat"}
      </p>

      {/* Acciones */}
      <div
        className={`${
          openMenuChat === id ? "grid" : "hidden"
        } group-hover:grid place-items-center relative h-6 aspect-square hover:bg-white/10 rounded-lg transition-colors`}
      >
        {/* Botón tres puntos */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenuChat((prevId) => (prevId === id ? null : id));
          }}
          className="flex items-center justify-center w-full h-full cursor-pointer"
        >
          <Image
            alt="menu"
            className="w-4 rotate-90 opacity-70 group-hover:opacity-100"
            src={assets.three_dots}
          />
        </button>

        {/* Menú desplegable */}
        <div
          className={`absolute right-0 top-8 z-50 bg-menu-bg border border-white/10 rounded-xl shadow-xl overflow-hidden w-40 ${
            openMenuChat === id ? "block" : "hidden"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRename();
            }}
            className="flex items-center gap-3 hover:bg-white/10 px-4 py-2.5 w-full text-text-main cursor-pointer transition-colors"
          >
            <Image alt="rename" className="w-4 opacity-80" src={assets.edit} />
            <span className="text-sm">Renombrar</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="flex items-center gap-3 hover:bg-white/10 px-4 py-2.5 w-full text-red-400 hover:text-red-300 cursor-pointer transition-colors"
          >
            <Image
              alt="delete"
              className="w-4 opacity-80"
              src={assets.remove}
            />
            <span className="text-sm">Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ChatLabel = memo(ChatLabelComponent);
ChatLabel.displayName = "ChatLabel";
