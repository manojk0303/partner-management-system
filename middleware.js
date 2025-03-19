// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// middleware.js
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if the path is an admin route
  const isAdminRoute = pathname.startsWith("/admin") || 
                       pathname.startsWith("/api/admin");

  // Public routes that don't need protection
  if (!isAdminRoute) {
    return NextResponse.next();
  }

  // For admin routes, verify authentication and role
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET
  });

  // If not authenticated or not an admin
  if (!token || token.role !== "ADMIN") {
    // For API routes, return a JSON response instead of redirecting
    if (pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    // Add cache-control header to prevent caching issues
    const redirectUrl = new URL("/auth/login", request.url)
    return NextResponse.redirect(redirectUrl, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  }

  // Add cache-control header to all responses
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

// Configure which routes to apply this middleware to
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};