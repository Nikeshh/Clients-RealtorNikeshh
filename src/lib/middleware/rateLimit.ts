import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';

const RATE_LIMIT = 100; // requests per minute
const WINDOW_MS = 60 * 1000; // 1 minute

const requests = new Map<string, number[]>();

export function rateLimit(request: NextRequest) {
  // Get client IP from headers or forwarded headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'anonymous';
  
  const now = Date.now();
  
  // Get existing requests for this IP
  const timestamps = requests.get(ip) || [];
  
  // Remove old timestamps
  const recent = timestamps.filter(time => time > now - WINDOW_MS);
  
  // Check rate limit
  if (recent.length >= RATE_LIMIT) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // Add new request
  recent.push(now);
  requests.set(ip, recent);
  
  return NextResponse.next();
} 