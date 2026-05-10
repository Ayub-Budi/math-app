'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Target, Heart, RefreshCcw, ArrowRight, XCircle, Trophy } from 'lucide-react';
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
  const [speed, setSpeed] = useState(6000); // ms to reach bottom
  const [correctInLevel, setCorrectInLevel] = useState(0);
  const meteorIdCounter = useRef(0);
  const clickedMeteors = useRef<Set<number>>(new Set());
  const [particles, setParticles] = useState<{id: string, x: number, y: number}[]>([]);
  const { currentLevel, hearts, deductHeart, addGamePoints, saveProgress, loading, renderTitleModal, handleGlobalReset, resetThisGame, isGameFinished, MAX_LEVEL, gamePoints } = useGameProgress('invaders');

  // Generate new equation
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
    // Kecepatan awal 6 detik, berkurang 500ms setiap level
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
          x: Math.floor(Math.random() * 80) + 10,
        };
        return [...prev, newMeteor];
      });
    }, 2000);

    return () => clearInterval(spawnInterval);
  }, [isPlaying, equation, hearts]);

  const handleMeteorClick = async (meteor: Meteor, e: React.MouseEvent) => {
    // Tandai meteor ini sudah di-klik agar tidak memicu pengurangan nyawa saat animasi menghilangnya selesai
    clickedMeteors.current.add(meteor.id);

    // Dapatkan titik koordinat klik untuk pusat ledakan
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const newParticleId = Date.now().toString() + Math.random();
    setParticles(prev => [...prev, { id: newParticleId, x, y }]);
    
    // Hilangkan partikel setelah 1 detik
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
        // Level Selesai!
        saveProgress(currentLevel + 1);
        setIsPlaying(false);
      } else {
        generateEquation();
      }
    } else {
      // Salah Tembak! Game Stop & Nyawa Kurang
      await deductHeart();
      setCorrectInLevel(0); // Reset progres level ini
      setIsPlaying(false);
      setMeteors([]);
    }
  };

  const handleMeteorMissed = async (meteor: Meteor) => {
    // Jika meteor ini sebelumnya sudah di-klik, abaikan (karena itu animasi exit, bukan jatuh ke bumi)
    if (clickedMeteors.current.has(meteor.id)) return;

    if (meteor.value === equation.answer) {
      // Meteor jawaban benar lolos! Game Stop & Nyawa Kurang
      await deductHeart();
      setCorrectInLevel(0); // Reset progres level ini
      setIsPlaying(false);
      setMeteors([]);
    } else {
      setMeteors(prev => prev.filter(m => m.id !== meteor.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xl font-bold tracking-widest uppercase">Memuat Pertahanan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center overflow-hidden relative">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-white rounded-full" style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%` }} />
        ))}
      </div>

      <header className="w-full max-w-4xl flex items-center justify-between mb-8 z-10">
        <Link href="/games" className="flex items-center gap-2 text-slate-400 hover:text-white font-bold bg-slate-900/50 px-4 py-2 rounded-full backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5" /> Kembali
        </Link>
        <div className="flex gap-4 items-center bg-slate-900/50 px-6 py-2 rounded-full backdrop-blur-sm">
          <div className="flex items-center gap-2 text-red-500 mr-2">
            <Heart className="w-5 h-5 fill-current" />
            <span className="font-black">{hearts}</span>
          </div>
          <div className="font-black text-slate-300">LEVEL: {currentLevel}</div>
          <div className="font-black text-cyan-400">MISI: {correctInLevel}/5</div>
          <div className="font-black text-yellow-400">POIN: {gamePoints}</div>
        </div>
      </header>

      <main className="w-full max-w-4xl flex-1 flex flex-col relative border-2 border-slate-800 rounded-3xl bg-slate-900/30 backdrop-blur-sm overflow-hidden z-10">
        
        {hearts <= 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-50 p-6 text-center">
            <XCircle className="w-24 h-24 text-red-500 mb-6" />
            <h2 className="text-5xl font-black mb-4 text-white uppercase tracking-tighter">Energi Habis!</h2>
            <p className="text-xl text-slate-400 mb-10 max-w-sm">Pertahanan runtuh. Nyawa harianmu habis. Kembali lagi besok untuk melindungi bumi!</p>
            <Link href="/games" className="bg-white text-slate-950 font-black px-12 py-4 rounded-full text-xl transition-all hover:scale-105">
              KEMBALI KE MENU
            </Link>
            {process.env.NODE_ENV === 'development' && (
              <button 
                onClick={handleGlobalReset}
                className="mt-8 text-slate-400 hover:text-white text-sm font-bold underline transition-colors"
              >
                Hapus Semua Progres & Isi Ulang Nyawa (Dev Mode)
              </button>
            )}
          </div>
        )}

        {isGameFinished && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 z-[60] p-6 text-center">
            <Trophy className="w-24 h-24 text-yellow-400 mb-6 animate-bounce" />
            <h2 className="text-6xl font-black mb-4 text-white uppercase tracking-tighter">MISI TUNTAS! 🚀</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-md">Bumi telah aman dari serangan meteor matematika! Kamu telah mencapai level maksimal ({MAX_LEVEL}).</p>
            <div className="flex flex-col gap-4">
              <Link href="/games" className="bg-white text-slate-950 font-black px-12 py-4 rounded-full text-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                KEMBALI KE MENU
              </Link>
              <button 
                onClick={resetThisGame}
                className="text-slate-400 hover:text-white text-sm font-bold underline transition-colors"
              >
                Mulai Lagi dari Level 1
              </button>
            </div>
          </div>
        )}

        {!isPlaying && hearts > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-50">
            <h2 className="text-5xl font-black mb-4 text-red-500">MATH INVADERS</h2>
            <p className="text-slate-300 mb-8 max-w-md text-center">Tembak meteor dengan jawaban benar! Hati-hati, jika salah atau terlewat nyawa harianmu berkurang.</p>
            <button onClick={startGame} className="bg-red-600 hover:bg-red-500 text-white font-black px-12 py-4 rounded-full text-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(220,38,38,0.5)]">
              MULAI MISI
            </button>
          </div>
        )}

        {/* Area Bermain */}
        <div className="flex-1 relative w-full h-[60vh]">
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
                className="absolute top-0 w-20 h-20 cursor-crosshair group"
              >
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-600 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.8)] flex items-center justify-center text-3xl font-black text-white relative">
                  <div className="absolute -top-10 w-8 h-16 bg-gradient-to-t from-red-500/50 to-transparent blur-md rounded-full -z-10" />
                  {meteor.value}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Papan Persamaan */}
        <div className="h-32 bg-slate-900 border-t-4 border-slate-700 flex flex-col items-center justify-center relative z-20">
          <div className="text-sm text-slate-400 font-bold mb-2 tracking-widest uppercase">Tembak Jawaban Dari:</div>
          <div className="text-5xl font-black text-cyan-400 font-mono flex items-center gap-6">
            <span>{equation.num1}</span>
            <span className="text-red-500">{equation.operator === '*' ? '×' : equation.operator}</span>
            <span>{equation.num2}</span>
            <span className="text-slate-500">=</span>
            <span className="text-slate-600">?</span>
          </div>
        </div>
      </main>

      {/* Particle Effects Container */}
      <div className="fixed inset-0 pointer-events-none z-[100]">
        <AnimatePresence>
          {particles.map(p => (
            <motion.div key={p.id} className="absolute" style={{ left: p.x, top: p.y }}>
              {[...Array(15)].map((_, i) => {
                const angle = (i / 15) * Math.PI * 2;
                const velocity = 50 + Math.random() * 100;
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
                    transition={{ duration: 0.5 + Math.random() * 0.3, ease: "easeOut" }}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: ['#ef4444', '#f97316', '#fbbf24', '#ffffff'][Math.floor(Math.random() * 4)],
                      boxShadow: '0 0 15px currentColor'
                    }}
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
