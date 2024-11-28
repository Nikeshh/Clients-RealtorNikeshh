import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { ValidationSchema, MiddlewareHandler } from './types';

export function validateBody(schema: ValidationSchema): MiddlewareHandler {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      
      for (const [field, validate] of Object.entries(schema)) {
        if (!validate(body[field])) {
          return NextResponse.json(
            { error: `Invalid ${field}` },
            { status: 400 }
          );
        }
      }
      
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
  };
} 