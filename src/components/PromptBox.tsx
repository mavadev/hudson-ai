import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/nextjs';

import assets from '@/assets';
import type { Message } from '@/interfaces/Message';
import { chatTypes } from '@/interfaces/Chat';
import { useAppContext } from '@/context/AppContext';

interface PromptBoxProps {
	isLoading: boolean;
	setIsLoading: (isLoading: boolean) => void;
}

const wait = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));

export const PromptBox = ({ isLoading, setIsLoading }: PromptBoxProps) => {
	const { user } = useUser();
	const [prompt, setPrompt] = useState('');

	const { selectedChat, sendPromptToAI, updateChatLocally, type, setType } = useAppContext();

	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			void sendPrompt();
		}
	};

	const sendPrompt = async () => {
		const normalizedPrompt = prompt.trim();

		if (!normalizedPrompt) {
			toast.error('No puedes enviar un mensaje vacío');
			return;
		}

		if (!user) {
			toast.error('Inicia sesión para enviar un mensaje');
			return;
		}

		if (isLoading) {
			toast.error('Debes esperar a que termine tu petición');
			return;
		}

		if (!selectedChat) {
			toast.error('No hay un chat seleccionado');
			return;
		}

		const chatId = selectedChat._id;
		const userTimestamp = Date.now();

		const userMessage: Message = {
			role: 'user',
			content: normalizedPrompt,
			timestamp: userTimestamp,
		};

		try {
			setIsLoading(true);
			setPrompt('');

			updateChatLocally(chatId, chat => ({
				...chat,
				messages: [...chat.messages, userMessage],
			}));

			const { message: aiResponse, title: generatedTitle } = await sendPromptToAI(chatId, normalizedPrompt, type);

			// La IA ya respondió: ocultamos el indicador de "pensando"
			setIsLoading(false);

			if (generatedTitle) {
				updateChatLocally(chatId, chat => ({
					...chat,
					name: generatedTitle,
				}));
			}

			const assistantTimestamp = typeof aiResponse.timestamp === 'number' ? aiResponse.timestamp : Date.now();

			const animatedMessage: Message = {
				role: 'assistant',
				content: '',
				timestamp: assistantTimestamp,
			};

			updateChatLocally(chatId, chat => ({
				...chat,
				messages: [...chat.messages, animatedMessage],
			}));

			const tokens = aiResponse.content.split(' ');

			for (let index = 0; index < tokens.length; index += 1) {
				const visibleContent = tokens.slice(0, index + 1).join(' ');

				updateChatLocally(chatId, chat => ({
					...chat,
					messages: chat.messages.map(message =>
						message.role === 'assistant' && message.timestamp === assistantTimestamp
							? {
									...message,
									content: visibleContent,
								}
							: message,
					),
				}));

				await wait(25);
			}
		} catch (error) {
			updateChatLocally(chatId, chat => ({
				...chat,
				messages: chat.messages.filter(message => message.timestamp !== userTimestamp),
			}));

			setPrompt(normalizedPrompt);

			toast.error(error instanceof Error ? error.message : 'Error al enviar el mensaje');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form
			onSubmit={event => {
				event.preventDefault();
				void sendPrompt();
			}}
			className='mb-4 w-full max-w-3xl rounded-2xl bg-[#404045] px-4 py-3.5 transition-all'>
			<textarea
				rows={3}
				value={prompt}
				onKeyDown={handleKeyDown}
				onChange={event => setPrompt(event.target.value)}
				placeholder='Envía tu mensaje a Hudson AI'
				className='w-full resize-none overflow-hidden break-words bg-transparent text-sm leading-6 outline-none'
			/>

			<div className='mt-2 flex items-center justify-between text-sm'>
				<div className='flex items-center gap-2'>
					{chatTypes.map(({ label, value }) => (
						<button
							key={value}
							type='button'
							onClick={() => setType(value)}
							className={`flex cursor-pointer items-center gap-2 rounded-md border border-slate-300/10 px-3 py-1 text-xs transition ${
								type === value ? 'bg-slate-800 hover:bg-slate-900' : 'bg-black/20'
							}`}>
							<Image
								className='h-5'
								alt=''
								src={assets.deepthink}
							/>
							{label}
						</button>
					))}
				</div>

				<div className='flex items-center gap-2'>
					<Image
						alt='Búsqueda'
						className='h-5'
						src={assets.search}
					/>

					<button
						type='submit'
						disabled={!prompt.trim() || isLoading}
						aria-label='Enviar mensaje'
						className={`cursor-pointer rounded-full p-2 transition disabled:cursor-not-allowed ${
							prompt.trim() && !isLoading ? 'bg-amber-800' : 'bg-[#71717a]'
						}`}>
						<Image
							alt=''
							className='aspect-square w-3.5'
							src={prompt.trim() && !isLoading ? assets.send : assets.send_disabled}
						/>
					</button>
				</div>
			</div>
		</form>
	);
};
