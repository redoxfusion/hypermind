"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IoArrowBack,
  IoBackspaceOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { RedirectToSignIn, useAuth } from "@clerk/nextjs";
import { ClipLoader } from "react-spinners";

export default function MathsGame() {
  const { userId } = useAuth();
  const [problems, setProblems] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextLoading, setNextLoading] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(3);
  const [resetMessage, setResetMessage] = useState(null);
  const [resetError, setResetError] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    async function fetchProgressAndProblems() {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Fetch user progress
        const progressRes = await fetch("/api/user-progress?game=MathsGame");
        if (!progressRes.ok) throw new Error("Failed to fetch progress");
        const { levelsPassed } = await progressRes.json();
        const initialLevel = levelsPassed + 1;
        setLevel(initialLevel);

        // Fetch problems for the level
        const problemsRes = await fetch(
          `/api/math-problems?level=${initialLevel}&game=MathsGame`
        );
        if (!problemsRes.ok) throw new Error("Failed to fetch problems");
        const data = await problemsRes.json();
        if (data.length === 0) {
          return;
        }
        setProblems(data);

        // Fetch total score
        const scoresRes = await fetch("/api/scores?game=MathsGame");
        if (scoresRes.ok) {
          const scores = await scoresRes.json();
          const total = scores.reduce((sum, s) => sum + s.score, 0);
          setTotalScore(total);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProgressAndProblems();
  }, [userId]);

  if (!userId) {
    return <RedirectToSignIn />;
  }

  const handleAnswerClick = (answer) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(answer);
    }
  };

  const handleBackspace = () => {
    setSelectedAnswer(null);
  };

  const handleClear = () => {
    setSelectedAnswer(null);
  };

  const handleNext = async () => {
    if (!userId) return;

    setNextLoading(true);

    const levelScore = 10;
    setScore(score + levelScore);
    setTotalScore(totalScore + levelScore);

    try {
      const scoreRes = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, score: levelScore, game: "MathsGame" }),
      });
      if (!scoreRes.ok) throw new Error("Failed to save score");
    } catch (error) {
      console.error("Error saving score:", error);
    }

    try {
      const progressRes = await fetch("/api/user-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levelsPassed: level, game: "MathsGame" }),
      });
      if (!progressRes.ok) throw new Error("Failed to update progress");
    } catch (error) {
      console.error("Error updating progress:", error);
    }

    setSelectedAnswer(null);
    const nextIndex = current + 1;
    if (nextIndex < problems.length) {
      setCurrent(nextIndex);
      setNextLoading(false);
    } else {
      setLevel((prev) => prev + 1);
      setCurrent(0);
      setProblems([]);
      setLoading(true);
      try {
        const problemsRes = await fetch(
          `/api/math-problems?level=${level + 1}&game=MathsGame`
        );
        if (!problemsRes.ok) throw new Error("Failed to fetch problems");
        const data = await problemsRes.json();
        if (data.length === 0) {
          setLoading(false);
          return;
        }
        setProblems(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setNextLoading(false);
      }
    }
  };

  const handleResetProgress = async () => {
    if (!userId) return;

    if (
      !window.confirm(
        "Are you sure you want to reset your progress? This will clear your scores and level for MathsGame."
      )
    ) {
      return;
    }

    setResetLoading(true);
    try {
      const response = await fetch("/api/user-progress/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "MathsGame" }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to reset progress");
      setResetMessage(data.message);
      setResetError(null);
      // Reset local state
      setLevel(1);
      setScore(0);
      setTotalScore(0);
      setCurrent(0);
      setSelectedAnswer(null);
      // Refetch problems for level 1
      setLoading(true);
      const problemsRes = await fetch(
        "/api/math-problems?level=1&game=MathsGame"
      );
      if (!problemsRes.ok) throw new Error("Failed to fetch problems");
      const dataProblems = await problemsRes.json();
      if (dataProblems.length === 0) {
        setProblems([]);
        setLoading(false);
        return;
      }
      setProblems(dataProblems);
    } catch (error) {
      console.error("Error resetting progress:", error);
      setResetError(error.message);
      setResetMessage(null);
    } finally {
      setLoading(false);
      setResetLoading(false);
    }
  };

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
  if (problems.length === 0)
    return (
      <div className="text-center mt-20 text-white text-lg md:text-xl">
        No problems available for this level.
      </div>
    );

  const currentProblem = problems[current];
  const isCorrect = selectedAnswer === currentProblem.answer;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-green-500 flex flex-col items-center justify-between py-4 sm:py-8">
      {/* Header */}
      <div className="w-full px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
        <Link href="/">
          <IoArrowBack size={24} className="text-white sm:size-30" />
        </Link>
        <h1 className="text-white text-base sm:text-lg">Category: Maths</h1>
        <div className="text-white text-base sm:text-lg">
          Level: {level} | Score: {totalScore}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center px-4 sm:px-0">
        <div className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
          {currentProblem.problem} = ?
        </div>

        {/* Answer Display */}
        <div className="flex justify-center gap-4 bg-white rounded-2xl px-8 py-4 mb-2 max-w-full">
          <div className="text-3xl sm:text-4xl font-bold underline text-gray-400">
            {selectedAnswer !== null ? selectedAnswer : "_"}
          </div>
        </div>

        {/* Backspace and Clear Buttons */}
        <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={handleBackspace}
            className="bg-white text-black rounded-full p-3 sm:p-2 hover:bg-gray-200"
            disabled={selectedAnswer === null}
          >
            <IoBackspaceOutline size={20} className="sm:size-24" />
          </button>
          <button
            onClick={handleClear}
            className="bg-white text-black rounded-full p-3 sm:p-2 hover:bg-gray-200"
            disabled={selectedAnswer === null}
          >
            <IoTrashOutline size={20} className="sm:size-24" />
          </button>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4 bg-white p-4 sm:p-6 rounded-2xl max-w-md sm:max-w-lg">
          {currentProblem.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(option)}
              className="text-lg sm:text-2xl font-bold underline text-gray-700 hover:text-blue-500 p-2 sm:p-3 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedAnswer !== null}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Next and Reset Buttons */}
      <div className="w-full flex flex-col items-center gap-4 px-6 sm:px-8 mt-4 sm:mt-0">
        <button
          onClick={handleNext}
          className="bg-white text-black font-bold rounded-full px-10 sm:px-12 py-2 sm:py-3 text-base sm:text-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed w-full sm:w-auto"
          disabled={selectedAnswer === null || !isCorrect}
        >
          {nextLoading ? (
            <ClipLoader
              loading={nextLoading}
              size={20}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          ) : (
            "NEXT"
          )}
        </button>
        {level > 1 && (
          <button
            onClick={handleResetProgress}
            className="bg-red-600 text-white font-bold rounded-full px-10 sm:px-12 py-2 sm:py-3 text-base sm:text-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto cursor-pointer"
            disabled={resetLoading}
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
        {resetError && <p className="text-red-400 text-center">{resetError}</p>}
      </div>
    </div>
  );
}
