import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env["GEMINI_API_KEY"]);

export async function GET(req) {
  const speech = req.nextUrl.searchParams.get("speech") || "formal";
  const question = req.nextUrl.searchParams.get("question") || "Have you ever been to Japan?";

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are an assistant. 
You should respond with a ${speech} and professional tone.

Their question is: ${question}

You always respond with a JSON object in this format:
{
  "response": ""
}`;

try {
    const result = await model.generateContent(prompt);
    if (!result || !result.response || !result.response.text) {
      console.error("Invalid response from Gemini:", result);
      return Response.json({ error: "Invalid response from Gemini" }, { status: 500 });
    }
    let responseText = result.response.text();
    responseText = responseText.replace(/```json\n|```/g, '').trim();
    // console.log("Gemini API Raw Response:", responseText);


    // Attempt to parse the response as JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", parseError, responseText);
      return Response.json({ error: "Invalid JSON format from Gemini", rawResponse: responseText }, { status: 500 });
    }
  
    // Validate the parsed response structure
    if (!parsedResponse.response || typeof parsedResponse.response !== "string") {
      console.error("Gemini response does not match expected format:", parsedResponse);
      return Response.json({ error: "Gemini response missing 'response' field", rawResponse: responseText }, { status: 500 });
    }

    // console.log("Gemini API Parsed Response:", parsedResponse);
    return Response.json(parsedResponse);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return Response.json({ error: "Failed to process request with Gemini", details: error.message }, { status: 500 });
  }
}
