import { NextResponse } from 'next/server'
import { generateState, setOAuthState } from '@/lib/oauth'

export async function GET() {
  const state = generateState()
  await setOAuthState(state)

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  })

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  )
}
