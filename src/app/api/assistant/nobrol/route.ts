import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 });
    }

    const systemInstruction = `
      Kamu adalah 'AsistenKu', tutor matematika virtual dalam MODE NOBROL (Voice Chat).
      Siswa sedang menggunakan suara untuk tanya-jawab cepat (tektokan).
      
      ATURAN NOBROL:
      1. Jawablah dengan SANGAT SINGKAT dan LANGSUNG ke inti (maksimal 15 kata).
      2. Jangan bertele-tele. Anggap ini percakapan telepon yang cepat.
      3. Gunakan bahasa Indonesia yang santai, gaul, dan penuh semangat.
      4. Prioritaskan jawaban yang enak didengar saat dibacakan.
      5. Jangan gunakan markdown yang rumit, gunakan teks polos agar mudah dibaca oleh mesin suara.
    `;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      contents: [prompt],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
      }
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error('Nobrol API Error:', error);
    return NextResponse.json({ error: 'Waduh, lagi ada gangguan sinkronisasi.' }, { status: 500 });
  }
}
