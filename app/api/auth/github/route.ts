import { NextResponse } from 'next/server'
import { generateState, setOAuthState } from '@/lib/oauth'

export async function GET() {
  const state = generateState()
  await setOAuthState(state)

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/github/callback`,
    scope: 'user:email',
    state,
  })

  return NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`
  )
}
