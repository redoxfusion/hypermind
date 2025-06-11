import { PassThrough } from "stream";
import axios from "axios";

export async function GET(req) {
  const voice = req.nextUrl.searchParams.get("Avatar") || "fox";
  const text = req.nextUrl.searchParams.get("text") || "I'm excited to try text to speech";

  const apiKey = process.env["ELEVEN_LABS_API_KEY"];
  const url = `https://api.elevenlabs.io/v1/text-to-speech/IKne3meq5aSn9XLyUdCD`;

  try {
    const response = await axios.post(
      url,
      { text },
      {
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        responseType: "arraybuffer",
      }
    );

    // Convert arrayBuffer to stream
    const bufferStream = new PassThrough();
    bufferStream.end(Buffer.from(response.data));

    return new Response(bufferStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `inline; filename=tts.mp3`,
      },
    });
  } catch (error) {
    console.error("Error generating speech:", error);
    return new Response(JSON.stringify({ error: "Failed to generate speech" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}