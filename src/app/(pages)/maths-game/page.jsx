"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  IoArrowBack,
  IoBackspaceOutline,
  IoClose,
  IoTrashOutline,
} from "react-icons/io5";
import { RedirectToSignIn, useAuth } from "@clerk/nextjs";
import { ClipLoader } from "react-spinners";
import Confetti from "react-confetti";

export default function MathsGame() {
  const { userId } = useAuth();
  const [problems, setProblems] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextLoading, setNextLoading] = useState(false);
  const [level, setLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [resetMessage, setResetMessage] = useState(null);
  const [resetError, setResetError] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 120 seconds timer
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [hint, setHint] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });

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

  useEffect(() => {
    async function fetchHint() {
      if (problems.length === 0 || current >= problems.length) return;
      setLoading(true);
      const currentProblem = problems[current];

      try {
        const hintRes = await fetch(
          `/api/ai?speech=formal&question=Provide a short hint (1-2 sentences) to help solve the following maths quiz problem: "${currentProblem.problem}". Do not give the answer.`
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

    fetchHint();
  }, [current, problems]);

  const handleNext = useCallback(
    async (isTimeout = false) => {
      if (!userId) return;

      setNextLoading(true);
      setTimeLeft(120); // Reset timer for next problem

      // Handle scoring: +10 for correct answers, -5 for timeout, 0 for incorrect manual submission
      const currentProblem = problems[current];
      const isCorrect = selectedAnswer === currentProblem.answer;
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
        levelScore = totalScore + 10; // Award 10 points for correct answer
        setTotalScore(levelScore);
        setShowConfetti(true); // Trigger confetti for correct answer
        playAudio("/music/sfx/Success.wav"); // Clapping audio for correct
        setTimeout(() => setShowConfetti(false), 7000); // Hide after 7 seconds
      } else {
        setShowErrorModal(true);
        setNextLoading(false);
        playAudio("/music/sfx/Fail.wav"); // Sad audio for incorrect answer
        return; // Do not proceed to next problem if answer is incorrect
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
      } finally {
        setTimeLeft(120); // Reset timer for next problem
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
          setTimeLeft(120); // Reset timer for next problem
        }
      }
    },
    [userId, problems, current, selectedAnswer, totalScore, level]
  );

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

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
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
        <h1 className="text-white text-lg">Maths</h1>
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

        <p className="text-white text-base mb-4 px-3 text-center">
          Hint: {hint}
        </p>

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
    </div>
  );
}
