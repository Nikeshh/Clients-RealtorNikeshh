import { auth } from "@/app/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const session = await auth()
  const isAuth = !!session
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth/')

  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!isAuth && !isAuthPage) {
    const callbackUrl = request.nextUrl.pathname
    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${encodedCallbackUrl}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/clients/:path*',
    '/properties/:path*',
    '/api/clients/:path*',
    '/api/properties/:path*',
    '/auth/:path*',
  ]
} 