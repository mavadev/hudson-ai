"use client";

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
} from "react";

import type { Message } from "@/interfaces/Message";
import type { Chat } from "@/interfaces/Chat";
import * as chatService from "@/services/chatService";
import { storageService } from "@/services/storageService";
import toast from "react-hot-toast";

type ChatUpdater = (chat: Chat) => Chat;

interface AppContextProps {
  chats: Chat[];
  selectedChat: Chat | null;
  setSelectedChat: Dispatch<SetStateAction<Chat | null>>;
  isLoading: boolean;

  fetchChats: () => Promise<void>;
  createNewChat: () => Promise<Chat>;
  renameExistingChat: (chatId: string, name: string) => Promise<void>;
  deleteExistingChat: (chatId: string) => Promise<void>;
  updateChatLocally: (chatId: string, updater: ChatUpdater) => void;

  sendPrompt: (
    prompt: string,
    onChunk?: (chunk: string) => void,
  ) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  // Cargar chats
  const fetchChats = useCallback(async () => {
    console.log("Fetching chats...");
    setIsLoading(true);

    try {
      if (user) {
        const remoteChats = await chatService.getChats();
        setChats(remoteChats);
        setSelectedChat((prev) =>
          prev
            ? (remoteChats.find((c) => c._id === prev._id) ??
              remoteChats[0] ??
              null)
            : (remoteChats[0] ?? null),
        );
      } else {
        const guestChats = storageService.getGuestChats();
        setChats(guestChats);
        setSelectedChat((prev) =>
          prev
            ? (guestChats.find((c) => c._id === prev._id) ??
              guestChats[0] ??
              null)
            : (guestChats[0] ?? null),
        );
      }
    } catch (error) {
      console.error("Error al obtener historial de chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

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
      setChats((prev) => [newGuestChat, ...prev]);
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
      updateChatLocally(chatId, (chat) => {
        const updated = { ...chat, name };
        if (!user) storageService.saveGuestChat(updated);
        return updated;
      });
    },
    [user, updateChatLocally],
  );

  // Eliminar chat
  const deleteExistingChat = useCallback(
    async (chatId: string) => {
      console.log("Deleting chat...");
      if (user) {
        await chatService.deleteChat(chatId);
      } else {
        storageService.deleteGuestChat(chatId);
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

  // Enviar mensaje a la IA
  const sendPrompt = useCallback(
    async (prompt: string, onChunk?: (chunk: string) => void) => {
      console.log("Sending prompt...");
      setIsLoading(true);

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
        );
      } catch (error) {
        console.error("Error al transmitir respuesta:", error);

        // En caso de error, puedes limpiar o colocar un mensaje de fallo en el aiMessage
        updateChatLocally(chatId, (chat) => {
          const updatedMessages = chat.messages.map((m) =>
            m._id === aiMessageId
              ? {
                  ...m,
                  content:
                    "Ocurrió un error al generar la respuesta. Intenta de nuevo.",
                }
              : m,
          );
          const updated = { ...chat, messages: updatedMessages };
          if (!user) storageService.saveGuestChat(updated);
          return updated;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [selectedChat, createNewChat, updateChatLocally, user],
  );

  // Efecto para sincronizar la carga de chats
  useEffect(() => {
    if (!isLoaded) return;

    const handleChatsFlow = async () => {
      const GUEST_KEY = "hudson_guest_chats";

      // Sincronizar usuario y chats de local
      console.log({ user });
      if (user) {
        console.log(
          `[AppContext] Sincronizando usuario ${user.id} y chats locales.`,
        );
        try {
          const localData = localStorage.getItem(GUEST_KEY);
          const guestChats = localData ? JSON.parse(localData) : [];

          console.log(
            `[AppContext] Chats locales cargados: ${guestChats.length}`,
          );

          // Sincronizamos los chats en local y el usuario en la DB
          await fetch("/api/chat/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              guestChats,
              userData: {
                email: user.primaryEmailAddress?.emailAddress,
                name: user.fullName || user.username,
                avatar: user.imageUrl,
              },
            }),
          });

          console.log(`[AppContext] Sincronización completada.`);

          // Si había chats de invitado guardados, limpiamos localStorage
          if (guestChats.length > 0) {
            localStorage.removeItem(GUEST_KEY);
            console.log(
              `[AppContext] Se eliminaron ${guestChats.length} chats locales.`,
            );
          }
        } catch (error) {
          console.error("Error en el flujo de usuario autenticado:", error);
          toast.error("Error al cargar chats. Por favor, intenta nuevamente.");
        }
      }
      await fetchChats();
    };

    handleChatsFlow();
  }, [isLoaded, user, fetchChats]);

  return (
    <AppContext.Provider
      value={{
        chats,
        selectedChat,
        setSelectedChat,
        isLoading,
        sendPrompt,
        fetchChats,
        createNewChat,
        renameExistingChat,
        deleteExistingChat,
        updateChatLocally,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
