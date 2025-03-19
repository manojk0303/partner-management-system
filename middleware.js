// In your middleware.js
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  console.log("Middleware running for path:", pathname);
  
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

  console.log("Token:", token ? "Found" : "Not found", "Role:", token?.role);

  // If not authenticated or not an admin, redirect to login
  if (!token || token.role !== "ADMIN") {
    // Redirect to a simple login page without the callback url
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}