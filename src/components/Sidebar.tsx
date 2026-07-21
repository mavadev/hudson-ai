'use client';
import Image from 'next/image';
import { useState } from 'react';
import { useClerk, UserButton } from '@clerk/nextjs';

import assets from '@/assets';
import { ChatLabel } from './ChatLabel';
import { useAppContext } from '@/context/AppContext';

interface SidebarProps {
	expand: boolean;
	setExpand: (expand: boolean) => void;
}

export const Sidebar = ({ expand, setExpand }: SidebarProps) => {
	const { openSignIn, user } = useClerk();
	const { chats, createNewChat } = useAppContext();
	const [openMenu, setOpenMenu] = useState<{ id: string; open: boolean }>({ id: '', open: false });

	return (
		<aside
			className={`flex flex-col justify-between bg-[#212327] py-7 transition-all z-50 max-md:absolute max-md:h-screen ${
				expand ? 'p-4 w-64' : 'md:w-20 w-0 max-md:overflow-hidden'
			}`}>
			<div>
				{/* Logo y toggle */}
				<header className={`flex ${expand ? 'flex-row gap-10' : 'flex-col items-center gap-8'}`}>
					<Image
						alt='logo'
						className={`${expand ? 'w-36 p-2' : 'w-10 p-1'}`}
						src={expand ? assets.hudson_white : assets.hudson_logo}
					/>
					<button
						onClick={() => setExpand(!expand)}
						className='group relative flex items-center justify-center hover:bg-gray-500/20 transition-all duration-300 h-9 w-9 rounded-lg cursor-pointer'>
						<Image
							alt='menu'
							className='md:hidden'
							src={assets.sidebar_close}
						/>
						<Image
							alt='menu'
							className='hidden md:block w-7'
							src={expand ? assets.sidebar_close : assets.sidebar_open}
						/>
						<div
							className={`absolute w-max ${
								expand ? 'left-1/2 -translate-x-1/2 top-12' : '-top-12 left-0'
							} opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none`}>
							{expand ? 'Cerrar Sidebar' : 'Abrir Sidebar'}
							<div
								className={`w-3 h-3 absolute bg-black rotate-45 ${
									expand ? 'left-1/2 -top-1.5 -translate-x-1/2' : 'left-4 -bottom-1.5'
								}`}></div>
						</div>
					</button>
				</header>

				{/* Nuevo chat */}
				<button
					onClick={createNewChat}
					className={`mt-8 flex items-center justify-center cursor-pointer ${
						expand
							? 'bg-amber-800 hover:opacity-90 rounded-2xl gap-2 py-2.5 px-3 w-max'
							: 'group relative h-9 w-9 mx-auto hover:bg-gray-500/30 rounded-lg'
					}`}>
					<Image
						alt='Nuevo Chat'
						className={expand ? 'w-6' : 'w-7'}
						src={expand ? assets.new_chat : assets.new_chat_disabled}
					/>
					{!expand && (
						<span className='absolute w-max -top-12 -right-12 opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none'>
							Nuevo Chat
							<div className='w-3 h-3 absolute bg-black rotate-45 left-4 -bottom-1.5'></div>
						</span>
					)}
					{expand && <p className='text-white font-medium'>Nuevo Chat</p>}
				</button>

				{/* Lista de chats */}
				<div className={`mt-8 text-white/25 text-sm ${expand ? 'block' : 'hidden'}`}>
					<p className='my-1'>Recientes</p>
					{chats.map(chat => (
						<ChatLabel
							key={chat._id}
							id={chat._id}
							name={chat.name}
							openMenu={openMenu}
							setOpenMenu={setOpenMenu}
						/>
					))}
				</div>
			</div>

			{/* Perfil */}
			<div
				onClick={() => !user && openSignIn()}
				className={`flex items-center ${
					expand ? 'hover:bg-white/10 rounded-lg' : 'justify-center w-full'
				} gap-3 text-white/60 text-sm p-2 mt-2 cursor-pointer`}>
				{user ? (
					<UserButton />
				) : (
					<Image
						alt='profile'
						className='w-7'
						src={assets.profile}
					/>
				)}
				{expand && <span>Mi Perfil</span>}
			</div>
		</aside>
	);
};
