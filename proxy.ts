import { jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback-secret-change-in-production-please'
)

async function isAuthenticated(req: NextRequest) {
  const token = req.cookies.get('brm_session')?.value
  if (!token) return false
  try {
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const authed = await isAuthenticated(req)

  if (pathname.startsWith('/dashboard')) {
    if (!authed) return NextResponse.redirect(new URL('/login', req.url))
  }

  if (pathname === '/login' || pathname === '/register') {
    if (authed) return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
