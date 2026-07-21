import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: number;
}

export interface IChat extends Document {
	name: string;
	messages: IMessage[];
	user: string;
	createdAt: Date;
	updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
	{
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
			type: Number,
			default: Date.now,
		},
	},
	{
		_id: false,
	},
);

const ChatSchema = new Schema<IChat>(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			default: 'Nuevo chat',
		},
		messages: {
			type: [MessageSchema],
			default: [],
		},
		user: {
			type: String,
			required: true,
			index: true,
		},
	},
	{
		timestamps: true,
	},
);

export const Chat: Model<IChat> = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);

export default Chat;
