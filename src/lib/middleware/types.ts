import type { NextRequest } from 'next/server';

export type MiddlewareHandler = (request: NextRequest) => Promise<Response> | Response;

export type ValidationSchema = {
  [key: string]: (value: any) => boolean;
};

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
} 