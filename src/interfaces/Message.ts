export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
	_id?: string;
	role: MessageRole;
	content: string;
	timestamp: string;
}
