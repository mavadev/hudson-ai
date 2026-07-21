'use client';

import { useUser } from '@clerk/nextjs';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type PropsWithChildren,
	type Dispatch,
	type SetStateAction,
} from 'react';

import type { Chat, ChatType } from '@/interfaces/Chat';
import type { Message } from '@/interfaces/Message';
import * as chatService from '@/services/chatService';

type ChatUpdater = (chat: Chat) => Chat;

interface AppContextProps {
	type: ChatType;
	setType: Dispatch<SetStateAction<ChatType>>;

	chats: Chat[];
	selectedChat: Chat | null;
	setSelectedChat: Dispatch<SetStateAction<Chat | null>>;

	fetchChats: () => Promise<void>;
	createNewChat: () => Promise<void>;
	renameExistingChat: (chatId: string, name: string) => Promise<void>;
	deleteExistingChat: (chatId: string) => Promise<void>;
	updateChatLocally: (chatId: string, updater: ChatUpdater) => void;

	sendPromptToAI: (
		chatId: string,
		prompt: string,
		typePrompt: ChatType,
	) => Promise<{ message: Message; title?: string }>;
}

const AppContext = createContext<AppContextProps | null>(null);

export const useAppContext = () => {
	const context = useContext(AppContext);

	if (!context) {
		throw new Error('useAppContext debe utilizarse dentro de AppContextProvider');
	}

	return context;
};

export const AppContextProvider = ({ children }: PropsWithChildren) => {
	const { user, isLoaded } = useUser();

	const [chats, setChats] = useState<Chat[]>([]);
	const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
	const [type, setType] = useState<ChatType>('general');

	const updateChatLocally = useCallback((chatId: string, updater: ChatUpdater) => {
		setChats(previousChats => previousChats.map(chat => (chat._id === chatId ? updater(chat) : chat)));

		setSelectedChat(previousChat => (previousChat?._id === chatId ? updater(previousChat) : previousChat));
	}, []);

	const fetchChats = useCallback(async () => {
		if (!user) return;

		try {
			const data = await chatService.getChats();

			setChats(data);

			setSelectedChat(currentChat => {
				if (data.length === 0) return null;

				const updatedSelectedChat = data.find(chat => chat._id === currentChat?._id);

				return updatedSelectedChat ?? data[0];
			});
		} catch (error) {
			console.error('Error fetching chats:', error);
		}
	}, [user]);

	const createNewChat = useCallback(async () => {
		if (!user) return;

		const newChat = await chatService.createChat();

		setChats(previousChats => [newChat, ...previousChats]);
		setSelectedChat(newChat);
	}, [user]);

	const renameExistingChat = useCallback(
		async (chatId: string, name: string) => {
			await chatService.renameChat(chatId, name);

			updateChatLocally(chatId, chat => ({
				...chat,
				name,
			}));
		},
		[updateChatLocally],
	);

	const deleteExistingChat = useCallback(async (chatId: string) => {
		try {
			await chatService.deleteChat(chatId);

			setChats(previousChats => {
				const remainingChats = previousChats.filter(chat => chat._id !== chatId);

				setSelectedChat(currentChat => {
					if (currentChat?._id !== chatId) {
						return currentChat;
					}

					return remainingChats[0] ?? null;
				});

				return remainingChats;
			});
		} catch (error) {
			console.error('Error deleting chat:', error);
			throw error;
		}
	}, []);

	const sendPromptToAI = useCallback(
		async (chatId: string, prompt: string, typePrompt: ChatType): Promise<{ message: Message; title?: string }> => {
			return chatService.sendPrompt(chatId, prompt, typePrompt);
		},
		[],
	);

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
				selectedChat,
				setSelectedChat,
				fetchChats,
				createNewChat,
				renameExistingChat,
				deleteExistingChat,
				updateChatLocally,
				sendPromptToAI,
			}}>
			{children}
		</AppContext.Provider>
	);
};
