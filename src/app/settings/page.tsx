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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pt-20 relative">
      <Navbar />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-3 whitespace-nowrap border ${
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
              className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-red-100"
            >
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-black text-center text-gray-800 mb-4">PERINGATAN KRITIS</h3>
              <p className="text-gray-600 text-center mb-8">
                Semua progres belajar, XP, level, dan nyawa akan <strong className="text-red-500">dihapus permanen</strong>. Tindakan ini tidak bisa dibatalkan. Apakah Anda yakin?
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-4 px-6 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmResetData}
                  className="flex-1 py-4 px-6 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                >
                  Ya, Hapus Semua
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <header className="mb-8">
          <Link href="/profile" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 font-medium transition-colors">
            <ArrowLeft className="w-5 h-5" /> Kembali ke Profil
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Pengaturan Profil ⚙️</h1>
          <p className="text-gray-500">Sesuaikan identitas dan tingkat belajarmu.</p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100"
        >
          <form onSubmit={handleSave} className="space-y-6">
            {/* Image Upload */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="relative group">
                <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {formData.image ? (
                    <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-indigo-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full cursor-pointer shadow-md hover:bg-indigo-700 transition-all">
                  <Camera className="w-4 h-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <Pencil className="w-3 h-3" /> Klik ikon kamera untuk mengubah foto (Maks 1MB)
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" /> Nama Tampilan
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                placeholder="Masukkan namamu"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-500" /> Tingkat Sekolah
              </label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
              >
                <option value="SD">Sekolah Dasar (SD)</option>
                <option value="SMP">Sekolah Menengah Pertama (SMP)</option>
                <option value="SMA">Sekolah Menengah Atas (SMA)</option>
              </select>
              <p className="text-xs text-gray-400 mt-2 italic">Materi belajar akan disesuaikan dengan tingkat yang kamu pilih.</p>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <label className="block text-sm font-bold text-gray-400 mb-2">Email (Terkunci)</label>
              <input
                type="text"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
            </button>

            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 text-green-600 font-bold bg-green-50 py-3 rounded-xl border border-green-100 mt-4"
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
            className="mt-12 bg-red-50 rounded-[2.5rem] p-8 border-2 border-red-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 rounded-2xl text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-800">Zona Bahaya (Dev Mode)</h3>
                <p className="text-red-600/60 text-sm">Tindakan permanen untuk memudahkan testing.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={handleResetHearts}
                disabled={saving}
                className="w-full bg-white text-green-600 border-2 border-green-200 font-black py-4 rounded-2xl shadow-sm hover:bg-green-600 hover:text-white hover:border-green-600 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                ISI ULANG NYAWA PENUH (5/5)
              </button>

              <button
                type="button"
                onClick={handleResetDataClick}
                disabled={saving}
                className="w-full bg-white text-red-600 border-2 border-red-200 font-black py-4 rounded-2xl shadow-sm hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center justify-center gap-2"
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
