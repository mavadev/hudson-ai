import axios from 'axios';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/config/db';
import { ChatType } from '@/interfaces/Chat';
import Chat, { IMessage } from '@/models/Chat';

// Definimos el tipo del body
interface ChatRequestBody {
	chatId: string;
	prompt: string;
	type: ChatType;
	userId: string;
}

export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}

		// Obtenemos el body
		const { chatId, prompt: userMessage, type }: ChatRequestBody = await req.json();

		await connectDB();

		// Obtenemos el chat correspondiente al usuario
		const chat = await Chat.findOne({ _id: chatId, user: userId });
		if (!chat) {
			return NextResponse.json({ error: 'Chat no encontrado' }, { status: 404 });
		}

		const isFirstMessage = chat.messages.length === 0;

		// Creamos el mensaje del usuario
		const userPrompt: IMessage = {
			role: 'user',
			content: userMessage,
			timestamp: new Date(),
		};
		chat.messages.push(userPrompt);

		// Llamamos a la IA para respuesta
		const {
			data: { response: assistantResponse },
		} = await axios.post<{ response: string }>(`${process.env.API_URL}/chat/${type}`!, {
			user_message: userMessage,
		});

		const assistantMessage: IMessage = {
			role: 'assistant',
			content: assistantResponse,
			timestamp: new Date(),
		};
		chat.messages.push(assistantMessage);

		if (isFirstMessage) {
			const {
				data: { response: titleResponse },
			} = await axios.post<{ response: string }>(`${process.env.API_URL}/chat/general`!, {
				user_message:
					'Dime en un titulo corto para el inicio de esta conversación (solo el titulo sin comillas): ' +
					assistantResponse,
			});
			chat.name = titleResponse;
		}

		await chat.save();
		return NextResponse.json({ message: assistantMessage, title: chat.name }, { status: 200 });
	} catch (error: unknown) {
		console.error('Error procesando el chat:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
