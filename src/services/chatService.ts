import axios from 'axios';
import { Chat, ChatType } from '@/interfaces/Chat';
import { Message } from '@/interfaces/Message';

export const getChats = async (): Promise<Chat[]> => {
	const response = await axios.get('/api/chat/get');
	return response.data.data;
};

export const createChat = async (): Promise<Chat> => {
	const response = await axios.post('/api/chat/create', {});
	return response.data.data;
};

export const renameChat = async (chatId: string, name: string): Promise<void> => {
	await axios.post('/api/chat/rename', { chatId, name });
};

export const deleteChat = async (chatId: string): Promise<void> => {
	await axios.post('/api/chat/delete', { chatId });
};

export const sendPrompt = async (
	chatId: string,
	prompt: string,
	type: ChatType,
): Promise<{ message: Message; title?: string }> => {
	const { data } = await axios.post('/api/chat/ai', { chatId, prompt, type });
	return data;
};
