import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('userId')?.value;
  const { pathname } = request.nextUrl;

  // Tentukan path yang bisa diakses tanpa login
  const isPublicPath = 
    pathname === '/' || 
    pathname.startsWith('/login') || 
    pathname.startsWith('/register') ||
    pathname.startsWith('/api/auth') || // API auth harus public
    pathname.includes('.') || // Static files (favicon, images, etc)
    pathname.startsWith('/_next'); // Next.js internals

  // Jika tidak ada userId dan mencoba mengakses path private
  if (!userId && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    // Simpan path asal untuk redirect setelah login jika perlu
    // loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login tapi mencoba ke halaman login/register
  if (userId && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

// Konfigurasi matcher untuk menentukan path mana saja yang akan diproses middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) -> Kita handle manual di dalam middleware jika perlu
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
