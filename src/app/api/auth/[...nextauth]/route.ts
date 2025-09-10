import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest } from 'next/server';

const handler = NextAuth(authOptions);

export async function GET(request: NextRequest) {
  return (handler as any).GET(request);
}

export async function POST(request: NextRequest) {
  return (handler as any).POST(request);
}