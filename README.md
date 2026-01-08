# Modern Soft - Intelligent Solutions

نظام دعم فني ذكي مبني على Next.js مع Google Gemini AI

## المميزات

- 🤖 مساعد ذكي يعمل بالذكاء الاصطناعي (Gemini 2.5 Flash)
- 💬 واجهة محادثة تفاعلية
- 📊 لوحة تحكم إدارية شاملة
- 🌓 دعم الوضع الداكن
- 📱 دعم PWA (Progressive Web App)
- 🔄 دعم RTL (اللغة العربية)
- 🔥 Firebase للبيانات
- 📈 تقارير وإحصائيات مفصلة

## التقنيات المستخدمة

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini AI (@google/genai)
- **Database**: Firebase Firestore
- **Charts**: Recharts

## التثبيت

1. تثبيت Dependencies:
```bash
npm install
```

2. إنشاء ملف `.env.local`:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

3. تشغيل المشروع:
```bash
npm run dev
```

4. فتح المتصفح على:
```
http://localhost:3000
```

## البنية

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page (/)
│   ├── chat/
│   │   └── page.tsx        # Chat interface (/chat)
│   ├── admin/
│   │   └── page.tsx        # Admin dashboard (/admin)
│   └── globals.css         # Global styles
├── components/             # React components
├── services/               # Firebase & DB services
├── utils/                  # Utility functions
├── types.ts                # TypeScript types
└── public/                 # Static files
```

## الصفحات

- `/` - الصفحة الرئيسية (Landing Page)
- `/chat` - واجهة المحادثة
- `/admin` - لوحة التحكم الإدارية

## Scripts

- `npm run dev` - تشغيل المشروع في وضع التطوير
- `npm run build` - بناء المشروع للإنتاج
- `npm run start` - تشغيل المشروع بعد البناء
- `npm run lint` - فحص الكود

## ملاحظات

- المشروع يستخدم Next.js 14+ مع App Router
- جميع المكونات هي Client Components (تستخدم 'use client')
- Firebase يعمل في client-side فقط
- Gemini AI يعمل في client-side فقط

## الترخيص

© 2025 Modern Soft - جميع الحقوق محفوظة
