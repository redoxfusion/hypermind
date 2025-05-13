import { useAILawyer } from "../hooks/useAILawyer";
import { useState, useEffect } from "react";

export const TypingBox = () => {
  const askAI = useAILawyer((state) => state.askAI);
  const loading = useAILawyer((state) => state.loading);
  const response = useAILawyer((state) => state.response); // Assuming AI response is stored in state
  const [question, setQuestion] = useState("");
  const [recording, setRecording] = useState(false);
  
  let recognition;
  if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
    recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
  }

  const ask = () => {
    askAI(question);
    setQuestion("");
  };

  const speakResponse = () => {
    if (response) {
      const speech = new SpeechSynthesisUtterance(response);
      speech.lang = "en-US";
      speech.rate = 1;
      speech.pitch = 1;
      window.speechSynthesis.speak(speech);
    }
  };

  const startRecording = () => {
    if (recognition) {
      setRecording(true);
      recognition.start();
      recognition.onresult = (event) => {
        setQuestion(event.results[0][0].transcript);
      };
      recognition.onend = () => setRecording(false);
    }
  };

  return (
    <div className="z-10 max-w-[600px] flex space-y-6 flex-col bg-gradient-to-tr from-slate-300/30 via-gray-400/30 to-slate-600-400/30 p-4 backdrop-blur-md rounded-xl border-slate-100/30 border">
      <div>
        <h2 className="text-white font-bold text-xl">Ask Conva AI Anything</h2>
        <p className="text-white/65">Ask a question and Conva AI will generate a response</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
          </span>
        </div>
      ) : (
        <div className="gap-3 flex">
          <input
            className="focus:outline focus:outline-white/80 flex-grow bg-slate-800/60 p-2 px-4 rounded-full text-white placeholder:text-white/50 shadow-inner shadow-slate-900/60"
            placeholder="Type something..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                ask();
              }
            }}
          />
          <button
            className="bg-slate-100/20 p-2 px-6 rounded-full text-white"
            onClick={ask}
          >
            Ask
          </button>
          <button
            className={`bg-red-500 text-white p-2 px-4 rounded-full ${recording ? "opacity-50" : "hover:bg-red-600"}`}
            onClick={startRecording}
            disabled={recording}
          >
            🎤 Record
          </button>
        </div>
      )}

      {response && (
        <div className="text-white bg-slate-700/50 p-3 rounded-lg shadow-md">
          <p>{response}</p>
          <button
            className="mt-2 bg-blue-500 text-white p-2 px-4 rounded-lg hover:bg-blue-600"
            onClick={speakResponse}
          >
            🔊 Speak
          </button>
        </div>
      )}
    </div>
  );
};
