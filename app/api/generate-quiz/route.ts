import { YoutubeTranscript } from "youtube-transcript";

function extractVideoId(url: string) {

  if (url.includes("youtu.be/")) {
    return url.split("youtu.be/")[1];
  }

  if (url.includes("v=")) {
    return url.split("v=")[1].split("&")[0];
  }

  return url;
}

export async function POST(req: Request) {

  const { url } = await req.json();

  const videoId = extractVideoId(url);

  const transcript = await YoutubeTranscript.fetchTranscript(videoId);

  const summary = transcript.map((t) => t.text).join(" ");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-quiz`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ summary })
    }
  );

  const quiz = await res.json();

  return Response.json(quiz);
}