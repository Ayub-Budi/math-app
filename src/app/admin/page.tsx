'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, Users, Zap, Star, ChevronLeft, LogOut, Loader2, KeyRound, BookOpen, Sparkles, CheckCircle2, Circle, RefreshCcw, Wand2, Play } from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminPage() {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'content'>('users');
  const [error, setError] = useState('');
  
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  
  // Content Management States
  const [contentStatus, setContentStatus] = useState<any[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [bulkStatus, setBulkStatus] = useState<string>('');

  // Cek apakah sudah pernah login admin di sesi ini
  useEffect(() => {
    const savedPasscode = sessionStorage.getItem('admin_passcode');
    if (savedPasscode) {
      setPasscode(savedPasscode);
      fetchAdminData(savedPasscode);
    }
  }, []);

  const fetchAdminData = async (code: string) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/stats?passcode=${code}`);
      const data = await res.json();
      
      if (res.ok) {
        setIsAuthenticated(true);
        setStats(data.stats);
        setUsers(data.users);
        sessionStorage.setItem('admin_passcode', code);
        fetchContentStatus(code);
      } else {
        setError(data.error || 'Akses ditolak.');
        sessionStorage.removeItem('admin_passcode');
        setIsAuthenticated(false);
      }
    } catch (err) {
      setError('Gagal menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContentStatus = async (code: string) => {
    setContentLoading(true);
    try {
      const res = await fetch(`/api/admin/content?passcode=${code}`);
      const data = await res.json();
      if (res.ok) {
        setContentStatus(data.contentStatus);
      }
    } catch (err) {
      console.error("Gagal load status konten:", err);
    } finally {
      setContentLoading(false);
    }
  };

  const handleGenerate = async (category: string, topicId: string, grade: string, type: 'theory' | 'questions') => {
    const id = `${category}-${topicId}-${grade}-${type}`;
    setGeneratingId(id);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, category, topicId, grade, type })
      });
      if (res.ok) {
        fetchContentStatus(passcode);
      }
    } catch (err) {
      console.error("Generate error:", err);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleBulkSync = async (category: string, topicId: string, grade: string) => {
    const id = `bulk-${category}-${topicId}-${grade}`;
    setGeneratingId(id);
    try {
      // Generate Theory first
      await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, category, topicId, grade, type: 'theory' })
      });
      // Then Questions
      await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, category, topicId, grade, type: 'questions' })
      });
      fetchContentStatus(passcode);
    } catch (err) {
      console.error("Bulk sync error:", err);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleGenerateAll = async () => {
    if (!confirm("Peringatan: Ini akan men-generate konten AI untuk SEMUA topik yang belum ada. Proses ini mungkin memakan waktu beberapa menit. Lanjutkan?")) return;
    
    setBulkStatus('Memulai proses pemetaan konten...');
    setIsLoading(true);
    
    try {
      for (const cat of contentStatus) {
        for (const topic of cat.topics) {
          for (const g of topic.statusByGrade) {
            if (!g.theoryStatus) {
              setBulkStatus(`Generasi TEORI: ${cat.title} - ${topic.title} (${g.grade})`);
              await fetch('/api/admin/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passcode, category: cat.id, topicId: topic.id, grade: g.grade, type: 'theory' })
              });
            }
            if (!g.questionsStatus) {
              setBulkStatus(`Generasi SOAL: ${cat.title} - ${topic.title} (${g.grade})`);
              await fetch('/api/admin/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passcode, category: cat.id, topicId: topic.id, grade: g.grade, type: 'questions' })
              });
            }
          }
        }
      }
      setBulkStatus('✅ Selesai! Seluruh konten berhasil di-sinkronisasi.');
      fetchContentStatus(passcode);
    } catch (err) {
      setBulkStatus('❌ Terjadi kesalahan saat bulk generation.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setBulkStatus(''), 5000);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim()) {
      fetchAdminData(passcode);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_passcode');
    setIsAuthenticated(false);
    setPasscode('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] z-0" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-slate-800 shadow-2xl relative z-10 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-3xl mx-auto mb-6 flex items-center justify-center border border-slate-700 shadow-inner">
            <Lock className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2 tracking-tight uppercase">Restricted Area</h1>
          <p className="text-slate-400 text-sm mb-8">Halaman ini khusus untuk Super Admin MathQuest.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Masukkan Passcode" className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-center font-mono tracking-widest" />
            </div>
            <AnimatePresence>{error && ( <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-sm font-bold bg-red-500/10 py-2 rounded-lg">{error}</motion.p> )}</AnimatePresence>
            <button type="submit" disabled={isLoading || !passcode} className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buka Gerbang'}
            </button>
          </form>
          <Link href="/" className="inline-flex items-center gap-1 text-slate-500 hover:text-white mt-8 text-sm transition-colors font-bold uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Kembali
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-20">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/50">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white leading-tight">Super Admin</h1>
              <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">Pusat Komando MathQuest</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>User Database</button>
              <button onClick={() => setActiveTab('content')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'content' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>AI Content Manager</button>
            </nav>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-red-400 transition-colors bg-slate-800 px-4 py-2 rounded-full"><LogOut className="w-4 h-4" /> Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        {bulkStatus && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6 bg-indigo-600 p-4 rounded-2xl flex items-center gap-4 text-white font-bold shadow-[0_0_20px_rgba(79,70,229,0.5)]">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{bulkStatus}</span>
          </motion.div>
        )}

        {activeTab === 'users' ? (
          <>
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700 relative overflow-hidden group hover:border-slate-500 transition-colors">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                  <Users className="w-8 h-8 text-blue-400 mb-4" />
                  <h2 className="text-4xl font-black text-white mb-1">{stats.totalUsers}</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total Pendaftar</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700 relative overflow-hidden group hover:border-slate-500 transition-colors">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                  <Zap className="w-8 h-8 text-yellow-400 mb-4" />
                  <h2 className="text-4xl font-black text-white mb-1">{stats.totalXpAll.toLocaleString()}</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total EXP Beredar</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700 relative overflow-hidden group hover:border-slate-500 transition-colors">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                  <Star className="w-8 h-8 text-cyan-400 mb-4" />
                  <h2 className="text-4xl font-black text-white mb-1">{stats.totalPointsAll.toLocaleString()}</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Game Points Beredar</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700 relative overflow-hidden group hover:border-slate-500 transition-colors">
                  <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest">Distribusi Tingkat</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-bold"> <span className="text-slate-400">Sekolah Dasar (SD)</span> <span className="text-white bg-slate-700 px-2 py-0.5 rounded-md">{stats.gradeDistribution.SD}</span> </div>
                    <div className="flex justify-between items-center text-sm font-bold"> <span className="text-slate-400">Sekolah Menengah (SMP)</span> <span className="text-white bg-slate-700 px-2 py-0.5 rounded-md">{stats.gradeDistribution.SMP}</span> </div>
                    <div className="flex justify-between items-center text-sm font-bold"> <span className="text-slate-400">Sekolah Atas (SMA)</span> <span className="text-white bg-slate-700 px-2 py-0.5 rounded-md">{stats.gradeDistribution.SMA}</span> </div>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-xl font-black text-white">Database Pengguna</h3>
                <div className="bg-slate-950 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-widest">Menampilkan {users.length} Data Terbaru</div>
              </div>
              <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-950/50 text-slate-400 font-bold uppercase tracking-wider text-xs sticky top-0 z-10">
                    <tr><th className="px-6 py-4">Nama User</th><th className="px-6 py-4">Tingkat</th><th className="px-6 py-4">Level</th><th className="px-6 py-4">EXP</th><th className="px-6 py-4">Game Points</th><th className="px-6 py-4">Waktu Bergabung</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4"> <div className="flex flex-col"> <span className="font-bold text-white">{user.name || 'Pemain Anonim'}</span> <span className="text-xs text-slate-500">{user.email}</span> </div> </td>
                        <td className="px-6 py-4"> <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-md font-bold text-xs">{user.grade}</span> </td>
                        <td className="px-6 py-4"> <div className="flex items-center gap-1.5 font-bold text-white"> <div className="w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center text-[10px]">{user.level}</div> </div> </td>
                        <td className="px-6 py-4 font-mono text-yellow-400 font-bold">{user.totalXp.toLocaleString()}</td>
                        <td className="px-6 py-4 font-mono text-cyan-400 font-bold">{user.gamePoints.toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs text-slate-400 font-medium">{formatDate(user.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-3xl font-black text-white mb-2">AI Content Management</h2>
                <p className="text-slate-400 max-w-xl">Gunakan panel ini untuk men-generate materi & soal. Data yang tersimpan akan langsung digunakan siswa tanpa memicu API Gemini berulang-ulang.</p>
              </div>
              <div className="flex flex-col md:flex-row gap-3 relative z-10">
                <button onClick={handleGenerateAll} disabled={isLoading} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-black shadow-lg transition-all active:scale-95 disabled:opacity-50"><Wand2 className="w-5 h-5" /> GENERATE ALL</button>
                <button onClick={() => fetchContentStatus(passcode)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-2xl font-bold transition-all active:scale-95"><RefreshCcw className={`w-5 h-5 ${contentLoading ? 'animate-spin' : ''}`} /> Refresh</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {contentStatus.map((cat) => (
                <div key={cat.id} className="bg-slate-900/50 rounded-[2rem] border border-slate-800 overflow-hidden shadow-lg">
                  <div className={`p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80`}>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700"><BookOpen className="w-6 h-6 text-indigo-400" /></div>
                       <h3 className="text-xl font-black text-white">{cat.title}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cat.topics.map((topic: any) => (
                        <div key={topic.id} className="bg-slate-950/50 p-5 rounded-3xl border border-slate-800 flex flex-col">
                          <h4 className="text-white font-black mb-4 h-12 line-clamp-2">{topic.title}</h4>
                          
                          <div className="space-y-4">
                            {topic.statusByGrade.map((g: any) => (
                              <div key={g.grade} className="bg-slate-900 p-3 rounded-2xl border border-slate-800/50">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md uppercase tracking-widest">{g.grade} LEVEL</span>
                                  <button 
                                    disabled={generatingId !== null}
                                    onClick={() => handleBulkSync(cat.id, topic.id, g.grade)}
                                    className="text-[10px] flex items-center gap-1 font-black text-white bg-slate-800 hover:bg-indigo-600 px-2 py-1 rounded-lg transition-all disabled:opacity-30"
                                  >
                                    {generatingId === `bulk-${cat.id}-${topic.id}-${g.grade}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                    SYNC ALL
                                  </button>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex-1 flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${g.theoryStatus ? 'bg-green-500' : 'bg-slate-700'}`} />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Theory</span>
                                  </div>
                                  <div className="flex-1 flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${g.questionsStatus ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Quiz</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
