'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCcw, Star, Timer, Play, Trophy, Heart, XCircle, CheckCircle2 } from 'lucide-react';
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-black">
        <RefreshCcw className="w-16 h-16 animate-spin mb-4 text-blue-500" />
        <p className="text-xl tracking-widest uppercase">Menyusun Angka...</p>
      </div>
    );
  }

  if (hearts <= 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center text-center">
        <XCircle className="w-24 h-24 text-red-500 mb-6" />
        <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter text-blue-400">Penyusun Lelah</h1>
        <p className="text-slate-400 text-xl mb-10 max-w-sm">Kamu kehabisan nyawa harian. Istirahatlah sejenak dan kembali besok dengan konsentrasi penuh!</p>
        <Link href="/games" className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black text-xl transition-all hover:scale-105">
          KEMBALI KE MENU
        </Link>
        {process.env.NODE_ENV === 'development' && (
          <button 
            onClick={handleGlobalReset}
            className="mt-8 text-blue-400 hover:text-white text-sm font-bold underline transition-colors"
          >
            Hapus Semua Progres & Isi Ulang Nyawa (Dev Mode)
          </button>
        )}
      </div>
    );
  }

  if (isGameFinished) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
          <Trophy className="w-24 h-24 text-blue-500 mb-6 animate-bounce" />
          <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter text-blue-400">TERURUT SEMPURNA! 📊</h1>
          <p className="text-slate-400 text-xl mb-10 max-w-md">Luar biasa! Kamu telah menguasai seni pengurutan angka hingga level {MAX_LEVEL}. Kamu adalah pakar logika!</p>
          <div className="flex flex-col gap-4">
            <Link href="/games" className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black text-xl transition-all hover:scale-105">
              KEMBALI KE MENU
            </Link>
            <button 
              onClick={resetThisGame}
              className="text-blue-400 hover:text-white text-sm font-bold underline transition-colors"
            >
              Mulai Ulang dari Level 1
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
      <header className="w-full max-w-4xl flex items-center justify-between mb-12">
        <Link href="/games" className="flex items-center gap-2 text-blue-300 hover:text-white font-bold bg-blue-900/50 px-4 py-2 rounded-full">
          <ArrowLeft className="w-5 h-5" /> Kembali
        </Link>
        <div className="flex items-center gap-4">
          <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-full font-black shadow-lg border border-red-500/30 flex items-center gap-2">
            <Heart className="w-5 h-5 fill-current" />
            {hearts}
          </div>
          <div className="bg-blue-900/80 px-6 py-2 rounded-full font-black text-blue-300 shadow-lg border border-blue-700">
            LEVEL {currentLevel}
          </div>
          <div className="bg-yellow-400 text-blue-900 px-6 py-2 rounded-full font-black shadow-lg">
            POIN: {gamePoints}
          </div>
        </div>
        <div className="bg-blue-500 text-white px-6 py-2 rounded-full font-black shadow-lg flex items-center gap-2">
          <Timer className="w-5 h-5" /> {timer}s
        </div>
      </header>

      <main className="w-full max-w-2xl">
        {!isPlaying && !isFinished ? (
          <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/10">
            <h2 className="text-4xl font-bold mb-6">Siap Mengurutkan?</h2>
            <p className="text-slate-400 mb-10">Susun angka dari yang terkecil ke terbesar secepat mungkin!</p>
            <button 
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black px-12 py-5 rounded-2xl text-xl shadow-xl transition-all flex items-center gap-3 mx-auto"
            >
              <Play className="w-6 h-6 fill-current" /> MULAI LEVEL {currentLevel}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="mb-8 text-blue-400 font-bold uppercase tracking-widest">Tarik angka untuk mengatur urutan:</p>
            
            <Reorder.Group axis="y" values={numbers} onReorder={setNumbers} className="w-full space-y-4 mb-12">
              {numbers.map((item) => (
                <Reorder.Item 
                  key={item.id} 
                  value={item}
                  className={`bg-white text-slate-900 p-6 rounded-2xl flex items-center justify-between shadow-xl cursor-grab active:cursor-grabbing border-l-8 transition-colors
                    ${isWrong ? 'border-red-500' : 'border-blue-500'}
                  `}
                >
                  <span className="text-3xl font-black">{item.value}</span>
                  <div className="flex gap-1">
                    {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />)}
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            <button
              onClick={handleSubmit}
              className={`w-full py-6 rounded-2xl font-black text-2xl shadow-2xl transition-all flex items-center justify-center gap-3
                ${isWrong ? 'bg-red-500 animate-shake' : 'bg-green-500 hover:bg-green-400'}
              `}
            >
              <CheckCircle2 className="w-8 h-8" /> SELESAI & CEK
            </button>
          </div>
        )}
      </main>

      {renderTitleModal()}

      <AnimatePresence>
        {isFinished && (
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-600 p-6"
          >
            <div className="text-center">
              <Trophy className="w-32 h-32 text-white mx-auto mb-6 animate-bounce" />
              <h2 className="text-6xl font-black mb-2 uppercase italic">Fantastis!</h2>
              <p className="text-2xl text-blue-100 mb-12 font-medium">Kamu menyelesaikan urutan dalam {timer} detik!</p>
              <div className="flex flex-col gap-4 max-w-xs mx-auto">
                <button 
                  onClick={startGame}
                  className="bg-white text-blue-600 font-black py-5 rounded-2xl text-xl shadow-2xl hover:scale-105 transition-all"
                >
                  LANJUTKAN
                </button>
                <Link href="/games" className="text-blue-100 font-bold hover:underline">
                  Kembali ke Menu
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
