import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

import connectDB from "@/config/db";
import User from "@/models/User";
import Chat from "@/models/Chat";
import { IMessage } from "@/models/Message";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();
    if (!userId || !clerkUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();

    // Siempre evaluamos la creación/actualización del usuario
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          email: email,
          name: clerkUser.fullName || clerkUser.username || "Usuario",
          avatar: clerkUser.imageUrl || "",
        },
      },
      { upsert: true, new: true },
    );

    // Evaluamos si hay un chat en local
    const { guestChat } = await req.json();

    let createdChat = null;
    if (guestChat) {
      // Mensajes sin _ids
      const messages: IMessage[] = guestChat.messages.map((m: IMessage) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      }));

      // Sincronizamos el chat en la DB
      createdChat = await Chat.create({
        userId,
        name: guestChat.name,
        messages,
        createdAt: guestChat.createdAt,
      });
    }
    return NextResponse.json({
      success: true,
      userSynced: true,
      chatSynced: !!createdChat,
      chatId: createdChat?._id || null,
    });
  } catch (error) {
    console.error("Error al sincronizar:", error);
    return NextResponse.json(
      { error: "Error interno al sincronizar" },
      { status: 500 },
    );
  }
}
