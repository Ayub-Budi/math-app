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
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-200 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MathQuest
              </span>
            </div>

            <div className="flex justify-around w-full md:w-auto md:gap-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-1 rounded-xl transition-all",
                      isActive 
                        ? "text-indigo-600 md:bg-indigo-50" 
                        : "text-gray-500 hover:text-indigo-500"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-[10px] md:text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="hidden md:flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Keluar</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
                  <LogOut className="w-10 h-10 text-red-500" />
                </div>
                
                <h3 className="text-2xl font-black text-gray-800 mb-2">Mau Pamit?</h3>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  Yakin mau keluar? Jangan lama-lama ya, tantangan matematika menantimu!
                </p>
                
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="py-4 px-6 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleLogout}
                    className="py-4 px-6 rounded-2xl bg-red-500 text-white font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition-all active:scale-95"
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
