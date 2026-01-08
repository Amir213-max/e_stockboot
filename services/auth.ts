// نظام Authentication محلي مع Sessions تنتهي بعد 5 دقائق

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: number;
}

export interface Session {
  userId: string;
  token: string;
  expiresAt: number;
  createdAt: number;
}

const STORAGE_KEYS = {
  USERS: 'auth_users',
  SESSIONS: 'auth_sessions',
  CURRENT_USER: 'auth_current_user',
  CURRENT_SESSION: 'auth_current_session'
};

const SESSION_DURATION = 5 * 60 * 1000; // 5 دقائق بالميلي ثانية

// توليد token عشوائي
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36);
}

// الحصول على جميع المستخدمين
function getUsers(): User[] {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

// حفظ المستخدمين
function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// الحصول على جميع الجلسات
function getSessions(): Session[] {
  const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  return data ? JSON.parse(data) : [];
}

// حفظ الجلسات
function saveSessions(sessions: Session[]): void {
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

// تنظيف الجلسات المنتهية
function cleanupExpiredSessions(): void {
  const sessions = getSessions();
  const now = Date.now();
  const activeSessions = sessions.filter(s => s.expiresAt > now);
  saveSessions(activeSessions);
}

export const auth = {
  // تسجيل مستخدم جديد
  register: async (username: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
    // التحقق من صحة البيانات
    if (!username || username.length < 3) {
      return { success: false, message: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' };
    }
    
    if (!email || !email.includes('@')) {
      return { success: false, message: 'البريد الإلكتروني غير صحيح' };
    }
    
    if (!password || password.length < 6) {
      return { success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
    }

    const users = getUsers();
    
    // التحقق من عدم وجود المستخدم
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: 'اسم المستخدم موجود بالفعل' };
    }
    
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'البريد الإلكتروني مستخدم بالفعل' };
    }

    // إنشاء مستخدم جديد
    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      username,
      email,
      createdAt: Date.now()
    };

    // حفظ المستخدم (في الواقع، يجب تشفير كلمة المرور، لكن سنحفظها بسيطة للآن)
    users.push(newUser);
    saveUsers(users);

    // حفظ كلمة المرور بشكل منفصل (في الواقع يجب تشفيرها)
    const userPasswords = JSON.parse(localStorage.getItem('auth_passwords') || '{}');
    userPasswords[newUser.id] = password;
    localStorage.setItem('auth_passwords', JSON.stringify(userPasswords));

    return { success: true, message: 'تم التسجيل بنجاح', user: newUser };
  },

  // تسجيل الدخول
  login: async (usernameOrEmail: string, password: string): Promise<{ success: boolean; message: string; session?: Session }> => {
    if (!usernameOrEmail || !password) {
      return { success: false, message: 'يرجى إدخال اسم المستخدم/البريد وكلمة المرور' };
    }

    const users = getUsers();
    const userPasswords = JSON.parse(localStorage.getItem('auth_passwords') || '{}');
    
    // البحث عن المستخدم
    const user = users.find(u => 
      u.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
      u.email.toLowerCase() === usernameOrEmail.toLowerCase()
    );

    if (!user) {
      return { success: false, message: 'اسم المستخدم أو البريد الإلكتروني غير صحيح' };
    }

    // التحقق من كلمة المرور
    if (userPasswords[user.id] !== password) {
      return { success: false, message: 'كلمة المرور غير صحيحة' };
    }

    // تنظيف الجلسات المنتهية
    cleanupExpiredSessions();

    // إنشاء جلسة جديدة
    const token = generateToken();
    const now = Date.now();
    const session: Session = {
      userId: user.id,
      token,
      expiresAt: now + SESSION_DURATION,
      createdAt: now
    };

    // حفظ الجلسة
    const sessions = getSessions();
    sessions.push(session);
    saveSessions(sessions);

    // حفظ الجلسة الحالية
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

    return { success: true, message: 'تم تسجيل الدخول بنجاح', session };
  },

  // تسجيل الخروج (بدون استدعاء getCurrentSession لتجنب التكرار)
  logout: (skipCheck?: boolean): void => {
    // الحصول على الجلسة مباشرة من localStorage بدون استدعاء getCurrentSession
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (data) {
      try {
        const session: Session = JSON.parse(data);
        // حذف الجلسة من القائمة
        const sessions = getSessions();
        const filtered = sessions.filter(s => s.token !== session.token);
        saveSessions(filtered);
      } catch (e) {
        // ignore
      }
    }
    
    // مسح فقط الجلسة الحالية والمستخدم الحالي - نحتفظ ببيانات المستخدمين المسجلين
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    
    // إعادة توجيه لصفحة login وإغلاق التطبيق
    if (typeof window !== 'undefined' && !skipCheck) {
      // لا نمسح كل localStorage - نحتفظ ببيانات المستخدمين المسجلين
      // إعادة توجيه فورية لصفحة login - استخدام replace بدلاً من href
      window.location.replace('/login');
    }
  },

  // الحصول على الجلسة الحالية (بدون استدعاء logout لتجنب التكرار)
  getCurrentSession: (skipLogout?: boolean): Session | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (!data) return null;

    try {
      const session: Session = JSON.parse(data);
      const now = Date.now();

      // التحقق من انتهاء الجلسة
      if (session.expiresAt <= now) {
        if (!skipLogout) {
          // حذف الجلسة مباشرة بدون استدعاء logout
          localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
          
          // حذف من القائمة
          const sessions = getSessions();
          const filtered = sessions.filter(s => s.token !== session.token);
          saveSessions(filtered);
          
          // إعادة توجيه فورية وإغلاق التطبيق - استخدام replace بدلاً من href
          // لا نمسح كل localStorage - نحتفظ ببيانات المستخدمين المسجلين
          if (typeof window !== 'undefined') {
            window.location.replace('/login');
          }
        }
        return null;
      }

      // لا نحدث الجلسة تلقائياً - الجلسة تنتهي بعد 5 دقائق بالضبط
      return session;
    } catch (e) {
      // في حالة خطأ في parsing
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      return null;
    }
  },

  // الحصول على المستخدم الحالي
  getCurrentUser: (): User | null => {
    const session = auth.getCurrentSession(true); // skipLogout = true
    if (!session) return null;

    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  },

  // التحقق من صحة الجلسة
  isAuthenticated: (): boolean => {
    return auth.getCurrentSession(true) !== null; // skipLogout = true
  },

  // الحصول على الوقت المتبقي للجلسة
  getSessionTimeLeft: (): number => {
    const session = auth.getCurrentSession(true); // skipLogout = true
    if (!session) return 0;
    
    const timeLeft = session.expiresAt - Date.now();
    return Math.max(0, timeLeft);
  },

  // تمديد الجلسة
  extendSession: (): boolean => {
    const session = auth.getCurrentSession(true); // skipLogout = true
    if (!session) return false;

    const now = Date.now();
    session.expiresAt = now + SESSION_DURATION;
    
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    
    // تحديث في القائمة
    const sessions = getSessions();
    const index = sessions.findIndex(s => s.token === session.token);
    if (index !== -1) {
      sessions[index] = session;
      saveSessions(sessions);
    }

    return true;
  }
};

// تنظيف الجلسات المنتهية عند تحميل الملف
if (typeof window !== 'undefined') {
  cleanupExpiredSessions();
  
  // تنظيف دوري كل دقيقة
  setInterval(() => {
    cleanupExpiredSessions();
  }, 60000);
}

