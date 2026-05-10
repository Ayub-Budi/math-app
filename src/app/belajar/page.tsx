'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Calculator, Divide, Triangle, BarChart3 as Chart, ArrowRight, Star, Brain } from 'lucide-react';
import Link from 'next/link';
import { curriculum } from '@/lib/topics';

// Helper to map string ID to icon component
const getIcon = (id: string) => {
  switch (id) {
    case 'aritmatika': return Calculator;
    case 'aljabar': return Divide;
    case 'geometri': return Triangle;
    case 'statistika': return Chart;
    default: return Brain;
  }
};

export default function BelajarMenuPage() {
  const [userGrade, setUserGrade] = useState('SD');
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedGrade = localStorage.getItem('userGrade') || 'SD';
    setUserGrade(savedGrade);

    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'guest_' + Math.random().toString(36).substring(7);
      localStorage.setItem('userId', userId);
    }

    fetch(`/api/learning/progress?userId=${userId}`)
      .then(res => res.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          // Hitung progres (topik selesai) per kategori
          const progressMap: Record<string, number> = {};
          data.forEach(item => {
            if (item.isCompleted) {
              progressMap[item.categoryId] = (progressMap[item.categoryId] || 0) + 1;
            }
          });
          setUserProgress(progressMap);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal load progres:", err);
        setLoading(false);
      });
  }, []);

  const filteredCategories = curriculum.filter(cat => cat.grades.includes(userGrade));

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pt-20">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-800 mb-4"
          >
            Pilih Bidang Ilmu 📚
          </motion.h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Setiap bidang memiliki tantangan unik. Selesaikan misi untuk mendapatkan XP dan naik level!
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredCategories.map((cat, index) => {
            const Icon = getIcon(cat.id);
            const totalTopics = cat.topics.length;
            const completedTopics = userProgress[cat.id] || 0;
            const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all overflow-hidden"
              >
                {/* Decorative Background Element */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${cat.color} opacity-5 rounded-bl-full transition-all group-hover:scale-150`} />
                
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 rounded-3xl ${cat.color} text-white shadow-lg`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                    <Star className="w-3 h-3 fill-current" /> {cat.level}
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">{cat.title}</h2>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  {cat.description}
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-bold text-gray-600">Progres Belajar</span>
                    <span className="text-sm font-bold text-gray-800">{loading ? '...' : `${progressPercent}%`}</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full ${cat.color}`} 
                    />
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-xs font-medium text-gray-400">{completedTopics} dari {totalTopics} Bab selesai</span>
                    <Link 
                      href={`/belajar/${cat.id}`}
                      className={`flex items-center gap-2 font-bold ${cat.color.replace('bg-', 'text-')} hover:underline group`}
                    >
                      Daftar Bab 
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
