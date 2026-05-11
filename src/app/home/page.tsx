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
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-24 md:pt-0 relative selection:bg-indigo-500/30">
      <Navbar />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl font-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-3 whitespace-nowrap border ${
              toast.type === 'success' 
                ? 'bg-emerald-500/90 text-white border-emerald-400' 
                : 'bg-red-500/90 text-white border-red-400'
            }`}
            style={{ backdropFilter: 'blur(12px)' }}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            <span className="uppercase tracking-tight text-sm">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-900/20 to-[#020617] pt-24 md:pt-32 pb-12 md:pb-24 px-4">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <main className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-10 md:gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center lg:text-left flex-1"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[9px] md:text-xs font-black uppercase tracking-[0.3em] mb-4 md:mb-6 backdrop-blur-md">
                Pusat Komando MathQuest
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 md:mb-6 tracking-tighter leading-[0.95] uppercase">
                Halo, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-purple-400">{userName}!</span> 🚀
              </h1>
              <p className="text-slate-400 text-sm md:text-lg lg:text-xl max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
                Tingkatkan mastery-mu, kumpulkan EXP, dan jadilah legenda matematika berikutnya!
              </p>
            </motion.div>
 
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/40 backdrop-blur-3xl p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl border border-white/5 shadow-2xl w-full max-w-md relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3.1rem] md:rounded-[4.1rem] blur opacity-10 group-hover:opacity-20 transition duration-1000" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                      <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Level Progress</h4>
                      <span className="font-black text-xl md:text-2xl text-white tracking-tighter">LV. {level}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-tighter">{xpProgress} <span className="text-slate-500 text-[9px]">/ 500 XP</span></span>
                  </div>
                </div>
                
                <div className="w-full h-4 md:h-6 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full relative shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
                  </motion.div>
                </div>
                <p className="text-[9px] text-slate-600 mt-4 text-center font-black tracking-[0.3em] uppercase italic">Selesaikan misi untuk menaikkan level!</p>
              </div>
            </motion.div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-12 md:mt-20">
            {[
              { label: 'Total EXP', value: totalXp, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
              { label: 'Game Points', value: gamePoints, icon: Star, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
              { label: 'Win Streak', value: streak, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
              { label: 'Nyawa HP', value: hearts, icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-slate-900/40 backdrop-blur-2xl p-5 md:p-8 rounded-2xl md:rounded-3xl border ${stat.border} flex flex-col items-center text-center group hover:scale-[1.02] transition-all duration-500 shadow-xl`}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bg} rounded-xl md:rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform shadow-lg`}>
                  <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color} ${stat.label === 'Nyawa HP' && 'animate-pulse'}`} />
                </div>
                <h4 className="text-xl md:text-3xl font-black text-white mb-1 tracking-tighter">{stat.value}</h4>
                <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </main>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          
          {/* Progress & AsistenKu Section */}
          <div className="lg:col-span-2 space-y-12 md:space-y-24">
            {/* AsistenKu Banner */}
            <section>
              <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 lg:p-14 relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />
                
                <div className="relative z-10 flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-4 backdrop-blur-md border border-white/10">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin-slow" />
                    AI Neural Tutor Aktif
                  </div>
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter mb-3 md:mb-4 uppercase leading-[0.95]">Butuh Teman Belajar?</h2>
                  <p className="text-indigo-100 text-sm md:text-base lg:text-lg font-medium leading-relaxed max-w-xl">
                    Tanyakan apa saja, mulai dari PR sulit hingga konsep matematika yang membingungkan ke <strong className="text-white">AsistenKu</strong>.
                  </p>
                </div>
                
                <div className="relative z-10 shrink-0 w-full lg:w-auto">
                  <Link href="/asistenku" className="group/btn relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-white rounded-xl md:rounded-2xl blur-lg group-hover/btn:blur-xl transition-all duration-300 opacity-30" />
                    <div className="relative w-full lg:w-auto bg-white text-indigo-700 font-black px-8 py-4 md:px-10 md:py-5 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl text-xs md:text-lg uppercase tracking-widest">
                      Tanya Asisten
                      <Bot className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                  </Link>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-8 md:mb-12">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-500/20 rounded-xl md:rounded-2xl flex items-center justify-center border border-indigo-500/20">
                    <Star className="w-5 h-5 md:w-6 md:h-6 text-indigo-400 fill-current" />
                  </div>
                  <h2 className="text-xl md:text-4xl font-black text-white tracking-tighter uppercase">Peta Kurikulum</h2>
                </div>
                <Link href="/belajar" className="text-indigo-400 hover:text-white text-[10px] md:text-sm font-black flex items-center gap-2 transition-all uppercase tracking-[0.2em] group">
                  Eksplorasi <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                {curriculum.map((cat, index) => {
                  const totalTopics = cat.topics.length;
                  const doneTopics = cat.topics.filter(t => completedTopics[t.id]).length;
                  const percent = Math.round((doneTopics / totalTopics) * 100);
                  
                  const gradients = [
                    'from-indigo-600 to-blue-600',
                    'from-purple-700 to-pink-600',
                    'from-orange-600 to-amber-600',
                    'from-emerald-700 to-green-600'
                  ];
                  
                  return (
                    <motion.div 
                      key={cat.id} 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-900/40 backdrop-blur-2xl rounded-2xl md:rounded-3xl p-6 md:p-10 border border-white/5 hover:border-indigo-500/30 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                      
                      <div className="flex flex-col gap-5 relative z-10">
                        <div className="flex justify-between items-start">
                          <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${gradients[index % 4]} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                            <BookOpen className="w-6 h-6 md:w-8 md:h-8" />
                          </div>
                          <span className="text-2xl md:text-4xl font-black text-white/20 tracking-tighter group-hover:text-white transition-colors">{percent}%</span>
                        </div>
 
                        <div>
                          <h4 className="font-black text-white text-lg md:text-2xl tracking-tighter uppercase mb-1">{cat.title}</h4>
                          <div className="flex items-center gap-2 text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            <CheckCircle2 className={`w-3.5 h-3.5 ${percent === 100 ? 'text-emerald-500' : 'text-slate-700'}`} />
                            {doneTopics} / {totalTopics} Misi Selesai
                          </div>
                        </div>
                        
                        <div className="h-2.5 md:h-3 bg-slate-950 rounded-full overflow-hidden border border-white/5 p-0.5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className={`h-full rounded-full bg-gradient-to-r ${gradients[index % 4]} shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Quick Access Side Bar */}
          <div className="space-y-8 md:space-y-12">
            {/* Exchange Section */}
            <section className="bg-gradient-to-br from-red-600 via-rose-600 to-orange-600 p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_70%)] pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6 md:mb-8 relative z-10">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-lg">
                  <Heart className="w-6 h-6 md:w-8 md:h-8 text-white fill-current animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-none">Vitalitas</h3>
                  <p className="text-red-100 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-80">Isi Ulang Nyawa</p>
                </div>
              </div>
              
              <div className="bg-black/20 backdrop-blur-xl p-5 md:p-6 rounded-xl md:rounded-2xl mb-6 md:mb-8 border border-white/10 relative z-10">
                <div className="flex justify-between items-center text-white mb-2 md:mb-3">
                  <span className="text-[9px] md:text-xs font-black uppercase tracking-widest opacity-70">Neural Points</span>
                  <span className="font-black text-lg md:text-2xl">{gamePoints} ✨</span>
                </div>
                <div className="h-px bg-white/10 mb-3 md:mb-4" />
                <div className="flex justify-between items-center text-red-100 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em]">
                  <span>Biaya: 100</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Hasil: +1 ❤️</span>
                </div>
              </div>
 
              <button 
                onClick={handleExchange}
                disabled={isExchanging}
                className={`w-full font-black py-4 md:py-6 rounded-xl md:rounded-2xl transition-all shadow-xl relative z-10 flex items-center justify-center gap-2 text-xs md:text-lg uppercase tracking-widest ${
                  gamePoints < 100 
                    ? 'bg-red-900/40 text-red-300 border border-red-500/30 cursor-not-allowed' 
                    : 'bg-white text-red-600 hover:scale-105 hover:shadow-white/20 active:scale-95'
                }`}
              >
                {isExchanging ? "SINKRONISASI..." : "TUKAR POIN ❤️"}
              </button>
            </section>

            <section>
              <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-xl md:rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" />
                </div>
                <h2 className="text-xl md:text-4xl font-black text-white tracking-tighter uppercase">Mini Games</h2>
              </div>

              <div className="grid gap-4 md:gap-6">
                {[
                  { name: 'Equation Game', color: 'bg-emerald-500', href: '/games/equation-game', desc: 'Latihan Aljabar Cepat' },
                  { name: 'Math Invaders', color: 'bg-red-500', href: '/games/invaders', desc: 'Tembak Angka Musuh' },
                  { name: 'Pattern Breaker', color: 'bg-cyan-500', href: '/games/pattern-breaker', desc: 'Asah Logika Pola' }
                ].map((game) => (
                  <Link key={game.name} href={game.href}>
                    <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-5 md:p-6 rounded-2xl md:rounded-3xl flex items-center justify-between hover:bg-slate-800/60 hover:border-indigo-500/30 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${game.color} shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover:scale-125 transition-transform`} />
                        <div>
                          <span className="font-black text-white text-sm md:text-xl uppercase tracking-tighter block">{game.name}</span>
                          <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">{game.desc}</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
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
