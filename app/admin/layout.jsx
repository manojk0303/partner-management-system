// admin/layout.js
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Suspense } from 'react';

export default function AdminLayout({ children }) {
  return (
    <div className="flex flex-col md:flex-row min-h-100vh bg-gray-50">
      <AdminNavigation />
      <div className="flex-1 flex flex-col overflow-hidden mt-16">
        <main className="flex-1 overflow-auto transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
