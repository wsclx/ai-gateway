import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import SidebarNavigation from '@/components/sidebar-navigation'
import { ErrorBoundary } from '@/components/ui/error-boundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Gateway',
  description: 'Internes AI Gateway für Abteilungen mit DSGVO-konformer Datenspeicherung',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className="dark">
      <body className={`${inter.className} bg-bg-primary text-text-primary`}>
        <Providers>
          <div className="min-h-screen bg-bg-primary flex">
            <SidebarNavigation />
            <div className="flex-1 p-6">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}