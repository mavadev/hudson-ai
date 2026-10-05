"use client";

import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
  type PropsWithChildren,
  useRef,
} from "react";

import type { Message } from "@/interfaces/Message";
import type { Chat } from "@/interfaces/Chat";
import * as chatService from "@/services/chatService";
import { storageService } from "@/services/storageService";

type ChatUpdater = (chat: Chat) => Chat;

interface AppContextProps {
  // Chats
  chats: Chat[];
  selectedChat: Chat | null;
  setSelectedChat: Dispatch<SetStateAction<Chat | null>>;

  // Loaders
  isGenerating: boolean;
  fetchingChats: boolean;

  // Acciones Generales
  sendPrompt: (
    prompt: string,
    onChunk?: (chunk: string) => void,
  ) => Promise<void>;
  stopGenerating: () => void;

  // Acciones Invitado
  clearChatGuest: () => void;

  // Acciones Autenticado
  prepareNewChat: () => void;
  renameExistingChat: (chatId: string, name: string) => Promise<void>;
  updateChatLocally: (chatId: string, updater: ChatUpdater) => void;
  deleteExistingChat: (chatId: string) => Promise<void>;
}

const AppContext = createContext<AppContextProps | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error(
      "useAppContext debe utilizarse dentro de AppContextProvider",
    );
  }
  return context;
};

export const AppContextProvider = ({ children }: PropsWithChildren) => {
  const { user, isLoaded } = useUser();

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [fetchingChats, setIsFetchingChats] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Actualizar un chat en memoria como en selección
  const updateChatLocally = useCallback(
    (chatId: string, updater: ChatUpdater) => {
      setChats((previousChats) =>
        previousChats.map((chat) =>
          chat._id === chatId ? updater(chat) : chat,
        ),
      );
      setSelectedChat((previousChat) =>
        previousChat?._id === chatId ? updater(previousChat) : previousChat,
      );
    },
    [],
  );

  //
  const stopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  }, []);

  // Cargar chats
  const fetchChats = useCallback(async () => {
    console.log("Fetching chats...");
    setIsGenerating(true);

    try {
      if (!user) {
        const guestChat = storageService.getGuestChat();
        setSelectedChat(guestChat || null);
      } else {
        const remoteChats = await chatService.getChats();
        setChats(remoteChats);
      }
    } catch (error) {
      console.error("Error al obtener historial de chats:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [user]);

  // Abrir un nuevo chat (sin crearlo)
  const prepareNewChat = useCallback(() => {
    setSelectedChat(null);
  }, []);

  // Crear un nuevo chat explícito
  const createNewChat = useCallback(async () => {
    console.log("Creating new chat...");
    if (user) {
      const newChat = await chatService.createChat();
      setChats((prev) => [newChat, ...prev]);
      setSelectedChat(newChat);
      return newChat;
    } else {
      const newGuestChat: Chat = {
        _id: `guest_${Date.now()}`,
        name: "",
        messages: [],
        createdAt: new Date().toISOString(),
      };
      storageService.saveGuestChat(newGuestChat);
      setSelectedChat(newGuestChat);
      return newGuestChat;
    }
  }, [user]);

  // Renombrar chat
  const renameExistingChat = useCallback(
    async (chatId: string, name: string) => {
      console.log("Renaming chat...");
      if (user) {
        await chatService.renameChat(chatId, name);
      }
      updateChatLocally(chatId, (chat) => ({ ...chat, name }));
    },
    [user, updateChatLocally],
  );

  // Eliminar chat
  const deleteExistingChat = useCallback(
    async (chatId: string) => {
      console.log("Deleting chat...");
      if (user) {
        await chatService.deleteChat(chatId);
      }
      setChats((prev) => {
        const remaining = prev.filter((c) => c._id !== chatId);
        setSelectedChat((curr) =>
          curr?._id === chatId ? (remaining[0] ?? null) : curr,
        );
        return remaining;
      });
    },
    [user],
  );

  const clearChatGuest = useCallback(() => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de eliminar este chat?",
    );
    if (confirmDelete) {
      prepareNewChat();
      storageService.deleteGuestChat();
      toast.success("Chat reseteado con éxito");
    }
  }, [prepareNewChat]);

  // Enviar mensaje a la IA
  const sendPrompt = useCallback(
    async (prompt: string, onChunk?: (chunk: string) => void) => {
      console.log("Sending prompt...");
      setIsGenerating(true);

      let activeChat = selectedChat;

      // Crear chat si no existe uno activo
      if (!activeChat) {
        activeChat = await createNewChat();
      }
      const chatId = activeChat._id;
      const prevMessages = activeChat.messages;

      // Definimos ambos mensajes
      const userMessage: Message = {
        _id: `msg_user_${Date.now()}`,
        role: "user",
        content: prompt,
        timestamp: new Date().toISOString(),
      };

      const aiMessageId = `msg_ai_${Date.now()}`;
      const aiMessage: Message = {
        _id: aiMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };

      // Actualizamos el chat
      updateChatLocally(chatId, (chat) => {
        const updated = {
          ...chat,
          messages: [...chat.messages, userMessage, aiMessage],
          updatedAt: new Date().toISOString(),
        };
        if (!user) storageService.saveGuestChat(updated);
        return updated;
      });

      // Crear nuevo AbortController para esta petición
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Petición a la API (Streaming)
      let accumulatedText = "";
      try {
        await chatService.sendPromptStream(
          prompt,
          chatId,
          prevMessages,
          (chunk) => {
            accumulatedText += chunk;
            if (onChunk) onChunk(chunk);

            updateChatLocally(chatId, (chat) => {
              const updatedMessages = chat.messages.map((m) =>
                m._id === aiMessageId ? { ...m, content: accumulatedText } : m,
              );
              const updated = { ...chat, messages: updatedMessages };
              if (!user) storageService.saveGuestChat(updated);
              return updated;
            });
          },
          (newTitle) => {
            console.log("Renaming chat to:", newTitle);
            updateChatLocally(chatId, (chat) => {
              const updated = { ...chat, name: newTitle };
              if (!user) storageService.saveGuestChat(updated);
              return updated;
            });
          },
          controller.signal,
        );
      } catch (error) {
        let finalResponse = accumulatedText.trim();

        // Manejar cancelación voluntaria de la petición
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Generación cancelada por el usuario.");
          if (!finalResponse)
            finalResponse = "Respuesta cancelada por el usuario.";
        } else {
          console.error("Error al transmitir respuesta:", error);
          if (!finalResponse)
            finalResponse = "No se pudo obtener una respuesta del asistente.";
        }

        // En caso de error, puedes limpiar o colocar un mensaje de fallo en el aiMessage
        updateChatLocally(chatId, (chat) => {
          const updatedMessages = chat.messages.map((m) =>
            m._id === aiMessageId
              ? {
                  ...m,
                  content: finalResponse,
                }
              : m,
          );
          const updated = { ...chat, messages: updatedMessages };
          if (!user) storageService.saveGuestChat(updated);
          return updated;
        });
      } finally {
        abortControllerRef.current = null;
        setIsGenerating(false);
      }
    },
    [selectedChat, createNewChat, updateChatLocally, user],
  );

  // Efecto para sincronizar la carga de chats
  useEffect(() => {
    if (!isLoaded) return;

    const handleChatsFlow = async () => {
      if (!user) return await fetchChats();

      try {
        setIsFetchingChats(true);

        // Verificar si hay chat local
        const guestChat = storageService.getGuestChat();
        const hasGuestMessages = guestChat && guestChat.messages.length > 0;

        // Sincronizamos el usuario en la DB y el chat local
        await fetch("/api/chat/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guestChat: hasGuestMessages ? guestChat : null,
          }),
        });

        // Limpiamos el chat en local
        if (guestChat) {
          storageService.deleteGuestChat();
        }
        await fetchChats();
        console.log(`[AppContext] Sincronización completada.`);
      } catch (error) {
        console.error("Error durante la sincronización inicial:", error);
        toast.error(
          "Error durante la sincronización. Por favor, intenta nuevamente.",
        );
      } finally {
        setIsFetchingChats(false);
      }
    };

    handleChatsFlow();
  }, [isLoaded, user, fetchChats]);
  return (
    <AppContext.Provider
      value={{
        chats,
        selectedChat,
        setSelectedChat,
        isGenerating,
        fetchingChats,
        sendPrompt,
        stopGenerating,
        clearChatGuest,
        prepareNewChat,
        renameExistingChat,
        deleteExistingChat,
        updateChatLocally,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
