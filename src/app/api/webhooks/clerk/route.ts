import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/config/db";
import { User } from "@/models/User";
import { WebhookEvent } from "@clerk/nextjs/server";
import Chat from "@/models/Chat";

export async function POST(req: NextRequest) {
  // Validación de la variable para el CLERK_WEBHOOK_SECRET
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!CLERK_WEBHOOK_SECRET) {
    throw new Error(
      "Por favor añade CLERK_WEBHOOK_SECRET en tu archivo .env.local",
    );
  }

  // Headers para verificación de seguridad (Svix)
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Faltan headers de Svix", { status: 400 });
  }

  // Obtener el cuerpo de la petición
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verificar la firma del Webhook
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error al verificar la firma del webhook:", err);
    return new Response("Error al verificar firma", { status: 400 });
  }

  // Conexión a la DB
  await connectDB();
  const eventType = evt.type;

  switch (eventType) {
    case "user.created": {
      // Obtenemos los datos del usuario
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;
      const primaryEmail = email_addresses[0]?.email_address;
      const fullName =
        `${first_name || ""} ${last_name || ""}`.trim() || "Usuario";

      // Validación del envio del correo
      if (!primaryEmail) {
        console.warn(
          `[user.created] Evento ${id} recibido sin correo. Omitiendo creación.`,
        );
        return new Response("Email no encontrado", { status: 400 });
      }

      // Crear el usuario en MongoDB
      await User.create({
        _id: id,
        name: fullName,
        email: primaryEmail,
        avatar: image_url,
      });

      console.log(`[Webhook] Usuario creado en BD: ${id}`);
      break;
    }
    case "user.updated": {
      // Obtención de datos
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;
      const primaryEmail = email_addresses?.[0]?.email_address;
      const fullName = `${first_name || ""} ${last_name || ""}`.trim();

      // Actualización del usuario
      await User.findByIdAndUpdate(
        id,
        {
          ...(primaryEmail && { email: primaryEmail }),
          ...(fullName && { name: fullName }),
          image: image_url || "",
        },
        { upsert: true, new: true }, // Upsert por si el usuario no existía
      );

      console.log(`[Webhook] Usuario actualizado en BD: ${id}`);
      break;
    }
    case "user.deleted": {
      const { id } = evt.data;

      if (id) {
        // Eliminamos todos los chats del usuario
        const deleteChatsResult = await Chat.deleteMany({ userId: id });
        // Eliminamos al usuario
        await User.findByIdAndDelete(id);

        console.log(
          `[Webhook] Usuario ${id} y sus ${deleteChatsResult.deletedCount} chats fueron eliminados de la BD.`,
        );
      }
      break;
    }

    default:
      console.log(`ℹ️ [Webhook] Evento sin acción configurada: ${eventType}`);
  }

  return new Response("Webhook procesado correctamente", { status: 200 });
}
