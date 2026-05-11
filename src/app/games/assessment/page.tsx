'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, ArrowRight, RefreshCcw, Heart, XCircle, Shapes, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useGameProgress } from '@/components/useGameProgress';

const masterShapes = [
  { id: 'square', shape: 'square', color: 'bg-red-500', label: 'Persegi', className: 'flex-shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-2xl' },
  { id: 'circle', shape: 'circle', color: 'bg-blue-500', label: 'Lingkaran', className: 'flex-shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-full' },
  { id: 'triangle', shape: 'triangle', color: 'bg-green-500', label: 'Segitiga', className: 'flex-shrink-0 w-16 h-16 md:w-24 md:h-24', style: { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' } },
  { id: 'rectangle', shape: 'rectangle', color: 'bg-yellow-500', label: 'Persegi Panjang', className: 'flex-shrink-0 w-24 h-14 md:w-32 md:h-20 rounded-xl' },
  { id: 'star', shape: 'star', color: 'bg-purple-500', label: 'Bintang', className: 'flex-shrink-0 w-16 h-16 md:w-24 md:h-24', style: { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' } },
  { id: 'hexagon', shape: 'hexagon', color: 'bg-pink-500', label: 'Segi Enam', className: 'flex-shrink-0 w-16 h-16 md:w-24 md:h-24', style: { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' } },
  { id: 'rhombus', shape: 'rhombus', color: 'bg-teal-500', label: 'Belah Ketupat', className: 'flex-shrink-0 w-16 h-16 md:w-24 md:h-24', style: { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' } },
  { id: 'pentagon', shape: 'pentagon', color: 'bg-orange-500', label: 'Segi Lima', className: 'flex-shrink-0 w-16 h-16 md:w-24 md:h-24', style: { clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' } },
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

  const { currentLevel, hearts, deductHeart, addGamePoints, saveProgress, loading, renderTitleModal, handleGlobalReset, resetThisGame, isGameFinished, MAX_LEVEL, gamePoints } = useGameProgress('assessment');

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-xs font-black tracking-[0.4em] uppercase opacity-50">Menyiapkan Lab Geometri...</p>
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

      <main className="w-full max-w-5xl flex-1 flex flex-col items-center justify-center p-4 md:p-8 z-10 space-y-8 md:space-y-20 relative">
        
        <AnimatePresence>
          {hearts <= 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 flex items-center justify-center bg-[#020617]/90 z-[100] p-6 backdrop-blur-md">
              <div className="text-center max-w-sm space-y-4 md:space-y-6">
                <XCircle className="w-16 h-16 md:w-20 md:h-20 text-red-500 mx-auto" />
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Energi Habis!</h2>
                <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed">Laboratorium geometri ditutup. Kembali besok!</p>
                <Link href="/games" className="block w-full bg-white text-slate-950 font-black py-3 md:py-4 rounded-xl text-[10px] md:text-xs uppercase tracking-widest shadow-xl">KEMBALI KE MENU</Link>
              </div>
            </motion.div>
          )}

          {isGameFinished && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 flex items-center justify-center bg-[#020617]/95 z-[100] p-6 backdrop-blur-md">
              <div className="text-center max-w-sm space-y-4 md:space-y-6">
                <Trophy className="w-16 h-16 md:w-20 md:h-20 text-yellow-400 mx-auto animate-bounce" />
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Master Bentuk!</h2>
                <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed">Kamu menguasai semua identifikasi geometri ({MAX_LEVEL}).</p>
                <div className="space-y-3">
                  <Link href="/games" className="block w-full bg-white text-slate-950 font-black py-3 md:py-4 rounded-xl text-[10px] md:text-xs uppercase tracking-widest shadow-xl">KEMBALI KE MENU</Link>
                  <button onClick={resetThisGame} className="text-slate-500 hover:text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest underline">Mulai Lagi Level 1</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Target Receptacles */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-16 w-full">
          {shuffledTargets.map((target) => (
            <div key={`target-${target.id}`} className="flex flex-col items-center gap-4 md:gap-6">
              <div 
                id={`target-${target.id}`}
                className={`
                  w-28 h-28 xs:w-32 xs:h-32 md:w-40 md:h-40 border-4 border-dashed rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center transition-all duration-500
                  ${placedItems[target.id] ? 'border-emerald-500 bg-emerald-500/10 shadow-emerald-500/20 shadow-2xl' : 'border-white/5 bg-slate-900/20 backdrop-blur-xl'}
                `}
              >
                {placedItems[target.id] ? (
                  <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} className={`${target.className} ${target.color} shadow-xl`} style={target.style} />
                ) : (
                  <div className="text-center px-2">
                    <span className="text-[10px] md:text-[12px] uppercase font-black opacity-30 tracking-[0.2em] text-white leading-tight">
                      Wadah<br/>{target.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Warehouse Area */}
        <AnimatePresence mode="wait">
          {!roundCompleted && hearts > 0 && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-3xl flex flex-wrap gap-6 md:gap-12 bg-slate-900/30 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] backdrop-blur-3xl border border-white/5 shadow-2xl items-center justify-center min-h-[160px] md:min-h-[220px]">
              {currentShapes.map((item) => (
                !placedItems[item.id] && (
                  <motion.div
                    key={`draggable-${item.id}`}
                    drag
                    dragSnapToOrigin
                    onDragEnd={async (e, info) => {
                      const dropX = info.point.x;
                      const dropY = info.point.y;
                      const elements = document.elementsFromPoint(dropX, dropY);
                      const targetEl = elements.find(el => el.id && el.id.startsWith('target-'));
                      
                      if (targetEl) {
                        const targetId = targetEl.id.replace('target-', '');
                        if (targetId === item.id) {
                          markPlaced(item.id);
                        } else {
                          const targetShape = masterShapes.find(s => s.id === targetId);
                          setWrongAlert(`Oops! Itu wadah ${targetShape?.label}!`);
                          deductHeart();
                          setTimeout(() => setWrongAlert(null), 3000);
                        }
                      }
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileDrag={{ scale: 1.2, zIndex: 100 }}
                    className={`${item.className} ${item.color} cursor-grab active:cursor-grabbing shadow-2xl relative group`}
                    style={item.style}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-30 transition-opacity" />
                  </motion.div>
                )
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Round Success Modal */}
        <AnimatePresence>
          {roundCompleted && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] w-full px-4">
              <div className="bg-white text-indigo-950 p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] text-center shadow-[0_0_100px_rgba(79,70,229,0.3)] max-w-sm mx-auto space-y-4 md:space-y-6">
                <Trophy className="w-16 h-16 md:w-20 md:h-20 mx-auto text-yellow-500 drop-shadow-xl animate-bounce" />
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none">Sempurna!</h2>
                  <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Identifikasi bentuk berhasil.</p>
                </div>
                <button 
                  onClick={() => {
                    saveProgress(currentLevel + 1);
                    startNewRound();
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 md:py-5 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-[10px] md:text-xs uppercase tracking-widest"
                >
                  Lanjut Level {currentLevel + 1} <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alerts */}
        <AnimatePresence>
          {wrongAlert && (
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="fixed top-24 z-[120] bg-red-600 text-white font-black px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl shadow-2xl border-2 border-red-400/50 flex items-center gap-3 uppercase tracking-widest text-[9px] md:text-[10px]">
              <XCircle className="w-4 h-4 md:w-5 md:h-5" /> {wrongAlert}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-[10px] md:text-sm text-slate-500 font-black uppercase tracking-[0.3em] animate-pulse text-center px-4">
          Geser bentuk geometri ke dalam wadah yang sesuai
        </p>
      </main>

      {renderTitleModal()}
    </div>
  );
}
