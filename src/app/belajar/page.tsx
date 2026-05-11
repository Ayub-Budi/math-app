'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Calculator, Divide, Triangle, BarChart3 as Chart, ArrowRight, Star, Brain } from 'lucide-react';
import Link from 'next/link';
import { curriculum } from '@/lib/topics';

// Helper to map string ID to icon component
const getIcon = (id: string) => {
  switch (id) {
    case 'aritmatika': return Calculator;
    case 'aljabar': return Divide;
    case 'geometri': return Triangle;
    case 'statistika': return Chart;
    default: return Brain;
  }
};

export default function BelajarMenuPage() {
  const [userGrade, setUserGrade] = useState('SD');
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedGrade = localStorage.getItem('userGrade') || 'SD';
    setUserGrade(savedGrade);

    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'guest_' + Math.random().toString(36).substring(7);
      localStorage.setItem('userId', userId);
    }

    fetch(`/api/learning/progress?userId=${userId}`)
      .then(res => res.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          // Hitung progres (topik selesai) per kategori
          const progressMap: Record<string, number> = {};
          data.forEach(item => {
            if (item.isCompleted) {
              progressMap[item.categoryId] = (progressMap[item.categoryId] || 0) + 1;
            }
          });
          setUserProgress(progressMap);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal load progres:", err);
        setLoading(false);
      });
  }, []);

  const filteredCategories = curriculum.filter(cat => cat.grades.includes(userGrade));

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-24 md:pt-20 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Premium Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 relative z-10">
        <header className="mb-12 md:mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] md:text-xs font-black uppercase tracking-[0.4em] mb-8 shadow-lg backdrop-blur-md"
          >
            <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" /> Akademi MathQuest
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-3xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tighter uppercase leading-[0.9]"
          >
            PILIH BIDANG <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-cyan-400">ILMU NEURAL.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-slate-400 text-sm md:text-lg lg:text-xl max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Sinkronisasikan pikiranmu dengan kurikulum masa depan. Selesaikan misi untuk meraup <strong className="text-white">Academic EXP</strong>.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredCategories.map((cat, index) => {
            const Icon = getIcon(cat.id);
            const totalTopics = cat.topics.length;
            const completedTopics = userProgress[cat.id] || 0;
            const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative bg-slate-900/40 backdrop-blur-3xl rounded-xl md:rounded-2xl p-5 md:p-6 lg:p-7 border border-white/5 hover:border-indigo-500/30 transition-all duration-700 overflow-hidden shadow-xl flex flex-col h-full"
              >
                {/* Individual Card Background Glow */}
                <div className={`absolute top-0 right-0 w-64 h-64 ${cat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-1000 rounded-full blur-[100px] -mr-32 -mt-32`} />
                
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 mb-6 md:mb-8">
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl ${cat.color} text-white shadow-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500 border border-white/10`}>
                    <Icon className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl text-white px-3 py-1.5 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] border border-white/10 shadow-md">
                    Complexity: {cat.level}
                  </div>
                </div>
 
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tighter uppercase leading-none">{cat.title}</h2>
                  <p className="text-slate-500 text-[10px] md:text-xs mb-6 md:mb-8 leading-relaxed font-medium line-clamp-2 group-hover:text-slate-400 transition-colors">
                    {cat.description}
                  </p>
                </div>

                <div className="space-y-4 mt-auto">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Mastery Sync</span>
                    <span className="text-lg md:text-xl font-black text-white">{loading ? '...' : `${progressPercent}%`}</span>
                  </div>
                  
                  <div className="h-2.5 md:h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 p-0.5 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className={`h-full rounded-full ${cat.color} relative shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:15px_15px] animate-[shimmer_2s_linear_infinite]" />
                    </motion.div>
                  </div>
 
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 md:pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2">
                       <div className="w-7 h-7 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center">
                          <Brain className="w-3.5 h-3.5 text-slate-500" />
                       </div>
                       <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{completedTopics} / {totalTopics} Missions</span>
                    </div>
                    
                    <Link 
                      href={`/belajar/${cat.id}`}
                      className="w-full sm:w-auto px-5 py-2.5 md:px-6 md:py-3 bg-white text-indigo-950 rounded-lg md:rounded-xl font-black text-[9px] md:text-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg uppercase tracking-widest group/btn"
                    >
                      Mulai 
                      <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-hover/btn:translate-x-1.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
