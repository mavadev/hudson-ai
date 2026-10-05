import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/config/db";
import Chat from "@/models/Chat";

export async function POST(req: NextRequest) {
  try {
    // Obtenemos el id del usuario
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 },
      );
    }

    // Conexión a la DB
    await connectDB();

    // Creación del chat
    const newChat = await Chat.create({ userId });

    // Respuesta exitosa
    return NextResponse.json(
      {
        message: "Chat creado correctamente",
        chat: newChat,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error al crear un nuevo chat:", error);
    return NextResponse.json(
      { error: "No se pudo crear un nuevo chat" },
      { status: 500 },
    );
  }
}
