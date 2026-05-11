import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Inisialisasi AI dengan mode auto-auth (mengambil dari process.env.GEMINI_API_KEY)
const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const { prompt, topicTitle, categoryTitle, grade, history } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 });
    }

    const systemInstruction = `
      Kamu adalah 'AsistenKu', asisten virtual pintar yang mendampingi siswa belajar di Akademi MathQuest.
      
      KONTEKS PEMBELAJARAN SAAT INI:
      - Materi: ${topicTitle}
      - Kategori: ${categoryTitle}
      - Jenjang: ${grade}
      
      ATURAN KETAT:
      1. Kamu HANYA boleh menjawab pertanyaan yang berkaitan dengan materi '${topicTitle}' dan '${categoryTitle}' untuk jenjang ${grade}.
      2. Jika pengguna bertanya di luar topik tersebut (misal: tentang sejarah, game lain, atau topik matematika yang tidak relevan dengan bab ini), kamu HARUS menolak dengan sopan. Contoh: "Maaf, sebagai AsistenKu di bab ${topicTitle}, aku hanya bisa membantu menjawab hal-hal seputar materi ini. Yuk fokus lagi ke belajarnya!"
      3. Berikan penjelasan yang sederhana, ramah, dan asyik. Gunakan Bahasa Indonesia yang mudah dimengerti anak sekolah.
      4. Gunakan emoji untuk menyemangati siswa.
      5. Jangan memberikan jawaban langsung untuk soal kuis jika siswa bertanya, tapi berikan panduan cara mencarinya.
    `;

    // Susun pesan untuk model (termasuk riwayat jika ada)
    const contents = [];
    
    // Tambahkan riwayat chat sebelumnya jika ada
    if (history && Array.isArray(history)) {
      history.slice(-4).forEach(msg => {
        contents.push(`${msg.role === 'user' ? 'Siswa' : 'AsistenKu'}: ${msg.text}`);
      });
    }
    
    // Tambahkan prompt terbaru
    contents.push(`Siswa: ${prompt}`);

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      contents: contents.join('\n'),
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    if (!response || !response.text) {
      throw new Error('Gagal mendapatkan respon dari AI');
    }
    
    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'Waduh, tutornya lagi istirahat sebentar. Coba lagi ya!' }, { status: 500 });
  }
}
