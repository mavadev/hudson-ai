import type { Chat } from "@/interfaces/Chat";
const GUEST_KEY = "hudson-guest_chat";

export const storageService = {
  // Obtener chats locales
  getGuestChat(): Chat | undefined {
    if (typeof window === "undefined") return;
    const data = localStorage.getItem(GUEST_KEY);
    return data ? JSON.parse(data) : undefined;
  },

  // Guardar el chat actualizado localmente
  saveGuestChat(chat: Chat): void {
    localStorage.setItem(GUEST_KEY, JSON.stringify(chat));
  },

  // Eliminar chat local
  deleteGuestChat(): void {
    localStorage.removeItem(GUEST_KEY);
  },
};
