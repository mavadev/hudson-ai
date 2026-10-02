import axios from "axios";
import { Chat } from "@/interfaces/Chat";
import { Message } from "@/interfaces/Message";

// OBTENER CHATS
export const getChats = async (): Promise<Chat[]> => {
  try {
    const { data } = await axios.get(`/api/chat/get`);
    return data.chats;
  } catch {
    throw new Error(`Error al obtener los chats del usuario`);
  }
};

// CREAR CHAT
export const createChat = async (): Promise<Chat> => {
  try {
    const { data } = await axios.post("/api/chat/create");
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
    await axios.post("/api/chat/rename", { chatId, name });
  } catch {
    throw new Error(`Hubo un error al renombrar el chat ${chatId}`);
  }
};

// ELIMINAR CHAT POR ID
export const deleteChat = async (chatId: string): Promise<void> => {
  try {
    await axios.post("/api/chat/delete", { chatId });
  } catch {
    throw new Error(`Hubo un error al eliminar el chat ${chatId}`);
  }
};

// PETICIÓN ESTANDAR
export const sendPrompt = async (
  prompt: string,
  chatId: string,
): Promise<{ message: Message; title?: string }> => {
  try {
    const { data } = await axios.post("/api/chat/general", { prompt, chatId });
    return data;
  } catch {
    throw new Error("Error al obtener respuesta de la IA");
  }
};

// PETICIÓN STREAMING (Uso de fetch para soporte de ReadableStream)
export async function sendPromptStream(
  prompt: string,
  chatId: string,
  messages: Message[],
  onChunk: (chunk: string) => void,
  onTitleGenerated?: (title: string) => void,
): Promise<void> {
  const response = await fetch("/api/chat/general/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, chatId, messages }),
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
