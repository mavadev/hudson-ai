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

    // Obtenemos la señal de abort del cliente
    const signal = req.signal;

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
      if (!isFirstMessage)
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
      isFirstMessage = messages.length === 0;

      // Formateamos el historial de mensajes
      if (!isFirstMessage)
        historyMessages = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
    }

    // Generamos el título en el primer mensaje
    let generatedTitle: string | null = null;
    if (isFirstMessage) {
      try {
        const titleRes = await fetch(`${API_URL}/api/chat/title`, {
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
    const fastAiResponse = await fetch(`${API_URL}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_message: prompt,
        history: historyMessages,
      }),
      signal,
    });
    if (!fastAiResponse.ok || !fastAiResponse.body) {
      throw new Error("Error al conectar con el servicio de IA para streaming");
    }

    // Interceptador de Stream para acumular la respuesta
    const reader = fastAiResponse.body.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullAssistantResponse = "";

    // Función auxiliar para guardar en MongoDB lo que se haya alcanzado a generar
    const savePartialResponseToDB = async (wasAborted = false) => {
      if (!userId) return;

      let finalResponse = fullAssistantResponse.trim();

      // Si no se acumuló respuesta alguna, asignamos un mensaje según el motivo de cierre
      if (!finalResponse) {
        if (wasAborted) {
          finalResponse = "Respuesta cancelada por el usuario.";
        } else {
          finalResponse = "No se pudo obtener una respuesta del asistente.";
        }
      }
      await Chat.updateOne(
        { _id: chatId },
        {
          $push: {
            messages: {
              role: "assistant",
              content: finalResponse,
              timestamp: Date.now().toString(),
            },
          },
        },
      );
    };

    const customStream = new ReadableStream({
      async start(controller) {
        let wasAborted = true;

        // Escuchar la cancelación explícita en el stream
        const handleAbort = async () => {
          wasAborted = true;
          console.log("[API Route] Cliente abortó la transmisión.");
          try {
            await reader.cancel();
          } catch {}
          controller.close();
        };
        signal.addEventListener("abort", handleAbort);

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            fullAssistantResponse += chunk;
            // Transmitimos el fragmento al frontend
            controller.enqueue(encoder.encode(chunk));
          }

          // Al finalizar el stream de forma normal
          if (!signal.aborted) controller.close();
        } catch (err) {
          if (signal.aborted) {
            console.log(
              "[API Route] Stream terminado por cancelación del usuario.",
            );
          } else {
            console.error("Error durante la transmisión del stream:", err);
            controller.error(err);
          }
        } finally {
          // Remover el listener
          signal.removeEventListener("abort", handleAbort);
          await savePartialResponseToDB(wasAborted || signal.aborted);
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
    if (error instanceof Error && error.name === "AbortError") {
      console.log("[API Route] Petición cancelada correctamente.");
      return new Response("Aborted", { status: 499 });
    }

    console.error("Error en API Route Stream:", error);
    return NextResponse.json(
      { error: "No se pudo procesar la solicitud de streaming" },
      { status: 500 },
    );
  }
}
