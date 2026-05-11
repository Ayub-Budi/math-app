'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Layers, RefreshCcw, ArrowRight, Heart, XCircle, Trophy, Star, Loader2, Bot, Flag } from 'lucide-react';
import Link from 'next/link';
import { useGameProgress } from '@/components/useGameProgress';

interface Fraction {
  id: string;
  numerator: number;
  denominator: number;
  color: string;
  width: number; // percentage relative to 1.0 utuh
  isFixed?: boolean;
}

const getLevelConfig = (level: number) => {
  const seed = level * 1337;
  const pseudoRandom = (offset: number) => Math.abs(Math.sin(seed + offset));

  let target = 1.0;
  if (level > 10) target = [1.25, 1.5, 1.75, 2.0][(level - 1) % 4];
  else if (level > 5) target = [1.0, 1.5][(level - 1) % 2];

  const initialPieces: Fraction[] = [];
  const startingInventory: Omit<Fraction, 'id'>[] = [];

  // Logic to generate a solvable puzzle
  if (level <= 2) {
    // Very Easy: Target 1.0, simple blocks
    startingInventory.push(
      { numerator: 1, denominator: 2, color: 'bg-orange-500', width: 50 },
      { numerator: 1, denominator: 2, color: 'bg-orange-500', width: 50 },
      { numerator: 1, denominator: 4, color: 'bg-emerald-500', width: 25 },
      { numerator: 1, denominator: 4, color: 'bg-emerald-500', width: 25 }
    );
  } else if (level <= 5) {
    // Easy with Foundation: Target 1.0, 1 fixed piece
    initialPieces.push({ 
      id: 'fixed-1', numerator: 1, denominator: 4, color: 'bg-slate-700', width: 25, isFixed: true 
    });
    startingInventory.push(
      { numerator: 1, denominator: 4, color: 'bg-emerald-500', width: 25 },
      { numerator: 1, denominator: 2, color: 'bg-orange-500', width: 50 },
      { numerator: 1, denominator: 3, color: 'bg-indigo-500', width: 33.33 }, // Distractor
      { numerator: 1, denominator: 4, color: 'bg-emerald-500', width: 25 }
    );
  } else {
    // Medium/Hard: Dynamic foundation and specific inventory
    const foundationValue = level > 10 ? 0.5 : 0.25;
    initialPieces.push({ 
      id: 'fixed-1', numerator: 1, denominator: foundationValue === 0.5 ? 2 : 4, color: 'bg-slate-700', width: foundationValue * 100, isFixed: true 
    });
    
    // Fill the rest with specific pieces
    let remaining = target - foundationValue;
    if (remaining >= 0.5) {
      startingInventory.push({ numerator: 1, denominator: 2, color: 'bg-orange-500', width: 50 });
      remaining -= 0.5;
    }
    while (remaining > 0.05) {
      const den = [3, 4, 5, 8, 10, 12][Math.floor(pseudoRandom(remaining) * 6)];
      const val = 1 / den;
      if (val <= remaining + 0.01) {
        startingInventory.push({ numerator: 1, denominator: den, color: 'bg-indigo-500', width: (1/den)*100 });
        remaining -= val;
      } else {
        // Fallback for very small remaining
        startingInventory.push({ numerator: 1, denominator: 20, color: 'bg-slate-500', width: 5 });
        remaining -= 0.05;
      }
    }
    // Add some distractors
    startingInventory.push({ numerator: 1, denominator: 6, color: 'bg-purple-500', width: 16.66 });
  }

  return { target, initialPieces, startingInventory };
};

export default function FractionBridgePage() {
  const { currentLevel, hearts, deductHeart, addGamePoints, saveProgress, loading, renderTitleModal, handleGlobalReset, resetThisGame, isGameFinished, MAX_LEVEL, gamePoints } = useGameProgress('fraction-bridge');
  
  const levelConfig = getLevelConfig(currentLevel);
  const targetLength = levelConfig.target;

  const [bridgePieces, setBridgePieces] = useState<Fraction[]>([]);
  const [inventory, setInventory] = useState<Fraction[]>([]);
  const [hasDeductedForOver, setHasDeductedForOver] = useState(false);

  // Initialize level
  useEffect(() => {
    if (!loading) {
      setBridgePieces(levelConfig.initialPieces);
      setInventory(levelConfig.startingInventory.map((b, i) => ({
        ...b,
        id: `inv-${i}-${Date.now()}`,
        width: (b.numerator / b.denominator / targetLength) * 100
      })));
      setHasDeductedForOver(false);
    }
  }, [currentLevel, loading, targetLength]); // levelConfig is stable enough via currentLevel

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

  useEffect(() => {
    if (isOver && !hasDeductedForOver) {
      // Just flag it to show warning, no heart deduction here anymore
      setHasDeductedForOver(true);
    }
  }, [isOver, hasDeductedForOver]);

  const handleDragEnd = (e: any, info: any, block: Fraction) => {
    if (hearts <= 0) return;
    
    // Check if dragged upwards significantly
    if (info.offset.y < -50) {
      if (isComplete || isOver) return;
      
      // Add to bridge
      setBridgePieces(prev => [...prev, { ...block, id: `piece-${Date.now()}` }]);
      // Remove from inventory
      setInventory(prev => prev.filter(item => item.id !== block.id));
    }
  };

  const resetBridge = () => {
    if (hearts > 1) {
      deductHeart();
      setBridgePieces(levelConfig.initialPieces);
      setInventory(levelConfig.startingInventory.map((b, i) => ({
        ...b,
        id: `inv-${i}-${Date.now()}`,
        width: (b.numerator / b.denominator / targetLength) * 100
      })));
      setHasDeductedForOver(false);
    } else {
      deductHeart(); // This will trigger game over
    }
  };

  const nextLevel = () => {
    addGamePoints(50);
    saveProgress(currentLevel + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <Loader2 className="w-12 h-12 text-orange-400 animate-spin mb-4" />
        <p className="text-xs font-black tracking-[0.4em] uppercase opacity-50">Menyiapkan Arsitektur Pecahan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center overflow-x-hidden selection:bg-orange-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(79,70,229,0.03)_0%,transparent_60%)]" />
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
           <div className="bg-orange-500/10 border border-orange-500/20 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-orange-400 font-black text-[9px] md:text-[10px] uppercase tracking-widest">
             Level {currentLevel}
           </div>
        </div>
      </header>

      <main className="w-full max-w-5xl flex-1 flex flex-col items-center gap-6 md:gap-12 p-4 md:p-8 z-10">
        <div className="text-center space-y-2">
          <span className="text-[10px] md:text-xs font-black text-orange-500 uppercase tracking-[0.5em]">Neural Construction</span>
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight">Jembatan Pecahan</h2>
          <p className="text-slate-500 text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] max-w-xl mx-auto leading-relaxed">
            Konstruksi jalur hingga mencapai <span className="text-orange-500">{targetLength.toFixed(2)} Utuh</span>.
          </p>
        </div>

        {/* Bridge Construction Area */}
        <div className="w-full max-w-4xl h-48 md:h-72 mt-4 relative flex items-end">
          <AnimatePresence>
            {hearts <= 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 flex items-center justify-center bg-[#020617]/90 z-[100] p-6 backdrop-blur-xl">
                <div className="text-center max-w-sm space-y-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-red-500/30">
                    <XCircle className="w-10 h-10 md:w-12 md:h-12 text-red-500" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Konstruksi Gagal</h2>
                  <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] leading-relaxed">Energi material habis. Sinkronisasi terputus.</p>
                  <Link href="/games" className="block w-full bg-white text-slate-950 font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-xl">REBOOT MISSION</Link>
                </div>
              </motion.div>
            )}

            {isGameFinished && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 flex items-center justify-center bg-[#020617]/95 z-[100] p-6 backdrop-blur-xl">
                <div className="text-center max-w-sm space-y-6">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-yellow-500/30">
                    <Trophy className="w-12 h-12 md:w-16 md:h-16 text-yellow-400" />
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Master Arsitek</h2>
                  <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] leading-relaxed">Jembatan Neural telah terhubung sempurna ({MAX_LEVEL}).</p>
                  <div className="space-y-3">
                    <Link href="/games" className="block w-full bg-white text-slate-950 font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-xl">MAIN MENU</Link>
                    <button onClick={resetThisGame} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest underline">Reset Blueprint</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Left Platform */}
          <div className="w-12 xs:w-16 md:w-56 h-full bg-slate-900/60 border-r border-white/10 rounded-tr-[2rem] md:rounded-tr-[3rem] relative shadow-2xl">
             <div className="absolute inset-0 bg-orange-500/5" />
             <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2">
                <motion.div 
                  animate={isComplete ? { x: 'calc(100vw - 120px)', rotate: [0, 5, -5, 0] } : { x: 0 }} 
                  transition={{ duration: 2.5, ease: "easeInOut" }} 
                  className="w-10 h-10 md:w-16 md:h-16 bg-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)] border-2 border-orange-400"
                >
                   <Bot className="w-6 h-6 md:w-10 md:h-10 text-white" />
                </motion.div>
             </div>
          </div>

          {/* Bridge Construction Gap */}
          <div className="flex-1 h-full flex flex-col justify-end pb-8 relative px-2 md:px-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center font-black tracking-[0.3em] text-[9px] md:text-sm">
                <span className={isOver ? 'text-red-500' : isComplete ? 'text-emerald-400' : 'text-orange-400'}>
                  {totalCurrent.toFixed(2)}
                </span>
                <span className="text-white/20 mx-2">/</span>
                <span className="text-white">{targetLength.toFixed(2)}</span>
            </div>

            <div className="w-full h-10 md:h-20 bg-slate-950/60 rounded-xl md:rounded-2xl border-2 border-dashed border-white/10 flex overflow-hidden shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] relative backdrop-blur-md">
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-20 animate-[scanHorizontal_3s_linear_infinite] pointer-events-none" />
              
              <AnimatePresence>
                {bridgePieces.map(piece => (
                  <motion.div
                    key={piece.id}
                    initial={{ y: -50, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className={`h-full ${piece.isFixed ? 'bg-slate-800' : piece.color} border-r border-black/20 flex flex-col items-center justify-center font-black text-[9px] md:text-lg shadow-xl relative overflow-hidden`}
                    style={{ width: `${(piece.numerator / piece.denominator / targetLength) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                    {piece.isFixed && (
                      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
                    )}
                    <span className={`relative z-10 ${piece.isFixed ? 'text-slate-500' : 'text-white'} drop-shadow-md flex items-center gap-1`}>
                      {piece.numerator}/{piece.denominator}
                      {piece.isFixed && <Bot className="w-2 h-2 md:w-4 md:h-4 opacity-50" />}
                    </span>
                    <div className="absolute bottom-1 right-1 opacity-20 text-[6px] md:text-[8px] font-bold">
                      {((piece.numerator / piece.denominator / targetLength) * 100).toFixed(0)}%
                    </div>
                    {piece.isFixed && (
                       <div className="absolute top-0 left-0 w-full h-1 bg-slate-900/50" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isOver && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-red-600/80 backdrop-blur-sm flex items-center justify-center font-black z-20 text-white text-[9px] md:text-xs uppercase tracking-[0.4em] animate-pulse">
                  Kelebihan!
                </motion.div>
              )}
            </div>
            
            {/* Energy Stream Under the Bridge */}
            <div className="h-3 w-full mt-2 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent blur-sm" />
          </div>

          {/* Right Platform */}
          <div className="w-12 xs:w-16 md:w-56 h-full bg-slate-900/60 border-l border-white/10 rounded-tl-[2rem] md:rounded-tl-[3rem] relative shadow-2xl">
             <div className="absolute inset-0 bg-indigo-500/5" />
             <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2">
                <Flag className={`w-7 h-7 md:w-12 md:h-12 ${isComplete ? 'text-emerald-400 animate-bounce' : 'text-slate-700'} transition-colors duration-500`} />
             </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="h-10 flex flex-col items-center justify-center gap-2">
          <AnimatePresence mode="wait">
            {isOver || (inventory.length === 0 && !isComplete) ? (
              <motion.button 
                key="reset" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                onClick={resetBridge} 
                className="bg-red-600 text-white font-black px-6 py-2 rounded-lg hover:bg-red-500 transition-all flex items-center gap-3 shadow-xl text-[10px] uppercase tracking-widest group"
              >
                <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full group-hover:bg-black/30 transition-colors">
                  <Heart className="w-3 h-3 fill-current text-red-400" />
                  <span>-1</span>
                </div>
                <RefreshCcw className="w-3.5 h-3.5" /> Bongkar Konstruksi
              </motion.button>
            ) : isComplete ? (
              <motion.button 
                key="next" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                onClick={nextLevel} 
                className="bg-emerald-600 text-white font-black px-8 py-3 rounded-xl hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)] text-xs uppercase tracking-[0.2em]"
              >
                Sinkronisasi Selesai <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>
        
        {/* Material Warehouse */}
        <div className="w-full max-w-3xl px-4 pb-8">
          <div className="relative p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-slate-900/40 border border-white/10 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
            
            <div className="mb-4 md:mb-10 text-center space-y-1">
              <h3 className="font-black text-slate-500 tracking-[0.4em] text-[8px] md:text-[11px] uppercase">Gudang Material</h3>
            </div>
            
            <div className="flex flex-wrap gap-3 md:gap-6 justify-center items-center min-h-[120px]">
              {inventory.length > 0 ? (
                inventory.map((block) => (
                  <div key={block.id} className="flex flex-col items-center gap-2">
                    <motion.div
                      layoutId={block.id}
                      drag
                      dragSnapToOrigin
                      onDragEnd={(e, info) => handleDragEnd(e, info, block)}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileDrag={{ scale: 1.1, zIndex: 100 }}
                      className={`h-14 md:h-20 ${block.color} rounded-xl md:rounded-2xl flex items-center justify-center font-black text-[10px] md:text-2xl shadow-xl border-b-4 md:border-b-8 border-black/20 cursor-grab active:cursor-grabbing relative group`}
                      style={{ width: `${Math.max((block.numerator / block.denominator) * 200, 60)}px` }}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                      <span className="text-white drop-shadow-md">{block.numerator}/{block.denominator}</span>
                    </motion.div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                   <p className="text-red-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Material Habis! Konstruksi Macet.</p>
                </div>
              )}
            </div>
            
            <div className="mt-10 flex flex-col items-center gap-4">
              <div className="h-1 w-20 bg-orange-500/10 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ x: [-80, 80] }} 
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-1/2 h-full bg-orange-500/40" 
                />
              </div>
              <p className="text-[9px] md:text-[11px] text-slate-500 font-black uppercase tracking-[0.4em] animate-pulse text-center leading-relaxed">
                Tarik Material Ke Atas Jalur
              </p>
            </div>
          </div>
        </div>
      </main>

      {renderTitleModal()}

      <style jsx global>{`
        @keyframes scanHorizontal {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(500%); }
        }
      `}</style>
    </div>
  );
}
