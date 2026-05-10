import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// SDK akan otomatis mendeteksi process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const { prompt, imageBase64 } = await req.json();

    if (!prompt && !imageBase64) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 });
    }

    const contents: any[] = [];
    
    // Jika ada gambar, siapkan format inlineData
    if (imageBase64) {
      try {
        const base64Data = imageBase64.split(',')[1];
        const mimeType = imageBase64.split(';')[0].split(':')[1] || 'image/jpeg';
        
        contents.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
      } catch (e) {
        console.error("Format gambar tidak valid");
      }
    }

    // Tambahkan prompt teks
    if (prompt) {
      contents.push(prompt);
    }

    const systemInstruction = "Kamu adalah 'AsistenKu', tutor matematika pribadi virtual yang ramah, asyik, dan pintar. Tugasmu adalah membantu anak SD hingga SMA memecahkan PR matematika mereka. Berikan penjelasan langkah demi langkah, jangan hanya memberikan jawaban akhirnya. Gunakan bahasa Indonesia yang gaul tapi tetap sopan dan memotivasi (banyak gunakan emoji). Jika ada gambar soal, analisislah gambar tersebut.";

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'Waduh, AsistenKu lagi pusing nih. Coba lagi sebentar ya!' }, { status: 500 });
  }
}
