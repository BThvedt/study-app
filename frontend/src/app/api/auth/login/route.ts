import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  const tokenRes = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/oauth/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: process.env.DRUPAL_CLIENT_ID!,
        client_secret: process.env.DRUPAL_CLIENT_SECRET!,
        username,
        password,
      }),
    }
  );

//   const responseText = await tokenRes.text();
//   console.log('Token response status:', tokenRes.status);
//   console.log('Token response body:', responseText);

  if (!tokenRes.ok) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const tokens = await tokenRes.json();

  const response = NextResponse.json({ success: true });
  response.cookies.set('access_token', tokens.access_token, {
    httpOnly: true,
    secure: false, // true in production
    sameSite: 'lax',
    maxAge: tokens.expires_in,
    path: '/',
  });
  response.cookies.set('refresh_token', tokens.refresh_token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  return response;
}