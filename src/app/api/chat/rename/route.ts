import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

import connectDB from "@/config/db";
import Chat from "@/models/Chat";

interface RenameRequestBody {
  chatId: string;
  name: string;
}

export async function POST(req: NextRequest) {
  try {
    // Obtención de id de usuario
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtención de data de chat a renombrar
    const { chatId, name }: RenameRequestBody = await req.json();
    if (!chatId || !name?.trim()) {
      return NextResponse.json(
        { error: "El identificador y el nombre son obligatorios" },
        { status: 400 },
      );
    }

    // Conexión a la DB
    await connectDB();

    // Actualizar el nombre del chat
    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId, userId: userId },
      { name: name.trim() },
      { new: true },
    );

    // Si no fue actualizado se responde con un error
    if (!updatedChat) {
      return NextResponse.json(
        { error: "Chat no encontrado para actualizar" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Chat renombrado",
        chat: updatedChat,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error al renombrar el chat:", error);
    return NextResponse.json(
      { error: "Error al renombrar el chat" },
      { status: 500 },
    );
  }
}
