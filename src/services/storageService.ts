import type { Chat } from "@/interfaces/Chat";

const GUEST_KEY = "hudson_guest_chats";

export const storageService = {
  // Obtener chats locales
  getGuestChats(): Chat[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(GUEST_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Guardar un chat nuevo o actualizar existente localmente
  saveGuestChat(chat: Chat): void {
    const chats = this.getGuestChats();
    const index = chats.findIndex((c) => c._id === chat._id);

    if (index >= 0) {
      chats[index] = chat;
    } else {
      chats.unshift(chat);
    }

    localStorage.setItem(GUEST_KEY, JSON.stringify(chats));
  },

  // Eliminar chat local
  deleteGuestChat(chatId: string): void {
    const chats = this.getGuestChats().filter((c) => c._id !== chatId);
    localStorage.setItem(GUEST_KEY, JSON.stringify(chats));
  },

  // Limpiar almacenamiento local tras sincronizar a la nube
  clearGuestChats(): void {
    localStorage.removeItem(GUEST_KEY);
  },
};
