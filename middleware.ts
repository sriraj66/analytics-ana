import { NextRequest, NextResponse } from 'next/server'

async function CookiesDeleteRedirect(request: NextRequest, response: NextResponse) {
  if (request.nextUrl.pathname !== '/') {
    response = NextResponse.redirect(new URL('/', request.url));
  }
  response.cookies.delete('currentUser')
  response.cookies.delete('currentRole')
  response.cookies.delete('collegeId')
  response.cookies.delete('username')
  response.cookies.delete('currentId')
  response.cookies.delete('currentRollno')
  response.cookies.delete('token')
  return response;
}

export async function middleware(request: NextRequest) {
  const { url, nextUrl, cookies } = request;
  const { value: token } = cookies.get("token") ?? { value: null };
  const response = NextResponse.next()
  if (token === null) {
    if (nextUrl.pathname !== '/') {
      const response = NextResponse.redirect(new URL('/', url));
      return response;
    }
  } else {
    const loginRequest = await fetch(new URL('/api/auth', url), { method: 'POST', body: JSON.stringify({ token: token })})
    if (loginRequest.status === 200) {
      const loginJson: any = await loginRequest.json()
      if (loginJson.exp < (new Date().getTime() / 1000)) {
        return await CookiesDeleteRedirect(request, response)
      } else {
        response.cookies.set('currentId', loginJson.id)
        response.cookies.set('currentUser', loginJson.name)
        response.cookies.set('currentRole', loginJson.role)
        response.cookies.set('username', loginJson.username)
        response.cookies.set('token', token)
        if (loginJson.role === 'student') {
          response.cookies.set('currentRollno', loginJson.rollno)
        } else if (loginJson.role === 'superadmin') {
          response.cookies.set('collegeId', loginJson.role)
        } else if (loginJson.role === 'admin') {
          response.cookies.delete('collegeId')
          response.cookies.delete('currentRollno')
        }
      }
      if ((loginJson.role === 'student') && (nextUrl.pathname.startsWith('/admin') || nextUrl.pathname.startsWith('/sadmin'))) {
        const response = NextResponse.redirect(new URL('/dashboard', url))
        response.cookies.set('currentId', loginJson.id)
        response.cookies.set('currentUser', loginJson.name)
        response.cookies.set('currentRole', loginJson.role)
        response.cookies.set('username', loginJson.username)
        response.cookies.set('currentRollno', loginJson.rollno)
        response.cookies.set('token', token)
        response.cookies.delete('collegeId')
        response.cookies.set('token', token)
        return response
      } else if ((loginJson.role === 'superadmin') && (nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/admin'))) {
        const response = NextResponse.redirect(new URL('/sadmin', url))
        response.cookies.set('currentId', loginJson.id)
        response.cookies.set('currentUser', loginJson.name)
        response.cookies.set('currentRole', loginJson.role)
        response.cookies.set('username', loginJson.username)
        response.cookies.set('collegeId', loginJson.college)
        response.cookies.delete('currentRollno')
        response.cookies.set('token', token)
        return response
      } else if ((loginJson.role === 'admin') && (nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/sadmin'))) {
        const response = NextResponse.redirect(new URL('/admin', url))
        response.cookies.set('currentId', loginJson.id)
        response.cookies.set('currentUser', loginJson.name)
        response.cookies.set('currentRole', loginJson.role)
        response.cookies.set('username', loginJson.username)
        response.cookies.delete('collegeId')
        response.cookies.delete('currentRollno')
        response.cookies.set('token', token)
        return response
      }
    } else {
      return await CookiesDeleteRedirect(request, response)
    }
  }
  return response;
}

// export const config = { matcher: ["/dashboard/:path*", "/admin/:path*", "/sadmin/:path*"] };
export const config = { matcher: [] };