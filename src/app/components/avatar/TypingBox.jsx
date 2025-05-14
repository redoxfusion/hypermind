import { useAILawyer } from "@/hooks/useAILawyer";
import { useState, useEffect } from "react";

export const TypingBox = () => {
  const askAI = useAILawyer((state) => state.askAI);
  const loading = useAILawyer((state) => state.loading);
  const response = useAILawyer((state) => state.response);
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
    <div className="z-10 w-full max-w-[600px] flex flex-col gap-4 bg-gradient-to-tr from-slate-300/30 via-gray-400/30 to-slate-600/30 p-4 backdrop-blur-md rounded-xl border border-slate-100/30 mx-auto">
      <div>
        <h2 className="text-white font-bold text-lg sm:text-xl">Ask Conva AI Anything</h2>
        <p className="text-white/65 text-sm sm:text-base">Ask a question and Conva AI will generate a response</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
          </span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <input
            className="w-full flex-grow bg-slate-800/60 p-2 px-4 rounded-full text-white placeholder:text-white/50 shadow-inner shadow-slate-900/60 focus:outline focus:outline-white/80"
            placeholder="Type something..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") ask();
            }}
          />
          <div className="flex gap-2 sm:gap-3 flex-col sm:flex-row w-full sm:w-auto">
            <button
              className="bg-slate-100/20 p-2 px-4 sm:px-6 rounded-full text-white w-full sm:w-auto"
              onClick={ask}
            >
              Ask
            </button>
            <button
              className={`text-white p-2 px-4 rounded-full w-full sm:w-auto ${
                recording
                  ? "bg-red-500 opacity-50"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              onClick={startRecording}
              disabled={recording}
            >
              🎤 Record
            </button>
          </div>
        </div>
      )}

      {response && (
        <div className="text-white bg-slate-700/50 p-3 rounded-lg shadow-md">
          <p className="text-sm sm:text-base">{response}</p>
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
