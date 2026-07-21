import axios from 'axios';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/config/db';
import type { ChatType } from '@/interfaces/Chat';
import Chat, { type IMessage } from '@/models/Chat';

interface ChatRequestBody {
	chatId: string;
	prompt: string;
	type: ChatType;
}

const validChatTypes: ChatType[] = ['general', 'qa'];

export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}

		const body: ChatRequestBody = await req.json();
		const chatId = body.chatId;
		const prompt = body.prompt?.trim();
		const type = body.type;

		if (!chatId || !prompt || !validChatTypes.includes(type)) {
			return NextResponse.json({ error: 'Datos de la solicitud inválidos' }, { status: 400 });
		}

		const apiUrl = process.env.API_URL;

		if (!apiUrl) {
			throw new Error('API_URL no está definida');
		}

		await connectDB();

		const chat = await Chat.findOne({
			_id: chatId,
			user: userId,
		});

		if (!chat) {
			return NextResponse.json({ error: 'Chat no encontrado' }, { status: 404 });
		}

		const isFirstMessage = chat.messages.length === 0;

		const userMessage: IMessage = {
			role: 'user',
			content: prompt,
			timestamp: Date.now(),
		};

		chat.messages.push(userMessage);

		const aiResponse = await axios.post<{ response: string }>(`${apiUrl}/chat/${type}`, {
			user_message: prompt,
		});

		const assistantContent = aiResponse.data.response?.trim();

		if (!assistantContent) {
			throw new Error('El servicio de IA devolvió una respuesta vacía');
		}

		const assistantMessage: IMessage = {
			role: 'assistant',
			content: assistantContent,
			timestamp: Date.now(),
		};

		chat.messages.push(assistantMessage);

		let generatedTitle: string | undefined;

		if (isFirstMessage) {
			const titleResponse = await axios.post<{ response: string }>(`${apiUrl}/chat/general`, {
				user_message: [
					'Genera un título breve para esta conversación.',
					'Devuelve únicamente el título, sin comillas ni explicaciones.',
					`Conversación: ${prompt}`,
				].join('\n'),
			});

			generatedTitle =
				titleResponse.data.response
					?.replace(/^["']|["']$/g, '')
					.trim()
					.slice(0, 80) || 'Nueva conversación';

			chat.name = generatedTitle;
		}

		await chat.save();

		return NextResponse.json(
			{
				message: assistantMessage,
				...(generatedTitle && { title: generatedTitle }),
			},
			{ status: 200 },
		);
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error('Error comunicándose con el servicio de IA:', error.response?.data ?? error.message);
		} else {
			console.error('Error procesando el chat:', error);
		}

		return NextResponse.json({ error: 'No se pudo procesar el mensaje' }, { status: 500 });
	}
}
