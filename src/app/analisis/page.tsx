'use client';

import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Gamepad2, Target, Zap, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AnalysisPage() {
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalMisi: 0,
    totalXp: 0,
    gameMaxed: 0,
    titlesCount: 0,
    titles: [] as string[]
  });

  useEffect(() => {
    async function loadData() {
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = 'guest_' + Math.random().toString(36).substring(7);
        localStorage.setItem('userId', userId);
      }

      try {
        // Fetch Learning Progress
        const learnRes = await fetch(`/api/learning/progress?userId=${userId}`);
        const learnData = await learnRes.json();
        
        let completedTopics = 0;
        let xp = 0;
        if (Array.isArray(learnData)) {
          learnData.forEach(item => {
            if (item.isCompleted) completedTopics++;
            xp += item.score || 0;
          });
        }

        // Fetch Game Progress & Titles
        const gameRes = await fetch(`/api/games/progress?userId=${userId}`);
        const gameData = await gameRes.json();
        
        let maxedGames = 0;
        if (Array.isArray(gameData.progress)) {
          maxedGames = gameData.progress.filter((p: any) => p.isMaxed).length;
        }
        
        const userTitles = gameData.titles || [];

        setStats({
          totalMisi: completedTopics,
          totalXp: xp,
          gameMaxed: maxedGames,
          titlesCount: userTitles.length,
          titles: userTitles
        });

        // Get AI Tips
        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            totalSolved: completedTopics,
            totalXp: xp,
            completedGames: maxedGames,
            titles: userTitles
          })
        });
        const analyzeData = await analyzeRes.json();
        setAiTips(Array.isArray(analyzeData.tips) ? analyzeData.tips : [analyzeData.tips]);
      } catch (error) {
        console.error("Gagal memuat analisis:", error);
        setAiTips([
          "Teruslah berlatih setiap hari agar logika matematikamu makin tajam!",
          "Jangan takut salah, karena dari kesalahanlah kita belajar paling banyak."
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const statCards = [
    { label: 'Bab Diselesaikan', value: stats.totalMisi, icon: Target, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total XP', value: stats.totalXp, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Game Tamat', value: stats.gameMaxed, icon: Gamepad2, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Gelar Diraih', value: stats.titlesCount, icon: Zap, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pt-20">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Analisis Kemajuan 📊</h1>
          <p className="text-gray-500">Lihat seberapa jauh kamu telah berkembang dari datamu yang sebenarnya.</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-bold">Menganalisis data belajarmu...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6"
                  >
                    <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-500" />
                  Koleksi Gelar (Achievements)
                </h2>
              </div>

              <div className="space-y-4">
                {stats.titles.length > 0 ? (
                  stats.titles.map((title, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-2xl border-2 border-yellow-100 bg-yellow-50/50"
                    >
                      <div className="w-12 h-12 bg-yellow-400 text-white rounded-full flex items-center justify-center shadow-inner">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{title}</p>
                        <p className="text-xs text-gray-500">Gelar kehormatan karena menamatkan game spesifik.</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center p-8 border border-dashed border-gray-200 rounded-2xl">
                    <p className="text-gray-500">Belum ada gelar yang diraih. Tamatkan minigames untuk mendapatkan gelar!</p>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-indigo-600 p-8 rounded-3xl shadow-xl text-white overflow-hidden relative">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">Saran Belajar Cerdas 🤖</h2>
                <p className="opacity-90 mb-6">Berdasarkan data belajarmu, AI Assistant menyarankan:</p>
                <div className="space-y-3">
                  {aiTips.length > 0 ? (
                    aiTips.map((tip, idx) => (
                      <div key={idx} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex gap-3 items-start">
                        <span className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{idx + 1}</span>
                        <p className="font-medium leading-relaxed">{tip}</p>
                      </div>
                    ))
                  ) : (
                    <p className="italic bg-white/10 p-4 rounded-2xl">Ayo kumpulkan lebih banyak XP agar AI bisa memberikan saran yang lebih akurat!</p>
                  )}
                </div>
              </div>
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
