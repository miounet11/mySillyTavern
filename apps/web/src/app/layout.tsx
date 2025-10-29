import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { UserInitializer } from '@/components/user/UserInitializer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SillyTavern Perfect Clone',
  description: 'Perfect clone of SillyTavern AI chat interface with enhanced features',
  keywords: ['AI', 'chat', 'roleplay', 'LLM', 'SillyTavern', 'Next.js'],
  authors: [{ name: 'SillyTavern Perfect Clone Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#171717',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <UserInitializer />
        <div className="tavern-container">
          {children}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#374151',
              color: '#f3f4f6',
              border: '1px solid #4b5563',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#374151',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#374151',
              },
            },
          }}
        />
      </body>
    </html>
  )
}