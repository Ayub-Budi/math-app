'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Rocket, Mail, Lock, User as UserIcon, Loader2, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    grade: 'SD',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mendaftar');
      }

      // Berhasil, simpan data di local storage
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userGrade', data.user.grade);
      
      router.push('/home');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-100 p-4 rounded-full">
              <Rocket className="w-12 h-12 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Mulai Petualangan</h2>
          <p className="text-center text-gray-500 mb-8">Daftar sekarang dan jadilah ahli matematika!</p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm font-medium border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nama Lengkap"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-800"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-800"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-800"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="relative">
              <GraduationCap className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-800 appearance-none bg-white"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                required
              >
                <option value="SD">Sekolah Dasar (SD)</option>
                <option value="SMP">Sekolah Menengah Pertama (SMP)</option>
                <option value="SMA">Sekolah Menengah Atas (SMA)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-indigo-600 font-bold hover:underline">
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
