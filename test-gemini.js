const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
  // Membaca .env secara manual
  const envContent = fs.readFileSync('.env', 'utf8');
  const apiKey = envContent.match(/GEMINI_API_KEY=["']?([^"'\n]+)/)[1];
  
  console.log("Mengetes Kunci API:", apiKey.substring(0, 8) + "...");
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const modelsToTest = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-flash-latest"];
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`\n--- Mencoba model: ${modelName} ---`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Halo, apakah kamu aktif?");
      const response = await result.response;
      console.log(`BERHASIL! Respon dari ${modelName}:`, response.text());
      return; 
    } catch (error) {
      console.error(`GAGAL dengan model ${modelName}:`, error.message);
    }
  }
}

testGemini();
