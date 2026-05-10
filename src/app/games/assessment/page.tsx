'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, ArrowRight, RefreshCcw, Heart, XCircle, Shapes } from 'lucide-react';
import Link from 'next/link';
import { useGameProgress } from '@/components/useGameProgress';

const masterShapes = [
  { id: 'square', shape: 'square', color: 'bg-red-500', label: 'Persegi', className: 'flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl' },
  { id: 'circle', shape: 'circle', color: 'bg-blue-500', label: 'Lingkaran', className: 'flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-full' },
  { id: 'triangle', shape: 'triangle', color: 'bg-green-500', label: 'Segitiga', className: 'flex-shrink-0 w-20 h-20 md:w-24 md:h-24', style: { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' } },
  { id: 'rectangle', shape: 'rectangle', color: 'bg-yellow-500', label: 'Persegi Panjang', className: 'flex-shrink-0 w-28 h-16 md:w-32 md:h-20 rounded-xl' },
  { id: 'star', shape: 'star', color: 'bg-purple-500', label: 'Bintang', className: 'flex-shrink-0 w-20 h-20 md:w-24 md:h-24', style: { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' } },
  { id: 'hexagon', shape: 'hexagon', color: 'bg-pink-500', label: 'Segi Enam', className: 'flex-shrink-0 w-20 h-20 md:w-24 md:h-24', style: { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' } },
  { id: 'rhombus', shape: 'rhombus', color: 'bg-teal-500', label: 'Belah Ketupat', className: 'flex-shrink-0 w-20 h-20 md:w-24 md:h-24', style: { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' } },
  { id: 'pentagon', shape: 'pentagon', color: 'bg-orange-500', label: 'Segi Lima', className: 'flex-shrink-0 w-20 h-20 md:w-24 md:h-24', style: { clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' } },
];

const shuffleArray = (array: any[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export default function AssessmentGamePage() {
  const [currentShapes, setCurrentShapes] = useState<any[]>([]);
  const [shuffledTargets, setShuffledTargets] = useState<any[]>([]);
  const [placedItems, setPlacedItems] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState(0);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [wrongAlert, setWrongAlert] = useState<string | null>(null);

  const { currentLevel, hearts, deductHeart, addGamePoints, addXP, saveProgress, loading, renderTitleModal, handleGlobalReset, resetThisGame, isGameFinished, MAX_LEVEL, totalXp, gamePoints } = useGameProgress('assessment');
  const levelKey = currentLevel;

  const startNewRound = () => {
    const shuffled = shuffleArray(masterShapes);
    const selected = shuffled.slice(0, 3);
    setCurrentShapes(selected);
    setShuffledTargets(shuffleArray(selected));
    setPlacedItems({});
    setRoundCompleted(false);
  };

  useEffect(() => {
    startNewRound();
  }, []);

  const markPlaced = (shapeId: string) => {
    if (placedItems[shapeId]) return;
    const newPlaced = { ...placedItems, [shapeId]: true };
    setPlacedItems(newPlaced);
    setScore(s => s + 1);
    if (Object.keys(newPlaced).length === 3) {
      addGamePoints(20);
      setTimeout(() => setRoundCompleted(true), 500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-900 text-white font-black">
        <Shapes className="w-16 h-16 animate-spin mb-4 text-yellow-400" />
        <p className="text-xl tracking-widest uppercase">Mempersiapkan Lab...</p>
      </div>
    );
  }

  if (isGameFinished) {
    return (
      <div className="min-h-screen bg-indigo-950 text-white p-6 flex flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
          <Shapes className="w-24 h-24 text-yellow-400 mb-6 animate-spin" />
          <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter text-yellow-400">MASTER BENTUK! 🏆</h1>
          <p className="text-indigo-300 text-xl mb-10 max-w-md">Luar biasa! Kamu telah mengidentifikasi semua bentuk geometri hingga level {MAX_LEVEL}. Kamu adalah ilmuwan bentuk sejati!</p>
          <div className="flex flex-col gap-4">
            <Link href="/games" className="bg-yellow-400 text-indigo-900 px-12 py-4 rounded-full font-black text-xl transition-all hover:scale-105 shadow-xl">
              KEMBALI KE MENU
            </Link>
            <button 
              onClick={resetThisGame}
              className="text-indigo-400 hover:text-white text-sm font-bold underline transition-colors"
            >
              Mulai Ulang dari Level 1
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (hearts <= 0) {
    return (
      <div className="min-h-screen bg-indigo-950 text-white p-6 flex flex-col items-center justify-center text-center">
        <XCircle className="w-24 h-24 text-red-500 mb-6" />
        <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter text-indigo-400">Energi Habis</h1>
        <p className="text-indigo-300 text-xl mb-10 max-w-sm">Nyawa harianmu telah habis. Istirahatlah sejenak atau tukar poin di Dashboard Home!</p>
        <Link href="/games" className="bg-indigo-600 text-white px-12 py-4 rounded-full font-black text-xl transition-all hover:scale-105 shadow-xl">
          KEMBALI KE MENU
        </Link>
        {process.env.NODE_ENV === 'development' && (
          <button 
            onClick={handleGlobalReset}
            className="mt-8 text-indigo-400 hover:text-white text-sm font-bold underline transition-colors"
          >
            Hapus Semua Progres & Isi Ulang Nyawa (Dev Mode)
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-900 text-white p-6 flex flex-col items-center">
      <header className="w-full max-w-4xl flex items-center justify-between mb-8">
        <Link href="/games" className="flex items-center gap-2 text-indigo-300 hover:text-white font-bold">
          <ArrowLeft className="w-5 h-5" /> Kembali
        </Link>
        <div className="flex items-center gap-4">
          <div className="bg-red-500/20 text-red-400 px-6 py-2 rounded-full font-black shadow-lg border border-red-500/30 flex items-center gap-2">
            <Heart className="w-5 h-5 fill-current" />
            {hearts}
          </div>
          <div className="bg-indigo-800 text-indigo-200 px-6 py-2 rounded-full font-black shadow-lg">
            LEVEL: {currentLevel}
          </div>
          <div className="bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full font-black shadow-lg">
            POIN: {gamePoints}
          </div>
        </div>
      </header>

      <main className="w-full max-w-5xl flex flex-col items-center gap-16 relative" key={levelKey}>
        <div className="grid grid-cols-3 gap-4 md:gap-12 w-full place-items-center">
          {shuffledTargets.map((target) => (
            <div key={`target-${target.id}`} className="flex flex-col items-center gap-4">
              <div 
                id={`target-${target.id}`}
                className={`
                  w-28 h-28 md:w-40 md:h-40 border-4 border-dashed rounded-[2rem] flex items-center justify-center transition-all duration-300
                  ${placedItems[target.id] ? 'border-green-400 bg-green-400/20 shadow-green-500/50 shadow-lg' : 'border-white/30 bg-white/5'}
                `}
              >
                {placedItems[target.id] ? (
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} className={`${target.className} ${target.color}`} style={target.style} />
                ) : (
                  <span className="text-[10px] md:text-xs uppercase font-bold opacity-40 tracking-tighter text-center px-2">
                    Wadah<br/>{target.label}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {!roundCompleted && hearts > 0 && (
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="flex gap-6 md:gap-12 bg-white/10 p-8 md:p-12 rounded-[3rem] backdrop-blur-md border border-white/10 shadow-2xl items-center justify-center min-h-[200px]">
              {currentShapes.map((item) => (
                !placedItems[item.id] && (
                  <motion.div
                    key={`draggable-${item.id}`}
                    drag
                    dragSnapToOrigin
                    onDragEnd={async (e: any, info) => {
                      const dropX = e.clientX ?? (e.changedTouches ? e.changedTouches[0].clientX : 0);
                      const dropY = e.clientY ?? (e.changedTouches ? e.changedTouches[0].clientY : 0);
                      const elements = document.elementsFromPoint(dropX, dropY);
                      const targetEl = elements.find(el => el.id && el.id.startsWith('target-'));
                      
                      if (targetEl) {
                        const targetId = targetEl.id.replace('target-', '');
                        if (targetId === item.id) {
                          markPlaced(item.id);
                        } else {
                          const targetShape = masterShapes.find(s => s.id === targetId);
                          setWrongAlert(`Oops! Wadah itu untuk ${targetShape?.label}!`);
                          deductHeart();
                          setTimeout(() => setWrongAlert(null), 3000);
                        }
                      }
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileDrag={{ scale: 1.3, zIndex: 100, rotate: 10 }}
                    className={`${item.className} ${item.color} cursor-grab active:cursor-grabbing shadow-lg relative group`}
                    style={item.style}
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity rounded-full" />
                  </motion.div>
                )
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {roundCompleted && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-full px-4">
              <div className="bg-white text-indigo-900 p-8 md:p-12 rounded-[3rem] text-center shadow-[0_0_100px_rgba(79,70,229,0.5)] max-w-lg mx-auto">
                <Trophy className="w-24 h-24 mx-auto mb-6 text-yellow-500 drop-shadow-lg" />
                <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 uppercase">Sempurna!</h2>
                <p className="text-gray-500 mb-8 font-medium">Kelompok bentuk berhasil dicocokkan.</p>
                <button 
                  onClick={() => {
                    saveProgress(currentLevel + 1);
                    startNewRound();
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all"
                >
                  Lanjut Level {currentLevel + 1} <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {wrongAlert && (
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-24 z-[110] bg-red-500 text-white font-bold px-8 py-4 rounded-full shadow-2xl border-4 border-red-300 flex items-center gap-3">
              <span className="text-2xl">⚠️</span> {wrongAlert}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-indigo-400 text-sm md:text-base font-medium animate-pulse text-center px-4 uppercase tracking-widest">
          Geser bentuk ke wadah yang sesuai! Semangat belajar!
        </div>
      </main>

      {renderTitleModal()}
    </div>
  );
}
