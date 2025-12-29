import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RESERVED_SLUGS = new Set([
  '',
  'about',
  'blog',
  'businesses',
  'categories',
  'contact',
  'dashboard',
  'admin',
  'privacy',
  'profile',
  'support',
  'terms',
  'favourites',
  'sitemap.xml',
]);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  
  // Handle www redirect - redirect www to non-www (or vice versa based on preference)
  // For SEO, we'll redirect www to non-www
  // Only redirect if it's actually www, avoid redirect loops
  if (hostname.startsWith('www.') && !url.searchParams.has('_redirected')) {
    url.hostname = hostname.replace('www.', '');
    url.searchParams.set('_redirected', '1');
    return NextResponse.redirect(url, 301); // Permanent redirect
  }
  
  // Handle /businesses redirect to avoid client-side redirect
  if (pathname === '/businesses') {
    // Try to get location from cookie or default to riyadh
    const locationSlug = request.cookies.get('selected-location-slug')?.value || 'riyadh';
    const redirectUrl = new URL(`/businesses/in/${locationSlug}`, request.url);
    return NextResponse.redirect(redirectUrl, 301);
  }
  
  const token = request.cookies.get('auth-token')?.value;
  const isDashboard = pathname.startsWith('/dashboard');
  const isAdmin = pathname.startsWith('/admin');

  const sitemapMatch = pathname.match(/^\/sitemap-(\d+)\.xml$/);
  if (sitemapMatch) {
    const index = sitemapMatch[1];
    const url = request.nextUrl.clone();
    url.pathname = '/sitemap-chunk';
    url.searchParams.set('index', index);
    return NextResponse.rewrite(url);
  }

  if ((isDashboard || isAdmin) && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const singleSegment = pathname.match(/^\/([^\/]+)\/?$/);
  if (singleSegment) {
    const slug = decodeURIComponent(singleSegment[1]).toLowerCase();
    if (!RESERVED_SLUGS.has(slug) && !slug.includes('.')) {
      const baseUrl = API_BASE_URL || request.nextUrl.origin;
      try {
        // Use cache to avoid multiple API calls
        const res = await fetch(`${baseUrl}/api/categories/slug/${slug}`, {
          headers: { 'Content-Type': 'application/json' },
          cache: 'force-cache',
          next: { revalidate: 3600 }, // Cache for 1 hour
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.success) {
            const url = request.nextUrl.clone();
            url.pathname = `/category/${slug}`;
            return NextResponse.rewrite(url);
          }
        }
      } catch (error) {
        console.error('Category rewrite failed:', error);
      }
    }
  }

  // Add performance headers
  const response = NextResponse.next();
  
  // HTTP/2 is automatically handled by Vercel, but we can add headers for optimization
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};