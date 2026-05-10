const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const envContent = fs.readFileSync('.env', 'utf8');
  const apiKey = envContent.match(/GEMINI_API_KEY=["']?([^"'\n]+)/)[1];
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log("Mencoba mengambil daftar model...");
    // Menggunakan fetch manual karena library mungkin membatasi
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log("MODEL YANG TERSEDIA UNTUK ANDA:");
      data.models.forEach(m => console.log("- " + m.name));
    } else {
      console.log("Tidak ada model yang ditemukan atau Error:", data);
    }
  } catch (error) {
    console.error("Gagal mengambil daftar model:", error.message);
  }
}

listModels();
