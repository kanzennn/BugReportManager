import { NextRequest, NextResponse } from 'next/server'
import { verifyOAuthState, findOrCreateOAuthUser } from '@/lib/oauth'
import { createSession } from '@/lib/auth'

const base = () => process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error || !code || !state) {
    return NextResponse.redirect(`${base()}/login?error=oauth_cancelled`)
  }

  if (!(await verifyOAuthState(state))) {
    return NextResponse.redirect(`${base()}/login?error=oauth_invalid_state`)
  }

  // Exchange code for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${base()}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${base()}/login?error=oauth_failed`)
  }

  const { access_token } = await tokenRes.json() as { access_token: string }

  // Get user profile
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!profileRes.ok) {
    return NextResponse.redirect(`${base()}/login?error=oauth_failed`)
  }

  const profile = await profileRes.json() as { id: string; email: string; name: string }

  if (!profile.email) {
    return NextResponse.redirect(`${base()}/login?error=oauth_no_email`)
  }

  const { user } = await findOrCreateOAuthUser({
    provider: 'google',
    providerId: profile.id,
    email: profile.email,
    name: profile.name ?? profile.email.split('@')[0],
  })

  await createSession(user.id)
  const dest = user.agreedToTermsAt ? `${base()}/dashboard` : `${base()}/onboarding`
  return NextResponse.redirect(dest)
}
