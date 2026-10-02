import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/config/db";
import { IMessage } from "@/models/Message";
import Chat from "@/models/Chat";

const API_URL = process.env.API_URL;

interface ChatRequestBody {
  chatId: string;
  prompt: string;
  messages: IMessage[];
}

export async function POST(req: NextRequest) {
  try {
    if (!API_URL)
      throw new Error("API_URL no está definida en las variables de entorno");

    // Evaluar el cuerpo de la solicitud
    const { chatId, prompt, messages }: ChatRequestBody = await req.json();
    if (!chatId || !prompt?.trim()) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 },
      );
    }

    // Conexión a la base de datos
    await connectDB();
    const { userId } = getAuth(req);

    let isFirstMessage = false;
    let historyMessages: IMessage[] = [];

    // Obtenemos si es el primer mensaje y los mensajes (historial)
    if (userId) {
      const chat = await Chat.findOne({ _id: chatId, userId });
      if (!chat) {
        return NextResponse.json(
          { error: "Chat no encontrado" },
          { status: 404 },
        );
      }
      isFirstMessage = chat.messages.length === 0;

      // Guardamos los mensajes formateados
      historyMessages = chat.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Creamos el mensaje del usuario
      const userMessage: IMessage = {
        role: "user",
        content: prompt,
        timestamp: Date.now().toString(),
      };
      chat.messages.push(userMessage);
      await chat.save();
    } else {
      isFirstMessage = messages.length <= 1;

      // Formateamos el historial de mensajes
      historyMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
    }

    // Generamos el título en el primer mensaje
    let generatedTitle: string | null = null;
    if (isFirstMessage) {
      try {
        const titleRes = await fetch(`${API_URL}/chat/general`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_message: `Genera un título muy corto (máximo 5 palabras) para esta conversación. No uses comillas:\n${prompt}`,
          }),
        });
        const data = await titleRes.json();
        generatedTitle =
          data.response
            ?.replace(/^["']|["']$/g, "")
            .trim()
            .slice(0, 60) || "Nueva Conversación";

        // Guardamos el título generado en la base de datos
        if (generatedTitle && userId) {
          await Chat.updateOne({ _id: chatId }, { name: generatedTitle });
        }
      } catch (err) {
        console.error("Error generando título:", err);
      }
    }

    // Petición a la API de FastAPI (Streaming)
    const fastAiResponse = await fetch(`${API_URL}/chat/general/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_message: prompt,
        history: historyMessages,
      }),
    });
    if (!fastAiResponse.ok || !fastAiResponse.body) {
      throw new Error("Error al conectar con el servicio de IA para streaming");
    }

    // Interceptador de Stream para acumular la respuesta
    const reader = fastAiResponse.body.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullAssistantResponse = "";

    const customStream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            fullAssistantResponse += chunk;
            // Transmitimos el fragmento al frontend
            controller.enqueue(encoder.encode(chunk));
          }

          // Al finalizar el stream, guardamos la respuesta de la IA en la BD
          if (fullAssistantResponse.trim() && userId) {
            await Chat.updateOne(
              { _id: chatId },
              {
                $push: {
                  messages: {
                    role: "assistant",
                    content: fullAssistantResponse.trim(),
                    timestamp: Date.now().toString(),
                  },
                },
              },
            );
          }

          controller.close();
        } catch (err) {
          console.error("Error durante la transmisión del stream:", err);
          controller.error(err);
        }
      },
    });

    // Generamos los headers de la respuesta
    const responseHeaders = new Headers({
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });

    // Incluimos el título del chat en los headers si está disponible
    if (generatedTitle) {
      responseHeaders.set("X-Chat-Title", encodeURIComponent(generatedTitle));
    }

    // Devolvemos la respuesta con headers
    return new NextResponse(customStream, { headers: responseHeaders });
  } catch (error) {
    console.error("Error en API Route Stream:", error);
    return NextResponse.json(
      { error: "No se pudo procesar la solicitud de streaming" },
      { status: 500 },
    );
  }
}
