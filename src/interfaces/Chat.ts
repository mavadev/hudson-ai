import { Message } from './Message';

export interface Chat {
	_id: string;
	name: string;
	messages: Message[];
	userId?: string;
	createdAt: string;
	updatedAt?: string;
}
