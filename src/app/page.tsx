'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import assets from '@/assets';
import { Sidebar } from '@/components/Sidebar';
import { PromptBox } from '@/components/PromptBox';
import { useAppContext } from '@/context/AppContext';
import { Message as MessageComponent } from '@/components/Message';

export default function Home() {
	const { selectedChat } = useAppContext();

	const [expand, setExpand] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const messages = selectedChat?.messages ?? [];
	const containerRef = useRef<HTMLDivElement>(null);
	const shouldAutoScrollRef = useRef(true);

	const handleScroll = () => {
		const container = containerRef.current;
		if (!container) return;

		const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

		shouldAutoScrollRef.current = distanceFromBottom < 120;
	};

	const lastMessage = messages.at(-1);

	const scrollKey = [
		selectedChat?._id ?? '',
		messages.length,
		lastMessage?.content.length ?? 0,
		isLoading ? 'loading' : 'idle',
	].join(':');

	useEffect(() => {
		const container = containerRef.current;

		if (!container || !shouldAutoScrollRef.current) return;

		container.scrollTo({
			top: container.scrollHeight,
			behavior: 'smooth',
		});
	}, [scrollKey]);

	return (
		<div className='flex h-dvh overflow-hidden'>
			<Sidebar
				expand={expand}
				setExpand={setExpand}
			/>

			<main className='relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[#292a2d] px-4 text-white'>
				{/* Encabezado móvil */}
				<header className='absolute top-6 z-20 flex w-full items-center justify-between px-4 md:hidden'>
					<button
						type='button'
						onClick={() => setExpand(previousExpand => !previousExpand)}
						aria-label='Abrir menú lateral'
						className='cursor-pointer'>
						<Image
							alt=''
							className='rotate-180'
							src={assets.menu}
						/>
					</button>

					<Image
						alt='Hudson AI'
						className='opacity-70'
						src={assets.phone}
					/>
				</header>

				{/* Contenido central */}
				{messages.length === 0 ? (
					<section className='flex min-h-0 flex-1 flex-col items-center justify-center gap-4'>
						<Image
							alt='Hudson AI'
							src={assets.hudson_logo}
							className='h-12 w-12'
							priority
						/>

						<div>
							<h1 className='max-w-md text-balance text-center text-2xl font-medium'>Bienvenido, soy Hudson</h1>

							<p className='mt-2 text-center text-sm text-[#b1b1b1]'>¿En qué puedo ayudarte hoy?</p>
						</div>
					</section>
				) : (
					<>
						{/* Nombre del chat */}
						<div className='absolute left-1/2 top-7 z-10 -translate-x-1/2'>
							<p className='max-w-xs truncate rounded-lg border border-transparent px-2 py-1 font-semibold hover:border-gray-500/50'>
								{selectedChat?.name}
							</p>
						</div>

						{/* Solo esta sección tiene scroll */}
						<section
							ref={containerRef}
							onScroll={handleScroll}
							aria-label='Conversación actual'
							className='mt-20 min-h-0 w-full flex-1 overflow-y-auto'>
							<div className='mx-auto flex w-full max-w-3xl flex-col pb-6'>
								{messages.map((message, index) => (
									<MessageComponent
										key={`${message.timestamp}-${message.role}-${index}`}
										role={message.role}
										content={message.content}
									/>
								))}

								{isLoading && (
									<div
										className='flex w-full gap-4 pb-8'
										aria-label='Hudson está generando una respuesta'>
										<Image
											alt='Hudson AI'
											src={assets.hudson_logo}
											className='h-12 w-12 rounded-full border border-gray-600 bg-gray-800 p-2'
										/>

										<div className='flex items-center justify-center gap-1'>
											<span className='h-1 w-1 animate-bounce rounded-full bg-white' />
											<span className='h-1 w-1 animate-bounce rounded-full bg-white delay-100' />
											<span className='h-1 w-1 animate-bounce rounded-full bg-white delay-200' />
										</div>
									</div>
								)}
							</div>
						</section>
					</>
				)}

				{/* El prompt permanece abajo y no entra al scroll */}
				<div className='flex shrink-0 justify-center'>
					<PromptBox
						isLoading={isLoading}
						setIsLoading={setIsLoading}
					/>
				</div>

				<footer className='shrink-0 pb-3 text-center text-xs text-gray-500'>
					Desarrollado por{' '}
					<a
						target='_blank'
						rel='noreferrer'
						href='https://github.com/mavadev'
						className='hover:underline'>
						Gianmarco Chistama
					</a>
					.
				</footer>
			</main>
		</div>
	);
}
