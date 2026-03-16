// app/api/tajwid-feedback/route.ts
// Dipanggil SETELAH user selesai rekam (bukan realtime)
// Gemini dengerin audio langsung → kasih feedback mad, makhraj, waqaf, dll

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob;
    const surahName = formData.get("surahName") as string || "Al-Fatihah";
    const ayahStart = formData.get("ayahStart") as string || "1";
    const ayahEnd = formData.get("ayahEnd") as string || "7";
    const mode = formData.get("mode") as string || "tahsin"; // 'tahsin' atau 'tahfidz'

    if (!audioFile || audioFile.size < 1000) {
      return NextResponse.json({ error: "Audio terlalu pendek atau tidak ada" }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const base64Audio = buffer.toString("base64");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            skor_keseluruhan: {
              type: SchemaType.NUMBER,
              description: "Skor 0-100 keseluruhan bacaan"
            },
            ringkasan: {
              type: SchemaType.STRING,
              description: "Komentar singkat dan ramah 1-2 kalimat tentang bacaan secara keseluruhan"
            },
            mad: {
              type: SchemaType.OBJECT,
              properties: {
                nilai: { type: SchemaType.STRING, description: "Baik / Perlu Diperbaiki / Kurang" },
                catatan: { type: SchemaType.STRING, description: "Penjelasan spesifik tentang mad (panjang-pendek) yang perlu diperbaiki, atau pujian jika sudah baik. Sebutkan kata/ayat yang bersangkutan." }
              },
              required: ["nilai", "catatan"]
            },
            makhraj: {
              type: SchemaType.OBJECT,
              properties: {
                nilai: { type: SchemaType.STRING, description: "Baik / Perlu Diperbaiki / Kurang" },
                catatan: { type: SchemaType.STRING, description: "Penjelasan spesifik huruf mana yang makhrajnya perlu diperbaiki dan bagaimana cara yang benar." }
              },
              required: ["nilai", "catatan"]
            },
            ghunnah: {
              type: SchemaType.OBJECT,
              properties: {
                nilai: { type: SchemaType.STRING, description: "Baik / Perlu Diperbaiki / Kurang" },
                catatan: { type: SchemaType.STRING, description: "Apakah ghunnah (dengung) pada nun/mim tasydid sudah benar." }
              },
              required: ["nilai", "catatan"]
            },
            waqaf: {
              type: SchemaType.OBJECT,
              properties: {
                nilai: { type: SchemaType.STRING, description: "Baik / Perlu Diperbaiki / Kurang" },
                catatan: { type: SchemaType.STRING, description: "Apakah waqaf (berhenti) di tempat yang tepat." }
              },
              required: ["nilai", "catatan"]
            },
            kelancaran: {
              type: SchemaType.OBJECT,
              properties: {
                nilai: { type: SchemaType.STRING, description: "Baik / Perlu Diperbaiki / Kurang" },
                catatan: { type: SchemaType.STRING, description: "Apakah bacaan lancar tanpa terbata-bata." }
              },
              required: ["nilai", "catatan"]
            },
            saran_utama: {
              type: SchemaType.STRING,
              description: "Satu saran paling penting yang harus difokuskan untuk latihan berikutnya"
            }
          },
          required: ["skor_keseluruhan", "ringkasan", "mad", "makhraj", "ghunnah", "waqaf", "kelancaran", "saran_utama"]
        }
      }
    });

    const prompt = `
Kamu adalah Ustadz ahli ilmu tajwid dan tahsin Al-Quran yang berpengalaman.
Murid sedang membaca Surah ${surahName}, Ayat ${ayahStart} sampai ${ayahEnd}.
Mode latihan: ${mode === 'tahfidz' ? 'Tahfidz (hafalan)' : 'Tahsin (perbaikan bacaan)'}.

Dengarkan audio rekaman bacaan murid ini dengan seksama, lalu berikan evaluasi yang:
- Spesifik (sebutkan kata atau huruf yang bermasalah)
- Ramah dan menyemangati
- Menggunakan bahasa Indonesia yang mudah dipahami
- Tidak perlu menyebutkan istilah Arab yang terlalu teknis kecuali yang umum

Evaluasi aspek-aspek berikut:
1. MAD (panjang-pendek): Apakah murid memanjangkan/memendekkan huruf dengan benar?
2. MAKHRAJ (tempat keluar huruf): Apakah huruf-huruf diucapkan dari tempat yang benar? (contoh: ع vs ا, ح vs ه, ق vs ك)
3. GHUNNAH (dengung): Apakah ada nun/mim yang harus didengungkan sudah didengungkan?
4. WAQAF (tanda berhenti): Apakah murid berhenti di tempat yang tepat?
5. KELANCARAN: Apakah bacaan mengalir lancar?

Berikan skor 0-100 dan ringkasan singkat yang menyemangati.
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: "audio/webm", data: base64Audio } },
    ]);

    const data = JSON.parse(result.response.text());
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Tajwid feedback error:", error.message);

    if (error.message?.includes("429")) {
      return NextResponse.json({
        error: "AI sedang sibuk, coba lagi sebentar"
      }, { status: 429 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}