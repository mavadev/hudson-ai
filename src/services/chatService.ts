import { Chat } from "@/interfaces/Chat";
import { Message } from "@/interfaces/Message";

// Helper interno para peticiones JSON con fetch nativo
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

// OBTENER CHATS
export const getChats = async (): Promise<Chat[]> => {
  try {
    const data = await fetchJson<{ chats: Chat[] }>(`/api/chat/get`);
    return data.chats;
  } catch {
    throw new Error(`Error al obtener los chats del usuario`);
  }
};

// CREAR CHAT
export const createChat = async (): Promise<Chat> => {
  try {
    const data = await fetchJson<{ chat: Chat }>("/api/chat/create", {
      method: "POST",
    });
    return data.chat;
  } catch {
    throw new Error("Error al crear el chat");
  }
};

// RENOMBRAR CHAT POR ID
export const renameChat = async (
  chatId: string,
  name: string,
): Promise<void> => {
  try {
    await fetchJson("/api/chat/rename", {
      method: "POST",
      body: JSON.stringify({ chatId, name }),
    });
  } catch {
    throw new Error(`Hubo un error al renombrar el chat ${chatId}`);
  }
};

// ELIMINAR CHAT POR ID
export const deleteChat = async (chatId: string): Promise<void> => {
  try {
    await fetchJson("/api/chat/delete", {
      method: "POST",
      body: JSON.stringify({ chatId }),
    });
  } catch {
    throw new Error(`Hubo un error al eliminar el chat ${chatId}`);
  }
};

// PETICIÓN STREAMING (Uso de fetch para soporte de ReadableStream)
export async function sendPromptStream(
  prompt: string,
  chatId: string,
  messages: Message[],
  onChunk: (chunk: string) => void,
  onTitleGenerated?: (title: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, chatId, messages }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error("Error en la conexión de streaming");
  }

  // Extraer el título de los encabezados si está disponible
  const encodedTitle = response.headers.get("X-Chat-Title");
  if (encodedTitle && onTitleGenerated) {
    const title = decodeURIComponent(encodedTitle);
    onTitleGenerated(title);
  }

  // Leer el cuerpo de la respuesta como un ReadableStream
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  // Enviar los chunks al callback
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    onChunk(chunk);
  }
}
