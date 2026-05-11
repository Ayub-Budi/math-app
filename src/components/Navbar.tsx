'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, BookOpen, BarChart3, User, LogOut, Gamepad2, AlertCircle, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'Belajar', href: '/belajar', icon: BookOpen },
  { name: 'Games', href: '/games', icon: Gamepad2 },
  { name: 'AsistenKu', href: '/asistenku', icon: Bot },
  { name: 'Profil', href: '/profile', icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#020617]/40 backdrop-blur-3xl border-t border-white/5 md:top-0 md:bottom-auto md:border-t-0 md:border-b shadow-[0_10px_50px_rgba(0,0,0,0.5)]">
        {/* Subtle Bottom Glow for Desktop/Tab */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 md:opacity-100" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center h-16 md:h-16 lg:h-20">
            <div className="hidden md:flex items-center gap-2 lg:gap-4">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-500 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg">
                <Gamepad2 className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
              </div>
              <span className="text-lg lg:text-2xl font-black bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent uppercase tracking-tighter">
                MathQuest
              </span>
            </div>
 
            <div className="flex justify-around w-full md:w-auto md:gap-0.5 lg:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex flex-col md:flex-row items-center gap-0.5 md:gap-2 px-2 md:px-3 lg:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl transition-all duration-500 relative group",
                      isActive 
                        ? "text-white" 
                        : "text-slate-500 hover:text-indigo-400"
                    )}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="nav-active"
                        className="absolute inset-0 bg-indigo-600/10 border border-indigo-500/20 rounded-lg md:rounded-xl shadow-lg"
                      />
                    )}
                    <Icon className={cn("w-3.5 h-3.5 md:w-5 md:h-5 relative z-10 transition-all duration-500 group-hover:scale-110", isActive && "text-indigo-400")} />
                    <span className="text-[6px] md:text-[9px] lg:text-xs font-black uppercase tracking-[0.05em] relative z-10">{item.name}</span>
                  </Link>
                );
              })}
            </div>
 
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="hidden md:flex items-center gap-2 text-slate-500 hover:text-red-400 transition-all font-black uppercase text-[9px] lg:text-[10px] tracking-[0.1em] group"
            >
              <div className="p-1.5 lg:p-2 group-hover:bg-red-500/10 rounded-lg transition-all duration-500 group-hover:rotate-6">
                <LogOut className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
              </div>
              <span className="hidden lg:inline">Keluar</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative w-full max-w-sm bg-slate-900 border border-white/5 rounded-[3rem] p-10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl">
                  <LogOut className="w-12 h-12 text-red-500" />
                </div>
                
                <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter">Mau Pamit?</h3>
                <p className="text-slate-400 mb-10 leading-relaxed font-medium">
                  Yakin mau keluar? Jangan lama-lama ya, tantangan matematika menantimu di akademi!
                </p>
                
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="py-5 px-6 rounded-2xl font-black text-slate-500 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest text-xs"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleLogout}
                    className="py-5 px-6 rounded-2xl bg-red-600 text-white font-black shadow-[0_10px_30px_rgba(220,38,38,0.3)] hover:bg-red-500 transition-all active:scale-95 uppercase tracking-widest text-xs"
                  >
                    Keluar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
