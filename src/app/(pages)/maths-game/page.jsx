"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  IoArrowBack,
  IoBackspaceOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { RedirectToSignIn, useAuth } from "@clerk/nextjs";
import { ClipLoader } from "react-spinners";
import { useRouter } from "nextjs-toploader/app";

export default function MathsGame() {
  const { userId } = useAuth();
  const [problems, setProblems] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
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
    async function fetchProgressAndProblems() {
      if (!userId) {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        const progressRes = await fetch("/api/user-progress?game=MathsGame");
        if (!progressRes.ok) throw new Error("Failed to fetch progress");
        const { levelsPassed } = await progressRes.json();
        const initialLevel = levelsPassed + 1;
        setLevel(initialLevel);

        const problemsRes = await fetch(
          `/api/math-problems?level=${initialLevel}&game=MathsGame`
        );
        if (!problemsRes.ok) throw new Error("Failed to fetch problems");
        const data = await problemsRes.json();
        if (data.length === 0) return;
        setProblems(data);

        const scoresRes = await fetch("/api/scores?game=MathsGame");
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

    fetchProgressAndProblems();
  }, [userId]);

  const handleNext = useCallback(async (isTimeout = false) => {
    if (!userId) return;

    setNextLoading(true);
    setTimeLeft(30); // Reset timer for next problem

    // Handle scoring: +10 for correct answers, -5 for timeout, 0 for incorrect manual submission
    const currentProblem = problems[current];
    const isCorrect = selectedAnswer === currentProblem.answer;
    let levelScore = 0;

    if (isTimeout) {
      levelScore = -5; // Deduct 5 points for timeout
      setScore(Math.max(0, score + levelScore));
      setTotalScore(Math.max(0, totalScore + levelScore));
    } else if (isCorrect) {
      levelScore = 10; // Award 10 points for correct answer
      setScore(score + levelScore);
      setTotalScore(totalScore + levelScore);
    }

    try {
      await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, score: levelScore, game: "MathsGame" }),
      });
      await fetch("/api/user-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levelsPassed: level, game: "MathsGame" }),
      });
    } catch (error) {
      console.error("Error saving data:", error);
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
  }, [userId, problems, current, selectedAnswer, score, totalScore, level]);

  useEffect(() => {
    if (timeLeft > 0 && current < problems.length) {
      const timer = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && current < problems.length) {
      handleNext(true); // Pass isTimeout=true when timer runs out
    }
  }, [timeLeft, current, problems.length, handleNext]);

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

  const handleResetProgress = async () => {
    setResetLoading(true);
    if (!userId) return;

    if (
      !window.confirm(
        "Are you sure you want to reset your progress? This will clear your scores and level for MathsGame."
      )
    ) {
      return;
    }

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
      setLevel(1);
      setScore(0);
      setTotalScore(0);
      setCurrent(0);
      setSelectedAnswer(null);
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

  if (problems.length === 0)
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

  const currentProblem = problems[current];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-green-500 flex flex-col items-center justify-between py-8">
      <div className="w-full px-4 flex items-center justify-between">
        <Link href="/">
          <IoArrowBack size={30} className="text-white" />
        </Link>
        <h1 className="text-white text-lg">Category: Maths</h1>
        <div></div>
      </div>
      <div className="w-full px-4 flex items-center justify-center">
        <div className="text-white text-lg min-w-fit">
          Level: {level} | Score: {totalScore} | Time: {timeLeft}s
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="text-4xl font-bold text-white mb-6">
          {currentProblem.problem} = ?
        </div>

        <div className="flex justify-center gap-4 bg-white rounded-2xl px-8 py-4 mb-2">
          <div className="text-4xl font-bold underline text-gray-400">
            {selectedAnswer !== null ? selectedAnswer : "_"}
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={handleBackspace}
            className="bg-white text-black rounded-full p-2 hover:bg-gray-200"
            disabled={selectedAnswer === null}
          >
            <IoBackspaceOutline size={24} />
          </button>
          <button
            onClick={handleClear}
            className="bg-white text-black rounded-full p-2 hover:bg-gray-200"
            disabled={selectedAnswer === null}
          >
            <IoTrashOutline size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-6 rounded-2xl max-w-lg">
          {currentProblem.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(option)}
              className="text-2xl font-bold underline text-gray-700 hover:text-blue-500 p-3 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedAnswer !== null}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-4 px-6">
        <button
          onClick={() => handleNext(false)}
          className="bg-white text-black font-bold rounded-full mt-3 px-12 py-3 text-lg disabled:opacity-50 cursor-pointer"
          disabled={nextLoading}
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