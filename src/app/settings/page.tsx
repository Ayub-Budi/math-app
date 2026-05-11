'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { User, GraduationCap, Save, ArrowLeft, Loader2, CheckCircle2, Camera, Pencil, Trash2, AlertTriangle, XCircle, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const [formData, setFormData] = useState({
    name: '',
    grade: 'SD',
    email: '',
    image: ''
  });

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId || userId.startsWith('guest_')) {
      // For guest, use localStorage
      setFormData({
        name: localStorage.getItem('userName') || "Petualang",
        grade: localStorage.getItem('userGrade') || "SD",
        email: "Guest (Belum Login)",
        image: localStorage.getItem('userImage') || ""
      });
      setLoading(false);
      return;
    }

    async function fetchUser() {
      try {
        const res = await fetch(`/api/user?userId=${userId}`);
        const data = await res.json();
        if (res.ok) {
          setFormData({
            name: data.name || "",
            grade: data.grade || "SD",
            email: data.email || "",
            image: data.image || ""
          });
        }
      } catch (error) {
        console.error("Gagal memuat data pengaturan:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB Limit
        showToast("Ukuran foto terlalu besar! Maksimal 1MB.", 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const userId = localStorage.getItem('userId');

    // If Guest, just update localStorage
    if (!userId || userId.startsWith('guest_')) {
      localStorage.setItem('userName', formData.name);
      localStorage.setItem('userGrade', formData.grade);
      localStorage.setItem('userImage', formData.image);
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      return;
    }

    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: formData.name,
          grade: formData.grade,
          image: formData.image
        })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userGrade', data.user.grade);
        localStorage.setItem('userImage', data.user.image || "");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Gagal menyimpan pengaturan:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDataClick = () => {
    setShowConfirmModal(true);
  };

  const confirmResetData = async () => {
    setShowConfirmModal(false);
    setSaving(true);
    const userId = localStorage.getItem('userId');
    
    try {
      const res = await fetch('/api/user/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (res.ok) {
        showToast("Data berhasil direset. Halaman akan dimuat ulang...", 'success');
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err) {
      console.error("Gagal reset data:", err);
      showToast("Gagal meriset data.", 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetHearts = async () => {
    setSaving(true);
    const userId = localStorage.getItem('userId');
    
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, health: 5 })
      });

      if (res.ok) {
        showToast("Nyawa berhasil diisi penuh (5/5) ❤️", 'success');
      } else {
        showToast("Gagal mengisi nyawa.", 'error');
      }
    } catch (err) {
      console.error("Gagal mengisi nyawa:", err);
      showToast("Terjadi kesalahan jaringan.", 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-28 pt-4 md:pt-24 relative selection:bg-indigo-500/30">
      <Navbar />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-28 md:bottom-10 left-1/2 -translate-x-1/2 z-[100] px-4 md:px-6 py-3 md:py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-2 md:gap-3 whitespace-nowrap border ${
              toast.type === 'success' 
                ? 'bg-green-500/90 text-white border-green-400' 
                : 'bg-red-500/90 text-white border-red-400'
            }`}
            style={{ backdropFilter: 'blur(8px)' }}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Reset Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowConfirmModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto border border-red-500/20">
                <AlertTriangle className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-black text-center text-white mb-4 uppercase tracking-tighter">PERINGATAN KRITIS</h3>
              <p className="text-slate-400 text-center mb-8">
                Semua progres belajar, XP, level, dan nyawa akan <strong className="text-red-500">dihapus permanen</strong>. Tindakan ini tidak bisa dibatalkan. Apakah Anda yakin?
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-4 px-6 rounded-xl font-bold text-slate-400 bg-white/5 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmResetData}
                  className="flex-1 py-4 px-6 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-500/30 uppercase tracking-widest text-xs"
                >
                  Ya, Hapus Semua
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <header className="mb-6 md:mb-8">
          <Link href="/profile" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-400 mb-4 md:mb-6 font-medium transition-colors text-sm md:text-base">
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" /> Kembali ke Profil
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tighter">Pengaturan Profil ⚙️</h1>
          <p className="text-sm md:text-base text-slate-500">Sesuaikan identitas dan tingkat belajarmu.</p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 backdrop-blur-xl rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-white/5"
        >
          <form onSubmit={handleSave} className="space-y-6">
            {/* Image Upload */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="relative group">
                <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden border-4 border-slate-900 shadow-xl">
                  {formData.image ? (
                    <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-slate-600" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-indigo-500 transition-all border-2 border-slate-900">
                  <Camera className="w-4 h-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1 uppercase tracking-widest font-black">
                <Pencil className="w-3 h-3" /> Ganti Foto Profil (Maks 1MB)
              </p>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-widest">
                <User className="w-4 h-4 text-indigo-500" /> Nama Tampilan
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950/50 text-white px-4 py-3.5 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                placeholder="Masukkan namamu"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-widest">
                <GraduationCap className="w-4 h-4 text-indigo-500" /> Tingkat Sekolah
              </label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full bg-slate-950/50 text-white px-4 py-3.5 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium appearance-none"
              >
                <option value="SD" className="bg-slate-900">Sekolah Dasar (SD)</option>
                <option value="SMP" className="bg-slate-900">Sekolah Menengah Pertama (SMP)</option>
                <option value="SMA" className="bg-slate-900">Sekolah Menengah Atas (SMA)</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-2 italic font-medium">Materi belajar akan disesuaikan dengan tingkat yang kamu pilih.</p>
            </div>

            <div className="pt-4 border-t border-white/5">
              <label className="block text-[10px] font-black text-slate-600 mb-2 uppercase tracking-widest">Email (Terkunci)</label>
              <input
                type="text"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-white/5 bg-slate-950/30 text-slate-600 cursor-not-allowed font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest text-xs"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
            </button>

            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 py-3 rounded-xl border border-emerald-500/20 mt-4 text-xs uppercase tracking-widest"
              >
                <CheckCircle2 className="w-5 h-5" /> Pengaturan berhasil disimpan!
              </motion.div>
            )}
          </form>
        </motion.div>

        {/* Danger Zone - Only visible in development */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 md:mt-12 bg-red-500/5 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-red-500/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 rounded-2xl text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-500 uppercase tracking-tighter">Zona Bahaya (Dev Mode)</h3>
                <p className="text-red-400 opacity-60 text-xs font-bold uppercase tracking-widest">Tindakan permanen untuk memudahkan testing.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={handleResetHearts}
                disabled={saving}
                className="w-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black py-4 rounded-2xl shadow-sm hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                <CheckCircle2 className="w-5 h-5" />
                ISI ULANG NYAWA PENUH (5/5)
              </button>
 
              <button
                type="button"
                onClick={handleResetDataClick}
                disabled={saving}
                className="w-full bg-red-500/10 text-red-500 border border-red-500/20 font-black py-4 rounded-2xl shadow-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                <Trash2 className="w-5 h-5" />
                RESET SEMUA DATA PROGRES
              </button>
            </div>
            <p className="text-center text-[10px] text-red-400 mt-4 font-bold uppercase tracking-widest">
              Gunakan mode ini hanya untuk keperluan testing.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
