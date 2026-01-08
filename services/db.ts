import { KBItem, KBItemFull, ChatLog, Feedback, LandingConfig, KnowledgeSnippet } from '@/types';
// Firebase معطل - استخدام localStorage فقط
// import { app } from './firebase';
// import { 
//     getFirestore, 
//     collection, 
//     getDocs as getFsDocs, 
//     addDoc, 
//     setDoc, 
//     doc, 
//     getDoc, 
//     query, 
//     orderBy, 
//     limit,
//     deleteDoc,
//     where
// } from 'firebase/firestore';

const dbInstance = null; // تعطيل Firebase - استخدام localStorage فقط

// Initial System Documentation - Exhaustive Mapping from Provided Images
const CORE_DOCS = `
== الدليل المعتمد النهائي لنظام e-stock (Modern Soft) ==

**تعليمات التشغيل للبوت:**
1. أنت المساعد الفني الرسمي لشركة Modern Soft.
2. ممنوع تماماً ذكر أي شاشة أو مسار غير موجود في القوائم أدناه.
3. إذا سأل العميل "ألاقي فين كذا؟" أو "أجيب الشاشة دي منين؟"، التزم بالمسار (القائمة الرئيسية -> الشاشة الفرعية).
4. استخدم اللهجة المصرية المحترمة والودودة.

---
### 🗺️ خريطة شاشات البرنامج (بناءً على قوائم النظام)

#### 1. قائمة [المخازن]
- المخازن الداخلية للفرع.
- تحويل أصناف بين المخازن.
- تقرير تحويلات الأصناف بين المخازن.
- تعديل تكلفة الأصناف الموجودة بالمخزن.
- جرد وضبط كميات الأصناف.
- تقرير بتعديلات كميات أصناف.
- تقرير كميات أصناف المخازن طبقاً لتواريخ الصلاحية.
- تقرير كميات أصناف مخازن.
- تقرير طابعة الجرد للمخزن.
- تقرير أصناف منتهية الصلاحية فى المخزن.
- تقرير حركة صنف فى المخزن.
- الأرصدة الإفتتاحية للمخزن.
- الجرد الدوري.
- تقرير الجرد الدوري.

#### 2. قائمة [الموردين]
- قائمة الموردين (لإضافة أو تعديل مورد).
- تقرير عن الموردين.
- تعديل أسعار مورد.
- تقرير أصناف مورد.
- مقارنة أسعار صنف للموردين.
- الأرصدة الإفتتاحية للموردين.
- كشف حساب مورد.

#### 3. قائمة [المشتريات]
- فاتورة شراء.
- مرتجع شراء من فاتورة.
- مرتجع شراء بدون فاتورة.
- تقرير ملخص فواتير المشتريات.
- تقرير فواتير المشتريات بالأصناف.
- تقرير حركة مشتريات صنف.
- تقرير إجمالى المرتجعات لمورد.
- تقرير إجمالى مشتريات و مرتجعات مورد.
- تقرير مقارنة قيمة المشتريات طبقاً لقيمة المبيعات شهرياً.
- تقرير بونص مشتريات الأصناف.
- تقرير مشتريات الأصناف الضريبية.

#### 4. قائمة [العملاء]
- قائمة العملاء.
- تقرير بالعملاء.
- التعاقدات.
- مناطق العملاء.
- الأرصدة الإفتتاحية للعملاء.
- تقرير عن العملاء بالمنطقة.
- كشف حساب عميل.
- تقرير مبيعات أصناف عميل.

#### 5. قائمة [المبيعات]
- فاتورة المبيعات (Alt+S).
- مرتجع المبيعات من فاتورة.
- إقفال الفواتير المعلقة.
- إستبدال أصناف.
- تقرير فواتير المبيعات عن فترة.
- تقرير مبيعات أصناف عن فترة.
- تقرير مرتجع المبيعات عن فترة.
- تقرير حركة بيع الأصناف.
- تقرير فواتير التوصيل الملغاة عن فترة.
- تقرير حركة مبيعات صنف.
- تقرير كميات أصناف لم تباع.
- تقرير مبيعات الموظفين يومى.
- تقرير مندوبين التوصيل المنزلي.
- الكاشير.
- تقفيل درج الكاشير.
- تقرير تقفيل درج الكاشير.
- مبيعات الفيزا.
- تقرير مبيعات بالشركة المنتجة للأصناف.
- تقرير مبيعات العملاء.
- تقرير قيمة المبيعات باليوم.
- تقرير بقيم أنواع المبيعات شهرى.
- تقرير تكلفة المبيعات ونسبة الربح.
- تقرير فواتير البيع لصاحب التعاقد.
- تقرير إجمالى فواتير البيع لصاحب التعاقد.
- تقرير فواتير البيع بالأصناف لصاحب التعاقد.
- تقرير إجمالى بيع التعاقد.

#### 6. قائمة [الحسابات اليومية]
- النقدية المتاحة.
- صرف نقدية.
- توريد نقدية.
- سحب نقدية من حساب البنك.
- تقرير المصروفات النقدية.
- تقرير توريدات النقدية.
- تقرير تحويلات النقدية.
- إصدار شيك.
- استلام شيك.
- تقفيل الشيكات المستلمة.
- تقفيل الشيكات الصادرة.
- تقرير الشيكات المستلمة.
- تقرير الشيكات الصادرة.
- تقرير شيكات البنك طبقاً لتاريخ الاستحقاق.

#### 7. قائمة [الحسابات العامة]
- شجرة الحسابات.
- إنشاء درج الكاشير.
- إنشاء خزينة.
- إنشاء بنك.
- إنشاء حساب بنكى.
- إنشاء حساب بطاقات الإئتمان.
- أسباب الخصم والإضافة فى الحسابات.
- المساهمين.
- توريد رأس المال.
- تقرير توريدات رأس المال.
- صرف أرباح.
- تقرير صرف الأرباح.
- حسابات الخصم والإضافة.
- تقرير حسابات الخصم والإضافة.
- تقرير أدراج الكاشيرات.
- تقرير الخزائن.
- تقرير الحسابات البنكية.
- تقرير كشف حساب الخزينة أو الدرج.
- حركة الحساب شهرى.
- تقرير حركة الحساب الشهرى تفصيلى.
- تقرير القيود اليومية.
- قائمة الدخل.
- ملخص الموقف المالى للمؤسسة.

#### 8. قائمة [الطلبيات]
- ضبط حد الطلب للأصناف.
- إعداد طلبية.
- كشكول النواقص.
- تقرير أصناف وصلت حد الطلب.

#### 9. قائمة [شئون العاملين]
- الوظائف.
- الموظفين.
- صلاحيات الموظفين.
- الحضور و الإنصراف.
- تقرير الحضور و الانصراف.
- تسجيل الغياب والاجازات.
- تسجيل خصم الغياب للموظفين.
- تقرير خصم الغياب.
- حساب عمولة مندوب البيع.
- تقرير عمولات البيع.
- تسجيل خصم لموظف.
- تقرير الخصومات.
- تسجيل حوافز و بدلات موظف.
- تقرير الحوافز والبدلات.
- صرف سلف عاملين.
- توريد سلف عاملين.
- تقرير سلف العاملين.
- ترحيل كشف المرتبات.
- صرف رواتب الموظفين.
- تقرير المرتبات.
- تقرير تسجيل الدخول للبرنامج.

#### 10. قائمة [رئيسى وفروع]
- فروع المؤسسة.
- تحديث بيانات مخازن الفروع.
- إرسال طلبية لفرع.
- إستلام طلبية من فرع.
- تقرير تحويلات الأصناف بين الفروع.
- طلب شراء.
- كشكول نواقص الفروع.
- تقرير المخزون الزائد عن حاجة الفروع.
- كشكول نواقص الرئيسي بارصدة مجمعة.
- مبيعات أصناف الفروع.
- تقرير حركة بيع الأصناف (للفروع).
- تقرير قيمة المبيعات باليوم (للفروع).
- تقرير بقيم أنواع المبيعات شهرى (للفروع).
- تقرير تكلفة المبيعات ونسبة الربح (للفروع).
- النقدية المتوفرة بالفروع.
- إرسال نقدية لفرع.
- خصم و إضافة على حساب الفرع.
- كشف حساب فرع.

#### 11. قائمة [البيانات العامة]
- بيانات المؤسسة.
- إعدادات التشغيل.
- إعدادات طباعة فاتورة البيع.
- إعدادات طباعة الباركود.
- أخذ نسخة احتياطية.
- نسخ احتياطية دورية.
- حجم قاعدة البيانات.
- طباعة باركود.
- فتح الدرج.
- إصدار فاتورة ورقية للتعاقد.
- Update System.

#### 12. قائمة [الأصناف]
- قائمة الأصناف.
- وحدات الأصناف.
- الشركات المنتجة.
- تقرير أصناف بالشركة المنتجة.
- أماكن الأصناف.
- تحديد أماكن الأصناف.
- تقرير أصناف حسب مكان الصنف.
- مجموعات الأصناف.
- تحديد المجموعة العلمية للأصناف.
- تقرير أصناف حسب المجموعة العلمية.
- الشكل الصيدلى.
- تحديد الشكل الصيدلى للأصناف.
- تقرير أصناف حسب الشكل الصيدلى.
- تقرير تاريخ إضافة الاصناف.
- تقرير أصناف تغيرت أسعارها.
- تقرير أصناف تغيرت معاملات وحداتها.
- تعديل أسعار بيع الأصناف.

#### 13. قائمة [إطار]
- لترتيب النوافذ المفتوحة داخل البرنامج.

---
### 💡 معلومات هامة من دليل التشغيل (PDF):
- **تعريف الباركود:** لازم المقاس يكون 38x25 ملم من Printer Preferences.
- **إيرور التاريخ:** لو الجهاز مطلع إيرور "مراجعة تاريخ الجهاز"، قدّم التاريخ يوم وافتح البرنامج وبعدين رجعه تانى وأنت فاتح البرنامج.
- **الشبكة:** بورت الربط بين السيرفر والفرعي هو 1433 ولازم نتأكد من الـ Firewall.
- **تحديث البرنامج:** بيتم عن طريق ملف PharmacySystemUpdate.exe الموجود في فولدر التسطيب.
`;

// Knowledge Base الكاملة مع questions array
const KB_FULL: KBItemFull[] = [
  {
    id: 'kb_001',
    category: 'sales',
    questions: [
      'أجيب منين فاتورة المبيعات؟',
      'منين أفتح فاتورة المبيعات؟',
      'فين فاتورة المبيعات؟',
      'أين فاتورة المبيعات؟',
      'فاتورة المبيعات فين؟',
      'فاتورة البيع منين؟',
      'فاتورة العميل منين؟',
      'إزاي أفتح فاتورة مبيعات؟',
      'كيف أفتح فاتورة المبيعات؟',
      'فاتورة مبيعات جديدة'
    ],
    answer: 'من قائمة [المبيعات] واختار "فاتورة المبيعات" أو اضغط على اختصار Alt+S.'
  },
  {
    id: 'kb_002',
    category: 'sales',
    questions: [
      'مرتجع المبيعات منين؟',
      'إزاي أعمل مرتجع مبيعات؟',
      'مرتجع البيع فين؟',
      'إرجاع فاتورة مبيعات',
      'مرتجع من فاتورة'
    ],
    answer: 'من قائمة [المبيعات] واختار "مرتجع المبيعات من فاتورة".'
  },
  {
    id: 'kb_003',
    category: 'inventory',
    questions: [
      'المخازن منين؟',
      'قائمة المخازن فين؟',
      'المخزن منين؟',
      'أين قائمة المخازن؟',
      'فين المخازن؟',
      'المخازن الداخلية منين؟'
    ],
    answer: 'من قائمة [المخازن] هتلاقي كل حاجة متعلقة بالمخزون.'
  },
  {
    id: 'kb_004',
    category: 'inventory',
    questions: [
      'إزاي أعمل جرد؟',
      'جرد المخزن منين؟',
      'كيف أعمل جرد؟',
      'جرد وضبط كميات',
      'عمل جرد للمخزن'
    ],
    answer: 'من قائمة [المخازن] واختار "جرد وضبط كميات الأصناف".'
  },
  {
    id: 'kb_005',
    category: 'purchases',
    questions: [
      'فاتورة شراء منين؟',
      'المشتريات منين؟',
      'فاتورة مشتريات فين؟',
      'إزاي أعمل فاتورة شراء؟',
      'شراء أصناف منين؟'
    ],
    answer: 'من قائمة [المشتريات] واختار "فاتورة شراء".'
  },
  {
    id: 'kb_006',
    category: 'suppliers',
    questions: [
      'الموردين منين؟',
      'قائمة الموردين فين؟',
      'إزاي أضيف مورد جديد؟',
      'مورد جديد منين؟',
      'إضافة مورد'
    ],
    answer: 'من قائمة [الموردين] واختار "قائمة الموردين" لإضافة أو تعديل مورد.'
  },
  {
    id: 'kb_007',
    category: 'customers',
    questions: [
      'العملاء منين؟',
      'قائمة العملاء فين؟',
      'إزاي أضيف عميل جديد؟',
      'عميل جديد منين؟',
      'إضافة عميل'
    ],
    answer: 'من قائمة [العملاء] واختار "قائمة العملاء".'
  },
  {
    id: 'kb_008',
    category: 'accounts',
    questions: [
      'الحسابات منين؟',
      'كشف حساب منين؟',
      'الحسابات اليومية فين؟',
      'الحسابات العامة منين؟'
    ],
    answer: 'في قوائم [الحسابات اليومية] و[الحسابات العامة] كل حاجة متعلقة بالحسابات.'
  },
  {
    id: 'kb_009',
    category: 'reports',
    questions: [
      'تقرير المبيعات منين؟',
      'تقارير المبيعات فين؟',
      'تقرير مبيعات عن فترة',
      'كشف المبيعات'
    ],
    answer: 'من قائمة [المبيعات] واختار "تقرير فواتير المبيعات عن فترة" أو أي تقرير تاني من القائمة.'
  },
  {
    id: 'kb_010',
    category: 'troubleshooting',
    questions: [
      'الباركود مش بيطبع',
      'الطابعة مش شغالة',
      'مشكلة في الباركود',
      'الباركود بايظ',
      'إيرور في الباركود'
    ],
    answer: 'لازم المقاس يكون 38x25 ملم من Printer Preferences. لو لسه مش شغال، ممكن تتواصل معانا على 01272000075.'
  },
  {
    id: 'kb_011',
    category: 'troubleshooting',
    questions: [
      'إيرور التاريخ',
      'مراجعة تاريخ الجهاز',
      'خطأ في التاريخ',
      'التاريخ غلط'
    ],
    answer: 'لو الجهاز مطلع إيرور "مراجعة تاريخ الجهاز"، قدّم التاريخ يوم وافتح البرنامج وبعدين رجعه تانى وأنت فاتح البرنامج.'
  },
  {
    id: 'kb_012',
    category: 'troubleshooting',
    questions: [
      'الشبكة مش شغالة',
      'مش قادر يتصل بالفرع',
      'مشكلة في الشبكة',
      'الاتصال بالفرع مش شغال'
    ],
    answer: 'بورت الربط بين السيرفر والفرعي هو 1433 ولازم نتأكد من الـ Firewall.'
  },
  {
    id: 'kb_013',
    category: 'troubleshooting',
    questions: [
      'تحديث البرنامج',
      'Update System',
      'إزاي أحدث البرنامج؟',
      'تحديث النظام'
    ],
    answer: 'بيتم عن طريق ملف PharmacySystemUpdate.exe الموجود في فولدر التسطيب.'
  },
  {
    id: 'kb_014',
    category: 'sales',
    questions: [
      'الكاشير منين؟',
      'الكاشير فين؟',
      'أين الكاشير؟'
    ],
    answer: 'من قائمة [المبيعات] واختار "الكاشير".'
  },
  {
    id: 'kb_015',
    category: 'sales',
    questions: [
      'تقفيل درج الكاشير',
      'إزاي أقفل درج الكاشير؟',
      'تقفيل الكاشير'
    ],
    answer: 'من قائمة [المبيعات] واختار "تقفيل درج الكاشير".'
  }
];

// تحويل KB_FULL إلى KBItem للتوافق مع الكود القديم
const INITIAL_KB: KBItem[] = KB_FULL.flatMap(kbItem => 
  kbItem.questions.map((question, index) => ({
    id: `${kbItem.id}_q${index}`,
    question,
    answer: kbItem.answer,
    tags: [kbItem.category]
  }))
);

const INITIAL_LANDING_CONFIG: LandingConfig = {
    heroTitle: "نبتكر الحلول، \nلتبسيط أعمالك.",
    heroSubtitle: "Modern Soft تقدم أقوى الأنظمة المحاسبية والإدارية. اكتشف نظام e-stock لإدارة الصيدليات بمفهوم جديد من الذكاء والسرعة.",
    heroButtonText: "تحدث مع المساعد الذكي",
    featuresTitle: "لماذا تختار e-stock؟",
    featuresSubtitle: "منظومة متكاملة تغطي كافة احتياجاتك الإدارية",
    features: [
        { title: 'إدارة مخزون ذكية', desc: 'تنبيهات تلقائية للنواقص وتواريخ الصلاحية لضمان عدم الخسارة.', icon: '📦' },
        { title: 'تقارير تفصيلية', desc: 'أكثر من 50 تقرير للمبيعات والأرباح وحركة الأصناف لاتخاذ قرارات دقيقة.', icon: '📊' },
        { title: 'دعم فني فوري', desc: 'مساعد ذكي يعمل بالذكاء الاصطناعي متاح 24 ساعة لحل مشاكلك.', icon: '🤖' }
    ],
    aboutCompanyText: "نقدم حلولاً برمجية مبتكرة لمستقبل أعمالك. شريكك التقني للنجاح.",
    contactEmail: "support@modernsoft.com",
    contactPhone: "01272000075",
    footerText: "© 2025 جميع الحقوق محفوظة لشركة Modern Soft.",
    productsTitle: "حلول برمجية متكاملة",
    productsSubtitle: "نقدم مجموعة من الأنظمة المصممة خصيصاً لتناسب حجم وطبيعة عملك.",
    whatsappNumber: "201223438201", 
    products: [
        { id: '1', name: 'e-stock Pharma', description: 'نظام إدارة الصيدليات المتكامل. يدعم الفاتورة الإلكترونية، إدارة المخزون، والربط بين الفروع.', image: 'https://placehold.co/400x300/e6f2ff/0066cc?text=e-stock+Pharma', price: '4000 ج.م' },
        { id: '2', name: 'e-stock Retail', description: 'نظام الكاشير ونقاط البيع للانشطة التجارية. سهولة في الاستخدام ودقة في الحسابات.', image: 'https://placehold.co/400x300/fff0e6/cc6600?text=e-stock+Retail', price: '4500 ج.م' }
    ],
    aboutPageTitle: "من نحن",
    aboutPageContent: "تأسست Modern Soft برؤية واضحة وهي تمكين الشركات والمؤسسات من خلال حلول برمجية ذكية ومبتكرة.",
    aboutPageImage: "https://placehold.co/800x600/f3f4f6/9ca3af?text=Modern+Soft+Team",
    contactPageTitle: "تواصل معنا",
    contactAddress: "برج لؤلؤة الهندسة, بجوار كلية الهندسة_شبين الكوم_المنوفية",
    contactMapUrl: "https://maps.google.com/maps?q=30.558778,31.015796&z=15&output=embed"
};

const KEYS = {
  KB: 'masri_agent_kb',
  KB_FULL: 'masri_agent_kb_full', // Knowledge Base الجديدة
  LOGS: 'masri_agent_logs',
  FEEDBACK: 'masri_agent_feedback',
  ADMIN_PASS: 'masri_agent_admin_pass',
  LICENSE: 'masri_agent_license',
  DOCS: 'masri_agent_docs', 
  LANDING: 'masri_agent_landing_config',
  SNIPPETS: 'masri_agent_snippets',
  CANDIDATE_QUESTIONS: 'masri_agent_candidate_questions' // للأسئلة المقترحة من Logs
};

const SCREEN_IMAGES: Record<string, string> = {
  sales: 'https://placehold.co/600x400/png?text=Sales+POS',
  purchases: 'https://placehold.co/600x400/png?text=Purchases',
  inventory: 'https://placehold.co/600x400/png?text=Inventory'
};

export const db = {
  getKB: async (): Promise<KBItem[]> => {
    const data = localStorage.getItem(KEYS.KB);
    return data ? JSON.parse(data) : INITIAL_KB;
  },
  saveKB: async (items: KBItem[]) => {
    localStorage.setItem(KEYS.KB, JSON.stringify(items));
  },
  // Knowledge Base الجديدة مع questions array
  getKBFull: async (): Promise<KBItemFull[]> => {
    const data = localStorage.getItem(KEYS.KB_FULL);
    return data ? JSON.parse(data) : KB_FULL;
  },
  saveKBFull: async (items: KBItemFull[]) => {
    localStorage.setItem(KEYS.KB_FULL, JSON.stringify(items));
    // تحديث KB القديم للتوافق
    const kbItems: KBItem[] = items.flatMap(kbItem => 
      kbItem.questions.map((question, index) => ({
        id: `${kbItem.id}_q${index}`,
        question,
        answer: kbItem.answer,
        tags: [kbItem.category]
      }))
    );
    localStorage.setItem(KEYS.KB, JSON.stringify(kbItems));
  },
  searchKB: async (query: string): Promise<string | null> => {
    const items = await db.getKB();
    const q = query.toLowerCase();
    const match = items.find(item => item.question.includes(q));
    return match ? match.answer : null;
  },
  // البحث في KB_FULL
  searchKBFull: async (query: string): Promise<KBItemFull | null> => {
    const items = await db.getKBFull();
    // البحث سيتم في local-ai.ts مع normalize
    return null; // سيتم استخدامه في local-ai
  },
  // حفظ الأسئلة المرشحة من Logs
  getCandidateQuestions: async (): Promise<Array<{ question: string; count: number; category?: string }>> => {
    const data = localStorage.getItem(KEYS.CANDIDATE_QUESTIONS);
    return data ? JSON.parse(data) : [];
  },
  saveCandidateQuestion: async (question: string, category?: string) => {
    const candidates = await db.getCandidateQuestions();
    const existing = candidates.find(c => c.question === question);
    if (existing) {
      existing.count++;
    } else {
      candidates.push({ question, count: 1, category });
    }
    localStorage.setItem(KEYS.CANDIDATE_QUESTIONS, JSON.stringify(candidates));
  },
  getCoreDocs: (): string => {
      return CORE_DOCS;
  },
  getDocs: async (): Promise<string> => {
    let fullDocs = CORE_DOCS;
    if (dbInstance) {
        try {
            // @ts-ignore - Firebase functions disabled
            const docRef = doc(dbInstance, "settings", "manual");
            // @ts-ignore - Firebase functions disabled
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().content) {
                 fullDocs += "\n\n" + docSnap.data().content;
            } else {
                 const localDocs = localStorage.getItem(KEYS.DOCS);
                 if (localDocs) fullDocs += "\n\n" + localDocs;
            }
        } catch (e) {
             const localDocs = localStorage.getItem(KEYS.DOCS);
             if (localDocs) fullDocs += "\n\n" + localDocs;
        }
    } else {
         const localDocs = localStorage.getItem(KEYS.DOCS);
         if (localDocs) fullDocs += "\n\n" + localDocs;
    }
    return fullDocs;
  },
  saveDocs: async (text: string) => {
    if (dbInstance) {
        try {
            // @ts-ignore - Firebase functions disabled
            await setDoc(doc(dbInstance, "settings", "manual"), { content: text, timestamp: Date.now() });
        } catch (e) {
            console.error("Firestore saveDocs error", e);
        }
    }
    localStorage.setItem(KEYS.DOCS, text);
  },
  getDocLength: async (): Promise<number> => {
      const docs = await db.getDocs();
      return docs.length;
  },
  resetDocs: async (): Promise<number> => {
    if (dbInstance) {
        try {
            // @ts-ignore - Firebase functions disabled
            await setDoc(doc(dbInstance, "settings", "manual"), { content: "" });
        } catch (e) { console.error(e); }
    }
    localStorage.removeItem(KEYS.DOCS);
    return CORE_DOCS.length;
  },
  getSnippets: async (): Promise<KnowledgeSnippet[]> => {
      if (dbInstance) {
          try {
              // @ts-ignore - Firebase functions disabled
              const q = query(collection(dbInstance, "snippets"), orderBy("timestamp", "desc"));
              // @ts-ignore - Firebase functions disabled
              const querySnapshot = await getFsDocs(q);
              return querySnapshot.docs.map((d: any) => d.data() as KnowledgeSnippet);
          } catch (e) {
              console.error("Firestore getSnippets error", e);
          }
      }
      const data = localStorage.getItem(KEYS.SNIPPETS);
      return data ? JSON.parse(data) : [];
  },
  addSnippet: async (snippet: KnowledgeSnippet) => {
      if (dbInstance) {
          try {
              // @ts-ignore - Firebase functions disabled
              await setDoc(doc(dbInstance, "snippets", snippet.id), snippet);
          } catch (e) {
              console.error("Firestore addSnippet error", e);
          }
      }
      const data = localStorage.getItem(KEYS.SNIPPETS);
      const localSnippets = data ? JSON.parse(data) : [];
      localSnippets.unshift(snippet);
      localStorage.setItem(KEYS.SNIPPETS, JSON.stringify(localSnippets));
  },
  deleteSnippet: async (id: string) => {
      if (dbInstance) {
          try {
              // @ts-ignore - Firebase functions disabled
              await deleteDoc(doc(dbInstance, "snippets", id));
          } catch (e) { console.error(e); }
      }
      const data = localStorage.getItem(KEYS.SNIPPETS);
      if (data) {
          const snippets = JSON.parse(data) as KnowledgeSnippet[];
          const filtered = snippets.filter(s => s.id !== id);
          localStorage.setItem(KEYS.SNIPPETS, JSON.stringify(filtered));
      }
  },
  getLogs: async (): Promise<ChatLog[]> => {
    if (dbInstance) {
        try {
            // @ts-ignore - Firebase functions disabled
            const q = query(collection(dbInstance, "logs"), orderBy("timestamp", "desc"), limit(100));
            // @ts-ignore - Firebase functions disabled
            const querySnapshot = await getFsDocs(q);
            return querySnapshot.docs.map((d: any) => d.data() as ChatLog);
        } catch (e) {
            console.error("Firestore getLogs error, falling back to local", e);
        }
    }
    const data = localStorage.getItem(KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  },
  addLog: async (log: ChatLog) => {
    if (dbInstance) {
        try {
            // @ts-ignore - Firebase functions disabled
            await setDoc(doc(dbInstance, "logs", log.id), log);
        } catch (e) {
            console.error("Firestore addLog error", e);
        }
    }
    const localData = localStorage.getItem(KEYS.LOGS);
    const localLogs = localData ? JSON.parse(localData) : [];
    localLogs.unshift(log);
    localStorage.setItem(KEYS.LOGS, JSON.stringify(localLogs));
  },
  getFeedback: async (): Promise<Feedback[]> => {
    if (dbInstance) {
        try {
            // @ts-ignore - Firebase functions disabled
            const q = query(collection(dbInstance, "feedback"), orderBy("timestamp", "desc"), limit(100));
            // @ts-ignore - Firebase functions disabled
            const querySnapshot = await getFsDocs(q);
            return querySnapshot.docs.map((d: any) => d.data() as Feedback);
        } catch (e) {
            console.error("Firestore getFeedback error", e);
        }
    }
    const data = localStorage.getItem(KEYS.FEEDBACK);
    return data ? JSON.parse(data) : [];
  },
  addFeedback: async (feedback: Feedback) => {
    if (dbInstance) {
        try {
            // @ts-ignore - Firebase functions disabled
            await addDoc(collection(dbInstance, "feedback"), feedback);
        } catch (e) {
            console.error("Firestore addFeedback error", e);
        }
    }
    const data = localStorage.getItem(KEYS.FEEDBACK);
    const items = data ? JSON.parse(data) : [];
    items.unshift(feedback);
    localStorage.setItem(KEYS.FEEDBACK, JSON.stringify(items));
  },
  getAdminPassword: async (): Promise<string> => {
    if (dbInstance) {
        try {
            // @ts-ignore - Firebase functions disabled
            const docRef = doc(dbInstance, "settings", "admin");
            // @ts-ignore - Firebase functions disabled
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data().password || 'admin123';
            }
        } catch (e) { /* ignore */ }
    }
    return localStorage.getItem(KEYS.ADMIN_PASS) || 'admin123';
  },
  saveAdminPassword: async (pass: string) => {
    if (dbInstance) {
        try {
            // @ts-ignore - Firebase functions disabled
            await setDoc(doc(dbInstance, "settings", "admin"), { password: pass });
        } catch (e) { /* ignore */ }
    }
    localStorage.setItem(KEYS.ADMIN_PASS, pass);
  },
  getLicense: (): string | null => {
      return localStorage.getItem(KEYS.LICENSE);
  },
  activateLicense: (key: string): boolean => {
      if (key.trim().toUpperCase().startsWith('ESTOCK-')) {
          localStorage.setItem(KEYS.LICENSE, key.trim());
          return true;
      }
      return false;
  },
  getScreenImage: (screenName: string): string | null => {
    return SCREEN_IMAGES[screenName?.toLowerCase()] || null;
  },
  getLandingConfig: async (): Promise<LandingConfig> => {
    let finalConfig = { ...INITIAL_LANDING_CONFIG };
    if (dbInstance) {
        try {
            // @ts-ignore - Firebase functions disabled
            const docRef = doc(dbInstance, "settings", "landing");
            // @ts-ignore - Firebase functions disabled
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const remoteData = docSnap.data() as Partial<LandingConfig>;
                finalConfig = { ...finalConfig, ...remoteData };
            }
        } catch (e) {
            console.error("Firestore getLandingConfig error", e);
        }
    } else {
        const data = localStorage.getItem(KEYS.LANDING);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                finalConfig = { ...finalConfig, ...parsed };
            } catch (e) { /* ignore */ }
        }
    }
    return finalConfig;
  },
  saveLandingConfig: async (config: LandingConfig) => {
      if (dbInstance) {
          try {
              // @ts-ignore - Firebase functions disabled
              await setDoc(doc(dbInstance, "settings", "landing"), config);
          } catch (e: any) {
              console.error("Firestore saveLandingConfig error", e);
              throw e; 
          }
      }
      localStorage.setItem(KEYS.LANDING, JSON.stringify(config));
  }
};
