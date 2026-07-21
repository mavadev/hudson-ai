import Image from 'next/image';
import toast from 'react-hot-toast';
import { memo, useCallback } from 'react';

import assets from '@/assets';
import { useAppContext } from '@/context/AppContext';

interface ChatLabelProps {
	openMenu: { id: string; open: boolean };
	setOpenMenu: (openMenu: { id: string; open: boolean }) => void;
	id: string;
	name: string;
}

const ChatLabelComponent = ({ openMenu, setOpenMenu, id, name }: ChatLabelProps) => {
	const { chats, setSelectedChat, renameExistingChat, deleteExistingChat } = useAppContext();

	const handleSelectChat = useCallback(() => {
		const chatData = chats.find(chat => chat._id === id);
		if (chatData) {
			setSelectedChat(chatData);
		}
	}, [chats, id, setSelectedChat]);

	const handleRename = useCallback(async () => {
		const newName = prompt('Ingresa el nuevo nombre:');
		if (!newName?.trim()) return;

		try {
			await renameExistingChat(id, newName.trim());
			setOpenMenu({ id: '', open: false });
			toast.success('Chat renombrado correctamente');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Ocurrió un error');
		}
	}, [id, renameExistingChat, setOpenMenu]);

	const handleDelete = useCallback(async () => {
		const confirmDelete = window.confirm('¿Estás seguro de eliminar este chat?');
		if (!confirmDelete) return;

		try {
			await deleteExistingChat(id);
			setOpenMenu({ id: '', open: false });
			toast.success('Chat eliminado correctamente');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Ocurrió un error');
		}
	}, [id, deleteExistingChat, setOpenMenu]);

	return (
		<div
			className='flex items-center justify-between p-2 text-white/80 hover:bg-white/10 rounded-lg text-sm group cursor-pointer'
			onClick={handleSelectChat}>
			<p className='group-hover:max-w-5/6 truncate'>{name}</p>

			<div
				onClick={e => {
					e.stopPropagation();
					setOpenMenu({ id, open: !openMenu.open });
				}}
				className='group relative flex items-center justify-center h-6 w-6 hover:bg-black/80 rounded-lg'>
				<Image
					alt='menu'
					src={assets.three_dots}
					className={`w-4 ${openMenu.id === id && openMenu.open ? '' : 'hidden'} group-hover:block`}
				/>

				<div
					className={`absolute -right-36 top-6 bg-gray-700 rounded-xl w-max p-2 ${
						openMenu.id === id && openMenu.open ? 'block' : 'hidden'
					}`}>
					<button
						onClick={handleRename}
						className='flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg w-full'>
						<Image
							alt='rename'
							className='w-4'
							src={assets.edit}
						/>
						<span>Renombrar</span>
					</button>

					<button
						onClick={handleDelete}
						className='flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg w-full'>
						<Image
							alt='delete'
							className='w-4'
							src={assets.remove}
						/>
						<span>Eliminar</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export const ChatLabel = memo(ChatLabelComponent);
ChatLabel.displayName = 'ChatLabel';
