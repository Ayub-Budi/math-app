'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Brain, Star, Heart, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useGameProgress } from '@/components/useGameProgress';

export default function EquationGamePage() {
  const [levels, setLevels] = useState<any[]>([]);
  const [localLevelIndex, setLocalLevelIndex] = useState(0);
  const [placedValue, setPlacedValue] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const { currentLevel, hearts, deductHeart, addGamePoints, saveProgress, loading, renderTitleModal, handleGlobalReset, resetThisGame, isGameFinished, MAX_LEVEL, totalXp, gamePoints } = useGameProgress('equation-game');

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

  const handleDrop = async (val: number) => {
    if (hearts <= 0 || isCorrect !== null) return;

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
      await deductHeart(); // Kurangi nyawa di DB
      setTimeout(() => {
        setPlacedValue(null);
        setIsCorrect(null);
      }, 1000);
    }
  };

  if (loading || !currentLevelData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-900 text-white">
        <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xl font-bold italic tracking-widest">MENYIAPKAN TIMBANGAN AI...</p>
      </div>
    );
  }

  if (hearts <= 0) {
    return (
      <div className="min-h-screen bg-emerald-900 text-white p-6 flex flex-col items-center justify-center text-center">
        <XCircle className="w-24 h-24 text-red-500 mb-6" />
        <h1 className="text-4xl font-black mb-4">NYAWA HABIS!</h1>
        <p className="text-emerald-300 text-xl mb-8 max-w-md">
          Kamu sudah berjuang keras! Istirahat dulu, nyawa akan kembali penuh besok.
        </p>
        <Link href="/games" className="bg-white text-emerald-900 px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
          KEMBALI KE MENU
        </Link>
        {process.env.NODE_ENV === 'development' && (
          <button 
            onClick={handleGlobalReset}
            className="mt-8 text-emerald-400 hover:text-white text-sm font-bold underline transition-colors"
          >
            Hapus Semua Progres & Isi Ulang Nyawa (Dev Mode)
          </button>
        )}
      </div>
    );
  }

  if (isGameFinished) {
    return (
      <div className="min-h-screen bg-emerald-900 text-white p-6 flex flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
          <Star className="w-24 h-24 text-yellow-400 mb-6 fill-current" />
          <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter">MISI SELESAI! 🏆</h1>
          <p className="text-emerald-300 text-xl mb-10 max-w-sm">
            Selamat! Kamu telah menamatkan Equation Game level {MAX_LEVEL}. Kamu adalah ahli matematika sejati!
          </p>
          <div className="flex flex-col gap-4">
            <Link href="/games" className="bg-white text-emerald-900 px-12 py-4 rounded-2xl font-black text-xl transition-all hover:scale-105 shadow-2xl">
              KEMBALI KE MENU
            </Link>
            <button 
              onClick={resetThisGame}
              className="text-emerald-400 hover:text-white text-sm font-bold underline transition-colors"
            >
              Mulai Lagi dari Level 1
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (hearts <= 0) {
    return (
      <div className="min-h-screen bg-emerald-950 text-white p-6 flex flex-col items-center justify-center text-center">
        <XCircle className="w-24 h-24 text-red-500 mb-6" />
        <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter text-emerald-400">Energi Habis</h1>
        <p className="text-emerald-300 text-xl mb-10 max-w-sm">Nyawa harianmu telah habis. Istirahatlah sejenak atau tukar poin di Dashboard!</p>
        <Link href="/games" className="bg-emerald-500 text-emerald-950 px-12 py-4 rounded-full font-black text-xl transition-all hover:scale-105 shadow-xl">
          KEMBALI KE MENU
        </Link>
        {process.env.NODE_ENV === 'development' && (
          <button 
            onClick={handleGlobalReset}
            className="mt-8 text-emerald-400 hover:text-white text-sm font-bold underline transition-colors"
          >
            Hapus Semua Progres & Isi Ulang Nyawa (Dev Mode)
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-900 text-white p-6 flex flex-col items-center">
      {renderTitleModal()}
      
      <header className="w-full max-w-4xl flex items-center justify-between mb-12">
        <Link href="/games" className="flex items-center gap-2 text-emerald-300 hover:text-white font-bold">
          <ArrowLeft className="w-5 h-5" /> Kembali
        </Link>
        <div className="flex items-center gap-4">
          <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-full font-black shadow-lg border border-red-500/30 flex items-center gap-2">
            <Heart className="w-5 h-5 fill-current" />
            {hearts}
          </div>
          <div className="bg-emerald-800 text-emerald-200 px-6 py-2 rounded-full font-black shadow-lg">
            LEVEL: {currentLevel}
          </div>
        </div>
        <div className="bg-yellow-400 text-emerald-900 px-6 py-2 rounded-full font-black shadow-lg">
          POIN: {gamePoints}
        </div>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center gap-16">
        <div className="bg-white/10 p-12 rounded-[4rem] backdrop-blur-xl border border-white/20 shadow-2xl flex items-center gap-8 text-6xl font-black">
          <div className={`
            w-32 h-32 rounded-3xl border-4 border-dashed flex items-center justify-center transition-all
            ${placedValue !== null ? (isCorrect ? 'bg-green-500 border-green-300 scale-110' : 'bg-red-500 border-red-300 shake') : 'bg-white/5 border-white/20'}
          `}>
            {placedValue ?? '?'}
          </div>
          
          <span className="text-emerald-400">{currentLevelData.operator}</span>
          
          <div className="w-32 h-32 bg-white/20 rounded-3xl flex items-center justify-center shadow-inner">
            {currentLevelData.base}
          </div>
          
          <span className="text-emerald-400">=</span>
          
          <div className="w-32 h-32 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-xl">
            {currentLevelData.target}
          </div>
        </div>

        <div className="flex gap-6 mt-8">
          {currentLevelData.options?.map((val: number) => (
            <motion.div
              key={val}
              drag
              dragSnapToOrigin
              onDragEnd={() => handleDrop(val)}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileDrag={{ scale: 1.2, zIndex: 50 }}
              className="w-24 h-24 bg-white text-emerald-900 rounded-2xl flex items-center justify-center text-3xl font-bold cursor-grab active:cursor-grabbing shadow-xl border-b-8 border-gray-200"
            >
              {val}
            </motion.div>
          ))}
        </div>

        <p className="text-emerald-300 font-medium animate-pulse">
          Tarik angka yang tepat ke dalam kotak tanda tanya!
        </p>
      </main>
    </div>
  );
}
