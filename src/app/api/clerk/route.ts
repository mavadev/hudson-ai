import { Webhook } from 'svix';
import { headers } from 'next/headers';

import User from '@/models/User';
import Chat from '@/models/Chat';
import connectDB from '@/config/db';

interface ClerkWebhookData {
	id: string;
	first_name?: string | null;
	last_name?: string | null;
	image_url?: string;
	email_addresses?: Array<{
		email_address: string;
	}>;
}

type ClerkEventType = 'user.created' | 'user.updated' | 'user.deleted';

interface ClerkWebhookEvent {
	data: ClerkWebhookData;
	type: ClerkEventType;
}

export async function POST(req: Request) {
	try {
		const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

		if (!signingSecret) {
			throw new Error('CLERK_WEBHOOK_SIGNING_SECRET no está definido');
		}

		const headerPayload = await headers();

		const svixId = headerPayload.get('svix-id');
		const svixTimestamp = headerPayload.get('svix-timestamp');
		const svixSignature = headerPayload.get('svix-signature');

		if (!svixId || !svixTimestamp || !svixSignature) {
			return Response.json({ error: 'Faltan encabezados de Svix' }, { status: 400 });
		}

		const body = await req.text();

		const webhook = new Webhook(signingSecret);

		const event = webhook.verify(body, {
			'svix-id': svixId,
			'svix-timestamp': svixTimestamp,
			'svix-signature': svixSignature,
		}) as ClerkWebhookEvent;

		const { data, type } = event;

		await connectDB();

		switch (type) {
			case 'user.created':
			case 'user.updated': {
				const email = data.email_addresses?.[0]?.email_address;

				if (!email) {
					throw new Error('El evento de Clerk no contiene un correo');
				}

				const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ').trim();

				await User.findByIdAndUpdate(
					data.id,
					{
						_id: data.id,
						name: fullName || 'Usuario',
						email,
						image: data.image_url || '',
					},
					{
						upsert: true,
						new: true,
						runValidators: true,
					},
				);

				break;
			}

			case 'user.deleted':
				await Promise.all([User.findByIdAndDelete(data.id), Chat.deleteMany({ user: data.id })]);
				break;

			default:
				console.warn(`Evento no manejado: ${type}`);
		}

		return Response.json({ message: 'Evento procesado correctamente' }, { status: 200 });
	} catch (error) {
		console.error('Error procesando webhook de Clerk:', error);

		return Response.json({ error: 'Webhook inválido o no procesado' }, { status: 400 });
	}
}
