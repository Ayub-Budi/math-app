'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Map, Bot, Flag, BatteryWarning, ArrowUp, ArrowDown, ArrowLeft as ArrowL, ArrowRight, Heart, XCircle } from 'lucide-react';
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

  const initLevel = (lvl: number) => {
    const size = Math.min(8, 4 + Math.floor(lvl / 2));
    setGridSize(size);
    setRobotPos({ x: 0, y: 0 });
    
    let tx = Math.floor(Math.random() * (size - 2)) + 2;
    let ty = Math.floor(Math.random() * (size - 2)) + 2;
    setTargetPos({ x: tx, y: ty });

    const obsCount = lvl + 2;
    const obs: Position[] = [];
    for (let i = 0; i < obsCount; i++) {
      let ox = Math.floor(Math.random() * size);
      let oy = Math.floor(Math.random() * size);
      if ((ox === 0 && oy === 0) || (ox === tx && oy === ty) || (ox === 0 && oy === 1) || (ox === 1 && oy === 0)) continue;
      obs.push({ x: ox, y: oy });
    }
    setObstacles(obs);
    setStatus('playing');
  };

  useEffect(() => {
    if (currentLevel) initLevel(currentLevel);
  }, [currentLevel]);

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-teal-950 text-white font-black">
        <Bot className="w-16 h-16 animate-spin mb-4 text-cyan-400" />
        <p className="text-xl tracking-widest uppercase">Sinkronisasi Koordinat...</p>
      </div>
    );
  }

  if (hearts <= 0) {
    return (
      <div className="min-h-screen bg-teal-950 text-white p-6 flex flex-col items-center justify-center text-center">
        <XCircle className="w-24 h-24 text-red-500 mb-6" />
        <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter text-cyan-400">Robot Nonaktif</h1>
        <p className="text-teal-300 text-xl mb-10 max-w-sm">Baterai harian robot habis. Energi pemulihan akan tersedia besok!</p>
        <Link href="/games" className="bg-cyan-500 text-teal-950 px-12 py-4 rounded-full font-black text-xl transition-all hover:scale-105">
          KEMBALI KE MENU
        </Link>
        {process.env.NODE_ENV === 'development' && (
          <button 
            onClick={handleGlobalReset}
            className="mt-8 text-teal-400 hover:text-white text-sm font-bold underline transition-colors"
          >
            Hapus Semua Progres & Isi Ulang Nyawa (Dev Mode)
          </button>
        )}
      </div>
    );
  }

  if (isGameFinished) {
    return (
      <div className="min-h-screen bg-teal-950 text-white p-6 flex flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
          <Bot className="w-24 h-24 text-cyan-400 mb-6" />
          <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter text-cyan-400">KOORDINAT SELESAI! 🏁</h1>
          <p className="text-teal-300 text-xl mb-10 max-w-md">Hebat! Kamu telah menavigasi robot melewati semua rintangan hingga level {MAX_LEVEL}. Kamu adalah navigator ulung!</p>
          <div className="flex flex-col gap-4">
            <Link href="/games" className="bg-cyan-500 text-teal-950 px-12 py-4 rounded-full font-black text-xl transition-all hover:scale-105">
              KEMBALI KE MENU
            </Link>
            <button 
              onClick={resetThisGame}
              className="text-teal-400 hover:text-white text-sm font-bold underline transition-colors"
            >
              Mulai Ulang dari Level 1
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teal-950 text-white p-6 flex flex-col items-center">
      <header className="w-full max-w-4xl flex items-center justify-between mb-8 z-10">
        <Link href="/games" className="flex items-center gap-2 text-teal-400 hover:text-white font-bold bg-teal-900/50 px-4 py-2 rounded-lg backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5" /> Kembali
        </Link>
        <div className="flex items-center gap-2">
          <Map className="w-8 h-8 text-teal-400" />
          <h1 className="text-2xl font-black uppercase text-teal-300 tracking-widest hidden md:block">Labirin Koordinat</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-full font-black shadow-lg border border-red-500/30 flex items-center gap-2">
            <Heart className="w-5 h-5 fill-current" />
            {hearts}
          </div>
          <div className="bg-teal-900 border border-teal-700 px-6 py-2 rounded-full font-black text-cyan-400 shadow-lg">
            LEVEL {currentLevel}
          </div>
          <div className="bg-yellow-400 text-teal-900 px-6 py-2 rounded-full font-black shadow-lg">
            POIN: {gamePoints}
          </div>
        </div>
      </header>

      <main className="w-full max-w-3xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mt-4">
        <div className="relative bg-teal-900/30 p-4 rounded-3xl border-4 border-teal-800 shadow-2xl">
          <div className="absolute -top-6 left-0 right-0 flex justify-center text-teal-500 font-mono text-sm font-bold">Sumbu X (0 - {gridSize-1})</div>
          <div className="absolute top-0 bottom-0 -left-6 flex flex-col justify-center items-center text-teal-500 font-mono text-sm font-bold [writing-mode:vertical-rl] rotate-180">Sumbu Y (0 - {gridSize-1})</div>

          <div 
            className="grid gap-1 bg-teal-950 p-2 rounded-2xl"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              width: `${Math.min(300 + (gridSize * 20), 400)}px`,
              height: `${Math.min(300 + (gridSize * 20), 400)}px`
            }}
          >
            {Array.from({ length: gridSize * gridSize }).map((_, i) => {
              const y = Math.floor(i / gridSize);
              const x = i % gridSize;
              const isTarget = x === targetPos.x && y === targetPos.y;
              const isObstacle = obstacles.some(o => o.x === x && o.y === y);
              return (
                <div key={i} className="bg-teal-900/50 rounded-md border border-teal-800/50 flex items-center justify-center relative">
                  {isTarget && <Flag className="w-3/4 h-3/4 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />}
                  {isObstacle && <BatteryWarning className="w-3/4 h-3/4 text-red-500 opacity-80" />}
                </div>
              );
            })}

            <motion.div
              initial={false}
              animate={{ 
                x: `calc(${robotPos.x * 100}% + ${robotPos.x * 4}px)`, 
                y: `calc(${robotPos.y * 100}% + ${robotPos.y * 4}px)` 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute top-2 left-2 flex items-center justify-center z-10"
              style={{
                width: `calc((100% - 16px - ${(gridSize - 1) * 4}px) / ${gridSize})`,
                height: `calc((100% - 16px - ${(gridSize - 1) * 4}px) / ${gridSize})`
              }}
            >
              <div className={`w-full h-full rounded-md shadow-lg flex items-center justify-center
                ${status === 'crashed' ? 'bg-red-600 animate-ping' : status === 'won' ? 'bg-green-500' : 'bg-cyan-400'}
              `}>
                <Bot className={`w-3/4 h-3/4 ${status === 'crashed' ? 'text-black' : 'text-teal-950'}`} />
              </div>
            </motion.div>
          </div>

          <AnimatePresence>
            {status !== 'playing' && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-teal-950/80 rounded-2xl flex flex-col items-center justify-center z-20 backdrop-blur-sm"
              >
                {status === 'won' ? (
                  <>
                    <Flag className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
                    <h2 className="text-3xl font-black text-green-400">TARGET DICAPAI!</h2>
                    <p className="text-teal-200 mt-2">Membuka Area Selanjutnya...</p>
                  </>
                ) : (
                  <>
                    <BatteryWarning className="w-16 h-16 text-red-500 mb-4" />
                    <h2 className="text-3xl font-black text-red-500 uppercase">Tabrakan!</h2>
                    <p className="text-teal-200 mt-2 mb-6">Nyawa harianmu berkurang.</p>
                    <button onClick={() => initLevel(currentLevel)} className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-2 rounded-lg">
                      ULANGI LEVEL
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center gap-8 w-full max-w-xs">
          <div className="bg-teal-900/50 p-6 rounded-2xl border border-teal-700 w-full text-center">
            <h3 className="text-teal-400 font-bold mb-2 tracking-widest text-sm uppercase">Koordinat Saat Ini</h3>
            <div className="text-5xl font-black font-mono text-cyan-300">
              ({robotPos.x}, {robotPos.y})
            </div>
            <div className="text-teal-500 text-xs mt-4 uppercase font-bold">Target: ({targetPos.x}, {targetPos.y})</div>
          </div>

          <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
            <div />
            <button onClick={() => moveRobot(0, -1)} disabled={status !== 'playing'} className="bg-teal-700 hover:bg-teal-600 active:bg-teal-500 disabled:opacity-50 text-white p-4 rounded-xl flex items-center justify-center shadow-lg transition-colors">
              <ArrowUp className="w-8 h-8" />
            </button>
            <div />
            <button onClick={() => moveRobot(-1, 0)} disabled={status !== 'playing'} className="bg-teal-700 hover:bg-teal-600 active:bg-teal-500 disabled:opacity-50 text-white p-4 rounded-xl flex items-center justify-center shadow-lg transition-colors">
              <ArrowL className="w-8 h-8" />
            </button>
            <button onClick={() => moveRobot(0, 1)} disabled={status !== 'playing'} className="bg-teal-700 hover:bg-teal-600 active:bg-teal-500 disabled:opacity-50 text-white p-4 rounded-xl flex items-center justify-center shadow-lg transition-colors">
              <ArrowDown className="w-8 h-8" />
            </button>
            <button onClick={() => moveRobot(1, 0)} disabled={status !== 'playing'} className="bg-teal-700 hover:bg-teal-600 active:bg-teal-500 disabled:opacity-50 text-white p-4 rounded-xl flex items-center justify-center shadow-lg transition-colors">
              <ArrowRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      </main>

      {renderTitleModal()}
    </div>
  );
}
