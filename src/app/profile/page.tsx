'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { User, Mail, GraduationCap, Award, Zap, Star, ShieldCheck, Settings, LogOut, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: "Petualang",
    email: "-",
    grade: "SD",
    level: 1,
    xp: 0,
    streak: 0,
    rank: "Pemula",
    titles: [] as string[],
    image: ""
  });

  useEffect(() => {
    async function loadProfileData() {
      const userId = localStorage.getItem('userId');
      
      // Initial state from localStorage for fast load
      const userName = localStorage.getItem('userName') || "Petualang";
      const userEmail = localStorage.getItem('userEmail') || "-";
      const userGrade = localStorage.getItem('userGrade') || "SD";
      const userImage = localStorage.getItem('userImage') || "";
      
      setUserProfile(prev => ({ ...prev, name: userName, email: userEmail, grade: userGrade, image: userImage }));

      if (!userId || userId.startsWith('guest_')) {
        setLoading(false);
        return;
      }

      try {
        // Fetch User Data (Name, Email, Grade, Image)
        const userRes = await fetch(`/api/user?userId=${userId}`);
        const dbUser = await userRes.json();
        
        if (!userRes.ok) throw new Error("User not found");

        // Sync localStorage
        localStorage.setItem('userName', dbUser.name || "Petualang");
        localStorage.setItem('userEmail', dbUser.email || "-");
        localStorage.setItem('userGrade', dbUser.grade || "SD");
        localStorage.setItem('userImage', dbUser.image || "");

        // Fetch Learning Progress for XP
        const learnRes = await fetch(`/api/learning/progress?userId=${userId}`);
        const learnData = await learnRes.json();
        
        let xp = 0;
        if (Array.isArray(learnData)) {
          learnData.forEach(item => {
            if (item.isCompleted) xp += item.score || 0;
          });
        }

        // Fetch Game Progress for Titles/Achievements
        const gameRes = await fetch(`/api/games/progress?userId=${userId}`);
        const gameData = await gameRes.json();
        const titles = gameData.titles || [];

        // Simple level logic (1 level per 500 XP)
        const currentLevel = Math.floor(xp / 500) + 1;
        
        // Rank based on level
        let rank = "Pemula";
        if (currentLevel > 20) rank = "Legenda Matematika";
        else if (currentLevel > 15) rank = "Grandmaster";
        else if (currentLevel > 10) rank = "Pakar Angka";
        else if (currentLevel > 5) rank = "Petualang Mahir";

        setUserProfile({
          name: dbUser.name || userName,
          email: dbUser.email || userEmail,
          grade: dbUser.grade || userGrade,
          level: currentLevel,
          xp: xp,
          streak: 0,
          rank: rank,
          titles: titles,
          image: dbUser.image || ""
        });
      } catch (error) {
        console.error("Gagal memuat profil:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userGrade');
    localStorage.removeItem('userImage');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 font-bold">Menyiapkan profilmu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-28 pt-4 md:pt-24 selection:bg-indigo-500/30">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <header className="bg-slate-900/50 backdrop-blur-xl rounded-3xl md:rounded-[3rem] p-6 md:p-8 shadow-2xl border border-white/5 mb-6 md:mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-10 rounded-full -mr-20 -mt-20 blur-[80px]" />
          
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white overflow-hidden shrink-0">
              {userProfile.image ? (
                <img src={userProfile.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 md:w-16 md:h-16" />
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-black text-white">{userProfile.name}</h1>
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                  {userProfile.rank}
                </span>
              </div>
              <div className="space-y-1 text-slate-400">
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4 text-slate-500" /> {userProfile.email}
                </p>
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <GraduationCap className="w-4 h-4 text-slate-500" /> Kelas: {userProfile.grade}
                </p>
              </div>
            </div>

            <Link href="/settings" className="p-3.5 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors text-slate-400 hover:text-white shadow-lg border border-white/5">
              <Settings className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          <motion.div whileHover={{ y: -5 }} className="bg-slate-900/40 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-xl border border-white/5 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500/10 text-yellow-500 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Star className="w-5 h-5 md:w-6 md:h-6 fill-current" />
            </div>
            <p className="text-xl md:text-3xl font-black text-white">{userProfile.xp}</p>
            <p className="text-[10px] md:text-sm font-medium text-slate-500 uppercase tracking-widest">Total XP</p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-slate-900/40 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-xl border border-white/5 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-500/10 text-indigo-400 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <p className="text-xl md:text-3xl font-black text-white">Lvl {userProfile.level}</p>
            <p className="text-[10px] md:text-sm font-medium text-slate-500 uppercase tracking-widest">Level</p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-slate-900/40 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-xl border border-white/5 text-center col-span-2 md:col-span-1">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500/10 text-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Zap className="w-5 h-5 md:w-6 md:h-6 fill-current" />
            </div>
            <p className="text-xl md:text-3xl font-black text-white">{userProfile.streak}</p>
            <p className="text-[10px] md:text-sm font-medium text-slate-500 uppercase tracking-widest">Hari Beruntun</p>
          </motion.div>
        </div>

        {/* Achievements Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Gelar & Pencapaian</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userProfile.titles.length > 0 ? (
              userProfile.titles.map((title, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 flex items-center gap-4 hover:border-yellow-500/40 transition-colors cursor-default"
                >
                  <div className="w-12 h-12 bg-yellow-500 text-slate-950 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{title}</h3>
                    <p className="text-xs text-slate-500">Gelar kehormatan dari permainan.</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-slate-900/20 rounded-3xl border border-dashed border-white/10">
                <p className="text-slate-500">Belum ada gelar yang diraih. Selesaikan tantangan game!</p>
              </div>
            )}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col gap-4">

          <button 
            onClick={handleLogout}
            className="w-full bg-red-500/10 text-red-500 font-bold py-4 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
          >
            <LogOut className="w-5 h-5" /> Keluar Akun
          </button>
        </div>
      </main>
    </div>
  );
}
