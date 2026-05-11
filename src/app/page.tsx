'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Gamepad2, ArrowRight, Star, Sparkles, Zap, Heart, Bot, Camera, ShieldAlert } from 'lucide-react';

export default function LandingPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Premium Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] p-4 md:p-6 lg:p-8 pointer-events-none">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-8 py-3 md:py-4 bg-slate-900/40 backdrop-blur-3xl rounded-2xl md:rounded-full border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] pointer-events-auto">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <Brain className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-lg md:text-2xl font-black tracking-tighter uppercase whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">MathQuest</span>
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            <Link href="/login" className="px-3 md:px-6 py-2 font-black text-slate-400 hover:text-white transition-all text-[10px] md:text-xs uppercase tracking-[0.2em]">Log In</Link>
            <Link href="/register" className="px-4 py-2 md:px-8 md:py-3 font-black bg-white text-indigo-950 rounded-lg md:rounded-full hover:scale-105 transition-all shadow-lg active:scale-95 text-[10px] md:text-xs uppercase tracking-widest whitespace-nowrap">Join Now</Link>
          </div>
        </nav>
      </header>

      {/* 1. Hero Section */}
      <section className="relative z-10 pt-32 sm:pt-40 md:pt-48 pb-16 md:pb-32 px-6 md:px-12 text-center">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 md:px-6 md:py-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] md:text-xs font-black uppercase tracking-[0.4em] mb-8 md:mb-12"
          >
            <Sparkles className="w-3 h-3 md:w-4 md:h-4" /> Generasi Baru Pembelajaran AI
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-8 md:mb-12"
          >
            THE FUTURE<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-flow uppercase drop-shadow-[0_0_30px_rgba(129,140,248,0.3)]">OF MATH.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-slate-400 text-base md:text-xl lg:text-2xl max-w-3xl mx-auto mb-12 md:mb-16 leading-relaxed px-4 font-medium"
          >
            MathQuest menggabungkan kecanggihan <strong className="text-white">Neural AI</strong> dengan adrenalin <strong className="text-white">Arcade Games</strong>. Level up, survive, and conquer mathematics!
          </motion.p>
  
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 px-4"
          >
            <Link href="/register" className="group relative px-8 py-4 md:px-12 md:py-6 w-full sm:w-auto bg-white text-indigo-950 rounded-2xl md:rounded-3xl font-black text-sm md:text-xl shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-4 uppercase tracking-widest">
              MULAI PETUALANGAN <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. Sistem Ekonomi Ganda */}
      <section className="relative z-10 py-20 md:py-32 px-6 md:px-12 border-y border-white/5 bg-slate-950/40 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-6xl font-black mb-4 md:mb-6 uppercase tracking-tighter">Ekonomi Ganda</h2>
            <p className="text-slate-400 text-base md:text-xl font-medium tracking-tight">Belajar dihargai secara eksponensial.</p>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900/40 backdrop-blur-3xl p-8 md:p-12 lg:p-16 rounded-3xl md:rounded-[2.5rem] border border-white/5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000" />
              <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-8 md:mb-10 border border-yellow-500/30">
                <Zap className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
              </div>
              <h3 className="text-2xl md:text-4xl font-black mb-4 uppercase tracking-tighter">Academic EXP</h3>
              <p className="text-slate-400 text-sm md:text-lg mb-8 leading-relaxed font-medium">Neural learning system yang menghargai setiap progres pemahaman konsepmu.</p>
              <ul className="space-y-3 font-black text-slate-300 text-[10px] md:text-xs uppercase tracking-[0.2em]">
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Zona Belajar Tanpa Batas</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Level-up Progress Global</li>
              </ul>
            </motion.div>
 
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900/40 backdrop-blur-3xl p-8 md:p-12 lg:p-16 rounded-3xl md:rounded-[2.5rem] border border-white/5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000" />
              <div className="w-12 h-12 md:w-16 md:h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-8 md:mb-10 border border-cyan-500/30">
                <Star className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
              </div>
              <h3 className="text-2xl md:text-4xl font-black mb-4 uppercase tracking-tighter">Game Points</h3>
              <p className="text-slate-400 text-sm md:text-lg mb-8 leading-relaxed font-medium">Mini-games intens berhadiah Poin Game untuk amunisi vitalitasmu!</p>
              <ul className="space-y-3 font-black text-slate-300 text-[10px] md:text-xs uppercase tracking-[0.2em]">
                <li className="flex items-center gap-3 text-cyan-300"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Mata Uang Neural Premium</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Recharge Vitalitas ❤️</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Arcade Games & Sistem Nyawa */}
      <section className="relative z-10 py-20 md:py-32 px-6 md:px-12 text-center">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 md:mb-24"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 md:px-6 md:py-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 font-black text-[9px] md:text-xs mb-8 md:mb-12 uppercase tracking-[0.4em]">
              <Heart className="w-4 h-4 md:w-5 md:h-5 fill-current animate-pulse" /> 5 Hearts remaining
            </div>
            <h2 className="text-3xl md:text-6xl lg:text-7xl font-black mb-6 uppercase tracking-tighter leading-[0.9]">ARCADE NETWORK</h2>
            <p className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">Uji refleks neuralmu secara real-time. Hati-hati, nyawa habis = System Failure!</p>
          </motion.div>
 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {[
              { name: 'Math Invaders', desc: 'Uji kecepatan berhitungmu dengan menghancurkan meteor persamaan!', color: 'bg-gradient-to-br from-red-600 to-rose-700' },
              { name: 'Pattern Breaker', desc: 'Decoding neural yang mengasah logika enkripsi pola angkamu.', color: 'bg-gradient-to-br from-cyan-600 to-indigo-700' },
              { name: 'Equation Game', desc: 'Simulasi keseimbangan aljabar dalam lingkungan gravitasi nol.', color: 'bg-gradient-to-br from-emerald-600 to-teal-700' },
              { name: 'Jembatan Pecahan', desc: 'Konstruksi jembatan fraksional dengan manajemen material terbatas.', color: 'bg-gradient-to-br from-orange-600 to-yellow-700' },
              { name: 'Labirin Neural', desc: 'Navigasi robotik melalui koordinat matriks yang kompleks.', color: 'bg-gradient-to-br from-teal-600 to-cyan-700' },
              { name: 'Urutan Cepat', desc: 'Sinkronisasi urutan numerik dalam tekanan waktu tinggi.', color: 'bg-gradient-to-br from-blue-600 to-indigo-700' }
            ].map((game, i) => (
              <motion.div
                key={game.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-900/40 backdrop-blur-3xl p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-white/5 text-left hover:border-indigo-500/30 transition-all group cursor-pointer"
              >
                <div className={`w-full h-32 md:h-48 rounded-2xl ${game.color} mb-8 flex items-center justify-center shadow-2xl relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent_70%)]" />
                  <Gamepad2 className="w-12 h-12 md:w-16 md:h-16 text-white relative z-10 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl md:text-2xl font-black mb-3 uppercase tracking-tighter">{game.name}</h3>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium">{game.desc}</p>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 md:mt-24"
          >
             <Link href="/register" className="text-indigo-400 font-black text-xs md:text-lg uppercase tracking-[0.3em] hover:text-white transition-colors flex items-center justify-center gap-4 group">
               Lihat Seluruh Arena <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
             </Link>
          </motion.div>
        </div>
      </section>

      {/* 4. AsistenKu (AI Tutor) */}
      <section className="relative z-10 py-20 md:py-32 px-6 md:px-12 border-t border-white/5 bg-gradient-to-b from-indigo-950/20 to-[#020617] overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 md:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-8 md:mb-10 border border-indigo-500/30 mx-auto lg:mx-0 shadow-xl">
              <Bot className="w-8 h-8 md:w-10 md:h-10 text-indigo-400" />
            </div>
            <h2 className="text-3xl md:text-6xl font-black mb-6 md:mb-8 leading-[0.95] uppercase tracking-tighter">PR MACET? <br/><span className="text-indigo-400">NEURAL AI</span> SIAP.</h2>
            <p className="text-slate-400 text-base md:text-xl mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              Ditenagai oleh Google Gemini AI, <strong className="text-white">AsistenKu</strong> adalah tutor virtual langkah-demi-langkah tercanggih.
            </p>
            <ul className="space-y-4 font-black text-slate-300 text-[10px] md:text-sm uppercase tracking-[0.3em]">
              <li className="flex items-center gap-4 justify-center lg:justify-start"><Camera className="text-indigo-400 w-4 h-4 md:w-5 md:h-5" /> Scan soal via kamera.</li>
              <li className="flex items-center gap-4 justify-center lg:justify-start"><Sparkles className="text-indigo-400 w-4 h-4 md:w-5 md:h-5" /> Analisis Neural Instan.</li>
              <li className="flex items-center gap-4 justify-center lg:justify-start"><ShieldAlert className="text-indigo-400 w-4 h-4 md:w-5 md:h-5" /> Panduan Strategi Jawaban.</li>
            </ul>
          </motion.div>
 
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex-1 w-full max-w-xl"
          >
            <div className="bg-slate-900 rounded-[2.5rem] p-4 md:p-6 border-4 md:border-8 border-slate-800 shadow-2xl relative transform lg:rotate-3 lg:hover:rotate-0 transition-all duration-700">
              <div className="bg-slate-800/50 rounded-[2rem] p-6 md:p-10 h-[350px] md:h-[500px] flex flex-col justify-end gap-4 overflow-hidden">
                <div className="flex gap-3 items-end">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-600 shadow-lg" />
                  <div className="bg-blue-600 p-4 md:p-6 rounded-2xl rounded-bl-sm max-w-[85%] shadow-xl">
                    <p className="text-xs md:text-lg font-bold">Bantu aku cara mengerjakan soal pecahan ini ya!</p>
                  </div>
                </div>
                <div className="flex gap-3 items-end flex-row-reverse">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg"><Bot className="w-5 h-5 md:w-6 md:h-6 text-white" /></div>
                  <div className="bg-slate-700 p-4 md:p-6 rounded-2xl rounded-br-sm max-w-[85%] shadow-xl">
                    <p className="text-xs md:text-lg font-bold">Siap! Ayo kita samakan dulu penyebutnya ya. Perhatikan angka di bawah garis...</p>
                  </div>
                </div>
                
                <div className="mt-6 bg-slate-950 rounded-full py-3 md:py-4 px-6 md:px-10 flex justify-between items-center border border-white/5 shadow-inner">
                  <span className="text-slate-600 text-xs md:text-lg font-medium">Ketik pesan neuralmu...</span>
                  <div className="flex gap-4 md:gap-6">
                    <Camera className="w-5 h-5 md:w-8 md:h-8 text-slate-500 hover:text-white transition-colors cursor-pointer" />
                    <ArrowRight className="w-5 h-5 md:w-8 md:h-8 text-indigo-400 hover:scale-110 transition-all cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="relative z-10 py-24 md:py-48 px-6 md:px-12 text-center border-t border-white/10">
        <h2 className="text-4xl md:text-7xl lg:text-8xl font-black mb-12 md:mb-20 uppercase tracking-tighter leading-none">JOIN THE <br/>REVOLUTION.</h2>
        <Link href="/register" className="inline-flex items-center gap-4 px-10 py-5 md:px-16 md:py-8 bg-white text-indigo-950 rounded-2xl md:rounded-full font-black text-sm md:text-2xl hover:scale-105 active:scale-95 transition-all shadow-xl uppercase tracking-widest group">
          MULAI SEKARANG <ArrowRight className="w-6 h-6 md:w-10 md:h-10 group-hover:translate-x-3 transition-transform" />
        </Link>
      </footer>
    </main>
  );
}
