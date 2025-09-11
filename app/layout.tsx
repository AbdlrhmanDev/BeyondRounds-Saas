import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import '../styles/globals.css'
import Footer from '@/components/footer'
import ModernNav from '@/components/modern-nav'
import { ThemeProvider } from '@/components/theme-provider'
export const metadata: Metadata = {
  title: "beyondrounds",
  description: 'where doctors become friends',
  generator: 'beyondrounds',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ModernNav />
          {children}
          <Analytics />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
