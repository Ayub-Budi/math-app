'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Layers, RefreshCcw, ArrowRight, Heart, XCircle, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useGameProgress } from '@/components/useGameProgress';

interface Fraction {
  id: string;
  numerator: number;
  denominator: number;
  color: string;
  width: number; // percentage of 1 whole
}

const FRACTION_BLOCKS: Omit<Fraction, 'id'>[] = [
  { numerator: 1, denominator: 2, color: 'bg-orange-500', width: 50 },
  { numerator: 1, denominator: 3, color: 'bg-blue-500', width: 33.33 },
  { numerator: 1, denominator: 4, color: 'bg-green-500', width: 25 },
  { numerator: 1, denominator: 6, color: 'bg-purple-500', width: 16.66 },
];

export default function FractionBridgePage() {
  const [bridgePieces, setBridgePieces] = useState<Fraction[]>([]);
  const [targetLength] = useState(1);
  const [hasDeductedForOver, setHasDeductedForOver] = useState(false);

  const { currentLevel, hearts, deductHeart, addGamePoints, saveProgress, loading, renderTitleModal, handleGlobalReset, resetThisGame, isGameFinished, MAX_LEVEL, gamePoints } = useGameProgress('fraction-bridge');

  const calculateTotal = () => {
    let total = 0;
    bridgePieces.forEach(p => {
      total += p.numerator / p.denominator;
    });
    return total;
  };

  const totalCurrent = calculateTotal();
  const isComplete = Math.abs(totalCurrent - targetLength) < 0.01;
  const isOver = totalCurrent > targetLength + 0.01;

  // Handle heart deduction when bridge breaks
  useEffect(() => {
    if (isOver && !hasDeductedForOver) {
      deductHeart();
      setHasDeductedForOver(true);
    }
  }, [isOver, hasDeductedForOver, deductHeart]);

  const handleDragEnd = (e: any, info: any, block: Omit<Fraction, 'id'>) => {
    if (hearts <= 0) return;
    if (info.offset.y < -50) {
      if (isComplete || isOver) return;
      
      const newPiece: Fraction = {
        ...block,
        id: `piece-${Date.now()}-${Math.random()}`
      };
      setBridgePieces(prev => [...prev, newPiece]);
    }
  };

  const resetBridge = () => {
    setBridgePieces([]);
    setHasDeductedForOver(false);
  };

  const nextLevel = () => {
    addGamePoints(40);
    setBridgePieces([]);
    setHasDeductedForOver(false);
    saveProgress(currentLevel + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-900 text-white font-black">
        <Layers className="w-16 h-16 animate-bounce mb-4 text-orange-400" />
        <p className="text-xl tracking-widest">MEMUAT MATERIAL JEMBATAN...</p>
      </div>
    );
  }

  if (hearts <= 0) {
    return (
      <div className="min-h-screen bg-sky-950 text-white p-6 flex flex-col items-center justify-center text-center relative">
        <XCircle className="w-24 h-24 text-red-500 mb-6" />
        <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter text-orange-500">Izin Konstruksi Dicabut</h1>
        <p className="text-sky-300 text-xl mb-10 max-w-sm">Nyawa harianmu telah habis. Jembatan tidak bisa dibangun tanpa energi. Silakan kembali lagi besok!</p>
        <Link href="/games" className="bg-orange-500 text-white px-12 py-4 rounded-full font-black text-xl transition-all hover:scale-105 shadow-xl">
          KEMBALI KE MENU
        </Link>
        {process.env.NODE_ENV === 'development' && (
          <button 
            onClick={handleGlobalReset}
            className="mt-8 text-sky-400 hover:text-white text-sm font-bold underline transition-colors"
          >
            Hapus Semua Progres & Isi Ulang Nyawa (Dev Mode)
          </button>
        )}
      </div>
    );
  }

  if (isGameFinished) {
    return (
      <div className="min-h-screen bg-sky-900 text-white p-6 flex flex-col items-center justify-center text-center relative">
        <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center">
          <Trophy className="w-24 h-24 text-yellow-400 mb-6 animate-bounce" />
          <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter text-orange-400">JEMBATAN KOKOH! 🌉</h1>
          <p className="text-sky-200 text-xl mb-10 max-w-md">Luar biasa! Kamu telah menyelesaikan semua level pembangunan jembatan hingga level {MAX_LEVEL}. Kamu adalah arsitek pecahan terbaik!</p>
          <div className="flex flex-col gap-4">
            <Link href="/games" className="bg-orange-500 text-white px-12 py-4 rounded-full font-black text-xl transition-all hover:scale-105 shadow-xl">
              KEMBALI KE MENU
            </Link>
            <button 
              onClick={resetThisGame}
              className="text-sky-400 hover:text-white text-sm font-bold underline transition-colors"
            >
              Mulai Ulang dari Level 1
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-900 text-white p-6 flex flex-col items-center overflow-hidden">
      <header className="w-full max-w-5xl flex items-center justify-between mb-12">
        <Link href="/games" className="flex items-center gap-2 text-sky-300 hover:text-white font-bold bg-sky-950/50 px-4 py-2 rounded-full backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5" /> Kembali
        </Link>
        <div className="flex items-center gap-2">
          <Layers className="w-8 h-8 text-orange-400" />
          <h1 className="text-2xl font-black uppercase text-orange-300 tracking-widest hidden md:block">Jembatan Pecahan</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-full font-black shadow-lg border border-red-500/30 flex items-center gap-2">
            <Heart className="w-5 h-5 fill-current" />
            {hearts}
          </div>
          <div className="bg-sky-800 border border-sky-600 px-6 py-2 rounded-full font-black text-sky-200 shadow-lg">
            LEVEL {currentLevel}
          </div>
          <div className="bg-yellow-400 text-sky-900 px-6 py-2 rounded-full font-black shadow-lg">
            POIN: {gamePoints}
          </div>
        </div>
      </header>

      <main className="w-full max-w-5xl flex-1 flex flex-col items-center gap-8">
        <p className="text-sky-200 text-lg md:text-xl font-medium text-center max-w-2xl">
          Total panjang balok harus tepat <span className="font-black text-orange-400">1 utuh</span>! Hati-hati, jika kelebihan jembatan akan retak dan nyawamu berkurang.
        </p>

        <div className="w-full h-48 mt-12 relative flex items-end">
          <div className="w-24 md:w-48 h-full bg-emerald-800 border-t-8 border-emerald-600 rounded-tr-3xl relative">
            <div className="absolute bottom-full mb-2 left-4 md:left-12">
              <motion.div 
                animate={isComplete ? { x: 'calc(100vw - 200px)' } : { x: 0 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-yellow-200 z-20"
              >
                😎
              </motion.div>
            </div>
          </div>

          <div className="flex-1 h-full border-b-8 border-transparent flex items-start relative px-1">
            <div className="absolute -top-12 left-0 w-full text-center font-bold">
              Total: <span className={isOver ? 'text-red-400' : isComplete ? 'text-green-400' : 'text-orange-400'}>{totalCurrent.toFixed(2)}</span> / 1.00
            </div>

            <div className="w-full h-12 bg-sky-950/30 rounded-xl border-2 border-dashed border-sky-700/50 flex overflow-hidden shadow-inner relative">
              <AnimatePresence>
                {bridgePieces.map(piece => (
                  <motion.div
                    key={piece.id}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ scale: 0 }}
                    className={`h-full ${piece.color} border-r border-black/20 flex items-center justify-center font-bold text-xs md:text-base shadow-md`}
                    style={{ width: `${piece.width}%` }}
                  >
                    {piece.numerator}/{piece.denominator}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isOver && (
                <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center font-black animate-pulse z-10 text-white text-center text-sm md:text-base">
                  JEMBATAN RETAK! NYAWA BERKURANG!
                </div>
              )}
            </div>
          </div>

          <div className="w-24 md:w-48 h-full bg-emerald-800 border-t-8 border-emerald-600 rounded-tl-3xl relative flex items-end justify-end">
            <div className="absolute bottom-full mb-2 right-4 md:right-12 text-4xl">
              🏁
            </div>
          </div>
        </div>

        {isOver && (
          <button onClick={resetBridge} className="bg-red-500 text-white font-black px-8 py-3 rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-xl mt-4">
            <RefreshCcw className="w-5 h-5" /> BONGKAR JEMBATAN
          </button>
        )}
        
        {isComplete && (
          <button onClick={nextLevel} className="bg-green-500 text-white font-black px-8 py-3 rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-xl mt-4 animate-bounce">
            LANJUT LEVEL BERIKUTNYA <ArrowRight className="w-5 h-5" />
          </button>
        )}

        {!isComplete && !isOver && (
          <div className="w-full max-w-3xl bg-sky-950/50 p-8 rounded-[3rem] backdrop-blur-md mt-12 border border-sky-800/50">
            <h3 className="text-center font-bold text-sky-400 mb-6 tracking-widest text-sm uppercase">Gudang Balok Pecahan</h3>
            <div className="flex flex-wrap gap-4 md:gap-8 justify-center items-end">
              {FRACTION_BLOCKS.map((block, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <motion.div
                    drag
                    dragSnapToOrigin
                    onDragEnd={(e, info) => handleDragEnd(e, info, block)}
                    whileHover={{ scale: 1.05 }}
                    whileDrag={{ scale: 1.1, zIndex: 100 }}
                    className={`h-16 ${block.color} rounded-xl flex items-center justify-center font-black text-xl shadow-lg border-b-4 border-black/20 cursor-grab active:cursor-grabbing relative group`}
                    style={{ width: `${Math.max(block.width * 2, 80)}px` }}
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity" />
                    {block.numerator}/{block.denominator}
                  </motion.div>
                  <span className="text-xs text-sky-500 font-bold">{block.width.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {renderTitleModal()}
    </div>
  );
}
