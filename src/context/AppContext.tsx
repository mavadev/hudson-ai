'use client';

import { useUser } from '@clerk/nextjs';
import { createContext, useContext, useState, useEffect, PropsWithChildren, useCallback } from 'react';

import { ChatItem, ChatType } from '@/interfaces/Chat';
import * as chatService from '@/services/chatService';
import { Message } from '@/interfaces/Message';

// Definimos la interface del contexto
interface AppContextProps {
	type: ChatType;
	setType: React.Dispatch<React.SetStateAction<ChatType>>;
	chats: ChatItem[];
	setChats: React.Dispatch<React.SetStateAction<ChatItem[]>>;
	selectedChat: ChatItem | null;
	setSelectedChat: React.Dispatch<React.SetStateAction<ChatItem | null>>;

	fetchChats: () => Promise<void>;
	createNewChat: () => Promise<void>;
	renameExistingChat: (chatId: string, name: string) => Promise<void>;
	deleteExistingChat: (chatId: string) => Promise<void>;
	sendPromptToAI: (
		chatId: string,
		prompt: string,
		typePrompt: ChatType,
	) => Promise<{ message: Message; title?: string }>;
}

// Creamos el contexto
const AppContext = createContext<AppContextProps>({} as AppContextProps);
export const useAppContext = () => useContext(AppContext); // Hook del contexto

export const AppContextProvider = ({ children }: PropsWithChildren) => {
	const { user, isLoaded } = useUser();

	const [chats, setChats] = useState<ChatItem[]>([]);
	const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
	const [type, setType] = useState<ChatType>('general');

	// Obtener chats
	const fetchChats = useCallback(async () => {
		if (!user) return;

		try {
			const data = await chatService.getChats();
			setChats(data);

			if (data.length === 0) {
				await createNewChat();
				return fetchChats();
			}

			setSelectedChat(prev => prev || data[0] || null);
		} catch (error) {
			console.error('Error fetching chats:', error);
		}
	}, [user]);

	// Crear chat
	const createNewChat = useCallback(async () => {
		await chatService.createChat();
		await fetchChats();
	}, [fetchChats]);

	// Renombrar chat
	const renameExistingChat = useCallback(
		async (chatId: string, name: string) => {
			// Renombramos el chat en local
			setSelectedChat(
				prev =>
					prev && {
						...prev,
						name,
					},
			);

			// Renombramos el chat en la base de datos
			await chatService.renameChat(chatId, name);
			await fetchChats();
		},
		[fetchChats],
	);

	// Eliminar chat
	const deleteExistingChat = useCallback(
		async (chatId: string) => {
			// Eliminar el chat seleccionado localmente
			setSelectedChat(prev => (prev?._id === chatId ? null : prev));
			setChats(prev => prev.filter(chat => chat._id !== chatId));

			// Eliminar el chat de la base de datos
			await chatService.deleteChat(chatId);
			await fetchChats();
		},
		[fetchChats],
	);

	// Enviar prompt a IA
	const sendPromptToAI = useCallback(
		async (chatId: string, prompt: string, typePrompt: ChatType): Promise<{ message: Message; title?: string }> => {
			return await chatService.sendPrompt(chatId, prompt, typePrompt);
		},
		[],
	);

	// Cargar los chats al iniciar cuando el usuario esté cargado
	useEffect(() => {
		if (isLoaded && user) {
			fetchChats();
		}
	}, [isLoaded, user, fetchChats]);

	return (
		<AppContext.Provider
			value={{
				type,
				setType,
				chats,
				setChats,
				selectedChat,
				setSelectedChat,
				fetchChats,
				createNewChat,
				renameExistingChat,
				deleteExistingChat,
				sendPromptToAI,
			}}>
			{children}
		</AppContext.Provider>
	);
};
