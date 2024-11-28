import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from "@/app/auth"

type HandlerFunction = (req: NextRequest) => Promise<NextResponse>

export function withAuth(handler: HandlerFunction) {
  return async function (req: NextRequest) {
    const session = await auth()

    if (!session) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Not authenticated',
          message: 'Please sign in to access this resource'
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    return handler(req)
  }
} 