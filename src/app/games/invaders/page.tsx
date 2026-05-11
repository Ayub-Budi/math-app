'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Target, Heart, RefreshCcw, ArrowRight, XCircle, Trophy, Star, Brain } from 'lucide-react';
import Link from 'next/link';
import { useGameProgress } from '@/components/useGameProgress';

interface Meteor {
  id: number;
  value: number;
  x: number; // 0 to 100 percentage
}

export default function MathInvadersPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [equation, setEquation] = useState({ num1: 0, num2: 0, operator: '+', answer: 0 });
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const [speed, setSpeed] = useState(6000); 
  const [correctInLevel, setCorrectInLevel] = useState(0);
  const meteorIdCounter = useRef(0);
  const clickedMeteors = useRef<Set<number>>(new Set());
  const [particles, setParticles] = useState<{id: string, x: number, y: number}[]>([]);
  const { currentLevel, hearts, deductHeart, addGamePoints, saveProgress, loading, renderTitleModal, handleGlobalReset, resetThisGame, isGameFinished, MAX_LEVEL, gamePoints } = useGameProgress('invaders');

  const generateEquation = () => {
    const operators = ['+', '-', '*'];
    const op = operators[Math.floor(Math.random() * operators.length)];
    let n1 = Math.floor(Math.random() * 10) + 1;
    let n2 = Math.floor(Math.random() * 10) + 1;
    
    if (op === '-' && n2 > n1) [n1, n2] = [n2, n1];
    
    let ans = 0;
    if (op === '+') ans = n1 + n2;
    if (op === '-') ans = n1 - n2;
    if (op === '*') ans = n1 * n2;
    
    setEquation({ num1: n1, num2: n2, operator: op, answer: ans });
    return ans;
  };

  const startGame = () => {
    if (hearts <= 0) return;
    setScore(0);
    setCorrectInLevel(0);
    setMeteors([]);
    setSpeed(Math.max(1500, 6000 - (currentLevel - 1) * 500));
    meteorIdCounter.current = 0;
    generateEquation();
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying || hearts <= 0) return;

    const spawnInterval = setInterval(() => {
      setMeteors(prev => {
        if (prev.length > 5) return prev;
        const isCorrect = Math.random() > 0.5;
        let value = isCorrect ? equation.answer : Math.floor(Math.random() * 50);
        if (!isCorrect && value === equation.answer) value += 1;

        const newMeteor: Meteor = {
          id: meteorIdCounter.current++,
          value,
          x: Math.floor(Math.random() * 70) + 15,
        };
        return [...prev, newMeteor];
      });
    }, 2000);

    return () => clearInterval(spawnInterval);
  }, [isPlaying, equation, hearts]);

  const handleMeteorClick = async (meteor: Meteor, e: React.MouseEvent) => {
    clickedMeteors.current.add(meteor.id);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const newParticleId = Date.now().toString() + Math.random();
    setParticles(prev => [...prev, { id: newParticleId, x, y }]);
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticleId));
    }, 1000);

    if (meteor.value === equation.answer) {
      const newScore = score + 10;
      const newCorrect = correctInLevel + 1;
      setScore(newScore);
      setCorrectInLevel(newCorrect);
      
      addGamePoints(15);
      setMeteors([]);

      if (newCorrect >= 5) {
        saveProgress(currentLevel + 1);
        setIsPlaying(false);
      } else {
        generateEquation();
      }
    } else {
      await deductHeart();
      setCorrectInLevel(0); 
      setIsPlaying(false);
      setMeteors([]);
    }
  };

  const handleMeteorMissed = async (meteor: Meteor) => {
    if (clickedMeteors.current.has(meteor.id)) return;

    if (meteor.value === equation.answer) {
      await deductHeart();
      setCorrectInLevel(0); 
      setIsPlaying(false);
      setMeteors([]);
    } else {
      setMeteors(prev => prev.filter(m => m.id !== meteor.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
        <p className="text-xs font-black tracking-[0.4em] uppercase opacity-50">Menyiapkan Pertahanan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center overflow-hidden relative selection:bg-red-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_20%,rgba(220,38,38,0.05)_0%,transparent_50%)]" />
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute w-[1px] h-[1px] bg-white rounded-full animate-pulse" style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, animationDuration: `${2 + Math.random()*4}s` }} />
        ))}
      </div>

      {/* Header */}
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
             Lvl {currentLevel}
           </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="w-full max-w-4xl flex-1 flex flex-col relative mx-2 md:mx-4 mb-6 md:mb-8 border border-white/5 rounded-[1.5rem] md:rounded-[2rem] bg-slate-900/20 backdrop-blur-3xl overflow-hidden z-10 shadow-2xl">
        
        {/* Progress Bar Top */}
        <div className="absolute top-0 left-0 right-0 h-1 md:h-1.5 bg-slate-950/50 z-20">
          <motion.div 
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500"
            animate={{ width: `${(correctInLevel / 5) * 100}%` }}
          />
        </div>

        {/* Modals & Overlays */}
        <AnimatePresence>
          {hearts <= 0 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-[#020617]/90 z-50 p-6 backdrop-blur-md"
            >
              <div className="text-center max-w-sm space-y-4 md:space-y-6">
                <XCircle className="w-16 h-16 md:w-20 md:h-20 text-red-500 mx-auto" />
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-2">Energi Habis!</h2>
                  <p className="text-slate-400 text-[10px] md:text-sm leading-relaxed uppercase tracking-widest font-bold">Pertahanan runtuh. Kembali besok!</p>
                </div>
                <Link href="/games" className="block w-full bg-white text-slate-950 font-black py-3 md:py-4 rounded-xl text-[10px] md:text-xs uppercase tracking-widest shadow-xl">
                  KEMBALI KE MENU
                </Link>
              </div>
            </motion.div>
          )}

          {isGameFinished && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-[#020617]/95 z-[60] p-6 backdrop-blur-md"
            >
              <div className="text-center max-w-sm space-y-4 md:space-y-6">
                <Trophy className="w-16 h-16 md:w-20 md:h-20 text-yellow-400 mx-auto animate-bounce" />
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-2">MISI TUNTAS!</h2>
                  <p className="text-slate-400 text-[10px] md:text-sm leading-relaxed uppercase tracking-widest font-bold">Bumi aman! Kamu mencapai level maksimal ({MAX_LEVEL}).</p>
                </div>
                <div className="space-y-3">
                  <Link href="/games" className="block w-full bg-white text-slate-950 font-black py-3 md:py-4 rounded-xl text-[10px] md:text-xs uppercase tracking-widest shadow-xl">
                    KEMBALI KE MENU
                  </Link>
                  <button onClick={resetThisGame} className="text-slate-500 hover:text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest underline transition-colors">
                    Mulai Lagi dari Level 1
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {!isPlaying && hearts > 0 && !isGameFinished && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-slate-950/60 z-50 backdrop-blur-sm"
            >
              <div className="text-center max-w-md p-6 md:p-8 space-y-6 md:space-y-8">
                <div className="space-y-3 md:space-y-4">
                  <h2 className="text-3xl md:text-6xl font-black text-red-500 tracking-tighter uppercase">MATH INVADERS</h2>
                  <p className="text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-widest leading-relaxed">Tembak meteor dengan jawaban benar! Hati-hati, jika salah atau terlewat nyawa berkurang.</p>
                </div>
                <button onClick={startGame} className="bg-red-600 hover:bg-red-500 text-white font-black px-10 md:px-12 py-4 md:py-5 rounded-xl md:rounded-2xl text-xs md:text-sm uppercase tracking-widest shadow-[0_0_50px_rgba(220,38,38,0.3)] transition-all hover:scale-105 active:scale-95">
                  MULAI MISI
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play Area */}
        <div className="flex-1 relative w-full h-[45vh] md:h-[60vh]">
          <AnimatePresence>
            {isPlaying && hearts > 0 && meteors.map(meteor => (
              <motion.div
                key={meteor.id}
                initial={{ y: -100, x: `${meteor.x}%` }}
                animate={{ y: '60vh', x: `${meteor.x}%` }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                  y: { duration: speed / 1000, ease: "linear" },
                  opacity: { duration: 0.1 },
                  scale: { duration: 0.1 }
                }}
                onAnimationComplete={() => handleMeteorMissed(meteor)}
                onClick={(e) => handleMeteorClick(meteor, e)}
                className="absolute top-0 w-14 h-14 md:w-20 md:h-20 cursor-crosshair group -translate-x-1/2"
              >
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-600 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center justify-center text-lg md:text-3xl font-black text-white relative">
                  <div className="absolute -top-6 md:-top-8 w-5 md:w-6 h-10 md:h-12 bg-gradient-to-t from-red-500/40 to-transparent blur-md rounded-full -z-10" />
                  {meteor.value}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Dashboard Equation */}
        <div className="p-4 md:p-10 bg-slate-950/80 border-t border-white/5 flex flex-col items-center justify-center relative z-20">
          <div className="text-[8px] md:text-[10px] text-slate-500 font-black mb-3 md:mb-4 tracking-[0.3em] uppercase">Target Neural Kalkulasi:</div>
          <div className="text-3xl md:text-6xl font-black text-white flex items-center gap-3 md:gap-8 tracking-tighter">
            <span className="text-cyan-400">{equation.num1}</span>
            <span className="text-red-500/50 text-xl md:text-4xl">{equation.operator === '*' ? '×' : equation.operator}</span>
            <span className="text-cyan-400">{equation.num2}</span>
            <span className="text-slate-700">=</span>
            <div className="w-12 h-12 md:w-24 md:h-24 bg-slate-900 border-2 border-white/5 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-600 animate-pulse text-xl md:text-4xl">
              ?
            </div>
          </div>
        </div>
      </main>

      {/* Particle Effects */}
      <div className="fixed inset-0 pointer-events-none z-[100]">
        <AnimatePresence>
          {particles.map(p => (
            <motion.div key={p.id} className="absolute" style={{ left: p.x, top: p.y }}>
              {[...Array(12)].map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const velocity = 40 + Math.random() * 80;
                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                    animate={{ 
                      x: Math.cos(angle) * velocity, 
                      y: Math.sin(angle) * velocity, 
                      scale: 0, 
                      opacity: 0 
                    }}
                    transition={{ duration: 0.4 + Math.random() * 0.3, ease: "easeOut" }}
                    className="absolute w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]"
                  />
                );
              })}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {renderTitleModal()}
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
