import { Inter } from "next/font/google"
import AuthProvider from "@/providers/SessionProvider"
import { getSession } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import { ToastProvider } from "@/components/ui/toast-context"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider session={session}>
          <ToastProvider>
            {session?.user && <Navbar />}
            <main className={`mx-auto ${session?.user ? 'pt-16' : ''}`}>
              {children}
            </main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
