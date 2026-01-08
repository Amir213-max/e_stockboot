'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';
import AuthGuard from '@/components/AuthGuard';
import { auth } from '@/services/auth';

export default function AdminPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    auth.logout();
    router.push('/login');
  };

  return (
    <AuthGuard>
      <div className="h-[100dvh] w-full bg-gray-50 dark:bg-gray-900 p-0 sm:p-4 md:p-6 overflow-hidden transition-colors">
        <div className="h-full max-w-6xl mx-auto relative animate-in fade-in slide-in-from-bottom-4 flex flex-col min-h-0">
          <div className="absolute top-4 left-4 z-50 flex gap-2">
            <button 
              onClick={() => router.push('/chat')}
              className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-600 dark:text-white p-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-600 transition-all hover:scale-105"
              title="عودة للمحادثة"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg transition-all flex items-center gap-2"
              title="تسجيل الخروج"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              خروج
            </button>
          </div>
          <AdminDashboard isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </div>
      </div>
    </AuthGuard>
  );
}








