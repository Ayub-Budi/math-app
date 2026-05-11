'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCcw, Star, Timer, Play, Trophy, Heart, XCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useGameProgress } from '@/components/useGameProgress';

export default function SortGamePage() {
  const [numbers, setNumbers] = useState<{ id: number; value: number }[]>([]);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [score, setScore] = useState(0);

  const { currentLevel, hearts, deductHeart, addGamePoints, saveProgress, loading, renderTitleModal, handleGlobalReset, resetThisGame, isGameFinished, MAX_LEVEL, gamePoints } = useGameProgress('sort-game');

  const generateLevel = useCallback(() => {
    const count = Math.min(10, 4 + currentLevel);
    const newNumbers = Array.from({ length: count }, () => Math.floor(Math.random() * 100));
    setNumbers(newNumbers.map((val, idx) => ({ id: idx, value: val })));
    setTimer(0);
    setIsFinished(false);
    setIsWrong(false);
  }, [currentLevel]);

  useEffect(() => {
    if (currentLevel) generateLevel();
  }, [currentLevel, generateLevel]);

  useEffect(() => {
    let interval: any;
    if (isPlaying && !isFinished) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isFinished]);

  const handleSubmit = async () => {
    if (!isPlaying || isFinished || hearts <= 0) return;

    const values = numbers.map(n => n.value);
    const sorted = [...values].sort((a, b) => a - b);
    
    if (JSON.stringify(values) === JSON.stringify(sorted)) {
      setIsFinished(true);
      setIsPlaying(false);
      const pointsEarned = Math.max(10, 50 - Math.floor(timer / 2));
      addGamePoints(pointsEarned);
      setScore(s => s + Math.max(10, 100 - timer));
      setTimeout(() => {
        saveProgress(currentLevel + 1);
      }, 2500);
    } else {
      setIsWrong(true);
      await deductHeart();
      setTimeout(() => setIsWrong(false), 1000);
    }
  };

  const startGame = () => {
    if (hearts <= 0) return;
    generateLevel();
    setIsPlaying(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-xs font-black tracking-[0.4em] uppercase opacity-50">Mengatur Angka...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center overflow-hidden selection:bg-indigo-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(79,70,229,0.05)_0%,transparent_50%)]" />
      </div>

      <header className="w-full max-w-5xl flex items-center justify-between p-4 md:p-8 z-[60]">
        <Link href="/games" className="p-3 bg-slate-900/50 border border-white/5 rounded-2xl hover:bg-slate-800 transition-all group">
          <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
        </Link>
        
        <div className="flex gap-2 md:gap-4 items-center">
           <div className="bg-slate-900/50 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-2">
             <Heart className="w-4 h-4 text-red-500 fill-current" />
             <span className="font-black text-sm">{hearts}</span>
           </div>
           <div className="hidden sm:flex bg-slate-900/50 border border-white/5 px-4 py-2 rounded-xl items-center gap-2">
             <Star className="w-4 h-4 text-yellow-500 fill-current" />
             <span className="font-black text-sm">{gamePoints}</span>
           </div>
           <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl text-indigo-400 font-black text-[10px] uppercase tracking-widest">
             Level {currentLevel}
           </div>
           <div className="bg-slate-950 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
             <Timer className="w-4 h-4 text-slate-500" />
             <span className="font-black text-sm">{timer}s</span>
           </div>
        </div>
      </header>

      <main className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center p-4 md:p-8 z-10 space-y-8 md:space-y-12">
        
        <AnimatePresence>
          {hearts <= 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 flex items-center justify-center bg-[#020617]/90 z-[100] p-6 backdrop-blur-md">
              <div className="text-center max-w-sm space-y-6">
                <XCircle className="w-20 h-20 text-red-500 mx-auto" />
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Energi Habis!</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">Konsentrasi menurun. Istirahatlah dan kembali besok.</p>
                <Link href="/games" className="block w-full bg-white text-slate-950 font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-xl">KEMBALI KE MENU</Link>
              </div>
            </motion.div>
          )}

          {isGameFinished && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 flex items-center justify-center bg-[#020617]/95 z-[100] p-6 backdrop-blur-md">
              <div className="text-center max-w-sm space-y-6">
                <Trophy className="w-20 h-20 text-yellow-400 mx-auto animate-bounce" />
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Pakar Logika!</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">Kamu telah menguasai seni pengurutan ({MAX_LEVEL}).</p>
                <div className="space-y-3">
                  <Link href="/games" className="block w-full bg-white text-slate-950 font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-xl">KEMBALI KE MENU</Link>
                  <button onClick={resetThisGame} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest underline">Mulai Lagi Level 1</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isPlaying && !isFinished && !isGameFinished ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-8 md:p-12 bg-slate-900/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">Siap Mengurutkan?</h2>
              <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest leading-relaxed">Susun angka dari terkecil ke terbesar secepat mungkin!</p>
            </div>
            <button 
              onClick={startGame}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <Play className="w-4 h-4 fill-current" /> Mulai Misi {currentLevel}
            </button>
          </motion.div>
        ) : (
          <div className="w-full flex flex-col items-center space-y-8 md:space-y-12">
            <div className="text-center space-y-2">
               <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Neural Sequence</h3>
               <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Tarik kartu untuk mengatur urutan:</p>
            </div>
            
            <Reorder.Group axis="y" values={numbers} onReorder={setNumbers} className="w-full space-y-3 md:space-y-4">
              <AnimatePresence>
                {numbers.map((item) => (
                  <Reorder.Item 
                    key={item.id} 
                    value={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`bg-slate-900/50 backdrop-blur-3xl p-5 md:p-6 rounded-2xl flex items-center justify-between shadow-xl cursor-grab active:cursor-grabbing border border-white/5 border-l-8 transition-colors
                      ${isWrong ? 'border-l-red-500 bg-red-500/5' : 'border-l-indigo-500'}
                    `}
                  >
                    <span className="text-2xl md:text-3xl font-black text-white">{item.value}</span>
                    <div className="flex flex-col gap-1.5 opacity-20 group-active:opacity-50 transition-opacity">
                      {[1,2,3].map(i => <div key={i} className="w-1 md:w-1.5 h-1 md:h-1.5 bg-white rounded-full" />)}
                    </div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>

            <button
              onClick={handleSubmit}
              className={`w-full py-5 md:py-6 rounded-2xl font-black text-sm md:text-base text-white shadow-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest
                ${isWrong ? 'bg-red-600 animate-shake' : 'bg-emerald-600 hover:bg-emerald-500'}
              `}
            >
              {isWrong ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />} 
              {isWrong ? 'Urutan Salah!' : 'Selesai & Sinkronkan'}
            </button>
          </div>
        )}
      </main>

      {/* Success Overlay */}
      <AnimatePresence>
        {isFinished && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/95 p-6 backdrop-blur-xl"
          >
            <div className="text-center space-y-8 max-w-sm">
              <Trophy className="w-24 h-24 text-yellow-400 mx-auto animate-bounce" />
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight italic">Fantastis!</h2>
                <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest">Urutan sempurna dalam {timer} detik!</p>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={startGame}
                  className="w-full bg-white text-indigo-950 font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Lanjutkan Misi
                </button>
                <Link href="/games" className="block text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest underline">
                  Kembali ke Menu
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {renderTitleModal()}
    </div>
  );
}
