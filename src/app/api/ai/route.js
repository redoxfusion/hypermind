import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env["GEMINI_API_KEY"]);

export async function GET(req) {
  const speech = req.nextUrl.searchParams.get("speech") || "formal";
  const question = req.nextUrl.searchParams.get("question") || "Have you ever been to Japan?";

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `You are an assistant. 
You should respond with a formal and professional tone.

Their question is: ${question}

You always respond with a JSON object in this format:
{
  "response": ""
}`;

try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log("Gemini API Response:", responseText);
    return Response.json(JSON.parse(responseText));
  } catch (error) {
    return Response.json({ error: "Invalid JSON response from Gemini" });
  }
}
