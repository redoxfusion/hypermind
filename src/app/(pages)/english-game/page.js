"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IoArrowBack,
  IoBackspaceOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { RedirectToSignIn, useAuth } from "@clerk/nextjs";
import { ClipLoader } from "react-spinners";
import { useRouter } from "nextjs-toploader/app";

export default function EnglishGame() {
  const { userId } = useAuth();
  const [words, setWords] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextLoading, setNextLoading] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [resetMessage, setResetMessage] = useState(null);
  const [resetError, setResetError] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds timer

  useEffect(() => {
    async function fetchProgressAndWords() {
      if (!userId) {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        const progressRes = await fetch("/api/user-progress?game=EnglishGame");
        if (!progressRes.ok) throw new Error("Failed to fetch progress");
        const { levelsPassed } = await progressRes.json();
        const initialLevel = levelsPassed + 1;
        setLevel(initialLevel);

        const wordsRes = await fetch(
          `/api/words?level=${initialLevel}&game=EnglishGame`
        );
        if (!wordsRes.ok) throw new Error("Failed to fetch words");
        const data = await wordsRes.json();
        if (data.length === 0) return;
        setWords(data);

        const scoresRes = await fetch("/api/scores?game=EnglishGame");
        if (scoresRes.ok) {
          const scores = await scoresRes.json();
          setTotalScore(scores.reduce((sum, s) => sum + s.score, 0));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProgressAndWords();
  }, [userId]);

  const handleNext = useCallback(async () => {
    if (!userId) return;

    setNextLoading(true);
    setTimeLeft(30); // Reset timer for next word

    // Award points only for correct answers
    const currentWord = words[current];
    const isCorrect = selectedLetters.join("") === currentWord.answer;
    const levelScore = isCorrect ? 10 : 0;
    setScore(score + levelScore);
    setTotalScore(totalScore + levelScore);

    try {
      await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, score: levelScore, game: "EnglishGame" }),
      });
      await fetch("/api/user-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levelsPassed: level, game: "EnglishGame" }),
      });
    } catch (error) {
      console.error("Error saving data:", error);
    }

    setSelectedLetters([]);
    const nextIndex = current + 1;
    if (nextIndex < words.length) {
      setCurrent(nextIndex);
      setNextLoading(false);
      setTimeLeft(30); // Reset timer for next word
    } else {
      setLevel((prev) => prev + 1);
      setCurrent(0);
      setWords([]);
      setLoading(true);
      try {
        const wordsRes = await fetch(
          `/api/words?level=${level + 1}&game=EnglishGame`
        );
        if (!wordsRes.ok) throw new Error("Failed to fetch words");
        const data = await wordsRes.json();
        if (data.length === 0) {
          setLoading(false);
          return;
        }
        setWords(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setNextLoading(false);
        setTimeLeft(30); // Reset timer for next word
      }
    }
  }, [userId, words, current, selectedLetters, score, totalScore, level]);

  useEffect(() => {
    if (timeLeft > 0 && current < words.length) {
      const timer = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleNext(); // Auto-proceed when timer runs out
    }
  }, [timeLeft, current, words.length, handleNext]);

  
  const handleLetterClick = (letter) => {
    if (selectedLetters.length < currentWord.answer.length) {
      setSelectedLetters([...selectedLetters, letter]);
    }
  };

  const handleBackspace = () => {
    setSelectedLetters(selectedLetters.slice(0, -1));
  };

  const handleClear = () => {
    setSelectedLetters([]);
  };

  const handleResetProgress = async () => {
    setResetLoading(true);
    if (!userId) return;

    if (
      !window.confirm(
        "Are you sure you want to reset your progress? This will clear your scores and level for EnglishGame."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/user-progress/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "EnglishGame" }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to reset progress");
      setResetMessage(data.message);
      setResetError(null);
      setLevel(1);
      setScore(0);
      setTotalScore(0);
      setCurrent(0);
      setSelectedLetters([]);
      setLoading(true);
      const wordsRes = await fetch("/api/words?level=1&game=EnglishGame");
      if (!wordsRes.ok) throw new Error("Failed to fetch words");
      const dataWords = await wordsRes.json();
      if (dataWords.length === 0) {
        setWords([]);
        setLoading(false);
        return;
      }
      setWords(dataWords);
    } catch (error) {
      console.error("Error resetting progress:", error);
      setResetError(error.message);
      setResetMessage(null);
    } finally {
      setLoading(false);
      setResetLoading(false);
    }
  };

  if (!userId) return <RedirectToSignIn />;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center mt-20 text-white">
        <ClipLoader
          loading={loading}
          size={80}
          color="#fff"
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
    if (words.length === 0)
    return (
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
              className="ml-2"
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          ) : (
            "Play Again"
          )}
        </button>
      </div>
    );

  const currentWord = words[current];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-400 to-purple-500 flex flex-col items-center justify-between py-8">
      <div className="w-full px-4 flex items-center justify-between">
        <Link href="/">
          <IoArrowBack size={30} className="text-white" />
        </Link>
        <h1 className="text-white text-lg">Category: Animals</h1>
        <div></div>
      </div>
      <div className="w-full px-4 flex items-center justify-center">
        <div className="text-white text-lg min-w-fit">
          Level: {level} | Score: {totalScore} | Time: {timeLeft}s
        </div>
      </div>

      <div className="flex flex-col items-center">
        <Image
          src={currentWord.image}
          alt="Word Image"
          width={200}
          height={200}
          className="mb-4"
        />

        <div className="flex gap-4 bg-white rounded-2xl px-8 py-4 mb-2">
          {currentWord.answer.split("").map((char, index) => (
            <div
              key={index}
              className="text-4xl font-bold underline text-gray-400"
            >
              {selectedLetters[index] || "_"}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={handleBackspace}
            className="bg-white text-black rounded-full p-2 hover:bg-gray-200"
            disabled={selectedLetters.length === 0}
          >
            <IoBackspaceOutline size={24} />
          </button>
          <button
            onClick={handleClear}
            className="bg-white text-black rounded-full p-2 hover:bg-gray-200"
            disabled={selectedLetters.length === 0}
          >
            <IoTrashOutline size={24} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 bg-white p-6 rounded-2xl">
          {currentWord.options.map((letter, index) => (
            <button
              key={index}
              onClick={() => handleLetterClick(letter)}
              className="text-2xl font-bold underline text-gray-700 hover:text-indigo-500"
              disabled={selectedLetters.length >= currentWord.answer.length}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-4 px-6">
        <button
          onClick={handleNext}
          className="bg-white text-black font-bold rounded-full mt-3 px-12 py-3 text-lg disabled:opacity-50 cursor-pointer"
          disabled={nextLoading}
        >
          {!nextLoading ? (
            "NEXT"
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
                className="ml-2"
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
        {resetError && <p className="text-red-400 text-center">{resetError}</p>}
      </div>
    </div>
  );
}
