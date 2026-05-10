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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold">Menyiapkan profilmu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pt-20">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <header className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-5 rounded-full -mr-20 -mt-20" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white overflow-hidden">
              {userProfile.image ? (
                <img src={userProfile.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16" />
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-gray-800">{userProfile.name}</h1>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
                  {userProfile.rank}
                </span>
              </div>
              <div className="space-y-1 text-gray-500">
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4" /> {userProfile.email}
                </p>
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <GraduationCap className="w-4 h-4" /> Kelas: {userProfile.grade}
                </p>
              </div>
            </div>

            <Link href="/settings" className="p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors text-gray-600">
              <Settings className="w-6 h-6" />
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 fill-current" />
            </div>
            <p className="text-3xl font-black text-gray-800">{userProfile.xp}</p>
            <p className="text-sm font-medium text-gray-500">Total XP</p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-gray-800">Lvl {userProfile.level}</p>
            <p className="text-sm font-medium text-gray-500">Level Saat Ini</p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <p className="text-3xl font-black text-gray-800">{userProfile.streak}</p>
            <p className="text-sm font-medium text-gray-500">Hari Beruntun</p>
          </motion.div>
        </div>

        {/* Achievements Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-800">Gelar & Pencapaian</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userProfile.titles.length > 0 ? (
              userProfile.titles.map((title, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-4 rounded-2xl border-2 border-yellow-100 bg-yellow-50/10 flex items-center gap-4 hover:border-yellow-200 transition-colors cursor-default"
                >
                  <div className="w-12 h-12 bg-yellow-400 text-white rounded-full flex items-center justify-center shadow-inner">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{title}</h3>
                    <p className="text-xs text-gray-500">Gelar kehormatan dari permainan.</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-500">Belum ada gelar yang diraih. Selesaikan tantangan game!</p>
              </div>
            )}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col gap-4">

          <button 
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl border-2 border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" /> Keluar Akun
          </button>
        </div>
      </main>
    </div>
  );
}
