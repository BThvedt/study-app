import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return NextResponse.json({ authenticated: res.ok });
}