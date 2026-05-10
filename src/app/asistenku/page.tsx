'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, ImagePlus, Camera, User, Loader2, X, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string; // base64
}

export default function AsistenKuPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load history and profile image on mount
  useEffect(() => {
    setIsMounted(true);
    const savedImg = localStorage.getItem('userImage');
    if (savedImg) setUserProfileImage(savedImg);

    const savedHistory = localStorage.getItem('asistenku_chat_history');
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (e) {
        // Fallback if parsing fails
      }
    } else {
      setMessages([
        {
          role: 'model',
          text: 'Halo! Aku AsistenKu 🤖✨\nAda PR Matematika yang bikin pusing? Ketik soalnya atau fotokan saja ke aku, biar kita pecahkan bareng-bareng!'
        }
      ]);
    }
  }, []);

  // Save history whenever it changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('asistenku_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        alert("Ukuran gambar terlalu besar! Maksimal 4MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset value agar bisa pilih file yang sama dua kali
    if (e.target) e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (!file) continue;
        
        if (file.size > 4 * 1024 * 1024) {
          alert("Ukuran gambar terlalu besar! Maksimal 4MB.");
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
        
        // Mencegah teks aneh masuk ke textarea akibat paste gambar
        e.preventDefault();
        break; 
      }
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userText = input.trim();
    const userImage = selectedImage;

    // Tambahkan pesan user ke UI
    setMessages(prev => [...prev, { role: 'user', text: userText, image: userImage || undefined }]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText, imageBase64: userImage })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'model', text: data.text }]);
      } else {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'model', text: `❌ Waduh: ${data.error || 'Server sibuk'}` }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: '❌ Jaringan terputus. Coba cek internetmu ya!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-slate-200">
      <Navbar />
      
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 pt-20 pb-4 px-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/home" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">AsistenKu <Sparkles className="w-4 h-4 text-yellow-400" /></h1>
              <p className="text-xs text-indigo-300 font-bold tracking-widest uppercase">Tutor AI Matematika</p>
            </div>
          </div>
          
          <button 
            onClick={() => {
               if(confirm('Hapus semua riwayat percakapan?')) {
                 localStorage.removeItem('asistenku_chat_history');
                 window.location.reload();
               }
            }}
            className="text-xs font-bold text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors"
          >
            Bersihkan
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-6 pb-4">
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg overflow-hidden ${msg.role === 'user' ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                {msg.role === 'user' ? (
                  userProfileImage ? <img src={userProfileImage} alt="User" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-white" />
                ) : (
                  <Bot className="w-6 h-6 text-white" />
                )}
              </div>
              
              <div className={`max-w-[80%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.image && (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl max-w-sm">
                    <img src={msg.image} alt="Upload" className="w-full h-auto object-contain" />
                  </div>
                )}
                
                {msg.text && (
                  <div className={`p-4 rounded-3xl shadow-md ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-sm' 
                      : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/50'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed font-medium">
                      {msg.text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i} className={msg.role === 'user' ? 'font-black text-white' : 'font-black text-indigo-300'}>{part.slice(2, -2)}</strong>;
                        }
                        return <span key={i}>{part}</span>;
                      })}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 flex-row"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="bg-slate-800 p-4 rounded-3xl rounded-tl-sm border border-slate-700/50 flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                <span className="text-slate-400 italic text-sm">Sedang memikirkan jawaban...</span>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-slate-900 border-t border-slate-800 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Image Preview */}
          <AnimatePresence>
            {selectedImage && (
              <motion.div 
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 10, height: 0 }}
                className="mb-4 relative inline-block"
              >
                <div className="relative rounded-xl overflow-hidden border-2 border-indigo-500 w-32 h-32 bg-slate-800">
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2 bg-slate-800 p-2 rounded-3xl border border-slate-700 shadow-xl focus-within:border-indigo-500 transition-colors">
            {/* Hidden Inputs */}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            {/* Input khusus untuk akses kamera HP */}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              ref={cameraInputRef}
              onChange={handleImageSelect}
            />

            <button 
              onClick={() => cameraInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-full transition-all shrink-0"
              title="Kamera"
            >
              <Camera className="w-6 h-6" />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-full transition-all shrink-0"
              title="Galeri"
            >
              <ImagePlus className="w-6 h-6" />
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Ketik soal atau paste gambar (Ctrl+V) di sini..."
              className="flex-1 max-h-32 min-h-[44px] bg-transparent text-white placeholder-slate-400 border-none focus:ring-0 resize-none py-3 px-2 outline-none w-full"
              rows={1}
            />

            <button 
              onClick={handleSend}
              disabled={(!input.trim() && !selectedImage) || isLoading}
              className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-all shrink-0 disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-lg shadow-indigo-600/20 mb-0.5 mr-0.5"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-500 mt-3 font-bold tracking-widest uppercase">
            AsistenKu dapat membuat kesalahan. Cek kembali jawabannya.
          </p>
        </div>
      </footer>
    </div>
  );
}
