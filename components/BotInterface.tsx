'use client';

import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { localAI } from '@/services/local-ai';
import { db } from '@/services/db';
import { ChatLog } from '@/types';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // URL for display
  timestamp: Date;
}

interface BotInterfaceProps {
  onSessionEnd: (logId: string) => void;
  onAdminClick: () => void;
  onBack: () => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

const BotInterface: React.FC<BotInterfaceProps> = ({ onSessionEnd, onAdminClick, onBack, isDarkMode, toggleTheme }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [statusText, setStatusText] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [sessionId] = useState(() => Date.now().toString());
  
  // Secret Admin Access State
  const [logoClicks, setLogoClicks] = useState(0);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null); // Ref for text input
  const initialized = useRef(false);

  // Smart Robot Icon (SVG Data URI) - Replaced with Modern Soft Logo
  const ROBOT_ICON = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23F7941D'/%3E%3Cpath d='M20 30 Q 50 15 80 30 V 75 Q 50 90 20 75 Z' fill='white' opacity='0.2'/%3E%3Ctext x='50' y='65' font-size='45' font-weight='bold' font-family='serif' text-anchor='middle' fill='white'%3EMS%3C/text%3E%3C/svg%3E";

  // Auto-scroll to bottom
  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, statusText, selectedImage]);

  // Auto-focus input when not loading
  useEffect(() => {
    if (!isLoading && !isEnding && textInputRef.current) {
        // Small timeout to ensure DOM update is complete
        setTimeout(() => {
            textInputRef.current?.focus();
        }, 100);
    }
  }, [isLoading, isEnding]);

  // --- AUTO SAVE LOGIC ---
  useEffect(() => {
      // Only auto-save if we have actual conversation (more than just the welcome message)
      if (messages.length > 1) {
          const sessionData = {
              id: sessionId,
              messages: messages,
              timestamp: Number(sessionId)
          };
          localStorage.setItem('est_autosave_session', JSON.stringify(sessionData));
      }
  }, [messages, sessionId]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initChat = async () => {
        try {
            // تهيئة النظام المحلي
            await localAI.initialize();
            
            // رسالة ترحيب ودية
            const welcomeMessages = [
              'أهلاً وسهلاً بحضرتك يا فندم! 🧡\nمعاك المساعد الذكي لنظام E-stock، وأنا هنا عشان أساعدك في أي وقت.\n\nعشان أقدر أخدمك بأفضل شكل، ممكن أتشرف ببيانات حضرتك؟\n(الاسم، اسم الصيدلية، رقم التليفون، والعنوان)\n\nوبعدها أمرني، أنا تحت أمرك.',
              'أهلاً بحضرتك! 🧡\nمعاك المساعد الذكي لنظام E-stock.\n\nممكن أتشرف ببيانات حضرتك عشان أقدر أساعدك بشكل أفضل؟\n(الاسم، اسم الصيدلية، رقم التليفون، والعنوان)\n\nوبعدها قولي إيه اللي محتاجه وأنا معاك.',
              'أهلاً وسهلاً! 🧡\nمعاك المساعد الذكي لـ E-stock.\n\nممكن بيانات حضرتك عشان أخدمك أحسن؟\n(الاسم، اسم الصيدلية، رقم التليفون، والعنوان)\n\nوبعدها قولي إيه اللي محتاجه وأنا جاهز.'
            ];
            
            const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
            
            setMessages([{
                id: 'init',
                role: 'model',
                text: randomWelcome,
                timestamp: new Date()
            }]);
        } catch (error) {
            console.error("Initialization Error:", error);
            setMessages([{
                id: 'error_init',
                role: 'model',
                text: 'بعتذر جداً، حصل خطأ تقني بسيط أثناء التحميل. ممكن تعمل تحديث للصفحة؟',
                timestamp: new Date()
            }]);
        }
    };

    initChat();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Limit to 1MB to avoid "Rpc failed" / XHR Timeout errors
      if (file.size > 1024 * 1024) {
          alert('عفواً، حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 1 ميجابايت.');
          return;
      }
      setSelectedImage(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
          if (typeof reader.result === 'string') {
               resolve(reader.result.split(',')[1]);
          } else {
               reject(new Error("Failed to read file"));
          }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSecretLogoClick = () => {
    // Increment click count
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);

    // Clear existing timeout
    if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
    }

    // Check if threshold reached
    if (newCount >= 10) {
        onAdminClick();
        setLogoClicks(0); // Reset
    } else {
        // Set timeout to reset clicks if user stops clicking
        clickTimeoutRef.current = setTimeout(() => {
            setLogoClicks(0);
        }, 2000); // 2 seconds window to continue clicking
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading || isEnding) return;

    const userText = input;
    const currentImage = selectedImage;
    const userMsgId = Date.now().toString();

    // Reset input state
    setInput('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Optimistic Update
    setMessages(prev => [...prev, { 
        id: userMsgId, 
        role: 'user', 
        text: userText, 
        image: currentImage ? URL.createObjectURL(currentImage) : undefined,
        timestamp: new Date()
    }]);

    setIsLoading(true);
    
    // Lazy loading - محاكاة AI thinking
    const thinkingMessages = [
      'جاري التفكير...',
      'دعني أفكر...',
      'جاري البحث...',
      'دعني أتحقق...',
      'جاري المعالجة...'
    ];
    
    let thinkingIndex = 0;
    const thinkingInterval = setInterval(() => {
      setStatusText(thinkingMessages[thinkingIndex % thinkingMessages.length]);
      thinkingIndex++;
    }, 800);

    // تأخير ذكي بناءً على طول الرسالة (محاكاة AI حقيقي)
    const messageLength = userText.length;
    const baseDelay = 800; // 0.8 ثانية كحد أدنى
    const lengthDelay = Math.min(messageLength * 20, 2000); // أقصى 2 ثانية إضافية
    const totalDelay = baseDelay + lengthDelay;
    
    // تأخير عشوائي إضافي لمحاكاة AI (بين 300ms و 800ms)
    const randomDelay = 300 + Math.random() * 500;
    const finalDelay = totalDelay + randomDelay;

    try {
      // استخدام النظام المحلي
      const conversationHistory = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      let responseText: string;

      // محاكاة وقت المعالجة
      await new Promise(resolve => setTimeout(resolve, finalDelay));

      // تصنيف Emotion
      const emotion = localAI.getEmotionForQuestion(userText);
      
      if (currentImage) {
        // معالجة الصور (يمكن إضافة منطق محلي لاحقاً)
        responseText = 'معذرة، تحليل الصور حالياً غير متاح في النسخة المحلية. ممكن توصف المشكلة بالكلمات عشان أقدر أساعدك؟';
      } else {
        // توليد رد باستخدام النظام المحلي
        responseText = await localAI.generateResponse(userText, conversationHistory);
        
        // التحقق إذا كان السؤال غير مطابق (unmatched)
        // نتحقق من وجود كلمات ممنوعة في الرد
        const forbiddenPhrases = ['مش فاهم', 'مش متأكد', 'مش عارف', 'غير متوفر'];
        const isUnmatched = forbiddenPhrases.some(phrase => responseText.includes(phrase)) || 
                           responseText.includes('ممكن توضح') || 
                           responseText.includes('معلش، مش');
        
        // حفظ السؤال كـ unmatchedQuestion إذا لم يتم العثور على إجابة مباشرة
        if (isUnmatched) {
          // سيتم حفظه في endSession
          const currentMessages = [...messages, { 
            id: userMsgId, 
            role: 'user' as const, 
            text: userText, 
            image: currentImage ? URL.createObjectURL(currentImage) : undefined,
            timestamp: new Date()
          }];
          
          // حفظ مؤقت للاستخدام في endSession
          (currentMessages as any).__unmatchedQuestion = userText;
          (currentMessages as any).__emotion = emotion;
        }
      }

      clearInterval(thinkingInterval);
      setStatusText('');

      // محاكاة الكتابة التدريجية (typing effect) - اختياري
      const typingDelay = Math.min(responseText.length * 20, 1000); // أقصى ثانية واحدة
      await new Promise(resolve => setTimeout(resolve, typingDelay));

      setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'model', 
          text: responseText,
          timestamp: new Date()
      }]);

    } catch (error) {
      clearInterval(thinkingInterval);
      console.error(error);
      setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'model', 
          text: 'معلش في مشكلة بسيطة في النظام، ممكن تحاول تاني؟',
          timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      setStatusText('');
    }
  };

  const endSession = async () => {
    setIsEnding(true);
    setStatusText('جاري حفظ المحادثة وبيانات العميل...');
    
    try {
        // استخدام النظام المحلي لاستخراج المعلومات
        const clientInfo = localAI.extractClientInfo(messages);
        
        // البحث عن الأسئلة غير المطابقة في المحادثة
        const userMessages = messages.filter(m => m.role === 'user');
        let unmatchedQuestion: string | undefined;
        let detectedEmotion: 'angry' | 'rushed' | 'normal' = clientInfo.emotion || 'normal';
        
        // البحث عن آخر سؤال قد يكون غير مطابق
        for (let i = userMessages.length - 1; i >= 0; i--) {
          const userMsg = userMessages[i];
          const emotion = localAI.getEmotionForQuestion(userMsg.text);
          
          // إذا كان هناك سؤال مع emotion أو سؤال طويل، قد يكون غير مطابق
          if (emotion === 'angry' || userMsg.text.length > 30) {
            unmatchedQuestion = userMsg.text;
            detectedEmotion = emotion;
            break;
          }
        }

        const fullLog: ChatLog = {
          id: sessionId,
          timestamp: Number(sessionId),
          duration: (Date.now() - Number(sessionId)) / 1000,
          userQuery: messages.map(m => {
              const role = m.role === 'user' ? '👤 العميل' : '🤖 E-stock Bot';
              const imgTag = m.image ? ' [مرفق صورة]' : '';
              return `${role}: ${m.text}${imgTag}`;
          }).join('\n\n'),
          botResponse: clientInfo.summary,
          clientName: clientInfo.name,
          emotion: detectedEmotion,
          unmatchedQuestion: unmatchedQuestion
        };
        
        await db.addLog(fullLog);
        
        // تشغيل Auto-Expand من Logs
        await localAI.autoExpandFromLogs();
        
        localStorage.removeItem('est_autosave_session');
        
        onSessionEnd(sessionId);
    } catch (e) {
        console.error("Error saving log", e);
        const fallbackLog: ChatLog = {
          id: sessionId,
          timestamp: Number(sessionId),
          duration: (Date.now() - Number(sessionId)) / 1000,
          userQuery: "Error saving detail",
          botResponse: "Session ended with error",
          clientName: "Error",
          emotion: 'normal'
        };
        await db.addLog(fallbackLog);
        localStorage.removeItem('est_autosave_session');
        onSessionEnd(sessionId);
    } finally {
        setIsEnding(false);
    }
  };

  const formatTime = (date: Date) => {
      return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-800 sm:shadow-2xl sm:rounded-2xl rounded-none overflow-hidden border-0 sm:border border-gray-200 dark:border-gray-700 font-sans relative transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-3 sm:p-4 flex justify-between items-center text-gray-800 dark:text-gray-100 shadow-sm border-b border-gray-100 dark:border-gray-700 z-10 shrink-0">
        <div className="flex items-center space-x-3 space-x-reverse">
            <button 
                onClick={onBack}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                title="العودة للصفحة الرئيسية"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" transform="rotate(180 12 12)" />
                </svg>
            </button>
            <div 
                className="relative cursor-pointer select-none active:scale-95 transition-transform" 
                onClick={handleSecretLogoClick}
                title="E-stock Chat"
            >
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md ring-2 ring-blue-50 dark:ring-gray-600 overflow-hidden">
                    <img src={ROBOT_ICON} alt="Robot" className="w-full h-full object-cover" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
            </div>
            <div 
                className="flex flex-col cursor-pointer select-none" 
                onClick={handleSecretLogoClick}
            >
                <h2 className="font-bold text-base sm:text-lg leading-tight flex items-center gap-1">
                    E-stock chat
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-500">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                </h2>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">متصل الآن • يرد فوراً</p>
            </div>
        </div>
        
        <div className="flex items-center gap-1">
            <button 
                onClick={endSession}
                disabled={isEnding || isLoading}
                className="text-xs sm:text-sm bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
                {isEnding ? 'جاري الحفظ...' : 'إنهاء'}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" transform="rotate(180 12 12)"/>
                </svg>
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-5 space-y-6 bg-[#f0f2f5] dark:bg-gray-900 scrollbar-hide"
        style={{
            backgroundImage: isDarkMode 
                ? `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                : `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        <div className="text-center my-4">
            <span className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-500 dark:text-gray-300 text-xs px-3 py-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                اليوم
            </span>
        </div>

        {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
                <div 
                    key={msg.id} 
                    className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`} 
                >
                    <div className={`flex max-w-[85%] sm:max-w-[75%] gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        {!isUser && (
                            <div className="flex-shrink-0 self-end mb-1">
                                <img 
                                    src={ROBOT_ICON}
                                    alt="Bot"
                                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 p-0.5 object-cover shadow-sm border border-gray-100 dark:border-gray-600"
                                />
                            </div>
                        )}
                        
                        {/* Bubble */}
                        <div 
                            className={`relative px-4 py-2 sm:px-5 sm:py-3 shadow-sm text-sm sm:text-base leading-relaxed break-words ${
                                isUser 
                                    ? 'bg-gradient-to-l from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-none' 
                                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-2xl rounded-bl-none'
                            }`}
                        >
                            {msg.image && (
                                <div className="mb-2 -mx-2 -mt-2">
                                    <img 
                                        src={msg.image} 
                                        alt={isUser ? "User Upload" : "Bot Response"} 
                                        className="w-full h-auto max-h-64 object-cover rounded-xl bg-gray-50 dark:bg-gray-800" 
                                    />
                                </div>
                            )}
                            {msg.text && (
                                 <div className="whitespace-pre-wrap">
                                     {msg.text}
                                 </div>
                            )}
                            {/* Timestamp */}
                            <div className={`text-[10px] mt-1 flex items-center gap-1 ${isUser ? 'text-blue-100 justify-start' : 'text-gray-400 dark:text-gray-400 justify-end'}`}>
                                <span>{formatTime(new Date(msg.timestamp))}</span>
                                {isUser && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-blue-200">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
        
        {/* Loading Bubble */}
        {(isLoading || isEnding) && (
            <div className="flex w-full justify-start">
                 <div className="flex max-w-[80%] gap-2 flex-row">
                    <div className="flex-shrink-0 self-end mb-1">
                        <img 
                            src={ROBOT_ICON}
                            alt="Bot"
                            className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 p-0.5 object-cover shadow-sm border border-gray-100 dark:border-gray-600"
                        />
                    </div>
                    <div className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-3">
                         <div className="flex space-x-1 space-x-reverse items-center h-full pt-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-xs text-gray-400 animate-pulse font-medium">{statusText}</span>
                    </div>
                </div>
            </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-3 sm:p-4 shrink-0 z-20 transition-colors">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
            
            {/* Image Preview Overlay */}
            {selectedImage && (
                <div className="absolute bottom-full right-0 left-0 mb-4 mx-2 bg-white dark:bg-gray-700 p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-600 animate-in slide-in-from-bottom-2 fade-in flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden relative border border-gray-200 dark:border-gray-600">
                            <img 
                                src={URL.createObjectURL(selectedImage)} 
                                alt="Preview" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800 dark:text-white">صورة مرفقة</span>
                            <span className="text-xs text-gray-500 dark:text-gray-300 max-w-[150px] truncate">{selectedImage.name}</span>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        onClick={removeImage}
                        className="p-2 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="flex items-end gap-2 bg-gray-100 dark:bg-gray-700 rounded-[2rem] p-1.5 pr-2 focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900 focus-within:shadow-lg transition-all border border-transparent focus-within:border-blue-200 dark:focus-within:border-blue-700">
                
                {/* File Attachment Button */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageSelect} 
                    accept="image/*" 
                    className="hidden" 
                />
                
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2.5 rounded-full transition-all duration-200 ${selectedImage ? 'bg-blue-100 text-blue-600' : 'text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    title="رفع صورة"
                    disabled={isLoading || isEnding}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                </button>

                <textarea
                    ref={textInputRef as any}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder={selectedImage ? "اكتب تعليق على الصورة..." : "اكتب رسالتك هنا..."}
                    className="flex-1 bg-transparent border-0 py-3 px-2 outline-none text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-base resize-none max-h-32 min-h-[44px]"
                    rows={1}
                    disabled={isLoading || isEnding}
                    style={{ overflow: 'hidden' }}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                    }}
                />

                <button 
                    type="submit" 
                    disabled={(!input.trim() && !selectedImage) || isLoading || isEnding}
                    className={`p-3 rounded-full flex items-center justify-center transition-all duration-200 ${
                        (!input.trim() && !selectedImage) || isLoading || isEnding
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-md active:scale-95'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform rotate-180">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                </button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default BotInterface;
