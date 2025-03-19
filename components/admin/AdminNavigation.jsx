// components/AdminNavigation.jsx
"use client"
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

const AdminNavigation = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  const isActive = (path) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/admin', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      )
    },
    { 
      name: 'Brands', 
      path: '/admin/brands', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
      )
    },
    { 
      name: 'Offers', 
      path: '/admin/offers', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
      )
    },
  ];
  
  return (
    <>
      {/* Mobile Navigation Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center text-white text-lg font-bold mr-2">
            PM
          </div>
          <span className="font-semibold text-gray-800">Partner Management</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          )}
        </button>
      </div>
      
      {/* Mobile Navigation Menu */}
      <div className={`fixed inset-0 z-10 bg-gray-800 bg-opacity-50 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}>
        <div className={`fixed inset-y-0 left-0 w-64 bg-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
          <div className="h-full flex flex-col overflow-y-auto shadow-xl">
            <div className="px-4 py-6 bg-gradient-to-r from-indigo-600 to-purple-700 flex items-center space-x-3">
              <div className="h-10 w-10 rounded-md bg-white flex items-center justify-center text-blue-600 text-lg font-bold">
                PM
              </div>
              <div className='mt-16'>
                <h1 className="text-xl font-bold text-white">Partner Management</h1>
                <p className="text-blue-200 text-sm">Admin Dashboard</p>
              </div>
            </div>
            
            <nav className="flex-1 px-2 py-4 bg-white">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link href={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className={`mr-3 ${isActive(item.path) ? 'text-blue-600' : 'text-gray-500'}`}>
                        {item.icon}
                      </span>
                      {item.name}
                      {isActive(item.path) && (
                        <span className="ml-auto w-1.5 h-6 rounded-full bg-blue-600"></span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="px-2 py-4 border-t border-gray-200">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <span className="mr-3 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                  </svg>
                </span>
                View Public Site
              </Link>
              
              <button
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mt-2"
              >
                <span className="mr-3 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                </span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex md:flex-col bg-white border-r border-gray-200 shadow-sm w-64 transition-all duration-300">
        <div className="px-4 py-6 bg-gradient-to-r from-indigo-600 to-purple-700 flex items-center space-x-3">
          <div className="h-10 w-10 rounded-md bg-white flex items-center justify-center text-blue-600 text-lg font-bold">
            PM
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Partner Management</h1>
            <p className="text-blue-200 text-sm">Admin Dashboard</p>
          </div>
        </div>
        
        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className={`mr-3 ${isActive(item.path) ? 'text-blue-600' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  {item.name}
                  {isActive(item.path) && (
                    <span className="ml-auto w-1.5 h-6 rounded-full bg-blue-600"></span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="px-2 py-4 border-t border-gray-200">
          <Link
            href="/"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <span className="mr-3 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
              </svg>
            </span>
            View Public Site
          </Link>
          
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mt-2 group"
          >
            <span className="mr-3 text-gray-500 group-hover:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </span>
            <span className="group-hover:text-red-500 transition-colors">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminNavigation;