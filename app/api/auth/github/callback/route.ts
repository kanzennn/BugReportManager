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
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      redirect_uri: `${base()}/api/auth/github/callback`,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${base()}/login?error=oauth_failed`)
  }

  const { access_token } = await tokenRes.json() as { access_token: string }

  // Get GitHub user profile
  const profileRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: 'application/vnd.github+json',
    },
  })

  if (!profileRes.ok) {
    return NextResponse.redirect(`${base()}/login?error=oauth_failed`)
  }

  const profile = await profileRes.json() as { id: number; login: string; name: string | null; email: string | null }

  // GitHub may not expose email in profile — fetch it separately
  let email = profile.email
  if (!email) {
    const emailsRes = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/vnd.github+json',
      },
    })
    if (emailsRes.ok) {
      const emails = await emailsRes.json() as { email: string; primary: boolean; verified: boolean }[]
      email = emails.find((e) => e.primary && e.verified)?.email ?? emails[0]?.email ?? null
    }
  }

  if (!email) {
    return NextResponse.redirect(`${base()}/login?error=oauth_no_email`)
  }

  const user = await findOrCreateOAuthUser({
    provider: 'github',
    providerId: String(profile.id),
    email,
    name: profile.name ?? profile.login,
  })

  await createSession(user.id)
  return NextResponse.redirect(`${base()}/dashboard`)
}
