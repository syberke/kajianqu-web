import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob;
    const surah = formData.get("surah");
    const ayat = formData.get("ayat");

    if (!audioFile) return NextResponse.json({ error: "No audio provided" }, { status: 400 });

    // 1. Ubah Blob ke Buffer lalu ke Base64
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const base64Audio = buffer.toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 2. Prompt khusus untuk Guru Mengaji AI
    const prompt = `
      Kamu adalah Ustadz ahli Al-Quran. Dengarkan audio rekaman murid ini.
      Murid ini sedang membacakan Surah ${surah} ayat ${ayat}.
      
      Tugasmu:
      1. Berikan skor (0-100) berdasarkan kelancaran dan ketepatan makhraj.
      2. Sebutkan kata-kata yang salah ucap atau tertukar (jika ada).
      3. Berikan saran perbaikan yang singkat dan ramah.

      Kembalikan jawaban HANYA dalam format JSON:
      {
        "score": number,
        "feedback": "string",
        "mistakes": [{"word": "string", "correction": "string"}]
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "audio/webm",
          data: base64Audio,
        },
      },
    ]);

    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}