import { Message } from './Message';

export interface ChatItem {
	_id: string;
	name: string;
	messages: Message[];
	user: string;
	createdAt: string;
	updatedAt: string;
}

export const chatTypes = [
	{ label: 'General', value: 'general' },
	{ label: 'Analista QA', value: 'qa' },
] as const;

export type ChatType = (typeof chatTypes)[number]['value'];
