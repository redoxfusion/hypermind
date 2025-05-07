'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IoArrowBack, IoBackspaceOutline, IoTrashOutline } from 'react-icons/io5';
import { useAuth } from '@clerk/nextjs';

export default function MathsGame() {
  const { userId } = useAuth();
  const [problems, setProblems] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    async function fetchProgressAndProblems() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user progress
        const progressRes = await fetch('/api/user-progress?game=MathsGame');
        if (!progressRes.ok) throw new Error('Failed to fetch progress');
        const { levelsPassed } = await progressRes.json();
        const initialLevel = levelsPassed + 1;
        setLevel(initialLevel);

        // Fetch problems for the level
        const problemsRes = await fetch(`/api/math-problems?level=${initialLevel}&game=MathsGame`);
        if (!problemsRes.ok) throw new Error('Failed to fetch problems');
        const data = await problemsRes.json();
        if (data.length === 0) {
          setLoading(false);
          return;
        }
        setProblems(data);
        setLoading(false);

        // Fetch total score
        const scoresRes = await fetch('/api/scores?game=MathsGame');
        if (scoresRes.ok) {
          const scores = await scoresRes.json();
          const total = scores.reduce((sum, s) => sum + s.score, 0);
          setTotalScore(total);
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }

    fetchProgressAndProblems();
  }, [userId]);

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

    const levelScore = 10;
    setScore(score + levelScore);
    setTotalScore(totalScore + levelScore);

    try {
      const scoreRes = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, score: levelScore, game: 'MathsGame' }),
      });
      if (!scoreRes.ok) throw new Error('Failed to save score');
    } catch (error) {
      console.error('Error saving score:', error);
    }

    try {
      const progressRes = await fetch('/api/user-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ levelsPassed: level, game: 'MathsGame' }),
      });
      if (!progressRes.ok) throw new Error('Failed to update progress');
    } catch (error) {
      console.error('Error updating progress:', error);
    }

    setSelectedAnswer(null);
    const nextIndex = current + 1;
    if (nextIndex < problems.length) {
      setCurrent(nextIndex);
    } else {
      setLevel((prev) => prev + 1);
      setCurrent(0);
      setProblems([]);
      setLoading(true);
      try {
        const problemsRes = await fetch(`/api/math-problems?level=${level + 1}&game=MathsGame`);
        if (!problemsRes.ok) throw new Error('Failed to fetch problems');
        const data = await problemsRes.json();
        if (data.length === 0) {
          setLoading(false);
          return;
        }
        setProblems(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }
  };

  if (loading) return <div className="text-center mt-20 text-white text-lg md:text-xl">Loading...</div>;
  if (!userId) return <div className="text-center mt-20 text-white text-lg md:text-xl">Please sign in to play.</div>;
  if (problems.length === 0) return <div className="text-center mt-20 text-white text-lg md:text-xl">No problems available for this level.</div>;

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
        <div className="text-white text-base sm:text-lg">Level: {level} | Score: {totalScore}</div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center px-4 sm:px-0">
        <div className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
          {currentProblem.problem} = ?
        </div>

        {/* Answer Display */}
        <div className="flex justify-center gap-4 bg-white rounded-2xl px-8 py-4 mb-2 max-w-full">
          <div className="text-3xl sm:text-4xl font-bold underline text-gray-400">
            {selectedAnswer !== null ? selectedAnswer : '_'}
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

      {/* Next Button */}
      <div className="w-full flex flex-col items-center gap-4 px-6 sm:px-8 mt-4 sm:mt-0">
        <button
          onClick={handleNext}
          className="bg-white text-black font-bold rounded-full px-10 sm:px-12 py-2 sm:py-3 text-base sm:text-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed w-full sm:w-auto"
          disabled={selectedAnswer === null || !isCorrect}
        >
          NEXT
        </button>
      </div>
    </div>
  );
}