// File: /pages/auth/unauthorized.js
import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You don't have permission to access this resource.
          </p>
        </div>
        <div className="mt-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-500">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}