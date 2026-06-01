import { jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

const secretValue = process.env.JWT_SECRET
if (!secretValue || secretValue.length < 32) {
  throw new Error('JWT_SECRET must be set to a random string of at least 32 characters')
}
const secret = new TextEncoder().encode(secretValue)

async function isAuthenticated(req: NextRequest) {
  const token = req.cookies.get('brm_session')?.value
  if (!token) return false
  try {
    await jwtVerify(token, secret, { algorithms: ['HS256'] })
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
