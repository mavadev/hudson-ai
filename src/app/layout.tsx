import './prism.css';
import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';

import { AppContextProvider } from '@/context/AppContext';

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
});

export const metadata: Metadata = {
	title: {
		default: 'Hudson AI',
		template: '%s | Hudson AI',
	},
	description:
		'Modern conversational AI assistant powered by Gemini with specialized QA analysis, authentication, and persistent chat history.',
	icons: {
		icon: '/favicon.ico',
		shortcut: '/favicon-96x96.png',
		apple: '/apple-touch-icon.png',
	},
	manifest: '/site.webmanifest',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang='es'>
				<body className={`${inter.variable} antialiased`}>
					<AppContextProvider>
						{children}

						<Toaster
							position='top-right'
							toastOptions={{
								className: 'hudson-toast',
							}}
						/>
					</AppContextProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
