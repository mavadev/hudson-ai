import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/config/db';
import Chat from '@/models/Chat';

export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}

		await connectDB();

		const newChat = await Chat.create({
			name: 'Nuevo Chat',
			messages: [],
			user: userId,
		});

		return NextResponse.json(
			{
				message: 'Chat creado exitosamente',
				data: newChat,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error('Error al crear el chat:', error);

		return NextResponse.json({ error: 'No se pudo crear el chat' }, { status: 500 });
	}
}
