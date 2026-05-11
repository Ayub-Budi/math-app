'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Brain, Star, Heart, XCircle, Trophy, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useGameProgress } from '@/components/useGameProgress';

export default function EquationGamePage() {
  const [levels, setLevels] = useState<any[]>([]);
  const [localLevelIndex, setLocalLevelIndex] = useState(0);
  const [placedValue, setPlacedValue] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const { currentLevel, hearts, deductHeart, addGamePoints, saveProgress, loading, renderTitleModal, handleGlobalReset, resetThisGame, isGameFinished, MAX_LEVEL, gamePoints } = useGameProgress('equation-game');

  const fetchQuestion = useCallback(async () => {
    const savedGrade = localStorage.getItem('userGrade') || 'SD';
    try {
      const response = await fetch(`/api/questions/equation?grade=${savedGrade}`);
      const data = await response.json();
      setLevels(data);
      setLocalLevelIndex(0);
    } catch (error) {
      console.error("Gagal mengambil level:", error);
    }
  }, []);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const currentLevelData = levels[localLevelIndex];

  const handleDrop = (val: number, info: any) => {
    if (hearts <= 0 || isCorrect !== null) return;

    // Hit detection for the '?' box
    const dropX = info.point.x;
    const dropY = info.point.y;
    const elements = document.elementsFromPoint(dropX, dropY);
    const isOverReceptacle = elements.some(el => el.id === 'receptacle');

    if (!isOverReceptacle) return;

    setPlacedValue(val);
    if (val === currentLevelData.answer) {
      addGamePoints(10);
      setIsCorrect(true);
      setScore((prev) => prev + 100);
      setTimeout(() => {
        saveProgress(currentLevel + 1);
        setPlacedValue(null);
        setIsCorrect(null);
        
        if (localLevelIndex < levels.length - 1) {
          setLocalLevelIndex(localLevelIndex + 1);
        } else {
          fetchQuestion();
        }
      }, 1500);
    } else {
      setIsCorrect(false);
      deductHeart(); 
      setTimeout(() => {
        setPlacedValue(null);
        setIsCorrect(null);
      }, 1000);
    }
  };

  if (loading || !currentLevelData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-xs font-black tracking-[0.4em] uppercase opacity-50">Menyiapkan Timbangan Neural...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center overflow-hidden selection:bg-indigo-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_20%,rgba(79,70,229,0.05)_0%,transparent_50%)]" />
      </div>

      <header className="w-full max-w-5xl flex items-center justify-between p-4 md:p-8 z-[60]">
        <Link href="/games" className="p-2.5 md:p-3 bg-slate-900/50 border border-white/5 rounded-xl md:rounded-2xl hover:bg-slate-800 transition-all group">
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-slate-500 group-hover:text-white transition-colors" />
        </Link>
        
        <div className="flex gap-1.5 md:gap-4 items-center">
           <div className="bg-slate-900/50 border border-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2">
             <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500 fill-current" />
             <span className="font-black text-xs md:text-sm">{hearts}</span>
           </div>
           <div className="hidden xs:flex bg-slate-900/50 border border-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl items-center gap-1.5 md:gap-2">
             <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-500 fill-current" />
             <span className="font-black text-xs md:text-sm">{gamePoints}</span>
           </div>
           <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-indigo-400 font-black text-[9px] md:text-[10px] uppercase tracking-widest">
             Level {currentLevel}
           </div>
        </div>
      </header>

      <main className="w-full max-w-5xl flex-1 flex flex-col items-center justify-center p-4 md:p-8 z-10 space-y-12 md:space-y-24">
        
        <AnimatePresence>
          {hearts <= 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 flex items-center justify-center bg-[#020617]/90 z-[100] p-6 backdrop-blur-xl">
              <div className="text-center max-w-sm space-y-4 md:space-y-6">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-red-500/30">
                  <XCircle className="w-10 h-10 md:w-12 md:h-12 text-red-500" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">System Offline</h2>
                <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] leading-relaxed">Energi kritis terdeteksi. Hubungkan kembali sinkronisasi.</p>
                <Link href="/games" className="block w-full bg-white text-slate-950 font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-xl transition-transform hover:scale-105 active:scale-95">REBOOT SYSTEM</Link>
              </div>
            </motion.div>
          )}

          {isGameFinished && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 flex items-center justify-center bg-[#020617]/95 z-[100] p-6 backdrop-blur-xl">
              <div className="text-center max-w-sm space-y-4 md:space-y-6">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-yellow-500/30 animate-pulse">
                  <Trophy className="w-12 h-12 md:w-16 md:h-16 text-yellow-400" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Neural Master</h2>
                <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] leading-relaxed">Semua lapisan kalkulasi telah disinkronkan ({MAX_LEVEL}).</p>
                <div className="space-y-3">
                  <Link href="/games" className="block w-full bg-white text-slate-950 font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-xl transition-transform hover:scale-105">MAIN MENU</Link>
                  <button onClick={resetThisGame} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest underline">Reset Neural Core</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Neural Balance Scale */}
        <div className="relative w-full max-w-4xl flex flex-col items-center">
          {/* Label Atas */}
          <div className="mb-6 md:mb-12 text-center space-y-1">
            <span className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em]">Neural Balance Simulation</span>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Sinkronisasi Nilai</h2>
          </div>

          <motion.div 
            animate={{ rotate: isCorrect === true ? 5 : isCorrect === false ? -5 : 0 }}
            transition={{ type: 'spring', stiffness: 60 }}
            className="relative w-full flex flex-row items-center justify-center gap-2 xs:gap-3 md:gap-16 z-20"
          >
            {/* Timbangan Kiri (Kalkulasi) */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-indigo-500/10 rounded-[3rem] blur-2xl group-hover:bg-indigo-500/20 transition-all" />
              <div className="relative flex items-center gap-2 xs:gap-3 p-3 md:p-10 rounded-2xl md:rounded-[3rem] bg-slate-900/40 backdrop-blur-3xl border border-white/10 shadow-2xl">
                {/* Scan Effect Container */}
                <div className="absolute inset-0 rounded-[3rem] overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent h-[200%] animate-[scan_3s_linear_infinite]" />
                </div>
                
                <div 
                  id="receptacle"
                  className={`
                    w-12 h-12 xs:w-14 xs:h-14 md:w-36 md:h-36 rounded-xl md:rounded-[2.5rem] border-2 md:border-4 border-dashed flex items-center justify-center transition-all duration-500 relative
                    ${placedValue !== null ? (isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.4)] scale-110' : 'bg-red-500/20 border-red-500 text-red-400 animate-shake') : 'bg-white/5 border-white/10 text-white/20'}
                    text-base md:text-6xl font-black
                  `}
                >
                  {placedValue ?? '?'}
                </div>
                <span className="text-indigo-500/50 text-sm md:text-4xl font-black">{currentLevelData.operator === '*' ? '×' : currentLevelData.operator}</span>
                <div className="w-12 h-12 xs:w-14 xs:h-14 md:w-36 md:h-36 bg-slate-800/60 border border-white/5 rounded-xl md:rounded-[2.5rem] flex items-center justify-center text-base md:text-6xl font-black text-white shadow-inner">
                  {currentLevelData.base}
                </div>
              </div>
              {/* Tali Timbangan */}
              <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-px h-20 bg-gradient-to-t from-indigo-500/50 to-transparent" />
            </div>

            {/* Pivot Point / Operator Sama Dengan */}
            <div className="relative">
              <div className="w-8 h-8 md:w-20 md:h-20 rounded-full bg-slate-950 border-2 md:border-4 border-white/5 flex items-center justify-center z-30 shadow-[0_0_50px_rgba(79,70,229,0.4)]">
                <span className="text-white text-sm md:text-4xl font-black">=</span>
              </div>
              <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-2 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent -z-10" />
            </div>

            {/* Timbangan Kanan (Target) */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-purple-500/10 rounded-[3rem] blur-2xl group-hover:bg-purple-500/20 transition-all" />
              <div className="relative p-3 md:p-10 rounded-2xl md:rounded-[3rem] bg-indigo-600/20 backdrop-blur-3xl border border-indigo-400/30 shadow-[0_0_50px_rgba(79,70,229,0.3)]">
                <div className="w-12 h-12 xs:w-14 xs:h-14 md:w-36 md:h-36 bg-indigo-600 rounded-xl md:rounded-[2.5rem] flex items-center justify-center text-base md:text-6xl font-black text-white shadow-2xl border border-indigo-400/50">
                  {currentLevelData.target}
                </div>
              </div>
              <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-px h-20 bg-gradient-to-t from-indigo-500/50 to-transparent" />
            </div>
          </motion.div>

          {/* Base of Scale Decor */}
          <div className="hidden md:block absolute bottom-0 translate-y-36 w-80 h-8 bg-slate-950 border border-white/5 rounded-[3rem] shadow-2xl" />
          <div className="hidden md:block absolute bottom-0 translate-y-12 w-3 h-56 bg-gradient-to-t from-indigo-950 via-indigo-600 to-indigo-400/20 rounded-full border border-white/5" />
        </div>

        {/* Options Dashboard */}
        <div className="w-full max-w-2xl px-4 space-y-6 md:space-y-10 z-40">
          <div className="relative p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] bg-slate-900/40 border border-white/10 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            
            <div className="flex flex-wrap justify-center gap-3 md:gap-8 mb-6">
              {currentLevelData.options?.map((val: number) => (
                <motion.div
                  key={val}
                  drag
                  dragSnapToOrigin
                  onDragEnd={(e, info) => handleDrop(val, info)}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileDrag={{ scale: 1.2, zIndex: 100, rotate: [0, -5, 5, 0] }}
                  className="w-12 h-12 xs:w-14 xs:h-14 md:w-36 md:h-36 bg-white text-slate-950 rounded-xl md:rounded-[2.5rem] flex items-center justify-center text-base md:text-6xl font-black cursor-grab active:cursor-grabbing shadow-[0_15px_30px_rgba(0,0,0,0.3)] border-b-4 md:border-b-8 border-slate-200 transition-all hover:bg-slate-50 relative group"
                >
                  <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                  {val}
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="h-1 w-12 bg-indigo-500/20 rounded-full" />
              <p className="text-[9px] md:text-[10px] text-slate-500 font-black uppercase tracking-[0.5em] animate-pulse text-center leading-relaxed">
                Sinkronisasi Neural: Pindahkan Nilai
              </p>
            </div>
          </div>
        </div>
      </main>

      {renderTitleModal()}

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
