import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simplified middleware that allows all routes for UI development
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|fonts|icons|public|[\\w-]+\\.\\w+).*)',
  ],
}; 