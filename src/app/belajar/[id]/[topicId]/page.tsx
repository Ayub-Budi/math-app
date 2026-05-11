'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Trophy, Brain, Loader2, ArrowLeft, ArrowRight, Star, RefreshCcw, Info, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getTopicById, getCategoryById } from '@/lib/topics';
import confetti from 'canvas-confetti';

export default function TopicLearningPage({ params }: { params: Promise<{ id: string, topicId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const categoryId = resolvedParams.id;
  const topicId = resolvedParams.topicId;

  const topicData = getTopicById(categoryId, topicId);
  const category = getCategoryById(categoryId);

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
        setXpPotential((prev) => Math.max(5, Math.floor(20 * (timeLeft / 15))));
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isCorrect === null) {
      handleAnswer(''); 
    }
  }, [viewMode, showFinished, isCorrect, timeLeft]);

  const saveProgressToDb = async (finalScore: number, finalHearts: number) => {
    let userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
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
    loadQuestions();
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-[#020617]" />;
  }

  if (!topicData || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="text-center p-6 bg-slate-900/40 backdrop-blur-3xl rounded-3xl border border-white/5 max-w-sm mx-4">
          <Brain className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Misi Tidak Ditemukan</h2>
          <p className="text-slate-400 text-sm mb-6">Maaf, data misi atau kategori tidak tersedia.</p>
          <Link href="/belajar" className="block w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-black hover:bg-indigo-500 transition-all uppercase tracking-widest text-xs">
            Kembali ke Akademi
          </Link>
        </div>
      </div>
    );
  }

  if (showFinished) {
    return (
      <div className={`min-h-screen ${hearts > 0 ? 'bg-[#020617]' : 'bg-red-950/20'} flex flex-col items-center justify-center p-4 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.15)_0%,transparent_70%)]" />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center relative z-10 w-full max-w-md"
        >
          <div className="w-20 h-20 md:w-32 md:h-32 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-10 border-4 border-yellow-500/30 shadow-xl">
            <Trophy className="w-10 h-10 md:w-16 md:h-16 text-yellow-400" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3 uppercase tracking-tighter">Misi Selesai!</h1>
          <p className="text-base md:text-xl font-black text-indigo-400 mb-8 md:mb-12 uppercase tracking-widest">
            +{score} EXP TERKUMPUL
          </p>
          <div className="flex flex-col gap-3 w-full">
            <button 
              onClick={resetQuiz}
              className="w-full bg-slate-900/50 text-white border border-white/10 font-black py-4 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              <RefreshCcw className="w-4 h-4" /> Coba Lagi
            </button>
            <button 
              onClick={() => router.push(`/belajar/${categoryId}`)}
              className="w-full bg-white text-indigo-900 font-black py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              Lanjutkan Petualangan
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (viewMode === 'theory') {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200">
        <Navbar />
        
        <main className="max-w-5xl mx-auto px-4 py-6 md:py-12 relative z-10">
          <Link href={`/belajar/${categoryId}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-400 mb-6 md:mb-8 font-black uppercase text-[10px] tracking-widest transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Akademi
          </Link>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 md:space-y-10"
          >
            <header className="relative p-6 md:p-10 rounded-2xl md:rounded-3xl overflow-hidden border border-white/5 bg-slate-900/20 backdrop-blur-3xl shadow-xl">
               <div className={`absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 ${category.color} opacity-10 rounded-full blur-3xl -mr-16 -mt-16`} />
               
               <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                 <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${category.color} flex items-center justify-center shadow-lg shrink-0`}>
                    <Brain className="w-8 h-8 md:w-10 md:h-10 text-white" />
                 </div>
                 <div className="text-center md:text-left flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-3">
                       Modul Pembelajaran
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-white mb-3 tracking-tight leading-tight">
                      {topicData.title}
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-2xl">
                      {topicData.description}
                    </p>
                 </div>
               </div>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
              <div className="lg:col-span-8 space-y-10 md:space-y-12">
                {loadingTheory ? (
                  <div className="flex flex-col items-center py-24 space-y-4">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">Sinkronisasi Data...</p>
                  </div>
                ) : (
                  <div className="space-y-10 md:space-y-16">
                    {typeof theoryContent === 'string' ? (
                      <p className="text-slate-400 italic text-center font-medium leading-relaxed text-base">{theoryContent}</p>
                    ) : (
                      <>
                        <section className="relative">
                          <p className="text-base md:text-lg leading-relaxed text-slate-300 font-serif italic border-l-4 border-indigo-500/30 pl-5">
                            {theoryContent?.introduction}
                          </p>
                        </section>

                        <div className="space-y-12 md:space-y-16">
                          {theoryContent?.sections?.map((section: any, idx: number) => (
                            <section key={idx} className="relative group">
                              <div className="flex flex-col space-y-4">
                                <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-4 tracking-tight">
                                  <span className="shrink-0 w-10 h-10 rounded-xl bg-slate-900 border border-white/5 text-indigo-400 flex items-center justify-center text-xs font-black shadow-lg">
                                    0{idx + 1}
                                  </span>
                                  {section.heading}
                                </h2>
                                <div className="pl-0 md:pl-14">
                                  <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">
                                    {section.content}
                                  </p>
                                </div>
                              </div>
                            </section>
                          ))}
                        </div>

                        {theoryContent?.example && (
                          <section className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-indigo-600/10 to-purple-600/5 border border-white/5 shadow-xl overflow-hidden group">
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Star className="w-5 h-5 text-white fill-current" />
                                  </div>
                                  <h3 className="text-lg font-black text-white tracking-tight">Contoh Misi</h3>
                                </div>

                              <div className="bg-slate-950/60 p-5 md:p-6 rounded-xl border border-white/5">
                                <p className="text-base md:text-lg font-bold text-white leading-relaxed tracking-tight">
                                  {theoryContent?.example?.question}
                                </p>
                              </div>

                              <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-xl">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-3">Analisis Neural</span>
                                <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">
                                  {theoryContent?.example?.solution}
                                </p>
                              </div>
                            </div>
                          </section>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="sticky top-24 space-y-6">
                  <div className="p-6 md:p-8 rounded-2xl bg-slate-900/30 backdrop-blur-3xl border border-white/5 shadow-xl">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">Status Misi</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Reward</span>
                        <span className="text-lg font-black text-yellow-500">+20 EXP</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Kesulitan</span>
                        <span className="text-[10px] font-black text-white px-3 py-1 bg-white/5 rounded-full border border-white/10 uppercase tracking-widest">{category.level}</span>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-white/5">
                      <button 
                        onClick={() => setViewMode('quiz')}
                        disabled={loading}
                        className="group w-full bg-white text-indigo-900 font-black py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                      >
                        {loading ? 'SINKRONISASI...' : (
                          <>
                            MULAI <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-3">
                    <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wide">
                      Selesaikan materi ini untuk membuka kuis dan klaim EXP!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col text-slate-200">
      <header className="p-4 md:px-8 md:py-6 flex items-center justify-between border-b border-white/5 bg-slate-900/10 backdrop-blur-3xl sticky top-0 z-[60]">
        <Link href={`/belajar/${categoryId}`} className="p-2 hover:bg-white/5 rounded-xl transition-colors border border-white/5">
          <X className="w-5 h-5 text-slate-500" />
        </Link>
        
        <div className="flex-1 mx-4 md:mx-12 max-w-2xl">
          <div className="flex justify-between text-[9px] font-black text-slate-600 mb-2 uppercase tracking-widest">
            <span>Progres: {currentQuestion + 1}/{questions.length}</span>
            <span className={timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-indigo-400'}>Waktu: {timeLeft}S</span>
          </div>
          <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion) / (questions.length || 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
             <Heart className="w-4 h-4 text-red-500 fill-current" />
             <span className="font-black text-sm text-white">{hearts}</span>
           </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-4xl mx-auto w-full">
        {questions.length > 0 ? (
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-6 md:space-y-10"
          >
            <div className="text-center">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-500 font-black border border-yellow-500/20 uppercase tracking-widest text-[10px]">
                  <Star className="w-4 h-4 fill-current" />
                  Potensial: +{xpPotential} EXP
               </div>
            </div>

            <div className="relative bg-slate-900/40 backdrop-blur-3xl p-6 md:p-10 rounded-2xl md:rounded-3xl border border-white/5 shadow-xl text-center">
              <h2 className="text-lg md:text-2xl font-black text-white leading-relaxed tracking-tight uppercase">
                {questions[currentQuestion]?.text}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
              {questions[currentQuestion]?.options?.map((option: string, idx: number) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={isCorrect !== null}
                  className={`
                    group w-full p-4 md:p-6 text-center text-base md:text-lg font-black rounded-xl md:rounded-2xl border-2 transition-all shadow-md relative overflow-hidden
                    ${selectedAnswer === option 
                      ? (isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-red-500/20 border-red-500 text-red-400')
                      : 'bg-slate-900/40 border-white/5 hover:border-indigo-500 hover:bg-indigo-600/10 text-slate-500 hover:text-white'}
                  `}
                >
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    <span className="text-[10px] font-black text-slate-700 group-hover:text-indigo-400 uppercase tracking-widest">{String.fromCharCode(65 + idx)}</span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-24 space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
            <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">Menghasilkan Misi...</p>
          </div>
        )}
      </main>

      <AnimatePresence>
        {isCorrect !== null && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#020617]/60 backdrop-blur-md z-[80]"
            />
            
            <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className={`w-full max-w-sm p-8 rounded-[2rem] border-4 md:border-[6px] shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl
                  ${isCorrect ? 'bg-emerald-950/90 border-emerald-500' : 'bg-red-950/90 border-red-500'}`}
              >
                <div className="flex flex-col items-center text-center gap-6">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-2xl ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'} text-white`}>
                    {isCorrect ? <Trophy className="w-8 h-8 md:w-10 md:h-10" /> : <Brain className="w-8 h-8 md:w-10 md:h-10" />}
                  </div>
                  
                  <div>
                    <h3 className={`text-2xl md:text-3xl font-black uppercase tracking-tight mb-2 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isCorrect ? `Sempurna!` : `Oops!`}
                    </h3>
                    {!isCorrect && questions[currentQuestion] && (
                      <div className="space-y-2">
                        <span className="text-red-400/60 font-black text-[10px] uppercase tracking-[0.2em]">Kunci Jawaban</span>
                        <div className="text-white bg-red-600 px-4 py-2 rounded-xl text-lg md:text-xl font-black shadow-lg">
                          {questions[currentQuestion].answer}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={nextQuestion}
                    className={`w-full py-4 md:py-5 rounded-2xl font-black text-sm md:text-base text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest ${isCorrect ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-red-500 hover:bg-red-400'}`}
                  >
                    {currentQuestion < questions.length - 1 ? 'Misi Selanjutnya' : 'Klaim Hadiah'}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
