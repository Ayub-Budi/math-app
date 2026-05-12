'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Mic, MicOff, Volume2, VolumeX, ArrowLeft, Sparkles, AudioLines } from 'lucide-react';
import Link from 'next/link';

export default function NobrolPage() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'id-ID';

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);

          // Reset timeout setiap kali ada suara masuk
          if (timeoutRef.current) clearTimeout(timeoutRef.current);

          if (event.results[current].isFinal) {
            setTranscript('');
            handleSend(text);
          } else {
            // Jika dalam 5 detik tidak ada suara tambahan, kirim pesan secara paksa
            timeoutRef.current = setTimeout(() => {
              if (text.trim()) {
                setTranscript('');
                handleSend(text);
                recognitionRef.current?.stop(); // Berhenti sejenak untuk memproses
              }
            }, 5000);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } else {
        setIsSupported(false);
      }
      synthRef.current = window.speechSynthesis;
      // Pre-load voices
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = () => {
          // Hanya untuk trigger loading voices
          synthRef.current?.getVoices();
        };
      }
    }

    return () => {
      synthRef.current?.cancel();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Auto-restart listening
  useEffect(() => {
    if (isMounted && isStarted && !isListening && !isLoading && !isSpeaking) {
      const timer = setTimeout(() => {
        startListening();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isListening, isLoading, isSpeaking, isMounted, isStarted]);

  const startListening = () => {
    if (recognitionRef.current && isStarted) {
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current.start();
          setIsListening(true);
        }, 100);
      } catch (e) {
        console.error("Speech start error:", e);
      }
    }
  };

  const handleStartSession = () => {
    setIsStarted(true);
    setHasInteracted(true);
    
    // Unlock Audio for iOS
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance("");
      utterance.volume = 0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/assistant/nobrol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });

      if (res.ok) {
        const data = await res.json();
        setLastResponse(data.text);
        speak(data.text);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;
    
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Cari suara Indonesia
    let voices = synthRef.current.getVoices();
    
    // Jika list masih kosong, coba panggil lagi (beberapa browser butuh ini)
    if (voices.length === 0) {
      voices = window.speechSynthesis.getVoices();
    }

    const idVoice = voices.find(v => {
      const lang = v.lang.toLowerCase().replace('_', '-');
      const name = v.name.toLowerCase();
      return lang.includes('id-id') || lang === 'id' || name.includes('indonesia') || name.includes('bahasa');
    });

    if (idVoice) {
      console.log("Using Indonesian voice:", idVoice.name, idVoice.lang);
      utterance.voice = idVoice;
    } else {
      console.warn("No Indonesian voice found among", voices.length, "available voices. Available:", voices.map(v => v.lang).join(', '));
    }
    
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utteranceRef.current = utterance;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsLoading(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (event: any) => {
      // 'interrupted' biasanya terjadi karena kita memanggil cancel() untuk mengganti suara baru
      // Ini normal dan sebaiknya tidak dianggap error yang mengganggu user
      if (event.error === 'interrupted') {
        setIsSpeaking(false);
        return;
      }

      if (event.error) {
        console.error("Speech error detail:", event.error, event);
      }
      
      // Jika gagal dengan suara spesifik, coba lagi sekali tanpa setting voice
      if (utterance.voice && (event.error === 'language-unavailable' || event.error === 'voice-unavailable')) {
        utterance.voice = null;
        synthRef.current?.speak(utterance);
        return;
      }

      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    // Tambahkan delay kecil setelah cancel() agar browser mobile stabil
    setTimeout(() => {
      if (synthRef.current) {
        synthRef.current.speak(utterance);
      }
    }, 50);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {!isSupported && (
        <div className="absolute top-0 left-0 right-0 z-[100] bg-red-500 text-white p-3 flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest animate-in slide-in-from-top duration-500">
           <X className="w-4 h-4" /> Browser ini tidak mendukung fitur suara. Gunakan Chrome atau Safari terbaru.
        </div>
      )}

      <Link 
        href="/asistenku" 
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-black uppercase tracking-widest text-[10px] md:text-xs z-20"
      >
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" /> 
        <span className="hidden sm:inline">Kembali ke Chat</span>
        <span className="sm:hidden">Kembali</span>
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8 md:space-y-12 max-w-lg w-full text-center z-10 py-10">
        <div className="relative">
          <motion.div 
            animate={isListening ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(99,102,241,0.2)] border-4 border-white/10 relative overflow-hidden`}
          >
            {isListening || isSpeaking ? (
               <div className="flex gap-1.5 sm:gap-2 items-center h-full px-4">
                  {[1,2,3,4,5,6,7].map(i => (
                    <motion.div 
                      key={i}
                      animate={isSpeaking ? { height: [15, 60, 15] } : { height: [8, 20, 8] }}
                      transition={{ repeat: Infinity, duration: isSpeaking ? 0.4 : 0.8, delay: i * 0.05 }}
                      className="w-1.5 sm:w-2 bg-white rounded-full opacity-80"
                    />
                  ))}
               </div>
            ) : (
               <Bot className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 text-white drop-shadow-2xl" />
            )}
          </motion.div>
          {isListening && (
            <div className="absolute inset-0 rounded-full border-4 border-indigo-400 animate-ping opacity-20" />
          )}
        </div>

        <div className="space-y-3 md:space-y-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tighter flex items-center justify-center gap-3">
            NOBROL <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
          </h1>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`px-4 py-1 rounded-full text-[9px] md:text-xs font-black uppercase tracking-[0.3em] transition-colors ${
                isListening ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                isLoading ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse' :
                isSpeaking ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                'bg-slate-800 text-slate-500 border border-slate-700'
              }`}>
                {isListening ? 'Mendengarkan...' : isLoading ? 'Berpikir...' : isSpeaking ? 'AsistenKu Bicara' : 'Standby'}
              </span>
            </div>

          </div>
        </div>

        <div className="min-h-[100px] sm:min-h-[140px] w-full flex items-center justify-center px-6 py-8 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-2xl relative">
          <div className="absolute -top-3 left-6 px-3 py-1 bg-slate-900 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-500">
            Preview Percakapan
          </div>
          {transcript ? (
             <p className="text-lg sm:text-xl md:text-2xl text-white font-medium italic opacity-70 leading-relaxed">"{transcript}"</p>
          ) : lastResponse ? (
             <p className="text-base sm:text-lg md:text-xl text-slate-300 font-medium leading-relaxed italic">
               "{lastResponse}"
             </p>
          ) : (
             <p className="text-slate-500 font-medium italic animate-pulse text-sm sm:text-base">Siap mendengarkan suaramu...</p>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-6 w-full pt-4">
           <Link 
            href="/asistenku"
            className="flex-1 max-w-[280px] py-5 sm:py-6 bg-red-500 hover:bg-red-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(239,68,68,0.2)] transition-all active:scale-95 text-center text-xs sm:text-sm"
           >
             Selesai
           </Link>
        </div>

        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] pt-4">
          Ngobrol Tanpa Ngetik • Tektokan Kilat
        </p>
      </div>

      {/* Start Overlay for iOS & Experience */}
      {!isStarted && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col items-center text-center max-w-xs"
          >
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
              <Mic className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Siap Ngobrol?</h2>
            <p className="text-slate-400 text-sm font-medium mb-8">Ketuk tombol di bawah untuk mulai asisten suara.</p>
            <button
              onClick={handleStartSession}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
            >
              Mulai Sekarang
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
