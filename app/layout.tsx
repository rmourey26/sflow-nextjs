import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ 
  subsets: ["latin"], 
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({ 
  subsets: ["latin"], 
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SaverFlow - See Your Next 90 Days of Money',
  description: 'SaverFlow shows your future balance, predicts expenses, and offers small saving suggestions so you never have to guess.',
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
