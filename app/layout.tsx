import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "SaverFlow - See Your Next 90 Days of Money",
  description:
    "SaverFlow shows your future balance, predicts expenses, and offers small saving suggestions so you never have to guess.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SaverFlow",
  },
  icons: {
    icon: [
      { url: "/icons/icon-48x48.jpg", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-72x72.jpg", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.jpg", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-144x144.jpg", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.jpg", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.jpg", sizes: "180x180", type: "image/png" }],
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#7C3AED",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}
