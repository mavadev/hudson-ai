import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

import connectDB from '@/config/db';
import Chat from '@/models/Chat';

interface RenameRequestBody {
	chatId: string;
	name: string;
}

export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		const { chatId, name }: RenameRequestBody = await req.json();

		if (!userId) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}

		if (!chatId || !name?.trim()) {
			return NextResponse.json({ error: 'El identificador y el nombre son obligatorios' }, { status: 400 });
		}

		await connectDB();
		// Actualizar el nombre del chat
		const updatedChat = await Chat.findOneAndUpdate(
			{ _id: chatId, user: userId },
			{ name: name.trim() },
			{ new: true },
		);

		if (!updatedChat) {
			return NextResponse.json({ error: 'Chat no encontrado o no autorizado' }, { status: 404 });
		}

		return NextResponse.json(
			{
				message: 'Chat renombrado',
				data: updatedChat,
			},
			{ status: 200 },
		);
	} catch (error: unknown) {
		console.error('Error al renombrar el chat:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
