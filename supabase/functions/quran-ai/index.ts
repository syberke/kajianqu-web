import { serve } from "https://deno.land/std/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
}

serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {

    const formData = await req.formData()

    const file = formData.get("file")

    if (!file) {
      throw new Error("file not found")
    }

    console.log("audio received")

    return new Response(
      JSON.stringify({
        phoneme: "audio received"
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    )

  } catch (err) {

    return new Response(
      JSON.stringify({ error: String(err) }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    )

  }

})