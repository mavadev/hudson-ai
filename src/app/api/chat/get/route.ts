import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

import connectDB from "@/config/db";
import Chat from "@/models/Chat";

export async function GET(req: NextRequest) {
  try {
    // Obtenemos id del usuario
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 },
      );
    }

    // Conexión a la DB
    await connectDB();

    // Obtener los chats del usuario ordenados por fecha de actualización
    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });

    return NextResponse.json({ chats }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error al obtener los chats:", error);
    return NextResponse.json(
      { error: "Error al obtener los chats" },
      { status: 500 },
    );
  }
}
