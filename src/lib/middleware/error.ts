import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';

export function withErrorHandler(handler: Function) {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return NextResponse.json(
            { error: 'Duplicate entry' },
            { status: 409 }
          );
        }
        
        if (error.code === 'P2025') {
          return NextResponse.json(
            { error: 'Record not found' },
            { status: 404 }
          );
        }
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
} 