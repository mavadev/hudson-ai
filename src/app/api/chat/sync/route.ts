import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

import connectDB from "@/config/db";
import { Chat, IChat } from "@/models/Chat";
import { IMessage } from "@/models/Message";
import User from "@/models/User";
import { Playwrite_CL_Guides } from "next/font/google";

interface SyncRequestBody {
  guestChats: IChat[];
  userData: {
    email: string;
    name: string;
    avatar?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { guestChats, userData }: SyncRequestBody = await req.json();

    // Conexión a la DB
    await connectDB();

    // Aseguramos la existencia del usuario en la DB
    await User.findByIdAndUpdate(
      userId,
      {
        email: userData?.email,
        name: userData?.name,
        avatar: userData?.avatar || "",
      },
      { upsert: true, new: true },
    );

    // Si hay chats de invitados lo guardamos en la DB
    if (Array.isArray(guestChats) && guestChats.length > 0) {
      const chatsToInsert = guestChats.map((chat) => ({
        _id: chat._id,
        name: chat.name,
        messages: chat.messages.map((m: IMessage) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp || Date.now().toString(),
        })),
        userId,
        createdAt: chat.createdAt,
      }));

      console.log(chatsToInsert);

      // Insertamos todos los chats en MongoDB
      await Chat.insertMany(chatsToInsert);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = typeof error === "string" ? error : JSON.stringify(error);
    console.error("Error al sincronizar chats:", message);
    return NextResponse.json(
      { error: "Error interno al sincronizar chats" },
      { status: 500 },
    );
  }
}
