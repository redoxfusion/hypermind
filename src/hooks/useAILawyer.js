const { create } = require("zustand");

export const lawyers = ["Nanami", "Naoki"];

export const useAILawyer = create((set, get) => ({
  messages: [],
  currentMessage: null,
  lawyer: lawyers[0],
  setLawyer: (lawyer) => {
    set(() => ({
      lawyer,
      messages: get().messages.map((message) => {
        message.audioPlayer = null; // New lawyer, new Voice
        return message;
      }),
    }));
  },
  session: "default",
  setSession: (session) => {
    set(() => ({
      session,
    }));
  },
  loading: false,
  furigana: true,
  setFurigana: (furigana) => {
    set(() => ({
      furigana,
    }));
  },
  english: true,
  setEnglish: (english) => {
    set(() => ({
      english,
    }));
  },
  speech: "formal",
  setSpeech: (speech) => {
    set(() => ({
      speech,
    }));
  },
  askAI: async (question) => {
    if (!question) {
      return;
    }
    const message = {
      question,
      id: get().messages.length,
    };
    set(() => ({
      loading: true,
    }));

    const speech = get().speech;

    // Ask AI
    const res = await fetch(`/api/ai?question=${question}&speech=${speech}`);
    const data = await res.json();
    message.answer = data;
    message.speech = speech;

    set(() => ({
      currentMessage: message,
    }));

    set((state) => ({
      messages: [...state.messages, message],
      loading: false,
    }));
    get().playMessage(message);
  },
  playMessage: async (message) => {
    set(() => ({
      currentMessage: message,
    }));
  
    if (!message.audioPlayer) {
      set(() => ({
        loading: true,
      }));
  
      try {
        // Fetch API to get TTS response
        const audioRes = await fetch(
          `/api/tts?lawyer=${get().lawyer}&text=${encodeURIComponent(message.answer.response || "")}`
        );
  
        if (!audioRes.ok) {
          throw new Error("TTS API error: " + (await audioRes.text()));
        }
  
        const audio = await audioRes.blob();
        const visemesHeader = audioRes.headers.get("visemes");
        const visemes = visemesHeader ? JSON.parse(visemesHeader) : [];
  
        const audioUrl = URL.createObjectURL(audio);
        const audioPlayer = new Audio(audioUrl);

        console.log(message)
  
        message.visemes = visemes;
        message.audioPlayer = audioPlayer;
  
        message.audioPlayer.onended = () => {
          set(() => ({
            currentMessage: null,
          }));
        };


  
        set(() => ({
          loading: false,
          messages: get().messages.map((m) => (m.id === message.id ? message : m)),
        }));
  
        // Play audio
        message.audioPlayer.currentTime = 0;
        message.audioPlayer.play();
      } catch (error) {
        console.error("Error fetching TTS:", error);
        set(() => ({ loading: false }));
      }
    }
  },
  
  stopMessage: (message) => {
    message.audioPlayer.pause();
    set(() => ({
      currentMessage: null,
    }));
  },
}));
