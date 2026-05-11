'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, Volume2, VolumeX, Sparkles, Loader2, Minus } from 'lucide-react';

interface TopicAssistantProps {
  topicTitle: string;
  categoryTitle: string;
  grade: string;
}

export default function TopicAssistant({ topicTitle, categoryTitle, grade }: TopicAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized]);

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold: **text**
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em>$1</em>');
      return (
        <span key={i} className="block mb-1 last:mb-0" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };

  const stripMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1')     // Italic
      .replace(/#(.*?)\n/g, '$1 ')     // Headers
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
      .replace(/[`>#*_-]/g, '')        // Other symbols
      .replace(/\n+/g, ' ')            // Newlines to spaces
      .trim();
  };

  const speak = (text: string) => {
    if (!voiceEnabled || !synth) return;
    
    // Stop any current speech
    synth.cancel();

    const cleanText = stripMarkdown(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/learning/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          topicTitle,
          categoryTitle,
          grade,
          history: messages
        })
      });

      const data = await response.json();
      if (data.text) {
        const aiMsg = { role: 'model' as const, text: data.text };
        setMessages(prev => [...prev, aiMsg]);
        speak(data.text);
      } else {
        const errorMsg = { role: 'model' as const, text: 'Waduh, koneksi neural terputus. Coba kirim ulang ya!' };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-[100] flex flex-col items-end gap-4 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '80px' : '500px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[320px] md:w-[380px] bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col pointer-events-auto"
          >
            {/* Header */}
            <div className="p-4 bg-slate-800/50 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">AsistenKu</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Tutor {topicTitle}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-2 rounded-lg transition-colors ${voiceEnabled ? 'text-indigo-400 bg-indigo-400/10' : 'text-slate-500 hover:text-white'}`}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 text-slate-500 hover:text-white">
                  <Minus className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                >
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-white font-black text-sm uppercase tracking-wide">Ada yang bingung tentang {topicTitle}?</p>
                        <p className="text-slate-500 text-[10px] mt-1 font-medium">Tanyakan apa saja seputar bab ini, aku siap membantu!</p>
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`
                        max-w-[85%] p-3 md:p-4 rounded-2xl text-xs md:text-sm font-medium leading-relaxed shadow-sm
                        ${msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'}
                      `}>
                        {renderMarkdown(msg.text)}
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-900/50 border-t border-white/5">
                  <div className="relative flex items-center">
                    <input 
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Tanya soal materi ini..."
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 transition-colors outline-none"
                    />
                    <button 
                      onClick={handleSend}
                      disabled={loading || !input.trim()}
                      className="absolute right-2 p-2 bg-indigo-600 text-white rounded-xl disabled:opacity-50 hover:bg-indigo-500 transition-all shadow-lg active:scale-95"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[7px] text-center text-slate-600 mt-2 font-black uppercase tracking-widest">Neural Tutor Beta • Hanya menjawab seputar {topicTitle}</p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        initial={false}
        animate={{ 
          scale: isOpen ? 0.8 : 1,
          rotate: isOpen ? 90 : 0
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className={`pointer-events-auto w-14 h-14 rounded-2xl shadow-[0_10px_30px_rgba(79,70,229,0.4)] flex items-center justify-center relative group
          ${isSpeaking ? 'bg-indigo-500' : 'bg-indigo-600'}
        `}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
        {isSpeaking ? (
          <div className="flex gap-1 items-center">
            <div className="w-1 h-4 bg-white rounded-full animate-[voice_0.5s_ease-in-out_infinite]" />
            <div className="w-1 h-6 bg-white rounded-full animate-[voice_0.5s_ease-in-out_infinite_0.1s]" />
            <div className="w-1 h-4 bg-white rounded-full animate-[voice_0.5s_ease-in-out_infinite_0.2s]" />
          </div>
        ) : (
          <MessageSquare className="w-6 h-6 text-white" />
        )}
        
        {!isOpen && (
          <div className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </div>
        )}
      </motion.button>

      <style jsx global>{`
        @keyframes voice {
          0%, 100% { height: 10px; }
          50% { height: 24px; }
        }
      `}</style>
    </div>
  );
}
