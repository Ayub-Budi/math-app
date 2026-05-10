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

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <span className="text-3xl font-black tracking-tighter uppercase">MathQuest</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:block px-6 py-2 font-bold text-slate-400 hover:text-white transition-colors">Masuk</Link>
          <Link href="/register" className="px-6 py-3 font-bold bg-white text-black rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">Mulai Petualangan</Link>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-black uppercase tracking-widest mb-8"
          >
            <Sparkles className="w-4 h-4" /> Platform Edukasi Generasi Baru
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8"
          >
            BUKAN SEKADAR<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">APLIKASI BELAJAR.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            MathQuest menggabungkan kecanggihan <strong>Kecerdasan Buatan (AI)</strong> dengan keseruan <strong>Arcade Games</strong>. Kumpulkan poin, jaga nyawamu, dan taklukkan matematika!
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register" className="group relative px-10 py-5 w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-black text-lg shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-3">
              COBA SEKARANG <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. Sistem Ekonomi Ganda */}
      <section className="relative z-10 py-24 px-6 border-y border-white/5 bg-slate-900/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Sistem Ekonomi Ganda</h2>
            <p className="text-slate-400 text-lg">Belajar itu dihargai. Bermain itu ada risikonya.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[3rem] border border-slate-700 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-3xl font-black mb-3">Experience (EXP)</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">Dapatkan EXP khusus dengan membaca teori dan menyelesaikan kuis materi. EXP digunakan untuk menaikkan Level Akademik Anda.</p>
              <ul className="space-y-3 font-bold text-slate-300">
                <li className="flex items-center gap-2">✅ Zona Belajar Bebas Stres</li>
                <li className="flex items-center gap-2">✅ Tidak Memakan Nyawa</li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[3rem] border border-slate-700 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-3xl font-black mb-3">Game Points</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">Menangkan mini-games untuk meraup Poin Game. Tukarkan poin ini di Dashboard untuk membeli Nyawa cadangan!</p>
              <ul className="space-y-3 font-bold text-slate-300">
                <li className="flex items-center gap-2 text-cyan-300">💎 Mata Uang Premium</li>
                <li className="flex items-center gap-2">🛒 Dapat Dibelanjakan</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Arcade Games & Sistem Nyawa */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-black mb-8">
              <Heart className="w-5 h-5 fill-current" /> Jaga 5 Nyawamu!
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6">Arcade Games yang Menegangkan</h2>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-16">Uji refleks dan ketangkasan berhitungmu. Hati-hati, setiap jawaban yang salah akan mengurangi nyawamu secara real-time. Nyawa habis = Game Over!</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Math Invaders', desc: 'Tembak meteor persamaan jatuh sebelum menghantam markas!', color: 'from-red-600 to-orange-600' },
              { name: 'Pattern Breaker', desc: 'Retas brankas dengan memecahkan pola angka yang tersembunyi.', color: 'from-cyan-600 to-blue-600' },
              { name: 'Equation Game', desc: 'Seret dan jatuhkan angka ke timbangan agar seimbang.', color: 'from-emerald-600 to-teal-600' }
            ].map((game, i) => (
              <motion.div
                key={game.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 text-left hover:border-slate-500 transition-colors group"
              >
                <div className={`w-full h-32 rounded-2xl bg-gradient-to-br ${game.color} mb-6 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity`}>
                  <Gamepad2 className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-2">{game.name}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{game.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. AsistenKu (AI Tutor) */}
      <section className="relative z-10 py-32 px-6 border-t border-white/5 bg-gradient-to-b from-indigo-950/40 to-[#020617] overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className="w-20 h-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center mb-8 border border-indigo-500/30">
              <Bot className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-5xl font-black mb-6 leading-tight">Macet saat ngerjain PR? <br/><span className="text-indigo-400">AsistenKu</span> siap bantu.</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Ditenagai oleh Google Gemini AI, AsistenKu bukan sekadar kalkulator. Ia adalah tutor virtual yang akan memandu Anda langkah demi langkah.
            </p>
            <ul className="space-y-4 font-bold text-slate-300">
              <li className="flex items-center gap-3"><Camera className="text-indigo-400" /> Foto soal dari kameramu.</li>
              <li className="flex items-center gap-3"><Sparkles className="text-indigo-400" /> Analisis gambar yang sangat cerdas.</li>
              <li className="flex items-center gap-3"><ShieldAlert className="text-indigo-400" /> Menjelaskan proses, bukan cuma hasil akhir.</li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 w-full"
          >
            <div className="bg-slate-900 rounded-[2.5rem] p-4 border-4 border-slate-800 shadow-[0_0_50px_rgba(79,70,229,0.3)] relative transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="bg-slate-800/50 rounded-3xl p-6 h-[400px] flex flex-col justify-end gap-4">
                <div className="flex gap-3 items-end">
                  <div className="w-8 h-8 rounded-full bg-blue-600" />
                  <div className="bg-blue-600 p-4 rounded-2xl rounded-bl-sm max-w-[80%]">
                    <p className="text-sm font-medium">Bantu aku cara mengerjakan soal pecahan ini ya!</p>
                  </div>
                </div>
                <div className="flex gap-3 items-end flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></div>
                  <div className="bg-slate-700 p-4 rounded-2xl rounded-br-sm max-w-[80%]">
                    <p className="text-sm font-medium">Siap! Ayo kita samakan dulu penyebutnya ya. Coba perhatikan angka di bawah garis...</p>
                  </div>
                </div>
                
                <div className="mt-4 bg-slate-900 rounded-full py-3 px-6 flex justify-between items-center border border-slate-700">
                  <span className="text-slate-500 text-sm">Ketik pesanmu...</span>
                  <div className="flex gap-2">
                    <Camera className="w-5 h-5 text-slate-400" />
                    <ArrowRight className="w-5 h-5 text-indigo-400" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="relative z-10 py-32 px-6 text-center border-t border-white/10">
        <h2 className="text-5xl font-black mb-8">Jadi, Tunggu Apa Lagi?</h2>
        <Link href="/register" className="inline-flex items-center gap-3 px-12 py-6 bg-white text-black rounded-full font-black text-xl hover:scale-110 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.4)]">
          MULAI BELAJAR GRATIS
        </Link>
      </footer>
    </main>
  );
}
