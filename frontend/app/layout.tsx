import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Udyam Registration Clone',
  description: 'A full-stack clone of the Udyam Registration portal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Udyam Registration
                  </h1>
                  <span className="text-sm text-gray-500">Clone</span>
                </div>
                <div className="text-sm text-gray-600">
                  Government of India | Ministry of MSME
                </div>
              </div>
            </div>
          </header>
          
          <main className="py-8">
            {children}
          </main>
          
          <footer className="bg-gray-800 text-white py-8 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <p className="text-sm">
                  © 2024 Udyam Registration Clone - Educational Project
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  This is a clone for learning purposes only
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
