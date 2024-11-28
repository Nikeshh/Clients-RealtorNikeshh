import { auth } from "@/app/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const session = await auth()
  const isAuth = !!session
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth/')

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  if (!isAuth) {
    let callbackUrl = request.nextUrl.pathname
    if (request.nextUrl.search) {
      callbackUrl += request.nextUrl.search
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${encodedCallbackUrl}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/clients/:path*',
    '/properties/:path*',
    '/api/clients/:path*',
    '/api/properties/:path*',
    '/auth/:path*',
  ]
} 