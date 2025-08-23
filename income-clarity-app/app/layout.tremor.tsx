import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './tremor-globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Income Clarity - Professional Financial Dashboard',
  description: 'Clean, modern financial dashboard powered by Tremor components',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarnings>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}