// نظام AI محلي - Human-like Support Agent
import { db } from './db';
import { KnowledgeSnippet, KBItemFull, ChatLog } from '@/types';

interface SearchResult {
  score: number;
  content: string;
  source: 'docs' | 'kb' | 'snippets';
  path?: string; // المسار الرسمي من الدليل
}

interface Intent {
  name: string;
  triggers: string[]; // لهجات مختلفة
  category: string;
}

interface DetectedIntent {
  intent: Intent;
  confidence: number;
  matchedTriggers: string[];
}

export class LocalAI {
  private docs: string = '';
  private kb: any[] = [];
  private kbFull: KBItemFull[] = []; // Knowledge Base الجديدة
  private snippets: KnowledgeSnippet[] = [];
  private landingConfig: any = null;

  // System Personality - موظف دعم فني بشري
  private readonly PERSONALITY = {
    name: 'أحمد',
    role: 'موظف دعم فني',
    company: 'Modern Soft',
    tone: 'مصري مهني وودود',
    traits: ['صبور', 'متعاون', 'محترف', 'ودود', 'دقيق']
  };

  // Intent Engine - Intents مع Triggers بلهجات مختلفة
  private readonly INTENTS: Intent[] = [
    {
      name: 'sales_invoice',
      triggers: ['فاتورة مبيعات', 'فاتورة بيع', 'فاتورة عميل', 'فاتورة', 'بيع', 'مبيعات', 'فاتورة المبيعات', 'فاتورة البيع', 'فاتورة العميل', 'فاتورة جديدة', 'عمل فاتورة', 'إضافة فاتورة', 'فاتورة جديدة', 'فاتورة مبيعات جديدة'],
      category: 'sales'
    },
    {
      name: 'sales_return',
      triggers: ['مرتجع مبيعات', 'مرتجع بيع', 'مرتجع', 'إرجاع', 'إرجاع فاتورة', 'مرتجع فاتورة', 'إرجاع مبيعات'],
      category: 'sales'
    },
    {
      name: 'inventory',
      triggers: ['مخزن', 'مخازن', 'جرد', 'مخزون', 'أصناف', 'كميات', 'جرد مخزن', 'جرد المخزن', 'مخازن', 'المخازن', 'جرد أصناف', 'كمية أصناف'],
      category: 'inventory'
    },
    {
      name: 'purchases',
      triggers: ['شراء', 'مشتريات', 'فاتورة شراء', 'فاتورة مشتريات', 'شراء أصناف', 'مشتريات جديدة', 'فاتورة شراء جديدة'],
      category: 'purchases'
    },
    {
      name: 'suppliers',
      triggers: ['مورد', 'موردين', 'مورد جديد', 'إضافة مورد', 'قائمة الموردين', 'الموردين', 'مورد', 'موردين'],
      category: 'suppliers'
    },
    {
      name: 'customers',
      triggers: ['عميل', 'عملاء', 'عميل جديد', 'إضافة عميل', 'قائمة العملاء', 'العملاء', 'عميل', 'عملاء'],
      category: 'customers'
    },
    {
      name: 'accounts',
      triggers: ['حساب', 'حسابات', 'كشف حساب', 'رصيد', 'مديونية', 'الحسابات', 'حساب', 'حسابات'],
      category: 'accounts'
    },
    {
      name: 'reports',
      triggers: ['تقرير', 'تقارير', 'كشف', 'ملخص', 'إحصائيات', 'تقرير مبيعات', 'تقرير مخزون', 'تقرير مشتريات'],
      category: 'reports'
    },
    {
      name: 'where',
      triggers: ['أين', 'منين', 'فين', 'مكان', 'موقع', 'ألاقي', 'أجيب', 'أين أجد', 'منين ألاقي', 'فين ألاقي', 'أين موجود', 'مكانه فين'],
      category: 'navigation'
    },
    {
      name: 'how',
      triggers: ['كيف', 'ازاي', 'إزاي', 'طريقة', 'خطوات', 'كيفية', 'ازاي أعمل', 'كيف أعمل', 'طريقة عمل', 'خطوات عمل'],
      category: 'howto'
    },
    {
      name: 'problem',
      triggers: ['مشكلة', 'مشاكل', 'خطأ', 'إيرور', 'غلط', 'عطل', 'مش شغال', 'مش بيشتغل', 'مشكلة في', 'خطأ في', 'إيرور في'],
      category: 'troubleshooting'
    },
    {
      name: 'contact',
      triggers: ['رقم', 'تليفون', 'اتصال', 'هاتف', 'عنوان', 'إيميل', 'بريد', 'email', 'تواصل', 'اتصل', 'اتصالات'],
      category: 'contact'
    }
  ];

  // Normalize Arabic - تحويل لهجات مختلفة لنفس الكلمة + إزالة علامات الترقيم
  private normalizeArabic(text: string): string {
    let normalized = text.toLowerCase().trim();
    
    // إزالة علامات الترقيم أولاً
    normalized = normalized.replace(/[.,!?;:،؛؟]/g, ' ');
    
    // تحويل لهجات مختلفة
    const replacements: Record<string, string> = {
      // أين/منين/فين
      'منين': 'أين',
      'فين': 'أين',
      'ألاقي': 'أين',
      'أجيب': 'أين',
      
      // كيف/ازاي
      'ازاي': 'كيف',
      'إزاي': 'كيف',
      
      // فاتورة
      'فاتورة المبيعات': 'فاتورة مبيعات',
      'فاتورة البيع': 'فاتورة مبيعات',
      'فاتورة العميل': 'فاتورة مبيعات',
      
      // مخزن/مخازن
      'مخازن': 'مخزن',
      'المخازن': 'مخزن',
      
      // مورد/موردين
      'موردين': 'مورد',
      'الموردين': 'مورد',
      
      // عميل/عملاء
      'عملاء': 'عميل',
      'العملاء': 'عميل',
      
      // حساب/حسابات
      'حسابات': 'حساب',
      'الحسابات': 'حساب',
      
      // تقرير/تقارير
      'تقارير': 'تقرير',
      
      // إزالة التشكيل
      'أ': 'ا',
      'إ': 'ا',
      'آ': 'ا',
      'ى': 'ي',
      'ة': 'ه',
      'ؤ': 'و',
      'ئ': 'ي'
    };

    for (const [from, to] of Object.entries(replacements)) {
      normalized = normalized.replace(new RegExp(from, 'g'), to);
    }

    // إزالة علامات التشكيل
    normalized = normalized.replace(/[\u064B-\u065F\u0670]/g, '');
    
    // تنظيف المسافات المتعددة
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    return normalized;
  }

  // Tokenize - استخراج الكلمات المفتاحية من النص
  private extractKeywords(text: string): string[] {
    const normalized = this.normalizeArabic(text);
    const words = normalized.split(/\s+/).filter(w => w.length > 1);
    
    // إزالة كلمات توقف شائعة
    const stopWords = ['في', 'من', 'على', 'إلى', 'عن', 'مع', 'هو', 'هي', 'أن', 'إن', 'ال', 'اللي', 'الذي', 'التي', 'لي', 'ل', 'ب', 'ك', 'و', 'أو', 'لكن', 'لكن', 'ممكن', 'عشان', 'عشان', 'على', 'على', 'ه', 'دي', 'دا', 'ده', 'دول', 'دول', 'كده', 'كدا'];
    return words.filter(w => !stopWords.includes(w));
  }
  
  // User Emotion Classification
  classifyEmotion(text: string): 'angry' | 'rushed' | 'normal' {
    const normalized = this.normalizeArabic(text);
    const lower = text.toLowerCase();
    
    // Angry indicators
    const angryWords = ['مش شغال', 'بايظ', 'زفت', 'تعبان', 'مش راضي', 'مشكلة', 'غلط', 'خطأ', 'إيرور', 'عطل', 'مش بيشتغل', 'مش شغال', 'مش راضي', 'تعبان', 'زفت', 'بايظ'];
    const hasAngryWords = angryWords.some(word => normalized.includes(word) || lower.includes(word));
    const hasExclamation = text.includes('!') || /[A-Z]{3,}/.test(text);
    
    if (hasAngryWords || hasExclamation) {
      return 'angry';
    }
    
    // Rushed indicators
    const rushedWords = ['بسرعة', 'مستعجل', 'حالا', 'دلوقتي', 'عاجل', 'فورا', 'الآن'];
    const hasRushedWords = rushedWords.some(word => normalized.includes(word));
    const isShort = text.split(/\s+/).length <= 5;
    
    if (hasRushedWords || isShort) {
      return 'rushed';
    }
    
    return 'normal';
  }

  // Intent Detection - اكتشاف النية من السؤال
  private detectIntent(query: string): DetectedIntent | null {
    const normalized = this.normalizeArabic(query);
    const keywords = this.extractKeywords(query);
    
    let bestMatch: DetectedIntent | null = null;
    let bestScore = 0;

    for (const intent of this.INTENTS) {
      let score = 0;
      const matchedTriggers: string[] = [];

      for (const trigger of intent.triggers) {
        const normalizedTrigger = this.normalizeArabic(trigger);
        
        // تطابق كامل
        if (normalized.includes(normalizedTrigger)) {
          score += 10;
          matchedTriggers.push(trigger);
        }
        
        // تطابق جزئي بالكلمات
        const triggerWords = normalizedTrigger.split(/\s+/);
        let matchCount = 0;
        triggerWords.forEach(tw => {
          if (keywords.includes(tw)) {
            matchCount++;
            score += 3;
          }
        });
        
        if (matchCount >= triggerWords.length * 0.6) {
          matchedTriggers.push(trigger);
        }
      }

      if (score > bestScore && score > 5) {
        bestScore = score;
        bestMatch = {
          intent,
          confidence: Math.min(score / 10, 1),
          matchedTriggers: [...new Set(matchedTriggers)]
        };
      }
    }

    return bestMatch;
  }

  async initialize() {
    this.docs = await db.getDocs();
    this.kb = await db.getKB();
    this.kbFull = await db.getKBFull(); // تحميل KB_FULL
    this.snippets = await db.getSnippets();
    this.landingConfig = await db.getLandingConfig();
  }

  // تحسين البحث في التوثيق - Normalize + Fuzzy Matching
  private searchDocs(query: string): SearchResult[] {
    const results: SearchResult[] = [];
    const normalizedQuery = this.normalizeArabic(query);
    const keywords = this.extractKeywords(query);
    const intent = this.detectIntent(query);

    // البحث في أقسام التوثيق
    const sections = this.docs.split(/\n####|\n###/);
    
    sections.forEach((section) => {
      const sectionNormalized = this.normalizeArabic(section);
      let score = 0;
      
      // تطابق بالكلمات المفتاحية
      keywords.forEach(keyword => {
        const matches = (sectionNormalized.match(new RegExp(keyword, 'g')) || []).length;
        score += matches * 3;
      });

      // تطابق بالكلمات الكاملة
      const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
      queryWords.forEach(word => {
        if (sectionNormalized.includes(word)) {
          score += 5;
        }
      });

      // زيادة النقاط للعناوين
      const titleMatch = section.match(/^[^\n]+/);
      if (titleMatch) {
        const titleNormalized = this.normalizeArabic(titleMatch[0]);
        keywords.forEach(keyword => {
          if (titleNormalized.includes(keyword)) score += 15;
        });
        
        // استخراج المسار الرسمي
        const pathMatch = titleMatch[0].match(/قائمة\s*\[([^\]]+)\]/);
        if (pathMatch) {
          score += 10; // زيادة النقاط للعناوين التي تحتوي على مسارات
        }
      }

      // زيادة النقاط بناءً على Intent
      if (intent && sectionNormalized.includes(intent.intent.category)) {
        score += 20;
      }

      // البحث في القوائم (bullet points)
      const listItems = section.match(/^-\s+.+$/gm) || [];
      listItems.forEach(item => {
        const itemNormalized = this.normalizeArabic(item);
        keywords.forEach(keyword => {
          if (itemNormalized.includes(keyword)) score += 8;
        });
      });

      if (score > 0) {
        // استخراج المسار الرسمي
        const pathMatch = section.match(/قائمة\s*\[([^\]]+)\]/);
        const path = pathMatch ? `قائمة [${pathMatch[1]}]` : undefined;

        results.push({
          score,
          content: section.substring(0, 600),
          source: 'docs',
          path
        });
      }
    });

    return results.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  // Smart Matching Engine - البحث في KB_FULL مع questions array
  private searchKB(query: string): SearchResult | null {
    const normalizedQuery = this.normalizeArabic(query);
    const keywords = this.extractKeywords(query);
    const queryTokens = normalizedQuery.split(/\s+/).filter(w => w.length > 1);
    
    let bestMatch: SearchResult | null = null;
    let bestScore = 0;
    
    // البحث في KB_FULL أولاً (النظام الجديد)
    for (const item of this.kbFull) {
      let score = 0;
      
      // البحث في كل question في array
      for (const question of item.questions) {
        const questionNormalized = this.normalizeArabic(question);
        
        // تطابق كامل
        if (normalizedQuery === questionNormalized || questionNormalized.includes(normalizedQuery)) {
          score = 100;
          break;
        }
        
        // تطابق جزئي بالكلمات
        let matchCount = 0;
        queryTokens.forEach(token => {
          if (questionNormalized.includes(token)) {
            matchCount++;
            score += 15;
          }
        });
        
        // تطابق بالكلمات المفتاحية
        keywords.forEach(keyword => {
          if (questionNormalized.includes(keyword)) {
            score += 10;
          }
        });
        
        // إذا تطابق أكثر من 60% من الكلمات
        if (matchCount >= queryTokens.length * 0.6) {
          score += 25;
        }
      }
      
      // تطابق في الإجابة أيضاً
      const answerNormalized = this.normalizeArabic(item.answer);
      keywords.forEach(keyword => {
        if (answerNormalized.includes(keyword)) score += 5;
      });
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          score,
          content: item.answer,
          source: 'kb'
        };
      }
    }
    
    // إذا لم نجد تطابق في KB_FULL، نبحث في KB القديم (للتوافق)
    if (bestScore < 30) {
      for (const item of this.kb) {
        const questionNormalized = this.normalizeArabic(item.question);
        const answerNormalized = this.normalizeArabic(item.answer);
        let score = 0;
        
        if (questionNormalized.includes(normalizedQuery) || answerNormalized.includes(normalizedQuery)) {
          score = 100;
        } else {
          keywords.forEach(keyword => {
            if (questionNormalized.includes(keyword)) score += 20;
            if (answerNormalized.includes(keyword)) score += 10;
          });
          
          const queryWords = normalizedQuery.split(/\s+/);
          let matchCount = 0;
          queryWords.forEach(word => {
            if (questionNormalized.includes(word)) matchCount++;
          });
          
          if (matchCount >= queryWords.length * 0.6) {
            score += 30;
          }
        }
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = {
            score,
            content: item.answer,
            source: 'kb'
          };
        }
      }
    }
    
    return bestScore > 30 ? bestMatch : null;
  }

  // البحث في Snippets
  private searchSnippets(query: string): SearchResult[] {
    const results: SearchResult[] = [];
    const normalizedQuery = this.normalizeArabic(query);
    const keywords = this.extractKeywords(query);

    this.snippets.forEach(snippet => {
      const contentNormalized = this.normalizeArabic(snippet.content);
      let score = 0;

      keywords.forEach(keyword => {
        const matches = (contentNormalized.match(new RegExp(keyword, 'g')) || []).length;
        score += matches * 4; // Snippets لها أولوية أعلى
      });

      if (score > 0) {
        results.push({
          score,
          content: snippet.content.substring(0, 500),
          source: 'snippets'
        });
      }
    });

    return results.sort((a, b) => b.score - a.score).slice(0, 2);
  }

  // Human Response Wrapper - Prefix & Suffix مع Emotion-Aware
  private wrapHumanResponse(content: string, intent?: DetectedIntent | null, emotion?: 'angry' | 'rushed' | 'normal'): string {
    // منع أي رد فيه "مش عارف" أو "غير متوفر" أو "لا يمكن"
    const forbiddenPhrases = ['مش عارف', 'غير متوفر', 'لا يمكن', 'مش متوفر', 'مش موجود', 'مش متاح'];
    for (const phrase of forbiddenPhrases) {
      if (content.includes(phrase)) {
        // استبدال برد إيجابي
        content = content.replace(new RegExp(phrase, 'gi'), 'دعني أساعدك');
      }
    }
    
    // Emotion-Aware Prefix
    let prefix = '';
    
    if (emotion === 'angry') {
      // ردود تعاطفية للمستخدم الغاضب
      const angryPrefixes = [
        'معلش عن الإزعاج! ',
        'فهمتك تماماً! ',
        'مش مشكلة، هحل المشكلة دي معاك! ',
        'متفهم الموقف! '
      ];
      prefix = angryPrefixes[Math.floor(Math.random() * angryPrefixes.length)];
    } else if (emotion === 'rushed') {
      // رد مختصر للمستخدم المستعجل
      const rushedPrefixes = ['ماشي! ', 'طبعاً! ', 'أكيد! '];
      prefix = rushedPrefixes[Math.floor(Math.random() * rushedPrefixes.length)];
    } else if (intent) {
      const prefixMap: Record<string, string[]> = {
        'where': ['بالطبع! ', 'طبعاً! ', 'أكيد! ', 'ماشي! '],
        'how': ['طبعاً! ', 'بالطبع! ', 'سهلة خالص! ', 'ماشي! '],
        'problem': ['معلش عن الإزعاج! ', 'مش مشكلة! ', 'هحل المشكلة دي معاك! ', 'ماشي! '],
        'sales_invoice': ['طبعاً! ', 'أكيد! ', 'ماشي! ', 'بالطبع! '],
        'inventory': ['طبعاً! ', 'بالطبع! ', 'أكيد! ', 'ماشي! '],
        'default': ['طبعاً! ', 'بالطبع! ', 'أكيد! ', 'ماشي! ']
      };
      
      const prefixes = prefixMap[intent.intent.name] || prefixMap['default'];
      prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    } else {
      const defaultPrefixes = ['طبعاً! ', 'بالطبع! ', 'أكيد! ', 'ماشي! '];
      prefix = defaultPrefixes[Math.floor(Math.random() * defaultPrefixes.length)];
    }

    // Emotion-Aware Suffix
    let suffix = '';
    
    if (emotion === 'angry') {
      const angrySuffixes = [
        '\n\nلو محتاج أي حاجة تانية، أنا معاك!',
        '\n\nلو في أي مشكلة تانية، قولي وأنا تحت أمرك!'
      ];
      suffix = angrySuffixes[Math.floor(Math.random() * angrySuffixes.length)];
    } else if (emotion === 'rushed') {
      // لا نضيف suffix للمستخدم المستعجل - رد مختصر
      suffix = '';
    } else {
      const normalSuffixes = [
        '\n\nلو محتاج أي حاجة تانية، قولي وأنا تحت أمرك!',
        '\n\nلو في أي سؤال تاني، أنا جاهز!',
        '\n\nلو محتاج مساعدة أكتر، أنا معاك!',
        '\n\nلو في أي حاجة تانية، قولي!'
      ];
      suffix = normalSuffixes[Math.floor(Math.random() * normalSuffixes.length)];
    }

    // منع تكرار Prefix/Suffix إذا كان موجود في المحتوى
    if (!content.includes('طبعاً') && !content.includes('بالطبع') && !content.includes('أكيد') && !content.includes('معلش')) {
      content = prefix + content;
    }
    
    if (suffix && !content.includes('قولي') && !content.includes('معاك') && !content.includes('جاهز')) {
      content = content + suffix;
    }

    return content;
  }
  
  // Auto-Expand من Logs - اقتراح أسئلة جديدة
  async autoExpandFromLogs(): Promise<void> {
    try {
      const logs = await db.getLogs();
      const recentLogs = logs.slice(0, 50); // آخر 50 log
      
      // تجميع الأسئلة غير المطابقة
      const unmatchedQuestions: Record<string, number> = {};
      
      for (const log of recentLogs) {
        if (log.unmatchedQuestion) {
          const question = log.unmatchedQuestion.trim();
          if (question.length > 5) {
            unmatchedQuestions[question] = (unmatchedQuestions[question] || 0) + 1;
          }
        }
      }
      
      // البحث عن الأسئلة المتكررة أكثر من 3 مرات
      for (const [question, count] of Object.entries(unmatchedQuestions)) {
        if (count >= 3) {
          // حفظ كـ candidate question للـ Admin Review
          const intent = this.detectIntent(question);
          const category = intent?.intent.category || 'general';
          await db.saveCandidateQuestion(question, category);
        }
      }
    } catch (e) {
      console.error('Error in autoExpandFromLogs:', e);
    }
  }

  // استخراج المسار الرسمي من المحتوى
  private extractOfficialPath(content: string): string | null {
    const pathMatch = content.match(/قائمة\s*\[([^\]]+)\]/);
    if (pathMatch) {
      return `قائمة [${pathMatch[1]}]`;
    }
    return null;
  }

  // Smart Fallback - اقتراح مسار أو سؤال توضيحي (مع Emotion-Aware)
  private smartFallback(query: string, docResults: SearchResult[], emotion?: 'angry' | 'rushed' | 'normal'): string {
    const intent = this.detectIntent(query);
    const normalizedQuery = this.normalizeArabic(query);
    
    // إذا كان هناك نتائج ولو ضعيفة، اقترح أقرب مسار
    if (docResults.length > 0) {
      const bestResult = docResults[0];
      const path = bestResult.path || this.extractOfficialPath(bestResult.content);
      
      if (path) {
        // للمستخدم المستعجل - رد مختصر جداً
        if (emotion === 'rushed') {
          return this.wrapHumanResponse(
            `${path}\n\n${bestResult.content.split('\n').slice(0, 2).join('\n')}`,
            intent,
            emotion
          );
        }
        
        // للمستخدم الغاضب - رد تعاطفي
        if (emotion === 'angry') {
          return this.wrapHumanResponse(
            `متفهم الموقف! أقرب حاجة لسؤالك هي:\n\n${path}\n\n${bestResult.content.substring(0, 200)}\n\nلو تقدر توضح أكتر، هقدر أساعدك بشكل أدق.`,
            intent,
            emotion
          );
        }
        
        return this.wrapHumanResponse(
          `دلوقتي مش متأكد 100% من السؤال بالظبط، بس أقرب حاجة ليه هي:\n\n${path}\n\n${bestResult.content.substring(0, 200)}\n\nلو تقدر توضح سؤالك أكتر (مثلاً: "عايز أعمل إيه بالظبط؟" أو "عايز أعرف إيه؟")، هقدر أساعدك بشكل أدق.`,
          intent,
          emotion
        );
      }
    }

    // بناءً على Intent، اسأل سؤال توضيحي ذكي
    if (intent) {
      const clarificationQuestions: Record<string, string[]> = {
        'sales_invoice': [
          'عايز تعمل فاتورة مبيعات جديدة؟',
          'عايز تعرف منين تفتح فاتورة المبيعات؟',
          'عايز تعرف إزاي تعمل فاتورة مبيعات؟'
        ],
        'inventory': [
          'عايز تعمل جرد للمخزن؟',
          'عايز تعرف منين تفتح شاشة المخازن؟',
          'عايز تعرف إزاي تعمل جرد؟'
        ],
        'where': [
          'عايز تعرف مكان إيه بالظبط؟',
          'عايز تفتح إيه في البرنامج؟',
          'عايز تعرف منين تفتح إيه؟'
        ],
        'how': [
          'عايز تعرف إزاي تعمل إيه بالظبط؟',
          'عايز خطوات عمل إيه؟',
          'عايز طريقة عمل إيه؟'
        ]
      };

      const questions = clarificationQuestions[intent.intent.name] || ['عايز تعرف إيه بالظبط؟'];
      const question = questions[Math.floor(Math.random() * questions.length)];

      // للمستخدم المستعجل - سؤال مختصر
      if (emotion === 'rushed') {
        return this.wrapHumanResponse(
          `ممكن توضح أكتر؟\n- ${question}\n\nأو اتصل بنا: ${this.landingConfig?.contactPhone || '01272000075'}`,
          intent,
          emotion
        );
      }

      return this.wrapHumanResponse(
        `معلش، مش متأكد من السؤال بالظبط.\n\nممكن توضح أكتر؟ مثلاً:\n- ${question}\n- أو وصف المشكلة اللي حضرتك بتواجهها\n\nأو ممكن تتواصل معانا مباشرة على:\n📞 ${this.landingConfig?.contactPhone || '01272000075'}\n📧 ${this.landingConfig?.contactEmail || 'support@modernsoft.com'}\n\nاحنا معاك!`,
        intent,
        emotion
      );
    }

    // Fallback عام
    if (emotion === 'rushed') {
      return this.wrapHumanResponse(
        `ممكن توضح أكتر؟\n\nاتصل بنا: ${this.landingConfig?.contactPhone || '01272000075'}`,
        undefined,
        emotion
      );
    }

    return this.wrapHumanResponse(
      `معلش، مش فاهم السؤال بالظبط.\n\nممكن توضح أكتر؟ مثلاً:\n- عايز تعمل إيه بالظبط؟\n- أو وصف المشكلة اللي حضرتك بتواجهها\n\nأو ممكن تتواصل معانا مباشرة على:\n📞 ${this.landingConfig?.contactPhone || '01272000075'}\n📧 ${this.landingConfig?.contactEmail || 'support@modernsoft.com'}\n\nاحنا معاك!`,
      undefined,
      emotion
    );
  }

  // توليد رد ذكي بناءً على البحث مع Emotion-Aware
  async generateResponse(userMessage: string, conversationHistory: any[] = []): Promise<string> {
    await this.initialize();

    const messageLower = userMessage.toLowerCase().trim();
    const isFirstMessage = conversationHistory.filter(m => m.role === 'user').length === 0;

    // User Emotion Classification
    const emotion = this.classifyEmotion(userMessage);

    // التحقق من التحيات - ردود أكثر ودية
    const greetings = ['أهلا', 'مرحبا', 'السلام', 'صباح', 'مساء', 'هلا', 'أهلاً', 'مرحب', 'السلام عليكم', 'صباح الخير', 'مساء الخير'];
    if (greetings.some(g => messageLower.includes(g)) && conversationHistory.length <= 2) {
      const greetingVariations = [
        `أهلاً وسهلاً بحضرتك! 🧡\nمعاك ${this.PERSONALITY.name} من فريق الدعم الفني في ${this.PERSONALITY.company}.\n\nأنا هنا عشان أساعدك في أي وقت مع نظام E-stock.\n\nعشان أقدر أخدمك بأفضل شكل، ممكن أتشرف ببيانات حضرتك؟\n(الاسم، اسم الصيدلية، رقم التليفون، والعنوان)\n\nوبعدها أمرني، أنا تحت أمرك.`,
        `أهلاً بحضرتك! 🧡\nمعاك ${this.PERSONALITY.name} من فريق الدعم الفني.\n\nممكن أتشرف ببيانات حضرتك عشان أقدر أساعدك بشكل أفضل؟\n(الاسم، اسم الصيدلية، رقم التليفون، والعنوان)\n\nوبعدها قولي إيه اللي محتاجه وأنا معاك.`,
        `أهلاً وسهلاً! 🧡\nمعاك ${this.PERSONALITY.name} من ${this.PERSONALITY.company}.\n\nممكن بيانات حضرتك عشان أخدمك أحسن؟\n(الاسم، اسم الصيدلية، رقم التليفون، والعنوان)\n\nوبعدها قولي إيه اللي محتاجه وأنا جاهز.`
      ];
      return greetingVariations[Math.floor(Math.random() * greetingVariations.length)];
    }

    // Intent Detection
    const intent = this.detectIntent(userMessage);

    // البحث في Snippets أولاً (أعلى أولوية)
    const snippetResults = this.searchSnippets(userMessage);
    if (snippetResults.length > 0 && snippetResults[0].score > 10) {
      return this.wrapHumanResponse(snippetResults[0].content, intent, emotion);
    }

    // البحث في Knowledge Base (KB_FULL)
    const kbResult = this.searchKB(userMessage);
    if (kbResult && kbResult.score > 30) {
      // إذا كان rushed، نختصر الرد
      if (emotion === 'rushed') {
        const shortAnswer = kbResult.content.split('\n')[0]; // أول سطر فقط
        return this.wrapHumanResponse(shortAnswer, intent, emotion);
      }
      return this.wrapHumanResponse(kbResult.content, intent, emotion);
    }

    // البحث في التوثيق
    const docResults = this.searchDocs(userMessage);
    if (docResults.length > 0 && docResults[0].score > 5) {
      return this.formatResponse(docResults[0], docResults, intent, userMessage, emotion);
    }

    // البحث عن معلومات الشركة
    if (intent && intent.intent.name === 'contact') {
      const phoneVariations = [
        `طبعاً يا فندم! 📞\n\nرقمنا: ${this.landingConfig?.contactPhone || '01272000075'}\nالإيميل: ${this.landingConfig?.contactEmail || 'support@modernsoft.com'}\nالعنوان: ${this.landingConfig?.contactAddress || 'برج لؤلؤة الهندسة, بجوار كلية الهندسة_شبين الكوم_المنوفية'}\n\nاتصل بنا في أي وقت، احنا معاك!`,
        `بالطبع! 📞\n\nممكن تتواصل معانا على:\n📞 ${this.landingConfig?.contactPhone || '01272000075'}\n📧 ${this.landingConfig?.contactEmail || 'support@modernsoft.com'}\n📍 ${this.landingConfig?.contactAddress || 'برج لؤلؤة الهندسة, بجوار كلية الهندسة_شبين الكوم_المنوفية'}\n\nاحنا جاهزين في أي وقت!`
      ];
      return phoneVariations[Math.floor(Math.random() * phoneVariations.length)];
    }

    // Smart Fallback - منع أي رد فيه "مش عارف"
    // حفظ السؤال كـ unmatchedQuestion
    const unmatchedResponse = this.smartFallback(userMessage, docResults, emotion);
    
    // حفظ السؤال في logs كـ unmatchedQuestion (سيتم حفظه في BotInterface)
    // نرجع emotion أيضاً للاستخدام في BotInterface
    
    return unmatchedResponse;
  }
  
  // Helper method للحصول على emotion للسؤال
  getEmotionForQuestion(question: string): 'angry' | 'rushed' | 'normal' {
    return this.classifyEmotion(question);
  }

  private formatResponse(bestResult: SearchResult, allResults: SearchResult[], intent: DetectedIntent | null, userMessage: string, emotion?: 'angry' | 'rushed' | 'normal'): string {
    let response = bestResult.content;
    const path = bestResult.path || this.extractOfficialPath(bestResult.content);

    // للمستخدم المستعجل - رد مختصر جداً (خطوة واحدة فقط)
    if (emotion === 'rushed') {
      if (path) {
        return this.wrapHumanResponse(path, intent, emotion);
      }
      const firstLine = response.split('\n').find(l => l.trim().length > 10) || response.substring(0, 100);
      return this.wrapHumanResponse(firstLine, intent, emotion);
    }

    // استخراج المعلومات الأكثر صلة بناءً على نوع السؤال
    const lines = response.split('\n').filter(l => l.trim().length > 10);
    
    if (intent) {
      if (intent.intent.name === 'where') {
        // البحث عن المسارات
        const paths = lines.filter(l => l.includes('[') && l.includes(']'));
        if (paths.length > 0) {
          response = paths.slice(0, 3).join('\n');
        } else if (path) {
          response = path + '\n\n' + lines.slice(0, 4).join('\n');
        } else {
          response = lines.slice(0, 5).join('\n');
        }
      } else if (intent.intent.name === 'how') {
        // البحث عن الخطوات
        const steps = lines.filter(l => /^\d+\.|^-|^•/.test(l.trim()));
        if (steps.length > 0) {
          response = steps.slice(0, 5).join('\n');
        } else {
          response = lines.slice(0, 6).join('\n');
        }
      } else {
        response = lines.slice(0, 8).join('\n');
      }
    } else {
      response = lines.slice(0, 8).join('\n');
    }
    
    // إضافة المسار الرسمي إذا كان موجود
    if (path && !response.includes(path)) {
      response = path + '\n\n' + response;
    }
    
    // ربط معلومات إضافية ذكياً (فقط للمستخدم العادي)
    if (emotion !== 'rushed' && allResults.length > 1) {
      const relatedInfo = allResults[1].content;
      const relatedPath = allResults[1].path || this.extractOfficialPath(relatedInfo);
      
      // التحقق من عدم التكرار
      if (!response.includes(relatedInfo.substring(0, 50))) {
        if (relatedPath) {
          response += '\n\n💡 كمان معلومة مفيدة:\n' + relatedPath + '\n' + relatedInfo.substring(0, 200);
        } else {
          response += '\n\n💡 كمان معلومة مفيدة:\n' + relatedInfo.substring(0, 250);
        }
      }
    }

    return this.wrapHumanResponse(response, intent, emotion);
  }

  // استخراج اسم العميل من الرسالة مع Emotion
  extractClientInfo(messages: any[]): { name: string; summary: string; emotion?: 'angry' | 'rushed' | 'normal' } {
    let name = 'زائر';
    let summary = 'محادثة عامة';
    let detectedEmotion: 'angry' | 'rushed' | 'normal' = 'normal';

    for (const msg of messages) {
      if (msg.role === 'user') {
        const text = msg.text.toLowerCase();
        
        // تصنيف Emotion
        const emotion = this.classifyEmotion(msg.text);
        if (emotion === 'angry' || emotion === 'rushed') {
          detectedEmotion = emotion;
        }
        
        const namePatterns = [
          /اسمي\s+(\w+)/,
          /أنا\s+(\w+)/,
          /اسمي\s+هو\s+(\w+)/,
          /(\w+)\s+اسمي/,
          /اسمي\s+(\w+\s+\w+)/,
          /أنا\s+(\w+\s+\w+)/
        ];

        for (const pattern of namePatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            name = match[1];
            break;
          }
        }

        // استخراج ملخص بناءً على Intent
        const intent = this.detectIntent(msg.text);
        if (intent) {
          summary = `استفسار عن ${intent.intent.category}`;
        } else if (text.length > 20) {
          summary = text.substring(0, 50) + '...';
        }
      }
    }

    return { name, summary, emotion: detectedEmotion };
  }
}

export const localAI = new LocalAI();
