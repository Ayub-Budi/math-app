'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Trophy, Brain, Loader2, ArrowLeft, Star, RefreshCcw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getTopicById } from '@/lib/topics';
import confetti from 'canvas-confetti';

export default function TopicLearningPage({ params }: { params: Promise<{ id: string, topicId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const categoryId = resolvedParams.id;
  const topicId = resolvedParams.topicId;

  const topicData = getTopicById(categoryId, topicId);

  const [questions, setQuestions] = useState<any[]>([]);
  const [theoryContent, setTheoryContent] = useState<any>('');
  const [loading, setLoading] = useState(true);
  const [loadingTheory, setLoadingTheory] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isTopicCompleted, setIsTopicCompleted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFinished, setShowFinished] = useState(false);
  const [viewMode, setViewMode] = useState<'theory' | 'quiz'>('theory');
  const [timeLeft, setTimeLeft] = useState(15);
  const [xpPotential, setXpPotential] = useState(20);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function loadUserData() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    try {
      const res = await fetch(`/api/user?userId=${userId}`);
      const data = await res.json();
      if (data.health !== undefined) setHearts(data.health);
    } catch (err) {
      console.error("Gagal load data user:", err);
    }
  }

  async function checkTopicProgress() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    try {
      const res = await fetch(`/api/learning/progress?userId=${userId}&categoryId=${categoryId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const progress = data.find((p: any) => p.topicId === topicId);
        if (progress && progress.isCompleted) {
          setIsTopicCompleted(true);
        }
      }
    } catch (err) {
      console.error("Gagal cek progres bab:", err);
    }
  }

  async function loadQuestions() {
    setLoading(true);
    const savedGrade = localStorage.getItem('userGrade') || 'SD';
    try {
      const response = await fetch(`/api/questions/generate?category=${categoryId}&topic=${topicId}&grade=${savedGrade}`);
      const data = await response.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil soal:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTheory() {
    setLoadingTheory(true);
    const savedGrade = localStorage.getItem('userGrade') || 'SD';
    try {
      const response = await fetch(`/api/theory?category=${categoryId}&topic=${topicId}&grade=${savedGrade}`);
      const data = await response.json();
      setTheoryContent(data.theory || "Maaf, materi sedang tidak tersedia.");
    } catch (error) {
      console.error("Gagal mengambil teori:", error);
    } finally {
      setLoadingTheory(false);
    }
  }

  useEffect(() => {
    if (topicData) {
      loadUserData();
      checkTopicProgress();
      loadQuestions();
      loadTheory();
    }
  }, [categoryId, topicId, topicData]);

  // Timer logic
  useEffect(() => {
    if (viewMode === 'quiz' && !showFinished && isCorrect === null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        // XP berkurang setiap detik, min 5 XP
        setXpPotential((prev) => Math.max(5, Math.floor(20 * (timeLeft / 15))));
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isCorrect === null) {
      handleAnswer(''); // Time out considered wrong
    }
  }, [viewMode, showFinished, isCorrect, timeLeft]);

  const saveProgressToDb = async (finalScore: number, finalHearts: number) => {
    let userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      // Update XP Progress
      await fetch('/api/learning/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          categoryId,
          topicId,
          score: finalScore,
          isCompleted: true
        })
      });

      // Update Health
      await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          health: finalHearts
        })
      });
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  const handleAnswer = (option: string) => {
    if (isCorrect !== null || hearts <= 0) return;
    
    setSelectedAnswer(option);
    const correct = option === questions[currentQuestion]?.answer;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + xpPotential);
    } else {
      // deductHeart removed for Quiz
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setTimeLeft(15);
      setXpPotential(20);
    } else {
      finishQuiz(hearts);
    }
  };

  const finishQuiz = (finalHearts: number) => {
    setShowFinished(true);
    saveProgressToDb(score, finalHearts);
    if (finalHearts > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#eab308', '#22c55e']
      });
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setHearts(5);
    setIsCorrect(null);
    setSelectedAnswer(null);
    setShowFinished(false);
    setTimeLeft(15);
    setXpPotential(20);
    loadQuestions(); // Ambil soal baru agar tidak bosan
  };

  const handleGlobalReset = async () => {
    if (!confirm("Reset seluruh progres akun (XP, Level, Nyawa) untuk mulai dari nol?")) return;
    
    const userId = localStorage.getItem('userId');
    try {
      const res = await fetch('/api/user/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        alert("Akun berhasil direset! Selamat belajar kembali.");
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetTopicProgress = async () => {
    if (!confirm("Hapus progres bab ini dari database? Skor akan hilang dan status bab akan menjadi 'Belum Selesai'.")) return;
    
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const res = await fetch('/api/learning/progress/reset-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, categoryId, topicId })
      });
      if (res.ok) {
        alert("Progres berhasil dihapus!");
        window.location.reload();
      }
    } catch (err) {
      console.error("Gagal reset progres bab:", err);
    }
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  if (!topicData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
          <Brain className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Topik Tidak Ditemukan</h2>
          <p className="text-gray-500 mb-6">Maaf, bab yang kamu cari tidak tersedia.</p>
          <Link href={`/belajar/${categoryId}`} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
            Kembali ke Daftar Bab
          </Link>
        </div>
      </div>
    );
  }

  if (showFinished) {
    return (
      <div className={`min-h-screen ${hearts > 0 ? 'bg-indigo-600' : 'bg-red-600'} flex flex-col items-center justify-center p-4 text-white`}>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-2">Misi Selesai!</h1>
          <p className="text-xl opacity-90 mb-8">
            Kamu mendapatkan {score} XP
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={resetQuiz}
              className="bg-white/20 text-white border-2 border-white/50 font-bold px-8 py-4 rounded-2xl hover:bg-white/30 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-5 h-5" /> Coba Lagi
            </button>
            <button 
              onClick={() => router.push(`/belajar/${categoryId}`)}
              className="bg-white text-indigo-600 font-bold px-8 py-4 rounded-2xl shadow-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
              Kembali ke Daftar Bab
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Teori View
  if (viewMode === 'theory') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-12 md:pt-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] shadow-xl overflow-hidden"
          >
            <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
              <Link href={`/belajar/${categoryId}`} className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              <h1 className="text-3xl font-bold mb-2 mt-8 text-center">{topicData.title}</h1>
              <p className="opacity-80 text-center">{topicData.description}</p>
            </div>
            
            <div className="p-8 space-y-6 text-gray-700">
              {loadingTheory ? (
                <div className="flex flex-col items-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
                  <p className="text-gray-400 italic text-sm">AI sedang menyusun materi khusus untukmu...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {typeof theoryContent === 'string' ? (
                    <p className="text-gray-600 italic">{theoryContent}</p>
                  ) : (
                    <>
                      <section>
                        <p className="text-lg leading-relaxed text-gray-700 font-medium">
                          {theoryContent?.introduction}
                        </p>
                      </section>

                      {theoryContent?.sections?.map((section: any, idx: number) => (
                        <section key={idx} className="space-y-3 bg-indigo-50/50 p-6 rounded-3xl">
                          <h2 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-sm">{idx + 1}</span>
                            {section.heading}
                          </h2>
                          <p className="leading-relaxed text-gray-700">{section.content}</p>
                        </section>
                      ))}

                      {theoryContent?.example && (
                        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-8 rounded-3xl border border-indigo-200 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full -mr-10 -mt-10 blur-2xl" />
                          <h3 className="text-xl font-black text-indigo-900 mb-4 flex items-center gap-2">
                            <Brain className="w-6 h-6 text-indigo-600" /> Contoh Soal
                          </h3>
                          <p className="font-bold text-gray-800 mb-6 text-lg">{theoryContent?.example?.question}</p>
                          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-indigo-100 shadow-sm">
                            <p className="text-sm text-indigo-500 uppercase font-black mb-2 tracking-widest">Penyelesaian:</p>
                            <p className="text-indigo-950 font-medium leading-relaxed">{theoryContent?.example?.solution}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              
              <div className="pt-8">
                {/* Heart indicator removed for Quiz */}
                <button 
                  onClick={() => setViewMode('quiz')}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-indigo-700 hover:scale-[1.02] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'MENYIAPKAN KUIS...' : 'MULAI KUIS PEMAHAMAN 🚀'}
                </button>
                
                {isTopicCompleted && process.env.NODE_ENV === 'development' && (
                  <button 
                    onClick={resetTopicProgress}
                    className="w-full mt-4 flex items-center justify-center gap-2 text-red-400 hover:text-red-600 text-sm font-bold transition-colors py-2"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus Progres Bab Ini (Dev Mode)
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // Quiz View
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b bg-white shadow-sm">
        <Link href={`/belajar/${categoryId}`} className="p-2 hover:bg-gray-100 rounded-full">
          <X className="w-6 h-6 text-gray-500" />
        </Link>
        
        <div className="flex-1 mx-4 max-w-xl">
          <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
            <span>PROGRES</span>
            <span>WAKTU: {timeLeft}s</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
            <motion.div 
              className="h-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion) / (questions.length || 1)) * 100}%` }}
            />
            {/* Timer Overlay Bar */}
            <motion.div 
              className="absolute top-0 right-0 h-full bg-yellow-400/30"
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / 15) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        </div>

        {/* Heart indicator removed for Quiz */}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full">
        {questions.length > 0 ? (
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <div className="flex justify-center mb-6">
               <div className="bg-yellow-100 text-yellow-700 px-6 py-2 rounded-full font-black flex items-center gap-2 shadow-sm border border-yellow-200">
                  <Star className="w-5 h-5 fill-current" />
                  Potensi XP: +{xpPotential}
               </div>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-gray-100 mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-1 bg-yellow-400 transition-all duration-1000" style={{ width: `${(timeLeft/15)*100}%` }} />
              <h2 className="text-2xl md:text-3xl font-black text-gray-800 text-center leading-relaxed">
                {questions[currentQuestion]?.text}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {questions[currentQuestion]?.options?.map((option: string) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={isCorrect !== null}
                  className={`
                    w-full p-6 text-center text-xl font-bold rounded-3xl border-4 transition-all shadow-sm
                    ${selectedAnswer === option 
                      ? (isCorrect ? 'bg-green-50 border-green-500 text-green-700 shadow-green-100' : 'bg-red-50 border-red-500 text-red-700 shadow-red-100')
                      : 'bg-white border-gray-100 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md text-gray-600'}
                  `}
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="text-center">
            <p className="text-gray-500 italic">Gagal memuat soal. Silakan muat ulang halaman.</p>
          </div>
        )}
      </main>

      {/* Feedback Bar */}
      <AnimatePresence>
        {isCorrect !== null && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className={`fixed bottom-0 left-0 right-0 p-6 md:p-8 border-t-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 
              ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}
          >
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className={`p-4 rounded-full shadow-inner ${isCorrect ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                  {isCorrect ? <Trophy className="w-8 h-8" /> : <Brain className="w-8 h-8" />}
                </div>
                <div>
                  <h3 className={`text-2xl font-black ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {isCorrect ? `Luar Biasa! +${xpPotential} XP` : 'Ups, Tetap Semangat!'}
                  </h3>
                  {!isCorrect && questions[currentQuestion] && (
                    <p className="text-red-600 font-bold mt-1 text-lg">
                      Jawaban yang benar: <span className="bg-white px-3 py-1 rounded-md shadow-sm border border-red-200">{questions[currentQuestion].answer}</span>
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={nextQuestion}
                className={`w-full md:w-auto px-12 py-4 rounded-2xl font-black text-xl text-white shadow-xl transition-all hover:scale-105 active:scale-95 ${isCorrect ? 'bg-green-500 hover:bg-green-400' : 'bg-red-500 hover:bg-red-400'}`}
              >
                {currentQuestion < questions.length - 1 && hearts > 0 ? 'LANJUT SOAL' : 'SELESAI'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
