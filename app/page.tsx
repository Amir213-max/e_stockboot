'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModernSoftLanding from '@/components/ModernSoftLanding';
import AuthGuard from '@/components/AuthGuard';
import { auth } from '@/services/auth';

export default function HomePage() {
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

  const handleOpenChat = () => {
    router.push('/chat');
  };

  const handleLogout = () => {
    auth.logout();
    router.push('/login');
  };

  return (
    <AuthGuard>
      <div className="h-[100dvh] w-full flex flex-col bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden transition-colors duration-300">
        {/* Logout Button */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all flex items-center gap-2"
            title="تسجيل الخروج"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            تسجيل الخروج
          </button>
        </div>

        <div className="h-full w-full overflow-y-auto overflow-x-hidden">
          <ModernSoftLanding 
            onOpenChat={handleOpenChat} 
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
          />
        </div>
      </div>
    </AuthGuard>
  );
}








