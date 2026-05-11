'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Map, Bot, Flag, BatteryWarning, ArrowUp, ArrowDown, ArrowLeft as ArrowL, ArrowRight, Heart, XCircle, Trophy, Star, Loader2, Target } from 'lucide-react';
import Link from 'next/link';
import { useGameProgress } from '@/components/useGameProgress';

interface Position {
  x: number;
  y: number;
}

export default function GridNavigatorPage() {
  const [robotPos, setRobotPos] = useState<Position>({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState<Position>({ x: 4, y: 4 });
  const [obstacles, setObstacles] = useState<Position[]>([]);
  const [gridSize, setGridSize] = useState(5);
  const [status, setStatus] = useState<'playing' | 'won' | 'crashed'>('playing');

  const { currentLevel, hearts, deductHeart, addGamePoints, saveProgress, loading, renderTitleModal, handleGlobalReset, resetThisGame, isGameFinished, MAX_LEVEL, gamePoints } = useGameProgress('grid-navigator');

  const initLevel = useCallback((lvl: number) => {
    const size = Math.min(8, 4 + Math.floor(lvl / 2));
    setGridSize(size);
    setRobotPos({ x: 0, y: 0 });
    
    let tx = Math.floor(Math.random() * (size - 2)) + 2;
    let ty = Math.floor(Math.random() * (size - 2)) + 2;
    setTargetPos({ x: tx, y: ty });

    const obsCount = lvl + 1;
    const obs: Position[] = [];
    for (let i = 0; i < obsCount; i++) {
      let ox = Math.floor(Math.random() * size);
      let oy = Math.floor(Math.random() * size);
      // Avoid placing obstacles on start, target, or adjacent to start
      if ((ox === 0 && oy === 0) || (ox === tx && oy === ty) || (ox === 0 && oy === 1) || (ox === 1 && oy === 0)) {
        i--;
        continue;
      }
      obs.push({ x: ox, y: oy });
    }
    setObstacles(obs);
    setStatus('playing');
  }, []);

  useEffect(() => {
    if (currentLevel) initLevel(currentLevel);
  }, [currentLevel, initLevel]);

  const moveRobot = async (dx: number, dy: number) => {
    if (status !== 'playing' || hearts <= 0) return;

    const nx = robotPos.x + dx;
    const ny = robotPos.y + dy;

    if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) {
      setStatus('crashed');
      await deductHeart();
      return;
    }

    if (obstacles.some(o => o.x === nx && o.y === ny)) {
      setRobotPos({ x: nx, y: ny });
      setStatus('crashed');
      await deductHeart();
      return;
    }

    setRobotPos({ x: nx, y: ny });

    if (nx === targetPos.x && ny === targetPos.y) {
      setStatus('won');
      addGamePoints(25);
      setTimeout(() => saveProgress(currentLevel + 1), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
        <p className="text-xs font-black tracking-[0.4em] uppercase opacity-50">Sinkronisasi Koordinat Neural...</p>
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

      <main className="w-full max-w-5xl flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 md:gap-16 p-4 md:p-8 z-10">
        <div className="lg:w-1/2 flex flex-col items-center gap-4 md:gap-10">
          <div className="text-center space-y-1 lg:text-left lg:w-full">
            <span className="text-[10px] md:text-xs font-black text-cyan-500 uppercase tracking-[0.5em]">Neural Pathfinding</span>
            <h2 className="text-xl md:text-4xl font-black text-white uppercase tracking-tight">Labirin Neural</h2>
          </div>

          {/* Quick Tracking Bar - Mobile Only */}
          <div className="lg:hidden flex items-center justify-center gap-6 bg-slate-900/60 backdrop-blur-xl px-6 py-2.5 rounded-full border border-white/10 shadow-lg">
            <div className="flex flex-col items-center">
              <span className="text-[7px] font-black text-slate-500 uppercase">Bot</span>
              <span className="text-sm font-black text-white">({robotPos.x},{robotPos.y})</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[7px] font-black text-slate-500 uppercase">Target</span>
              <span className="text-sm font-black text-cyan-400">({targetPos.x},{targetPos.y})</span>
            </div>
          </div>

          {/* Grid Container */}
          <div className="relative p-2 md:p-6 rounded-[2.5rem] md:rounded-[3rem] bg-slate-900/40 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden w-full aspect-square max-w-[300px] xs:max-w-[340px] md:max-w-[480px]">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-[200%] animate-[scan_4s_linear_infinite] pointer-events-none" />
            
            <div 
              className="grid bg-slate-950/60 p-2 md:p-4 rounded-2xl md:rounded-[2rem] relative h-full w-full"
              style={{ 
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize}, 1fr)`,
              }}
            >
              {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                const y = Math.floor(i / gridSize);
                const x = i % gridSize;
                const isTarget = x === targetPos.x && y === targetPos.y;
                const isObstacle = obstacles.some(o => o.x === x && o.y === y);
                return (
                  <div key={i} className="p-0.5 md:p-1 w-full h-full">
                    <div className="bg-white/5 rounded-lg md:rounded-xl border border-white/5 flex items-center justify-center relative group overflow-hidden w-full h-full">
                      {isTarget && (
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-full h-full flex items-center justify-center">
                          <Flag className="w-1/2 h-1/2 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
                        </motion.div>
                      )}
                      {isObstacle && (
                        <div className="flex items-center justify-center relative w-full h-full">
                          <div className="absolute inset-0 bg-red-500/20 animate-pulse" />
                          <BatteryWarning className="w-1/2 h-1/2 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] relative z-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/5 transition-colors" />
                    </div>
                  </div>
                );
              })}

              <motion.div
                initial={false}
                animate={{ 
                  left: `${(robotPos.x / gridSize) * 100}%`,
                  top: `${(robotPos.y / gridSize) * 100}%`
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute z-10 p-0.5 md:p-1"
                style={{
                  width: `${100 / gridSize}%`,
                  height: `${100 / gridSize}%`
                }}
              >
                <div className={`w-full h-full rounded-lg md:rounded-xl shadow-2xl flex items-center justify-center transition-all duration-500 border-b-2 md:border-b-4 border-black/20
                  ${status === 'crashed' ? 'bg-red-600 shadow-red-500/40' : status === 'won' ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-cyan-500 shadow-cyan-500/30'}
                `}>
                  <Bot className={`w-2/3 h-2/3 ${status === 'crashed' ? 'text-white' : 'text-slate-900'}`} />
                </div>
              </motion.div>
            </div>

            <AnimatePresence>
              {(status !== 'playing' || hearts <= 0 || isGameFinished) && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#020617]/90 flex items-center justify-center z-50 backdrop-blur-xl p-6"
                >
                  <div className="text-center max-w-xs space-y-6">
                     {hearts <= 0 ? (
                        <>
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-red-500/30">
                            <XCircle className="w-10 h-10 text-red-500" />
                          </div>
                          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Power Depleted</h2>
                          <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed">Bot dinonaktifkan. Tunggu sinkronisasi energi.</p>
                          <Link href="/games" className="block w-full bg-white text-slate-950 font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-xl">TERMINAL RESET</Link>
                        </>
                     ) : isGameFinished ? (
                        <>
                          <div className="w-20 h-20 md:w-24 md:h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-yellow-500/30">
                            <Trophy className="w-10 h-10 text-yellow-400" />
                          </div>
                          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">System Mastered</h2>
                          <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed">Seluruh koordinat telah terpetakan ({MAX_LEVEL}).</p>
                          <div className="space-y-3">
                            <Link href="/games" className="block w-full bg-white text-slate-950 font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-xl">MAIN MENU</Link>
                            <button onClick={resetThisGame} className="text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-widest underline">Reset Map Memory</button>
                          </div>
                        </>
                     ) : status === 'won' ? (
                        <>
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-500/30">
                            <Flag className="w-10 h-10 text-emerald-400" />
                          </div>
                          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Target Locked</h2>
                          <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed">Koordinat sinkron! Melanjutkan misi...</p>
                        </>
                     ) : (
                        <>
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-red-500/30">
                            <BatteryWarning className="w-10 h-10 text-red-500" />
                          </div>
                          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Collision Detected</h2>
                          <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed">Sistem integritas terganggu!</p>
                          <button onClick={() => initLevel(currentLevel)} className="block w-full bg-red-600 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-xl hover:bg-red-500">REBOOT SYSTEM</button>
                        </>
                     )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Dashboard & Controls */}
        <div className="lg:w-1/2 flex flex-col items-center gap-6 md:gap-12 w-full max-w-md">
          {/* Neural Tracking Dashboard - Desktop Only */}
          <div className="hidden lg:block bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/10 w-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <h3 className="text-[10px] text-slate-600 font-black mb-8 tracking-[0.4em] uppercase text-center">Neural Tracking Dashboard</h3>
            
            <div className="flex justify-around items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bot_X</span>
                <div className="text-5xl font-black text-white tabular-nums">{robotPos.x}</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="flex flex-col items-center gap-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bot_Y</span>
                <div className="text-5xl font-black text-white tabular-nums">{robotPos.y}</div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="flex items-center gap-3 bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest">
                <Target className="w-4 h-4" /> Destination: ({targetPos.x}, {targetPos.y})
              </div>
            </div>
          </div>

          {/* D-Pad Controls */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 w-44 xs:w-48 md:w-64 mx-auto pb-4 lg:pb-0">
            <div />
            <ControlButton onClick={() => moveRobot(0, -1)} disabled={status !== 'playing'} icon={<ArrowUp className="w-7 h-7 md:w-10 md:h-10" />} label="N" />
            <div />
            <ControlButton onClick={() => moveRobot(-1, 0)} disabled={status !== 'playing'} icon={<ArrowL className="w-7 h-7 md:w-10 md:h-10" />} label="W" />
            <ControlButton onClick={() => moveRobot(0, 1)} disabled={status !== 'playing'} icon={<ArrowDown className="w-7 h-7 md:w-10 md:h-10" />} label="S" />
            <ControlButton onClick={() => moveRobot(1, 0)} disabled={status !== 'playing'} icon={<ArrowRight className="w-7 h-7 md:w-10 md:h-10" />} label="E" />
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

function ControlButton({ onClick, disabled, icon, label }: { onClick: () => void, disabled: boolean, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className="group relative bg-slate-900/60 hover:bg-slate-800 active:bg-cyan-600 disabled:opacity-20 text-cyan-500 active:text-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center shadow-xl border border-white/5 transition-all active:scale-90 overflow-hidden"
    >
      <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      {icon}
      <span className="text-[8px] md:text-[10px] font-black mt-1 opacity-40 group-active:opacity-100">{label}</span>
    </button>
  );
}
