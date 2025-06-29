"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoArrowBack, IoClose } from "react-icons/io5";
import { RedirectToSignIn, useAuth } from "@clerk/nextjs";
import { ClipLoader } from "react-spinners";
import { useRouter } from "nextjs-toploader/app";
import Confetti from "react-confetti";

export default function FlagsGameQuiz() {
  const { userId } = useAuth();
  const [flags, setFlags] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [availableLetters, setAvailableLetters] = useState([]);
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(true);
  const [nextLoading, setNextLoading] = useState(false);
  const [level, setLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [resetMessage, setResetMessage] = useState(null);
  const [resetError, setResetError] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Update window dimensions on mount and resize
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight + 1000,
      });
    };
    handleResize(); // Set initial dimensions
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchProgressAndFlags() {
      if (!userId) {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        const progressRes = await fetch(
          "/api/user-progress?game=FlagsGameQuiz"
        );
        if (!progressRes.ok) throw new Error("Failed to fetch progress");
        const { levelsPassed } = await progressRes.json();
        const initialLevel = levelsPassed + 1;
        setLevel(initialLevel);

        const flagsRes = await fetch(
          `/api/words?level=${initialLevel}&game=FlagsGameQuiz`
        );
        if (!flagsRes.ok) throw new Error("Failed to fetch flags");
        const data = await flagsRes.json();
        if (data.length === 0) return;
        setFlags(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProgressAndFlags();
  }, [userId]);

  useEffect(() => {
    async function fetchHint() {
      if (flags.length === 0 || current >= flags.length) return;
      setLoading(true);
      const currentFlag = flags[current];

      // Generate available letters (all unique letters from the answer, ignoring spaces for selection)
      const answerLetters = currentFlag.answer.replace(/\s/g, "").split("");
      const uniqueLetters = [...new Set(answerLetters)];
      setAvailableLetters(shuffle(uniqueLetters));

      try {
        const hintRes = await fetch(
          `/api/ai?speech=formal&question=Provide a short hint (1-2 sentences) about the country ${currentFlag.answer} for a flag quiz game, focusing on a unique cultural or geographical feature.`
        );
        if (!hintRes.ok) throw new Error("Failed to fetch hint");
        const hintData = await hintRes.json();
        setHint(hintData.response || "No hint available.");
      } catch (error) {
        console.error("Error fetching hint:", error);
        setHint("No hint available due to an error.");
      } finally {
        setLoading(false);
      }
    }

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    fetchHint();
  }, [flags, current]);

  useEffect(() => {
    async function fetchTotalScore() {
      try {
        const scoresRes = await fetch("/api/scores?game=FlagsGameQuiz");
        if (scoresRes.ok) {
          const scores = await scoresRes.json();
          setTotalScore(scores.reduce((sum, s) => sum + s.score, 0));
        }
      } catch (error) {
        console.error("Error fetching scores:", error);
      }
    }

    fetchTotalScore();
  }, [userId]);

  const handleNext = useCallback(
    async (isTimeout = false) => {
      if (!userId) return;

      setNextLoading(true);
      setTimeLeft(120);

      const currentFlag = flags[current];
      const isCorrect =
        selectedLetters.join("") === currentFlag.answer.replace(/\s/g, "");
      let levelScore = 0;

      // Play audio based on outcome
      const playAudio = (path) => {
        const audio = new Audio(path);
        audio
          .play()
          .catch((error) => console.error("Audio play error:", error));
      };

      if (isTimeout) {
        levelScore = Math.max(0, totalScore - 5); // Deduct 5 points for timeout
        setTotalScore(levelScore);
        playAudio("/music/sfx/Fail.wav"); // Sad audio for timeout
      } else if (isCorrect) {
        levelScore = totalScore + 10;
        setTotalScore(levelScore);
        setShowConfetti(true); // Trigger confetti for correct answer
        playAudio("/music/sfx/Success.wav"); // Clapping audio for correct
        setTimeout(() => setShowConfetti(false), 7000); // Hide after 7 seconds
      } else {
        setShowErrorModal(true); // Show custom error modal
        setNextLoading(false);
        playAudio("/music/sfx/Fail.wav"); // Sad audio for timeout
        return; // Prevent moving to next question
      }

      try {
        await fetch("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            level,
            score: levelScore,
            game: "FlagsGameQuiz",
          }),
        });
        await fetch("/api/user-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ levelsPassed: level, game: "FlagsGameQuiz" }),
        });
      } catch (error) {
        console.error("Error saving data:", error);
      } finally {
        setTimeLeft(120); // Reset timer for next word
      }

      setSelectedLetters([]);
      const nextIndex = current + 1;
      if (nextIndex < flags.length) {
        setCurrent(nextIndex);
        setNextLoading(false);
      } else {
        setLevel((prev) => prev + 1);
        setCurrent(0);
        setFlags([]);
        setLoading(true);
        try {
          const flagsRes = await fetch(
            `/api/words?level=${level + 1}&game=FlagsGameQuiz`
          );
          if (!flagsRes.ok) throw new Error("Failed to fetch flags");
          const data = await flagsRes.json();
          if (data.length === 0) {
            setLoading(false);
            return;
          }
          setFlags(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
          setNextLoading(false);
          setTimeLeft(120); // Reset timer for next word
        }
      }
    },
    [userId, flags, current, selectedLetters, totalScore, level]
  );

  useEffect(() => {
    if (timeLeft > 0 && current < flags.length) {
      const timer = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && current < flags.length) {
      handleNext(true);
    }
  }, [timeLeft, current, flags.length, handleNext]);

  const handleLetterClick = (letter) => {
    if (
      selectedLetters.length < flags[current].answer.replace(/\s/g, "").length
    ) {
      setSelectedLetters([...selectedLetters, letter]);
    }
  };

  const handleRemoveLetter = () => {
    setSelectedLetters(selectedLetters.slice(0, -1));
  };

  const handleResetProgress = async () => {
    setResetLoading(true);
    if (!userId) return;

    if (
      !window.confirm(
        "Are you sure you want to reset your progress for Quiz mode?"
      )
    ) {
      setResetLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/user-progress/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "FlagsGameQuiz" }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to reset progress");
      setResetMessage(data.message);
      setResetError(null);
      setLevel(1);
      setTotalScore(0);
      setCurrent(0);
      setSelectedLetters([]);
      setLoading(true);
      const flagsRes = await fetch("/api/words?level=1&game=FlagsGameQuiz");
      if (!flagsRes.ok) throw new Error("Failed to fetch flags");
      const dataFlags = await flagsRes.json();
      if (dataFlags.length === 0) {
        setFlags([]);
        setLoading(false);
        return;
      }
      setFlags(dataFlags);
    } catch (error) {
      console.error("Error resetting progress:", error);
      setResetError(error.message);
      setResetMessage(null);
    } finally {
      setLoading(false);
      setResetLoading(false);
    }
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  if (!userId) return <RedirectToSignIn />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-green-500 flex flex-col items-center justify-between py-8 relative">
      <div className="w-full px-4 flex items-center justify-between">
        <Link href="/flag-game">
          <IoArrowBack size={30} className="text-white" />
        </Link>
        <h1 className="text-white text-lg">Flags (Quiz Mode)</h1>
        <div></div>
      </div>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center mt-20 text-white">
          <ClipLoader
            loading={loading}
            size={80}
            color="#fff"
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      ) : flags.length === 0 ? (
        <div className="min-h-screen text-center mt-20 text-white">
          <h2>Game Over!</h2>
          <p>Your Total Score: {totalScore}</p>
          <p>Level Achieved: {level - 1}</p>
          <button
            onClick={handleResetProgress}
            className="bg-red-600 text-white font-bold rounded-full px-12 py-3 text-lg hover:bg-red-700 cursor-pointer mt-4"
          >
            {resetLoading ? (
              <ClipLoader
                loading={resetLoading}
                size={20}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            ) : (
              "Play Again"
            )}
          </button>
        </div>
      ) : (
        <div>
          <div className="w-full px-4 flex items-center justify-center">
            <div className="text-white text-lg min-w-fit">
              Level: {level} | Score: {totalScore} | Time: {timeLeft}s
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src={flags[current].image}
              alt="Flag Image"
              width={200}
              height={200}
              className="mb-4"
            />
            <p className="text-white text-base mb-4 px-3 text-center">{hint}</p>
            <div className="flex flex-col items-center mb-4">
              <div className="flex flex-col items-center mb-4">
                {flags[current].answer.split(" ").map((word, wordIndex) => {
                  // Calculate how many letters should be displayed for this word
                  const wordsBeforeThis = flags[current].answer
                    .split(" ")
                    .slice(0, wordIndex);
                  const totalLettersBeforeThisWord = wordsBeforeThis.reduce(
                    (sum, w) => sum + w.length,
                    0
                  );
                  const lettersForThisWord = selectedLetters.slice(
                    totalLettersBeforeThisWord,
                    totalLettersBeforeThisWord + word.length
                  );

                  return (
                    <div
                      key={wordIndex}
                      className="text-white text-2xl mb-2 flex"
                    >
                      {/* Render selected letters for this word */}
                      {lettersForThisWord.map((letter, index) => (
                        <span key={index} className="mx-1">
                          {letter}
                        </span>
                      ))}
                      {/* Render underscores for remaining letters in this word */}
                      {Array.from({
                        length: word.length - lettersForThisWord.length,
                      }).map((_, index) => (
                        <span key={index} className="mx-1">
                          _
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2 mb-4 place-items-center mx-auto">
              {availableLetters.map((letter, index) => (
                <button
                  key={index}
                  onClick={() => handleLetterClick(letter)}
                  className="bg-white text-black font-bold rounded-full px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  disabled={
                    selectedLetters.length >= flags[current].answer.length
                  }
                >
                  {letter}
                </button>
              ))}
            </div>
            <button
              onClick={handleRemoveLetter}
              className="bg-red-600 text-white font-bold rounded-full px-6 py-2 hover:bg-red-700 cursor-pointer"
              disabled={selectedLetters.length === 0}
            >
              Remove
            </button>
          </div>
          <div className="w-full flex flex-col items-center gap-4 px-6">
            <button
              onClick={() => handleNext(false)}
              className="bg-white text-black font-bold rounded-full mt-3 px-12 py-3 text-lg disabled:opacity-50 cursor-pointer"
              disabled={
                nextLoading ||
                selectedLetters.length !==
                  flags[current].answer.replace(/\s/g, "").length
              }
            >
              {!nextLoading ? (
                "SUBMIT"
              ) : (
                <ClipLoader
                  loading={nextLoading}
                  size={20}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />
              )}
            </button>
            {level > 1 && (
              <button
                onClick={handleResetProgress}
                className="bg-red-600 text-white font-bold rounded-full px-12 py-3 text-lg hover:bg-red-700 cursor-pointer"
              >
                {resetLoading ? (
                  <ClipLoader
                    loading={resetLoading}
                    size={20}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                ) : (
                  "Reset Progress"
                )}
              </button>
            )}
            {resetMessage && (
              <p className="text-green-400 text-center">{resetMessage}</p>
            )}
            {resetError && (
              <p className="text-red-400 text-center">{resetError}</p>
            )}
          </div>
        </div>
      )}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
        />
      )}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-red-500 to-pink-600 p-6 rounded-lg shadow-lg text-white animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Incorrect Answer!</h2>
              <button
                onClick={handleCloseErrorModal}
                className="text-white hover:text-gray-200"
              >
                <IoClose size={24} />
              </button>
            </div>
            <p className="mb-4">
              Your answer was incorrect. Please try again with the hint
              provided.
            </p>
            <button
              onClick={handleCloseErrorModal}
              className="bg-white text-red-600 font-bold py-2 px-4 rounded-full hover:bg-gray-200 transition duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
