'use client';

import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Star, Shapes, Brain, SortAsc, Target, Unlock, Map, Layers, Heart, Gamepad2, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const GAMES = [
  {
    id: 'assessment',
    title: 'Cocokkan Bentuk',
    description: 'Uji ingatan visualmu dengan menggeser bentuk geometri ke wadah yang tepat!',
    icon: Shapes,
    color: 'from-indigo-600 to-purple-600',
    iconColor: 'text-yellow-400',
    xp: '20 XP',
    difficulty: 'Mudah'
  },
  {
    id: 'equation-game',
    title: 'Timbangan Angka',
    description: 'Gunakan logikamu untuk menyeimbangkan persamaan matematika yang menantang!',
    icon: Brain,
    color: 'from-emerald-600 to-teal-600',
    iconColor: 'text-emerald-300',
    xp: '10 XP',
    difficulty: 'Sedang'
  },
  {
    id: 'sort-game',
    title: 'Urutan Cepat',
    description: 'Susun deretan angka dari yang terkecil hingga terbesar secepat kilat!',
    icon: SortAsc,
    color: 'from-blue-600 to-cyan-600',
    iconColor: 'text-blue-300',
    xp: '15 XP',
    difficulty: 'Mudah'
  },
  {
    id: 'invaders',
    title: 'Math Invaders',
    description: 'Tembak meteor berangka sebelum menyentuh bumi. Uji kecepatan berhitungmu!',
    icon: Target,
    color: 'from-red-600 to-orange-600',
    iconColor: 'text-red-300',
    xp: '15 XP',
    difficulty: 'Sulit'
  },
  {
    id: 'fraction-bridge',
    title: 'Jembatan Pecahan',
    description: 'Susun balok pecahan untuk membangun jembatan agar karakter bisa menyeberang!',
    icon: Layers,
    color: 'from-orange-600 to-yellow-600',
    iconColor: 'text-orange-200',
    xp: '40 XP',
    difficulty: 'Sedang'
  },
  {
    id: 'pattern-breaker',
    title: 'Brankas Pola',
    description: 'Pecahkan pola deret angka rahasia untuk membuka brankas keamanan tinggi!',
    icon: Unlock,
    color: 'from-slate-700 to-slate-900',
    iconColor: 'text-cyan-400',
    xp: '25 XP',
    difficulty: 'Sulit'
  },
  {
    id: 'grid-navigator',
    title: 'Labirin Koordinat',
    description: 'Bantu robot melewati labirin menggunakan instruksi arah dan koordinat!',
    icon: Map,
    color: 'from-teal-600 to-cyan-700',
    iconColor: 'text-teal-200',
    xp: '25 XP',
    difficulty: 'Sedang'
  }
];

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
    <div className="min-h-screen bg-[#020617] pb-24 selection:bg-indigo-500/30">
      <Navbar />
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(79,70,229,0.1)_0%,transparent_50%)]" />
      </div>

      <main className="max-w-7xl mx-auto px-4 pt-8 md:pt-32 relative z-10">
        <header className="mb-10 md:mb-16 text-center space-y-6 md:space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 md:gap-3 bg-slate-900/50 border border-white/5 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl shadow-2xl backdrop-blur-3xl group"
          >
            <Heart className={`w-4 h-4 md:w-5 md:h-5 text-red-500 transition-transform duration-500 group-hover:scale-110 ${health === 0 ? 'grayscale' : 'fill-current animate-pulse'}`} />
            <span className="font-black text-slate-300 text-[10px] md:text-sm uppercase tracking-widest">Energi: {health ?? '...'} / 5</span>
          </motion.div>

          <div className="space-y-3 md:space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-6xl font-black text-white tracking-tighter uppercase flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4"
            >
              <Gamepad2 className="w-8 h-8 md:w-16 md:h-16 text-indigo-500" /> Neural Arena
            </motion.h1>
            <p className="text-slate-500 max-w-2xl mx-auto text-[10px] md:text-base font-medium leading-relaxed uppercase tracking-widest px-4">
              Uji ketangkasan kognitifmu dalam simulasi neural interaktif.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8 mb-12">
          {GAMES.map((game, idx) => (
            <motion.div 
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link href={`/games/${game.id}`} className="group relative block h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-[2rem] md:rounded-[2.5rem] border border-white/5 transition-all duration-500 group-hover:border-white/20 group-hover:bg-white/[0.05]" />
                
                <div className="relative p-6 md:p-10 flex flex-col h-full space-y-4 md:space-y-6">
                  <div className="flex justify-between items-start">
                    <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br ${game.color} shadow-2xl transition-transform duration-500 group-hover:scale-110`}>
                      <game.icon className={`w-6 h-6 md:w-8 md:h-8 ${game.iconColor} drop-shadow-xl`} />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                       <span className="bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full text-[8px] md:text-[9px] font-black text-indigo-400 uppercase tracking-widest">{game.xp}</span>
                       <span className="text-[7px] md:text-[8px] font-black text-slate-600 uppercase tracking-widest">{game.difficulty}</span>
                    </div>
                  </div>

                  <div className="space-y-2 md:space-y-3 flex-1">
                    <h3 className="text-lg md:text-2xl font-black text-white tracking-tight uppercase group-hover:text-indigo-400 transition-colors">{game.title}</h3>
                    <p className="text-slate-500 text-[10px] md:text-sm font-medium leading-relaxed line-clamp-2 md:line-clamp-none">{game.description}</p>
                  </div>

                  <div className="pt-2 md:pt-4 flex items-center gap-2 text-indigo-500 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                    Mulai Simulasi <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          
          {/* Coming Soon Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 bg-slate-900/10 backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-3 md:space-y-4 group opacity-50 h-48 md:h-full"
          >
            <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-slate-700" />
            <div>
              <h3 className="text-sm md:text-lg font-black text-slate-700 uppercase tracking-widest">Misi Baru</h3>
              <p className="text-slate-800 text-[9px] md:text-xs font-bold uppercase tracking-tighter">Dalam pengembangan...</p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
