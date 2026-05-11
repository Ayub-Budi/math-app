'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Unlock, Lock, Zap, Delete, Heart, XCircle, Trophy, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useGameProgress } from '@/components/useGameProgress';

interface PatternLevel {
  sequence: number[];
  answer: number;
  type: string;
}

export default function PatternBreakerPage() {
  const [score, setScore] = useState(0);
  const [currentPattern, setCurrentPattern] = useState<PatternLevel | null>(null);
  const [inputVal, setInputVal] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isError, setIsError] = useState(false);

  const { currentLevel, hearts, deductHeart, addGamePoints, saveProgress, loading, renderTitleModal, handleGlobalReset, resetThisGame, isGameFinished, MAX_LEVEL, gamePoints } = useGameProgress('pattern-breaker');

  const generatePattern = useCallback((lvl: number): PatternLevel => {
    const seq: number[] = [];
    let ans = 0;
    
    const types = ['aritmatika', 'geometri', 'kuadrat', 'fibonacci'];
    const maxTypeIdx = Math.min(types.length - 1, Math.floor((lvl - 1) / 3));
    const selectedType = types[Math.floor(Math.random() * (maxTypeIdx + 1))];

    if (selectedType === 'aritmatika') {
      const start = Math.floor(Math.random() * 10) + 1;
      const step = Math.floor(Math.random() * 5) + 2;
      for (let i = 0; i < 4; i++) seq.push(start + i * step);
      ans = start + 4 * step;
    } else if (selectedType === 'geometri') {
      const start = Math.floor(Math.random() * 3) + 2;
      const multiplier = Math.floor(Math.random() * 2) + 2;
      for (let i = 0; i < 4; i++) seq.push(start * Math.pow(multiplier, i));
      ans = start * Math.pow(multiplier, 4);
    } else if (selectedType === 'kuadrat') {
      const start = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < 4; i++) seq.push(Math.pow(start + i, 2));
      ans = Math.pow(start + 4, 2);
    } else {
      let a = Math.floor(Math.random() * 3) + 1;
      let b = Math.floor(Math.random() * 3) + 2;
      seq.push(a, b);
      for (let i = 2; i < 4; i++) {
        const next = seq[i-1] + seq[i-2];
        seq.push(next);
      }
      ans = seq[3] + seq[2];
    }

    return { sequence: seq, answer: ans, type: selectedType };
  }, []);

  const startLevel = useCallback((lvl: number) => {
    setCurrentPattern(generatePattern(lvl));
    setInputVal('');
    setIsUnlocked(false);
    setIsError(false);
  }, [generatePattern]);

  useEffect(() => {
    if (currentLevel) startLevel(currentLevel);
  }, [currentLevel, startLevel]);

  const handleKeypad = (num: string) => {
    if (isUnlocked) return;
    if (inputVal.length < 5) {
      setInputVal(prev => prev + num);
      setIsError(false);
    }
  };

  const handleBackspace = () => {
    if (isUnlocked) return;
    setInputVal(prev => prev.slice(0, -1));
    setIsError(false);
  };

  const submitAnswer = async () => {
    if (!currentPattern || hearts <= 0 || isUnlocked) return;
    
    if (parseInt(inputVal) === currentPattern.answer) {
      addGamePoints(25);
      setIsUnlocked(true);
      setScore(s => s + (currentLevel * 100));
      setTimeout(() => {
        saveProgress(currentLevel + 1);
      }, 2000);
    } else {
      setIsError(true);
      setInputVal('');
      await deductHeart();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
        <p className="text-xs font-black tracking-[0.4em] uppercase opacity-50">Menghapus Enkripsi Pola...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center overflow-x-hidden selection:bg-cyan-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_20%,rgba(6,182,212,0.05)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
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
           <div className="bg-cyan-500/10 border border-cyan-500/20 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-cyan-400 font-black text-[9px] md:text-[10px] uppercase tracking-widest">
             Level {currentLevel}
           </div>
        </div>
      </header>

      <main className="w-full max-w-5xl flex-1 flex flex-col items-center justify-center p-4 md:p-8 z-10 space-y-8 md:space-y-16">
        <div className="text-center space-y-2">
          <span className="text-[10px] md:text-xs font-black text-cyan-500 uppercase tracking-[0.5em]">Neural Pattern Recognition</span>
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight">Berkas Pola</h2>
          <p className="text-slate-500 text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] max-w-xl mx-auto leading-relaxed px-4">
            Pecahkan enkripsi urutan untuk membuka <span className="text-cyan-400">Vault Neural</span>.
          </p>
        </div>

        <AnimatePresence>
          {hearts <= 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 flex items-center justify-center bg-[#020617]/90 z-[100] p-6 backdrop-blur-xl">
              <div className="text-center max-w-sm space-y-6">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-red-500/30">
                  <XCircle className="w-10 h-10 md:w-12 md:h-12 text-red-500" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Akses Ditolak</h2>
                <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] leading-relaxed">Sistem terkunci akibat kegagalan enkripsi berulang.</p>
                <Link href="/games" className="block w-full bg-white text-slate-950 font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-xl">RESET TERMINAL</Link>
              </div>
            </motion.div>
          )}

          {isGameFinished && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 flex items-center justify-center bg-[#020617]/95 z-[100] p-6 backdrop-blur-xl">
              <div className="text-center max-w-sm space-y-6">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-yellow-500/30">
                  <Trophy className="w-12 h-12 md:w-16 md:h-16 text-yellow-400" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Master Dekriptor</h2>
                <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] leading-relaxed">Seluruh lapisan enkripsi telah terbuka ({MAX_LEVEL}).</p>
                <div className="space-y-3">
                  <Link href="/games" className="block w-full bg-white text-slate-950 font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-xl">MAIN MENU</Link>
                  <button onClick={resetThisGame} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest underline">Re-encrypt System</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security Terminal / Vault Area */}
        <motion.div 
          animate={isUnlocked ? { scale: [1, 1.02, 1] } : isError ? { x: [-10, 10, -10, 10, 0] } : {}}
          className={`w-full max-w-2xl bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden transition-colors duration-500
            ${isUnlocked ? 'border-emerald-500/50 shadow-emerald-500/10' : isError ? 'border-red-500/50 shadow-red-500/10' : 'border-cyan-500/30 shadow-cyan-500/10'}
          `}
        >
          {/* Laser Scan Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-[200%] animate-[scan_4s_linear_infinite] pointer-events-none" />

          <div className="flex justify-between items-center mb-8 md:mb-12 border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 md:p-4 rounded-2xl ${isUnlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                {isUnlocked ? <Unlock className="w-6 h-6 md:w-8 md:h-8" /> : <Lock className="w-6 h-6 md:w-8 md:h-8" />}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Security_Protocol</span>
                <span className="text-sm md:text-xl font-black text-slate-400 tracking-[0.2em] uppercase">VLT_0{currentLevel}</span>
              </div>
            </div>
            <Zap className={`w-5 h-5 ${isUnlocked ? 'text-emerald-400' : 'text-cyan-600 animate-pulse'}`} />
          </div>

          <div className="text-center space-y-8 md:space-y-12">
            <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6">
              {currentPattern?.sequence.map((num, i) => (
                <div key={i} className="flex items-center gap-3 md:gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black text-slate-700 uppercase mb-1">POS_{i+1}</span>
                    <span className="text-2xl md:text-5xl font-black text-white tracking-tighter">{num}</span>
                  </div>
                  {i < currentPattern.sequence.length - 1 && (
                    <div className="w-px h-8 md:h-12 bg-slate-800 rotate-[20deg] mt-4" />
                  )}
                </div>
              ))}
              <div className="w-px h-8 md:h-12 bg-slate-800 rotate-[20deg] mt-4" />
              <motion.div 
                animate={isUnlocked ? { scale: 1.1 } : {}}
                className={`min-w-[4rem] md:min-w-[8rem] h-14 md:h-24 bg-slate-950/60 rounded-2xl border-2 flex flex-col items-center justify-center transition-all px-4
                  ${isUnlocked ? 'border-emerald-500 text-emerald-400' : isError ? 'border-red-500 text-red-500' : 'border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'}
                `}
              >
                <span className="text-[8px] font-black uppercase mb-1 opacity-50">TARGET</span>
                <span className="text-2xl md:text-5xl font-black">{isUnlocked ? currentPattern?.answer : (inputVal || '?')}</span>
              </motion.div>
            </div>

            <div className="pt-4">
              <AnimatePresence mode="wait">
                {isUnlocked ? (
                  <motion.div key="win" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                    <Star className="w-3 h-3 fill-current" /> Vault Unlocked - Syncing Data
                  </motion.div>
                ) : isError ? (
                  <motion.div key="fail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em]">
                    Pattern_Mismatch - Access_Denied
                  </motion.div>
                ) : (
                  <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
                    Analyzing Pattern Sequence...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Input Terminal Keypad */}
        <div className="w-full max-w-sm px-4 space-y-4">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handleKeypad(num.toString())}
                disabled={isUnlocked}
                className="group relative bg-slate-900/50 border border-white/5 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-400 hover:text-white font-black text-xl md:text-3xl py-4 md:py-6 rounded-2xl transition-all active:scale-95 disabled:opacity-20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                {num}
              </button>
            ))}
            <button
              onClick={handleBackspace}
              disabled={isUnlocked || inputVal.length === 0}
              className="group relative bg-slate-900/50 border border-white/5 hover:border-red-500/50 hover:bg-red-500/10 text-slate-700 hover:text-red-500 flex items-center justify-center rounded-2xl transition-all active:scale-95 disabled:opacity-20"
            >
              <Delete className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <button
              onClick={() => handleKeypad('0')}
              disabled={isUnlocked}
              className="group relative bg-slate-900/50 border border-white/5 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-400 hover:text-white font-black text-xl md:text-3xl py-4 md:py-6 rounded-2xl transition-all active:scale-95 disabled:opacity-20"
            >
              0
            </button>
            <button
              onClick={submitAnswer}
              disabled={isUnlocked || inputVal.length === 0}
              className="relative bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs md:text-sm py-4 md:py-6 rounded-2xl transition-all active:scale-95 disabled:opacity-20 shadow-[0_10px_30px_rgba(6,182,212,0.3)] uppercase tracking-widest flex items-center justify-center gap-2"
            >
              Decrypt
            </button>
          </div>
        </div>
      </main>

      {renderTitleModal()}

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}
