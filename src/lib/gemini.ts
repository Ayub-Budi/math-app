import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const modelName = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
const genAI = new GoogleGenerativeAI(apiKey);

// Helper function for retrying Gemini calls on 429
async function retryWithDelay<T>(fn: () => Promise<T>, retries = 2, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && error?.status === 429) {
      console.log(`Rate limited. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithDelay(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function generateQuestions(category: string, topic: string = "general", grade: string = "SD") {
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
    Generate 5 soal pilihan ganda matematika untuk tingkat ${grade} tentang kategori: ${category}, khusus untuk Bab/Sub-topik: ${topic.replace(/-/g, ' ')}.
    Format JSON:
    [
      {
        "text": "Pertanyaan",
        "options": ["A", "B", "C", "D"],
        "answer": "Jawaban Benar"
      }
    ]
  `;

  try {
    return await retryWithDelay(async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleanText = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanText);
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    return [
      {
        text: "Berapakah 12 + 15?",
        options: ["25", "26", "27", "28"],
        answer: "27"
      }
    ];
  }
}

export async function generateEquationLevels(grade: string = "SD") {
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
    Generate 3 soal matematika untuk game "Timbangan Angka" (isi kotak kosong).
    Tingkat: ${grade}. Format: [? (operator) base = target].
    Output JSON array:
    [
      { "target": 12, "base": 7, "operator": "+", "answer": 5, "options": [3, 5, 8, 4] }
    ]
    Pastikan (answer operator base = target) logis.
  `;

  try {
    return await retryWithDelay(async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleanText = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanText);
    });
  } catch (error) {
    return [
      { target: 15, base: 10, operator: "-", answer: 25, options: [20, 25, 30, 15] }
    ];
  }
}

export async function generateTheory(category: string, topic: string = "general", grade: string = "SD") {
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
    Buatlah penjelasan materi matematika terstruktur untuk tingkat ${grade} tentang kategori: ${category}, khusus membahas detail tentang Sub-topik/Bab: ${topic.replace(/-/g, ' ')}.
    Format JSON:
    {
      "title": "Judul Materi",
      "introduction": "Penjelasan pembuka dan asal-usul",
      "sections": [
        {
          "heading": "Nama Sub-materi",
          "content": "Penjelasan detail"
        }
      ],
      "example": {
        "question": "Contoh soal",
        "solution": "Langkah penyelesaian"
      }
    }
    Gunakan Bahasa Indonesia yang edukatif dan mudah dipahami.
  `;

  try {
    return await retryWithDelay(async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleanText = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanText);
    });
  } catch (error) {
    console.error("DETAILED GEMINI ERROR:", error);
    return "Materi belum tersedia saat ini.";
  }
}

export async function getStudyTips(userData: any) {
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
    Analisis data belajar siswa berikut: ${JSON.stringify(userData)}.
    Berikan 3 saran belajar yang sangat spesifik, singkat, dan memotivasi dalam bahasa Indonesia.
    Gunakan format JSON: ["Saran 1", "Saran 2", "Saran 3"]
  `;

  try {
    return await retryWithDelay(async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleanText = text.replace(/`{3}json|`{3}/g, "").trim();
      return JSON.parse(cleanText);
    });
  } catch (error) {
    return [
      "Teruslah berlatih setiap hari agar logika matematikamu makin tajam!",
      "Jangan takut salah, karena dari kesalahanlah kita belajar paling banyak.",
      "Coba jelaskan materi yang baru kamu pelajari ke temanmu untuk memperdalam pemahaman."
    ];
  }
}