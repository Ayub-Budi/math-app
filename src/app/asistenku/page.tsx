'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, ImagePlus, Camera, User, Loader2, X, Sparkles, ArrowLeft, Mic } from 'lucide-react';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
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
        // Fallback
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

  const clearHistory = () => {
    localStorage.removeItem('asistenku_chat_history');
    setMessages([
      {
        role: 'model',
        text: 'Halo! Aku AsistenKu 🤖✨\nAda PR Matematika yang bikin pusing? Ketik soalnya atau fotokan saja ke aku, biar kita pecahkan bareng-bareng!'
      }
    ]);
    setShowDeleteModal(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("Ukuran gambar terlalu besar! Maksimal 4MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onloadend = () => setSelectedImage(reader.result as string);
        reader.readAsDataURL(file);
        e.preventDefault();
        break; 
      }
    }
  };

  const renderMessage = (text: string, isUser: boolean) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.trim() === '---') return <hr key={idx} className="my-3 border-slate-700/50" />;
      if (line.startsWith('### ')) return <h3 key={idx} className="text-lg md:text-xl font-black text-white mt-4 mb-2 uppercase tracking-tight">{line.replace('### ', '')}</h3>;
      if (line.trim().startsWith('* ')) {
        const content = line.trim().replace('* ', '');
        return (
          <div key={idx} className="flex gap-2 ml-2 mb-1 items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
            <div className="text-sm md:text-base font-medium">{renderInline(content, isUser)}</div>
          </div>
        );
      }
      if (line.trim() === '') return <div key={idx} className="h-2" />;
      return <div key={idx} className="text-sm md:text-base whitespace-pre-wrap leading-relaxed font-medium mb-1 last:mb-0">{renderInline(line, isUser)}</div>;
    });
  };

  const renderInline = (text: string, isUser: boolean) => {
    const parts = text.split(/(\*\*.*?\*\*|\$\$.*?\$\$|\$.*?\$)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className={isUser ? 'font-black text-white' : 'font-black text-indigo-300'}>{renderInline(part.slice(2, -2), isUser)}</strong>;
      }
      if ((part.startsWith('$$') && part.endsWith('$$')) || (part.startsWith('$') && part.endsWith('$'))) {
        const isDouble = part.startsWith('$$');
        const content = isDouble ? part.slice(2, -2) : part.slice(1, -1);
        
        // Cek apakah ini Matrix (pmatrix)
        if (content.includes('\\begin{pmatrix}')) {
          return renderMatrix(content, i);
        }

        return (
          <span key={i} className="mx-0.5 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-200 font-mono text-[0.95em] border border-indigo-500/40 shadow-sm inline-block my-0.5">
            {content.trim().replace(/\\/g, '')}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderMatrix = (formula: string, key: any) => {
    // A = \begin{pmatrix} 3 & 0 \\ -1 & 2 \end{pmatrix}
    const labelMatch = formula.match(/^(.*?)=\s*\\begin{pmatrix}/);
    const label = labelMatch ? labelMatch[1].trim() : '';
    
    const matrixContentMatch = formula.match(/\\begin{pmatrix}([\s\S]*?)\\end{pmatrix}/);
    if (!matrixContentMatch) return <span key={key}>{formula}</span>;
    
    const rows = matrixContentMatch[1].trim().split('\\\\');
    const matrixData = rows.map(row => row.trim().split('&').map(cell => cell.trim()));

    return (
      <div key={key} className="inline-flex items-center gap-2 my-2 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl shadow-inner overflow-x-auto max-w-full">
        {label && <span className="font-black text-indigo-300 mr-1 shrink-0">{label} =</span>}
        <div className="relative px-3 py-2 flex items-center shrink-0">
          <div className="absolute left-0 top-0 bottom-0 w-2.5 border-l-2 border-t-2 border-b-2 border-indigo-400 rounded-l-xl" />
          <div className="flex flex-col gap-3 min-w-[60px]">
            {matrixData.map((row, rIdx) => (
              <div key={rIdx} className="flex justify-around gap-6 px-2">
                {row.map((cell, cIdx) => (
                  <span key={cIdx} className="font-mono text-white text-sm md:text-base font-bold min-w-[24px] text-center">{cell}</span>
                ))}
              </div>
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-2.5 border-r-2 border-t-2 border-b-2 border-indigo-400 rounded-r-xl" />
        </div>
      </div>
    );
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userText = input.trim();
    const userImage = selectedImage;

    setMessages(prev => [...prev, { role: 'user', text: userText, image: userImage || undefined }]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText, imageBase64: userImage, mode: 'chat' })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'model', text: data.text }]);
      } else {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'model', text: `❌ Waduh: ${data.error || 'Server sibuk'}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: '❌ Jaringan terputus. Coba lagi ya!' }]);
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
    <div className="flex flex-col h-screen bg-[#0f172a] text-slate-200 overflow-x-hidden">
      <Navbar />
      
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 pt-4 md:pt-24 pb-4 px-4 sticky top-0 z-10 shadow-lg">
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
              <h1 className="text-sm md:text-xl font-black text-white flex items-center gap-2">AsistenKu <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" /></h1>
              <p className="text-[8px] md:text-xs text-indigo-300 font-bold tracking-widest uppercase">Tutor AI Matematika</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link 
              href="/asistenku/nobrol"
              className="flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full font-black text-[9px] md:text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-400/30"
            >
              <Mic className="w-3 h-3 md:w-4 md:h-4" />
              Nobrol
            </Link>

            <button 
              onClick={() => setShowDeleteModal(true)}
              className="p-2 md:p-3 text-slate-500 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </header>

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
              
              <div className={`max-w-[90%] md:max-w-[80%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.image && (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl max-w-full md:max-w-sm">
                    <img src={msg.image} alt="Upload" className="w-full h-auto object-contain" />
                  </div>
                )}
                {msg.text && (
                  <div className={`p-3 md:p-5 rounded-2xl md:rounded-3xl shadow-xl border ${
                    msg.role === 'user' ? 'bg-blue-600 text-white border-blue-500/50' : 'bg-slate-800/80 text-slate-200 border-slate-700/50 backdrop-blur-sm'
                  }`}>
                    {renderMessage(msg.text, msg.role === 'user')}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg animate-pulse">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="bg-slate-800 p-4 rounded-3xl border border-slate-700/50 flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                <span className="text-slate-400 italic text-sm font-medium">AsistenKu sedang mengetik...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 p-3 md:p-4 pb-20 md:pb-4">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {selectedImage && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mb-4 relative inline-block">
                <div className="relative rounded-xl overflow-hidden border-2 border-indigo-500 w-32 h-32 bg-slate-800">
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                  <button onClick={() => setSelectedImage(null)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600"><X className="w-4 h-4" /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-1 md:gap-2 bg-slate-800 p-1.5 md:p-2 rounded-2xl md:rounded-3xl border border-slate-700 shadow-xl focus-within:border-indigo-500 transition-colors">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleImageSelect} />
            <button onClick={() => cameraInputRef.current?.click()} className="p-2 md:p-3 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-full transition-all shrink-0"><Camera className="w-5 h-5 md:w-6 md:h-6" /></button>
            <button onClick={() => fileInputRef.current?.click()} className="p-2 md:p-3 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-full transition-all shrink-0"><ImagePlus className="w-5 h-5 md:w-6 md:h-6" /></button>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} onPaste={handlePaste} placeholder="Ketik soal atau paste gambar (Ctrl+V) di sini..." className="flex-1 max-h-32 min-h-[40px] bg-transparent text-white placeholder-slate-400 border-none focus:ring-0 resize-none py-2.5 px-2 outline-none w-full" rows={1} />
            <button onClick={handleSend} disabled={(!input.trim() && !selectedImage) || isLoading} className="p-2.5 md:p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-all shrink-0 disabled:opacity-50"><Send className="w-4 h-4 md:w-5 md:h-5 ml-1" /></button>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Hapus Riwayat?</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Semua pesan dan riwayat belajarmu dengan AsistenKu akan dihapus permanen. Kamu yakin?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold transition-all active:scale-95"
                >
                  Batal
                </button>
                <button
                  onClick={clearHistory}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
