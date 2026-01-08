'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/services/auth';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0);

  useEffect(() => {
    // التحقق من الجلسة
    const checkAuth = () => {
      // إذا كنا في صفحة login، لا نحتاج للتحقق
      if (pathname === '/login') {
        setIsChecking(false);
        return;
      }

      if (!auth.isAuthenticated()) {
        // إعادة التوجيه لصفحة تسجيل الدخول مع مسح البيانات
        localStorage.clear();
        window.location.replace('/login');
        return;
      }

      // التحقق من الوقت المتبقي
      const timeLeft = auth.getSessionTimeLeft();
      setSessionTimeLeft(timeLeft);

      setIsChecking(false);
    };

    checkAuth();

    // تحديث الوقت المتبقي كل ثانية
    const interval = setInterval(() => {
      // تخطي إذا كنا في صفحة login
      if (pathname === '/login') {
        return;
      }

      // التحقق من الجلسة مباشرة
      const session = auth.getCurrentSession(true); // skipLogout = true لتجنب التكرار
      
      if (session) {
        const timeLeft = session.expiresAt - Date.now();
        setSessionTimeLeft(Math.max(0, timeLeft));

        // إذا انتهت الجلسة أو على وشك الانتهاء (أقل من ثانية)
        if (timeLeft <= 0) {
          // مسح فقط الجلسة الحالية - نحتفظ ببيانات المستخدمين المسجلين
          auth.logout(true); // skipCheck = true لتجنب التكرار
          // إعادة تحميل الصفحة بالكامل وإرسال المستخدم لصفحة تسجيل الدخول
          window.location.replace('/login');
          return;
        }
      } else if (pathname !== '/login') {
        // إذا لم تكن هناك جلسة، إعادة توجيه فوراً
        // لا نمسح localStorage - نحتفظ ببيانات المستخدمين المسجلين
        window.location.replace('/login');
        return;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [router, pathname]);

  // عرض شاشة التحميل أثناء التحقق
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  // عرض عداد الجلسة (فقط إذا لم نكن في صفحة login)
  if (pathname === '/login') {
    return <>{children}</>;
  }

  const minutes = Math.floor(sessionTimeLeft / 60000);
  const seconds = Math.floor((sessionTimeLeft % 60000) / 1000);

  return (
    <>
      {children}
      
      {/* Session Timer - Fixed Bottom */}
      <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700 z-50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            الجلسة تنتهي خلال: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
    </>
  );
}

