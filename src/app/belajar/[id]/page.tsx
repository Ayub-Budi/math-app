'use client';

import { use, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle, Lock, PlayCircle, Star, Brain } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getCategoryById } from '@/lib/topics';

export default function CategoryTopicsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const categoryId = resolvedParams.id;
  const category = getCategoryById(categoryId);
  
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'guest_' + Math.random().toString(36).substring(7);
      localStorage.setItem('userId', userId);
    }

    fetch(`/api/learning/progress?userId=${userId}&categoryId=${categoryId}`)
      .then(res => res.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          const map: Record<string, boolean> = {};
          data.forEach(item => {
            if (item.isCompleted) {
              map[item.topicId] = true;
            }
          });
          setCompletedTopics(map);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal load progres:", err);
        setLoading(false);
      });
  }, [categoryId]);

  if (!category) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-8 text-center">
        <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl">
          <Brain className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Misi Tidak Ditemukan</h1>
          <p className="text-slate-400 mb-8 max-w-xs mx-auto">Neural database kami tidak menemukan data untuk kategori ini.</p>
          <Link href="/belajar" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-500 transition-all shadow-xl">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Akademi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] right-[-10%] w-[50%] h-[50%] ${category.color} opacity-5 rounded-full blur-[120px] animate-pulse`} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-16 relative z-10">
        <header className="mb-8 md:mb-16 mt-16 md:mt-0">
          <div className="flex justify-center md:justify-start mb-6">
            <Link href="/belajar" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-400 font-black uppercase text-[8px] md:text-[9px] tracking-[0.1em] transition-all group">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1.5 transition-transform" /> Kembali ke Akademi
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="relative group shrink-0">
              <div className={`absolute -inset-4 ${category.color} opacity-10 blur-2xl rounded-full group-hover:opacity-30 transition-opacity duration-1000`} />
              <div className={`relative w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-3xl ${category.color} text-white shadow-2xl border border-white/20 flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-500`}>
                <BookOpen className="w-8 h-8 md:w-16 md:h-16" />
              </div>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                    {category.title}
                  </h1>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-xl flex flex-col items-center md:items-end shadow-lg">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Misi Selesai</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-indigo-400">{Object.keys(completedTopics).length}</span>
                    <span className="text-slate-600 font-black text-xs">/ {category.topics.length}</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-xs md:text-lg font-medium leading-relaxed max-w-2xl">
                {category.description}
              </p>
              
              {/* Category Progress Bar */}
              <div className="mt-6 h-2 md:h-3 bg-slate-900 rounded-full border border-white/5 p-0.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(Object.keys(completedTopics).length / category.topics.length) * 100}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-6 md:space-y-12">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-lg">
              <Brain className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xs md:text-2xl font-black text-white uppercase tracking-tighter">Daftar Misi Belajar</h2>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center py-48 space-y-8">
              <div className="w-20 h-20 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-slate-600 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Menghubungkan ke Neural Data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-10">
              {category.topics.map((topic, index) => {
                const isCompleted = completedTopics[topic.id];
                const isLocked = index > 0 && !completedTopics[category.topics[index-1].id];

                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link 
                      href={isLocked ? '#' : `/belajar/${categoryId}/${topic.id}`}
                      className={`
                        group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl border transition-all duration-700 overflow-hidden
                        ${isLocked 
                          ? 'bg-slate-950/40 border-white/5 opacity-40 cursor-not-allowed' 
                          : isCompleted 
                            ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40' 
                            : 'bg-slate-900/20 border-white/5 hover:border-indigo-500/40 hover:bg-slate-900/40 shadow-2xl'}
                      `}
                    >
                      <div className="flex items-center gap-4 md:gap-5 relative z-10 mb-5 sm:mb-0 min-w-0 flex-1">
                        <div className={`
                          shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center font-black text-sm md:text-lg border-2 transition-all duration-700
                          ${isCompleted 
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg' 
                            : isLocked
                              ? 'bg-slate-900 text-slate-700 border-slate-800'
                              : 'bg-slate-950 text-indigo-400 border-slate-800 group-hover:border-indigo-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]'}
                        `}>
                          {isCompleted ? <CheckCircle className="w-5 h-5 md:w-6 md:h-6" /> : index + 1}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                             <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border ${isCompleted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : isLocked ? 'bg-slate-800 text-slate-600 border-slate-700' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                                MISSION {index + 1}
                             </span>
                             {isCompleted && <span className="text-[7px] md:text-[8px] font-black text-emerald-500 uppercase tracking-widest">DONE</span>}
                          </div>
                          <h3 className={`text-base md:text-xl font-black mb-0.5 uppercase tracking-tighter truncate ${isCompleted ? 'text-emerald-400' : isLocked ? 'text-slate-600' : 'text-white'}`}>
                            {topic.title}
                          </h3>
                          <p className="text-slate-500 text-[9px] md:text-xs font-medium line-clamp-1 group-hover:text-slate-400 transition-colors">
                            {topic.description}
                          </p>
                        </div>
                      </div>
 
                      <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-4 relative z-10 shrink-0">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest
                          ${isCompleted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : isLocked ? 'bg-slate-900 text-slate-700 border border-white/5' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 group-hover:bg-yellow-500 group-hover:text-white transition-all'}
                        `}>
                          <Star className={`w-3 h-3 md:w-3.5 md:h-3.5 ${isCompleted ? 'fill-emerald-400' : 'fill-yellow-500 group-hover:fill-white'}`} />
                          +{topic.xpReward} XP
                        </div>
                        
                        <div className={`
                          p-2 md:p-3 rounded-lg md:rounded-xl transition-all duration-700
                          ${isLocked 
                            ? 'bg-slate-900 text-slate-800 border border-white/5' 
                            : isCompleted 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-105'}
                        `}>
                          {isLocked ? <Lock className="w-4 h-4" /> : <PlayCircle className="w-4 h-4 md:w-6 md:h-6" />}
                        </div>
                      </div>
                      
                      {/* Premium Hover Background Glow */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
