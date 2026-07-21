import Prism from 'prismjs';
import Image from 'next/image';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

import assets from '@/assets';
import { MessageRole } from '@/interfaces/Message';

interface MessageProps {
	role: MessageRole;
	content: string;
}

export const Message = ({ role, content }: MessageProps) => {
	useEffect(() => {
		Prism.highlightAll();
	}, [content]);

	const copyMessage = async () => {
		try {
			await navigator.clipboard.writeText(content);
			toast.success('Mensaje copiado al portapapeles');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Error al copiar');
		}
	};

	return (
		<div className='w-full'>
			<div className={`mb-8 ${role === 'user' && 'flex flex-col items-end'}`}>
				<div
					className={`group relative py-3 text-sm ${role === 'user' ? 'rounded-xl bg-slate-700 px-5' : 'flex gap-4'}`}>
					{role === 'user' ? (
						<span className='text-white/90'>{content}</span>
					) : (
						<>
							<Image
								alt=''
								src={assets.hudson_logo}
								className='h-10 w-10 p-2 border border-amber-900 rounded-full bg-amber-800 hidden sm:block'
							/>
							<div className='space-y-4 w-full overflow-auto leading-6'>
								<Markdown
									remarkPlugins={[remarkGfm]}
									rehypePlugins={[rehypeRaw]}
									components={{
										table: ({ children }) => (
											<table className='table-auto w-full text-left text-sm mt-4 mb-6 border-gray-700'>
												{children}
											</table>
										),
										thead: ({ children }) => <thead className='bg-amber-800 text-white'>{children}</thead>,
										th: ({ children }) => <th className='border border-gray-700 px-4 py-2'>{children}</th>,
										td: ({ children }) => <td className='border border-gray-700 leading-6 px-4 py-2'>{children}</td>,
									}}>
									{content}
								</Markdown>
							</div>
						</>
					)}

					<div
						className={`opacity-0 group-hover:opacity-100 absolute ${
							role === 'user' ? '-left-7 top-4' : 'left-14 -bottom-6'
						} transition-all`}>
						<div className='flex items-center gap-2 opacity-70'>
							{role === 'user' ? (
								<Image
									alt='Copy'
									className='w-4 cursor-pointer'
									onClick={copyMessage}
									src={assets.copy}
								/>
							) : (
								<>
									<Image
										alt='Copy'
										src={assets.copy}
										onClick={copyMessage}
										className='w-4.5 cursor-pointer'
									/>
									<Image
										alt='Like'
										src={assets.like}
										className='w-4.5 cursor-pointer'
									/>
									<Image
										alt='Dislike'
										src={assets.dislike}
										className='w-4.5 cursor-pointer'
									/>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
