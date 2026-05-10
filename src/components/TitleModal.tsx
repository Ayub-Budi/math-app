'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface TitleModalProps {
  title: string | null;
  onClose: () => void;
}

export default function TitleModal({ title, onClose }: TitleModalProps) {
  useEffect(() => {
    if (title) {
      // Tembakkan confetti saat modal muncul
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#facc15', '#f87171', '#60a5fa']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#facc15', '#f87171', '#60a5fa']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [title]);

  return (
    <AnimatePresence>
      {title && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="bg-gradient-to-b from-indigo-900 to-slate-900 border-4 border-yellow-400 rounded-[3rem] p-8 md:p-12 max-w-lg w-full text-center shadow-[0_0_100px_rgba(250,204,21,0.3)] relative overflow-hidden"
          >
            {/* Animasi Cahaya Berputar */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-[spin_60s_linear_infinite]" />
            
            <div className="relative z-10">
              <div className="flex justify-center mb-6 relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 flex items-center justify-center opacity-50"
                >
                  <Sparkles className="w-32 h-32 text-yellow-200" />
                </motion.div>
                <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] relative z-10" />
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-indigo-200 uppercase tracking-widest mb-2">
                Pencapaian Baru Dibuka!
              </h2>
              
              <p className="text-sm text-slate-400 mb-6">
                Luar biasa! Anda telah menyelesaikan game ini dan resmi mendapatkan gelar kehormatan:
              </p>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 p-[2px] rounded-2xl mb-8 shadow-2xl"
              >
                <div className="bg-slate-950 rounded-2xl py-4 px-6 flex items-center justify-center gap-3">
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                  <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">
                    {title}
                  </span>
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                </div>
              </motion.div>

              <button
                onClick={onClose}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-900 font-black px-10 py-4 rounded-full text-lg transition-transform hover:scale-105 active:scale-95 shadow-xl w-full"
              >
                TERIMA JULUKAN
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
