import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob;
    const currentAyahIndex = formData.get("currentAyahIndex");

    if (!audioFile || audioFile.size < 1000) {
      return NextResponse.json({ text: "", feedback: "", isAyahComplete: false });
    }

    // Konversi Blob ke Base64 (Fixed version)
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const base64Audio = buffer.toString("base64");

    // Menggunakan Gemini 2.5 Flash dengan JSON Schema
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", 
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            text: { type: SchemaType.STRING },
            feedback: { type: SchemaType.STRING },
            isAyahComplete: { type: SchemaType.BOOLEAN },
          },
          required: ["text", "feedback", "isAyahComplete"]
        },
      },
    });

    const prompt = `
      Kamu adalah asisten Tahfidz Al-Quran. 
      Tugas:
      1. Transkripsikan audio rekaman Surah Al-Fatihah ini ke teks Arab di field 'text'.
      2. Berikan feedback tajwid singkat di field 'feedback'.
      3. Cek apakah murid sudah menyelesaikan ayat ke-${currentAyahIndex}. Jika ya, set 'isAyahComplete' ke true.
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: "audio/webm", data: base64Audio } },
    ]);

    const data = JSON.parse(result.response.text());
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Error API:", error.message);
    // Jika kena rate limit (API Sibuk)
    if (error.message.includes("429")) {
      return NextResponse.json({ 
        text: "", 
        feedback: "API Sibuk (Rate Limit). Istirahat sejenak...", 
        isAyahComplete: false 
      }, { status: 200 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}