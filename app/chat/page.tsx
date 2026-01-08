'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BotInterface from '@/components/BotInterface';
import RatingModal from '@/components/RatingModal';
import AuthGuard from '@/components/AuthGuard';
import { ChatLog } from '@/types';
import { db } from '@/services/db';
import { auth } from '@/services/auth';

export default function ChatPage() {
  const router = useRouter();
  const [showRating, setShowRating] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [botKey, setBotKey] = useState(0); // Key لإعادة تحميل BotInterface

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

    // Abandoned session recovery logic
    const recoverAbandonedSession = async () => {
      const abandonedSession = localStorage.getItem('est_autosave_session');
      if (abandonedSession) {
        try {
          const data = JSON.parse(abandonedSession);
          if (data.messages && data.messages.length > 1) {
            console.log("Recovering abandoned session...");
            const fullLog: ChatLog = {
              id: data.id,
              timestamp: data.timestamp,
              duration: (Date.now() - data.timestamp) / 1000,
              userQuery: data.messages.map((m: any) => {
                const role = m.role === 'user' ? '👤 العميل' : '🤖 E-stock Bot';
                const imgTag = m.image ? ' [مرفق صورة]' : '';
                return `${role}: ${m.text}${imgTag}`;
              }).join('\n\n'),
              botResponse: "جلسة غير مكتملة (تم الاسترداد تلقائياً)",
              clientName: "زائر (جلسة مستعادة)"
            };
            
            await db.addLog(fullLog);
            console.log("Abandoned session saved to DB.");
          }
        } catch (e) {
          console.error("Error recovering session", e);
        }
        localStorage.removeItem('est_autosave_session');
      }
    };
    recoverAbandonedSession();
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

  const handleSessionEnd = (logId: string) => {
    setShowRating(logId);
    // إعادة تحميل BotInterface بإنشاء جلسة جديدة
    setBotKey(prev => prev + 1);
  };

  const handleRatingClose = () => {
    setShowRating(null);
    router.push('/');
  };

  const handleAdminClick = () => {
    router.push('/admin');
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleLogout = () => {
    auth.logout();
    router.push('/login');
  };

  return (
    <AuthGuard>
      <div className="h-[100dvh] w-full flex flex-col bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden transition-colors duration-300">
      <div className="h-full flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Navbar specific to Chat App */}
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm z-40 select-none flex-shrink-0 transition-colors">
          <div className="max-w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14 sm:h-16 items-center">
              <div className="flex items-center space-x-4 space-x-reverse">
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1"
                  title="تسجيل الخروج"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  خروج
                </button>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex-shrink-0 flex items-center justify-center bg-white dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-600 w-9 h-9 sm:w-10 sm:h-10">
                  {/* Chat Nav Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full p-1">
                    <rect width='100' height='100' rx='20' fill='#F7941D'/>
                    <path d='M20 30 Q 50 15 80 30 V 75 Q 50 90 20 75 Z' fill='white' opacity='0.2'/>
                    <text x='50' y='65' fontSize='45' fontWeight='bold' fontFamily='serif' textAnchor='middle' fill='white'>MS</text>
                  </svg>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">E-stock chat <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-normal bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full border border-blue-100 dark:border-blue-800 hidden sm:inline-block">دعم فني</span></h1>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 relative overflow-hidden p-0 sm:p-4 md:p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
          <div className="h-full max-w-5xl mx-auto flex flex-col">
            <div className="flex-1 relative flex flex-col min-h-0">
              <BotInterface 
                key={botKey}
                onSessionEnd={handleSessionEnd} 
                onAdminClick={handleAdminClick} 
                onBack={handleBack}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
              />
            </div>
            <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-1 sm:mt-2 py-1 flex-shrink-0 flex justify-between items-center px-4 select-none bg-gray-50 dark:bg-gray-900 sm:bg-transparent">
              <span>نظام محلي - بدون إنترنت</span>
            </div>
          </div>
        </main>
      </div>

      {/* Rating Modal */}
      {showRating && (
        <RatingModal 
          chatId={showRating} 
          onClose={handleRatingClose} 
        />
      )}
      </div>
    </AuthGuard>
  );
}







