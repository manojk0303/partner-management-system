// File: /hooks/useAuth.js
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export function useAuth({ required = true, adminOnly = true } = {}) {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const isAdmin = session?.user?.role === "ADMIN";
  const authenticated = !!session;
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If authentication is required and the user is not authenticated
      if (required && !authenticated) {
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
      }
      
      // If admin access is required but the user is not an admin
      else if (adminOnly && !isAdmin) {
        router.push("/auth/unauthorized");
      }
    }
  }, [loading, authenticated, isAdmin, required, adminOnly, router]);

  return {
    session,
    loading,
    authenticated,
    isAdmin
  };
}