import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

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

  // If not authenticated or not an admin, redirect to login
  if (!token || token.role !== "ADMIN") {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure which routes to apply this middleware to
export const config = {
  matcher: [
    "/admin/:path",
    "/api/admin/:path",
  ],
};