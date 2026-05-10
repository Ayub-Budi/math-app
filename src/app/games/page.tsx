'use client';

import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Star, Shapes, Brain, SortAsc, Target, Unlock, Map, Layers, Heart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function GamesMenuPage() {
  const [health, setHealth] = useState<number | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      fetch(`/api/user?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.health !== undefined) setHealth(data.health);
        });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pt-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12 text-center relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-md border border-red-50 mb-6 group hover:shadow-lg transition-all"
          >
            <Heart className={`w-6 h-6 text-red-500 group-hover:scale-125 transition-transform duration-300 ${health === 0 ? 'grayscale' : 'fill-current'}`} />
            <span className="font-black text-gray-700">Nyawa Harian: {health ?? '...'} / 5</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3"
          >
            Mini Game Center <span className="text-5xl">🎮</span>
          </motion.h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Bosan belajar teori? Ayo asah otakmu dengan berbagai mini game interaktif! Kumpulkan XP dan jadilah juara.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12">
          {/* Game 1: Shapes */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Link href="/games/assessment" className="block group bg-indigo-900 rounded-[2rem] p-6 text-white hover:scale-105 transition-all shadow-xl relative overflow-hidden h-full">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
               <Shapes className="w-12 h-12 mb-4 text-yellow-400 drop-shadow-lg" />
               <h3 className="text-xl font-bold mb-2">Cocokkan Bentuk</h3>
               <p className="text-indigo-200 text-xs leading-relaxed mb-6">Uji ingatan visualmu dengan menggeser bentuk geometri ke wadah yang tepat!</p>
            </Link>
          </motion.div>

          {/* Game 2: Equation */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Link href="/games/equation-game" className="block group bg-emerald-700 rounded-[2rem] p-6 text-white hover:scale-105 transition-all shadow-xl relative overflow-hidden h-full">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
               <Brain className="w-12 h-12 mb-4 text-emerald-300 drop-shadow-lg" />
               <h3 className="text-xl font-bold mb-2">Timbangan Angka</h3>
               <p className="text-emerald-100 text-xs leading-relaxed mb-6">Gunakan logikamu untuk menyeimbangkan persamaan matematika yang menantang!</p>
            </Link>
          </motion.div>

          {/* Game 3: Sort */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <Link href="/games/sort-game" className="block group bg-blue-700 rounded-[2rem] p-6 text-white hover:scale-105 transition-all shadow-xl relative overflow-hidden h-full">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
               <SortAsc className="w-12 h-12 mb-4 text-blue-300 drop-shadow-lg" />
               <h3 className="text-xl font-bold mb-2">Urutan Cepat</h3>
               <p className="text-blue-100 text-xs leading-relaxed mb-6">Susun deretan angka dari yang terkecil hingga terbesar secepat kilat!</p>
            </Link>
          </motion.div>

          {/* Game 4: Math Invaders */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <Link href="/games/invaders" className="block group bg-red-700 rounded-[2rem] p-6 text-white hover:scale-105 transition-all shadow-xl relative overflow-hidden h-full">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
               <Target className="w-12 h-12 mb-4 text-red-300 drop-shadow-lg" />
               <h3 className="text-xl font-bold mb-2">Math Invaders</h3>
               <p className="text-red-100 text-xs leading-relaxed mb-6">Tembak meteor berangka yang jatuh sebelum menyentuh tanah. Uji kecepatan berhitungmu!</p>
            </Link>
          </motion.div>

          {/* Game 5: Fraction Bridge */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
            <Link href="/games/fraction-bridge" className="block group bg-orange-600 rounded-[2rem] p-6 text-white hover:scale-105 transition-all shadow-xl relative overflow-hidden h-full">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
               <Layers className="w-12 h-12 mb-4 text-orange-200 drop-shadow-lg" />
               <h3 className="text-xl font-bold mb-2">Jembatan Pecahan</h3>
               <p className="text-orange-100 text-xs leading-relaxed mb-6">Susun balok pecahan untuk membangun jembatan agar karakter bisa menyeberang!</p>
            </Link>
          </motion.div>

          {/* Game 6: Pattern Breaker */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
            <Link href="/games/pattern-breaker" className="block group bg-slate-800 rounded-[2rem] p-6 text-white hover:scale-105 transition-all shadow-xl relative overflow-hidden h-full">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
               <Unlock className="w-12 h-12 mb-4 text-cyan-400 drop-shadow-lg" />
               <h3 className="text-xl font-bold mb-2">Brankas Pola</h3>
               <p className="text-slate-300 text-xs leading-relaxed mb-6">Pecahkan pola deret angka rahasia untuk membuka brankas berteknologi tinggi!</p>
            </Link>
          </motion.div>

          {/* Game 7: Grid Navigator */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}>
            <Link href="/games/grid-navigator" className="block group bg-teal-600 rounded-[2rem] p-6 text-white hover:scale-105 transition-all shadow-xl relative overflow-hidden h-full">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
               <Map className="w-12 h-12 mb-4 text-teal-200 drop-shadow-lg" />
               <h3 className="text-xl font-bold mb-2">Labirin Koordinat</h3>
               <p className="text-teal-100 text-xs leading-relaxed mb-6">Bantu robot melewati labirin menggunakan instruksi arah dan koordinat Cartesius!</p>
            </Link>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
