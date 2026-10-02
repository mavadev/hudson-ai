import { Schema } from 'mongoose';

// Interface para el modelo de mensaje
export interface IMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp?: string;
}

// Creación del esquema de mensaje
export const MessageSchema = new Schema<IMessage>({
	role: {
		type: String,
		enum: ['user', 'assistant', 'system'],
		required: true,
	},
	content: {
		type: String,
		required: true,
		trim: true,
	},
	timestamp: {
		type: String,
		default: () => Date.now().toString(),
	},
});
