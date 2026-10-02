import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

import Chat from '@/models/Chat';
import connectDB from '@/config/db';

interface DeleteRequestBody {
	chatId: string;
}

export async function POST(req: NextRequest) {
	try {
		// Obtención de id de usuario
		const { userId } = getAuth(req);
		if (!userId) {
			return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
		}

		// Obtención de id de chat a eliminar
		const { chatId }: DeleteRequestBody = await req.json();
		if (!chatId) {
			return NextResponse.json({ error: 'Es necesario el id del chat a eliminar' }, { status: 404 });
		}

		// Conexión a la DB
		await connectDB();

		// Eliminar el chat por su id y propio del usuario
		const { deletedCount } = await Chat.deleteOne({ _id: chatId, userId });

		// Verificar si el chat fue eliminado correctamente
		if (deletedCount === 0) {
			return NextResponse.json({ error: 'Chat no encontrado' }, { status: 404 });
		}

		return NextResponse.json({ message: 'Chat eliminado exitosamente' }, { status: 200 });
	} catch (error: unknown) {
		console.error('Error al eliminar el chat:', error);
		return NextResponse.json({ error: 'Error al eliminar el chat' }, { status: 500 });
	}
}
