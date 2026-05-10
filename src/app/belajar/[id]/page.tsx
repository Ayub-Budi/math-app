'use client';

import { use, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle, Lock, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getCategoryById } from '@/lib/topics';

export default function CategoryTopicsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const categoryId = resolvedParams.id;
  const category = getCategoryById(categoryId);
  
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'guest_' + Math.random().toString(36).substring(7);
      localStorage.setItem('userId', userId);
    }

    fetch(`/api/learning/progress?userId=${userId}&categoryId=${categoryId}`)
      .then(res => res.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          const map: Record<string, boolean> = {};
          data.forEach(item => {
            if (item.isCompleted) {
              map[item.topicId] = true;
            }
          });
          setCompletedTopics(map);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal load progres:", err);
        setLoading(false);
      });
  }, [categoryId]);

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Kategori Tidak Ditemukan</h1>
          <Link href="/belajar" className="text-indigo-600 hover:underline">Kembali ke Menu Utama</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pt-20">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-12">
          <Link href="/belajar" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 font-medium">
            <ArrowLeft className="w-5 h-5" /> Kembali ke Bidang Ilmu
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-4 rounded-2xl ${category.color} text-white shadow-lg`}>
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">{category.title}</h1>
              <p className="text-gray-500 text-lg">{category.description}</p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Daftar Materi (Bab)</h2>
          
          {loading ? (
            <div className="text-center py-10 text-gray-400 font-medium animate-pulse">
              Memuat progres belajar Anda...
            </div>
          ) : (
            <div className="grid gap-4">
              {category.topics.map((topic, index) => {
                // Untuk demo, kita buat semua bab terbuka, ATAU bisa juga dikunci berdasarkan bab sebelumnya
                // Di sini kita buka semua agar user bebas memilih
                const isCompleted = completedTopics[topic.id];

                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link 
                      href={`/belajar/${categoryId}/${topic.id}`}
                      className={`
                        flex items-center justify-between p-6 rounded-2xl border-2 transition-all group
                        ${isCompleted 
                          ? 'bg-green-50 border-green-200 hover:border-green-400' 
                          : 'bg-white border-gray-100 hover:border-indigo-300 hover:shadow-lg'}
                      `}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                          ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}
                        `}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className={`text-xl font-bold mb-1 ${isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
                            {topic.title}
                          </h3>
                          <p className="text-gray-500 text-sm">{topic.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                          +{topic.xpReward} XP
                        </div>
                        {isCompleted ? (
                          <CheckCircle className="w-8 h-8 text-green-500" />
                        ) : (
                          <PlayCircle className="w-8 h-8 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
