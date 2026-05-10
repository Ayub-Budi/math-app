'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, ArrowRight, Zap, Target, BookOpen, Crown, Battery, ShieldAlert, Heart, Info, CheckCircle2, XCircle, Flame, ChevronRight, Gamepad2, Lock, Play, Bot, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { curriculum } from '@/lib/topics';

export default function HomePage() {
  const [totalXp, setTotalXp] = useState(0);
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [recommendedTopics, setRecommendedTopics] = useState<any[]>([]);
  const [level, setLevel] = useState(1);
  const [userName, setUserName] = useState("Petualang");
  const [streak, setStreak] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const [gamePoints, setGamePoints] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [isExchanging, setIsExchanging] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    setIsMounted(true);
    let userId = localStorage.getItem('userId');
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);

    if (!userId) {
      userId = 'guest_' + Math.random().toString(36).substring(7);
      localStorage.setItem('userId', userId);
    }

    const fetchProgress = async () => {
      try {
        const userRes = await fetch(`/api/user?userId=${userId}`);
        if (userRes.ok) {
          const dbUser = await userRes.json();
          if (dbUser.name) setUserName(dbUser.name);
          setStreak(dbUser.streak || 0);
          setTotalXp(dbUser.totalXp || 0);
          setGamePoints(dbUser.gamePoints || 0);
          setHearts(dbUser.health || 0);
          
          const currentLevel = Math.floor((dbUser.totalXp || 0) / 500) + 1;
          setLevel(currentLevel);
        }

        const res = await fetch(`/api/learning/progress?userId=${userId}`);
        const data = await res.json();
        
        const map: Record<string, boolean> = {};

        if (Array.isArray(data)) {
          data.forEach((item) => {
            if (item.isCompleted) {
              map[item.topicId] = true;
            }
          });
        }
        
        setCompletedTopics(map);

        const recommendations = [];
        for (const cat of curriculum) {
          const nextTopic = cat.topics.find(t => !map[t.id]);
          if (nextTopic) {
            recommendations.push({
              categoryId: cat.id,
              categoryTitle: cat.title,
              ...nextTopic,
              status: 'current'
            });
          }
          if (recommendations.length >= 4) break;
        }

        setRecommendedTopics(recommendations);
      } catch (err) {
        console.error("Gagal load progres:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const handleExchange = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId || isExchanging) return;

    if (gamePoints < 100) {
      showToast("Poin tidak cukup! Butuh 100 poin untuk 1 Nyawa.", 'error');
      return;
    }

    setIsExchanging(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, exchangePointsForHealth: true })
      });
      
      if (res.ok) {
        const data = await res.json();
        setGamePoints(data.gamePoints);
        setHearts(data.health);
        showToast("Berhasil menukar 100 poin dengan 1 Nyawa! ❤️", 'success');
      } else {
        const data = await res.json();
        showToast(data.error || "Gagal menukar poin.", 'error');
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan jaringan.", 'error');
    } finally {
      setIsExchanging(false);
    }
  };

  const xpProgress = totalXp % 500;
  const xpPercent = (xpProgress / 500) * 100;

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-24 md:pt-0 relative">
      <Navbar />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-3 whitespace-nowrap border ${
              toast.type === 'success' 
                ? 'bg-green-500/90 text-white border-green-400' 
                : 'bg-red-500/90 text-white border-red-400'
            }`}
            style={{ backdropFilter: 'blur(8px)' }}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-900/40 to-[#0f172a] pt-24 pb-16 px-4">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-blue-600 rounded-full blur-[100px]" />
        </div>

        <main className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center md:text-left"
            >
              <h4 className="text-indigo-400 font-black tracking-[0.2em] uppercase text-sm mb-3">Pusat Komando</h4>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">
                Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{userName}!</span> 🚀
              </h1>
              <p className="text-slate-400 text-lg max-w-md">
                Kumpulkan EXP dari belajar untuk naik level, dan Poin Game untuk isi nyawa!
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-700/50 shadow-2xl min-w-[320px]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                    <Trophy className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="font-black text-xl text-white">LEVEL {level}</span>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{xpProgress} / 500 XP</span>
              </div>
              
              <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700 p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full relative shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
                </motion.div>
              </div>
              <p className="text-[10px] text-slate-500 mt-3 text-center font-bold tracking-widest uppercase italic">Hanya kuis & materi yang menambah EXP!</p>
            </motion.div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { label: 'Total XP', value: totalXp, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
              { label: 'Game Points', value: gamePoints, icon: Star, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
              { label: 'Streak', value: streak, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { label: 'Nyawa', value: hearts, icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-800/30 backdrop-blur-md p-6 rounded-3xl border border-slate-700/30 flex flex-col items-center text-center group hover:bg-slate-800/50 transition-colors"
              >
                <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <h4 className="text-3xl font-black text-white mb-1 tracking-tighter">{stat.value}</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </main>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Progress & AsistenKu Section */}
          <div className="lg:col-span-2 space-y-12">
            {/* AsistenKu Banner */}
            <section>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-8 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />
                
                <div className="relative z-10 flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-sm border border-white/10">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    Baru! AI Tutor
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">Ada PR yang susah?</h2>
                  <p className="text-indigo-100 text-lg">Foto soalnya dan tanyakan langsung ke <strong className="text-white">AsistenKu</strong>. Tersedia 24/7!</p>
                </div>
                
                <div className="relative z-10 shrink-0">
                  <Link href="/asistenku" className="group/btn relative inline-flex items-center justify-center">
                    <div className="absolute inset-0 bg-white rounded-2xl blur group-hover/btn:blur-md transition-all duration-300 opacity-50" />
                    <div className="relative bg-white text-indigo-600 font-black px-8 py-5 rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl">
                      TANYA SEKARANG
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 group-hover/btn:translate-x-1 transition-transform">
                        <Bot className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                    <Star className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Peta Kurikulum</h2>
                </div>
                <Link href="/belajar" className="text-indigo-400 hover:text-white text-sm font-bold flex items-center gap-1 transition-colors">
                  LIHAT SEMUA <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-6">
                {curriculum.map((cat, index) => {
                  const totalTopics = cat.topics.length;
                  const doneTopics = cat.topics.filter(t => completedTopics[t.id]).length;
                  const percent = Math.round((doneTopics / totalTopics) * 100);
                  
                  const gradients = [
                    'from-indigo-500 to-blue-500',
                    'from-purple-600 to-pink-500',
                    'from-orange-500 to-amber-500',
                    'from-emerald-600 to-green-500'
                  ];
                  
                  return (
                    <motion.div 
                      key={cat.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-800/20 rounded-[2rem] p-8 border border-slate-700/30 hover:border-slate-600/50 transition-all group"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradients[index % 4]} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-black text-white text-xl tracking-tight">{cat.title}</h4>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{doneTopics} / {totalTopics} Bab Selesai</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-3xl font-black text-white leading-none">{percent}%</span>
                        </div>
                      </div>
                      
                      <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 1.5, ease: "circOut" }}
                          className={`h-full rounded-full bg-gradient-to-r ${gradients[index % 4]}`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Quick Access Side Bar */}
          <div className="space-y-12">
            {/* Exchange Section */}
            <section className="bg-gradient-to-br from-red-600 to-rose-700 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <Flame className="w-7 h-7 text-white fill-current" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Pasokan Nyawa</h3>
                  <p className="text-red-100 text-[10px] font-bold uppercase tracking-widest">Tukar Poin Game</p>
                </div>
              </div>
              
              <div className="bg-black/20 backdrop-blur-md p-4 rounded-2xl mb-6 border border-white/10 relative z-10">
                <div className="flex justify-between items-center text-white mb-2">
                  <span className="text-xs font-bold">Saldo Poin</span>
                  <span className="font-black">{gamePoints} ✨</span>
                </div>
                <div className="flex justify-between items-center text-red-100 text-[10px] font-bold uppercase tracking-widest">
                  <span>Biaya: 100 Poin</span>
                  <span>Hasil: +1 Nyawa</span>
                </div>
              </div>

              <button 
                onClick={handleExchange}
                disabled={isExchanging}
                className={`w-full font-black py-4 rounded-xl transition-all shadow-xl relative z-10 flex items-center justify-center gap-2 ${
                  gamePoints < 100 
                    ? 'bg-red-900/50 text-red-300 border border-red-500/30 hover:scale-[1.02] active:scale-95' 
                    : 'bg-white text-red-600 hover:scale-105 active:scale-95'
                }`}
              >
                {isExchanging ? "MEMPROSES..." : "TUKAR SEKARANG 💖"}
              </button>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                  <Gamepad2 className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Game Cepat</h2>
              </div>

              <div className="grid gap-4">
                {[
                  { name: 'Equation Game', color: 'bg-emerald-600', href: '/games/equation-game' },
                  { name: 'Math Invaders', color: 'bg-red-600', href: '/games/invaders' },
                  { name: 'Pattern Breaker', color: 'bg-cyan-600', href: '/games/pattern-breaker' }
                ].map((game) => (
                  <Link key={game.name} href={game.href}>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl flex items-center justify-between hover:bg-slate-700/50 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${game.color} animate-pulse`} />
                        <span className="font-bold text-white group-hover:translate-x-1 transition-transform">{game.name}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}
