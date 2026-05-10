'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Unlock, Lock, Zap, Delete, Heart, XCircle, Trophy } from 'lucide-react';
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

  // Fungsi pembuat pola
  const generatePattern = (lvl: number): PatternLevel => {
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
  };

  const startLevel = (lvl: number) => {
    setCurrentPattern(generatePattern(lvl));
    setInputVal('');
    setIsUnlocked(false);
    setIsError(false);
  };

  useEffect(() => {
    if (currentLevel) startLevel(currentLevel);
  }, [currentLevel]);

  const handleKeypad = (num: string) => {
    if (inputVal.length < 5) {
      setInputVal(prev => prev + num);
      setIsError(false);
    }
  };

  const handleBackspace = () => {
    setInputVal(prev => prev.slice(0, -1));
    setIsError(false);
  };

  const submitAnswer = async () => {
    if (!currentPattern || hearts <= 0) return;
    
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
      <div className="min-h-screen bg-slate-950 text-cyan-400 flex flex-col items-center justify-center font-mono">
        <Zap className="w-16 h-16 animate-pulse mb-4" />
        <p className="text-xl tracking-widest">DECRYPTING SECURITY LAYERS...</p>
      </div>
    );
  }

  if (hearts <= 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-cyan-50 p-6 flex flex-col items-center justify-center text-center font-mono relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <XCircle className="w-24 h-24 text-red-500 mb-6 z-10" />
        <h1 className="text-5xl font-black mb-4 text-white z-10 uppercase tracking-tighter">System Locked</h1>
        <p className="text-red-400 text-xl mb-10 max-w-sm z-10">Nyawa harian Anda telah habis. Akses ke Vault telah diblokir secara otomatis oleh sistem keamanan pusat.</p>
        <Link href="/games" className="bg-cyan-600 text-slate-950 px-12 py-4 rounded-xl font-black text-xl transition-all hover:scale-105 z-10 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
          REBOOT SYSTEM
        </Link>
        {process.env.NODE_ENV === 'development' && (
          <button 
            onClick={handleGlobalReset}
            className="mt-8 text-red-500 hover:text-white text-sm font-bold underline transition-colors z-10"
          >
            Hapus Semua Progres & Isi Ulang Nyawa (Dev Mode)
          </button>
        )}
      </div>
    );
  }

  if (isGameFinished) {
    return (
      <div className="min-h-screen bg-slate-950 text-cyan-50 p-6 flex flex-col items-center justify-center text-center font-mono relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <Trophy className="w-24 h-24 text-yellow-400 mb-6 z-10 shadow-[0_0_50px_rgba(250,204,21,0.3)]" />
        <h1 className="text-5xl font-black mb-4 text-white z-10 uppercase tracking-tighter">VAULT DECRYPTED 🔓</h1>
        <p className="text-cyan-400 text-xl mb-10 max-w-md z-10">Luar biasa! Kamu telah memecahkan semua lapisan keamanan hingga level {MAX_LEVEL}. Akses penuh telah diberikan.</p>
        <div className="flex flex-col gap-4 z-10">
          <Link href="/games" className="bg-cyan-600 text-slate-950 px-12 py-4 rounded-xl font-black text-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
            KEMBALI KE MENU
          </Link>
          <button 
            onClick={resetThisGame}
            className="text-slate-500 hover:text-cyan-400 text-sm font-bold underline transition-colors"
          >
            Reset Enkripsi (Mulai Level 1)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-cyan-50 p-6 flex flex-col items-center justify-center relative font-mono overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950 pointer-events-none" />

      <header className="w-full max-w-4xl flex items-center justify-between mb-8 z-10 absolute top-6 px-6">
        <Link href="/games" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-200 font-bold bg-slate-900/80 px-4 py-2 rounded-lg border border-cyan-900 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5" /> KELUAR
        </Link>
        <div className="bg-slate-900/80 px-6 py-2 rounded-lg border border-cyan-900 text-cyan-400 font-black flex items-center gap-4">
          <div className="flex items-center gap-2 text-red-500">
            <Heart className="w-5 h-5 fill-current" />
            <span>{hearts}</span>
          </div>
          <span className="text-slate-600">|</span>
          <span>LEVEL: {currentLevel}</span>
          <span className="text-slate-600">|</span>
          <span className="text-yellow-400">POIN: {gamePoints}</span>
        </div>
      </header>

      <main className="w-full max-w-2xl flex flex-col items-center gap-8 z-10 mt-16">
        <motion.div 
          animate={isUnlocked ? { scale: [1, 1.05, 1], borderColor: '#22c55e' } : isError ? { x: [-10, 10, -10, 10, 0], borderColor: '#ef4444' } : {}}
          transition={{ duration: 0.4 }}
          className={`w-full bg-slate-900 border-2 rounded-2xl p-8 shadow-2xl relative overflow-hidden
            ${isUnlocked ? 'border-green-500 shadow-green-500/20' : isError ? 'border-red-500 shadow-red-500/20' : 'border-cyan-500 shadow-cyan-500/20'}
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[200%] animate-[scan_4s_linear_infinite] pointer-events-none" />

          <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              {isUnlocked ? <Unlock className="w-8 h-8 text-green-500" /> : <Lock className="w-8 h-8 text-cyan-500" />}
              <span className="text-xl font-black tracking-[0.3em] text-slate-400">VAULT_0{currentLevel}</span>
            </div>
            <Zap className={`w-6 h-6 ${isUnlocked ? 'text-green-500' : 'text-cyan-600 animate-pulse'}`} />
          </div>

          <div className="text-center mb-10">
            <p className="text-cyan-600 text-sm mb-4 tracking-widest uppercase">Pecahkan Deret Keamanan:</p>
            <div className="flex justify-center items-center gap-2 md:gap-6 text-3xl md:text-5xl font-black">
              {currentPattern?.sequence.map((num, i) => (
                <span key={i} className="text-slate-200">{num}</span>
              ))}
              <span className="text-slate-600">,</span>
              <motion.span 
                animate={isUnlocked ? { color: '#22c55e', scale: 1.2 } : {}}
                className={`w-20 md:w-32 h-16 md:h-20 border-b-4 flex items-center justify-center
                  ${isUnlocked ? 'border-green-500 text-green-500' : isError ? 'border-red-500 text-red-500' : 'border-cyan-500 text-cyan-400'}
                `}
              >
                {isUnlocked ? currentPattern?.answer : (inputVal || '?')}
              </motion.span>
            </div>
          </div>

          <div className="h-8 flex justify-center items-center">
            <AnimatePresence mode="wait">
              {isUnlocked ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-green-500 font-bold tracking-widest">
                  ACCESS GRANTED - MEMUAT VAULT BERIKUTNYA...
                </motion.div>
              ) : isError ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-500 font-bold tracking-widest">
                  ACCESS DENIED - POLA TIDAK COCOK!
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-cyan-600 font-medium tracking-widest animate-pulse text-sm">
                  AWAITING INPUT...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleKeypad(num.toString())}
              disabled={isUnlocked}
              className="bg-slate-900 border border-slate-700 hover:border-cyan-400 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 font-black text-2xl py-4 rounded-xl transition-colors active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleBackspace}
            disabled={isUnlocked || inputVal.length === 0}
            className="bg-slate-900 border border-slate-700 hover:border-red-400 hover:bg-red-900/20 text-slate-400 hover:text-red-400 flex items-center justify-center py-4 rounded-xl transition-colors active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Delete className="w-8 h-8" />
          </button>
          <button
            onClick={() => handleKeypad('0')}
            disabled={isUnlocked}
            className="bg-slate-900 border border-slate-700 hover:border-cyan-400 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 font-black text-2xl py-4 rounded-xl transition-colors active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            0
          </button>
          <button
            onClick={submitAnswer}
            disabled={isUnlocked || inputVal.length === 0}
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xl py-4 rounded-xl transition-colors active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            ENTER
          </button>
        </div>
      </main>

      {renderTitleModal()}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}} />
    </div>
  );
}
