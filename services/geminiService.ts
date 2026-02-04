
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Anda adalah asisten virtual resmi untuk program MBG (Makan Bergizi Gratis) Kabupaten Bandung.
Tujuan Anda adalah memberikan informasi yang akurat, ramah, dan mendukung kepada masyarakat Kabupaten Bandung.

Informasi Utama MBG Kabupaten Bandung:
1. MBG adalah program pemberian makan siang bergizi gratis untuk anak sekolah (PAUD sampai SMP), ibu hamil, dan balita.
2. Visi: Mewujudkan Generasi Emas 2045 dan menurunkan angka stunting di Kabupaten Bandung (Visi BEDAS - Bangkit, Edukatif, Dinamis, Agamis, Sejahtera).
3. Kandungan Gizi: Setiap paket makan mengandung karbohidrat, protein hewani (ayam/ikan/telur), sayuran, buah, dan susu. Kalori disesuaikan dengan kebutuhan usia.
4. Sumber Bahan Baku: Mengutamakan hasil pertanian dan peternakan lokal Kabupaten Bandung untuk memberdayakan ekonomi daerah.
5. Jika ditanya hal teknis pendaftaran yang tidak ada di data, arahkan untuk menghubungi Dinas Pendidikan atau Dinas Kesehatan Kabupaten Bandung.

Jawablah dalam bahasa Indonesia yang sopan dan mudah dimengerti oleh warga. Gunakan istilah populer di Kabupaten Bandung jika relevan (seperti kata 'Bedas').
`;

export const getGeminiResponse = async (userPrompt: string) => {
  try {
    // Fix: Instantiate GoogleGenAI right before the call to ensure the latest API key is used from the environment
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Fix: Use ai.models.generateContent with model and prompt as per latest SDK guidelines
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    // Fix: Access the generated text using the .text property directly (not a method call)
    return response.text || "Maaf, saya sedang mengalami kendala teknis. Silakan coba lagi nanti.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Maaf, terjadi kesalahan saat menghubungi asisten AI. Mohon pastikan koneksi internet Anda stabil.";
  }
};
