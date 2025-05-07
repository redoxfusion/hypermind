'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoArrowBack, IoBackspaceOutline, IoTrashOutline } from 'react-icons/io5';
import { useAuth } from '@clerk/nextjs';

export default function FlagsGame() {
  const { userId } = useAuth();
  const [words, setWords] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    async function fetchProgressAndWords() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user progress
        const progressRes = await fetch('/api/user-progress?game=FlagsGame');
        if (!progressRes.ok) throw new Error('Failed to fetch progress');
        const { levelsPassed } = await progressRes.json();
        const initialLevel = levelsPassed + 1;
        setLevel(initialLevel);

        // Fetch words for the level
        const wordsRes = await fetch(`/api/words?level=${initialLevel}&game=FlagsGame`);
        if (!wordsRes.ok) throw new Error('Failed to fetch words');
        const data = await wordsRes.json();
        if (data.length === 0) {
          setLoading(false);
          return;
        }
        setWords(data);
        setLoading(false);

        // Fetch total score
        const scoresRes = await fetch('/api/scores?game=FlagsGame');
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

    fetchProgressAndWords();
  }, [userId]);

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

  const handleNext = async () => {
    if (!userId) return;

    const levelScore = 10;
    setScore(score + levelScore);
    setTotalScore(totalScore + levelScore);

    try {
      const scoreRes = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, score: levelScore, game: 'FlagsGame' }),
      });
      if (!scoreRes.ok) throw new Error('Failed to save score');
    } catch (error) {
      console.error('Error saving score:', error);
    }

    try {
      const progressRes = await fetch('/api/user-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ levelsPassed: level, game: 'FlagsGame' }),
      });
      if (!progressRes.ok) throw new Error('Failed to update progress');
    } catch (error) {
      console.error('Error updating progress:', error);
    }

    setSelectedLetters([]);
    const nextIndex = current + 1;
    if (nextIndex < words.length) {
      setCurrent(nextIndex);
    } else {
      setLevel((prev) => prev + 1);
      setCurrent(0);
      setWords([]);
      setLoading(true);
      try {
        const wordsRes = await fetch(`/api/words?level=${level + 1}&game=FlagsGame`);
        if (!wordsRes.ok) throw new Error('Failed to fetch words');
        const data = await wordsRes.json();
        if (data.length === 0) {
          setLoading(false);
          return;
        }
        setWords(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }
  };

  if (loading) return <div className="text-center mt-20 text-white text-lg md:text-xl">Loading...</div>;
  if (!userId) return <div className="text-center mt-20 text-white text-lg md:text-xl">Please sign in to play.</div>;
  if (words.length === 0) return <div className="text-center mt-20 text-white text-lg md:text-xl">No words available for this level.</div>;

  const currentWord = words[current];
  const isComplete = selectedLetters.join('') === currentWord.answer;

  // Dynamically adjust font size based on word length
  const wordLength = currentWord.answer.length;
  const fontSizeClass = wordLength > 20 ? 'text-lg' : wordLength > 15 ? 'text-xl' : wordLength > 10 ? 'text-2xl' : 'text-4xl';
  const gapClass = wordLength > 20 ? 'gap-1' : wordLength > 15 ? 'gap-2' : 'gap-4';
  const paddingClass = wordLength > 20 ? 'px-4 py-2' : 'px-8 py-4';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-green-500 flex flex-col items-center justify-between py-4 sm:py-8">
      {/* Header */}
      <div className="w-full px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
        <Link href="/">
          <IoArrowBack size={24} className="text-white sm:size-30" />
        </Link>
        <h1 className="text-white text-base sm:text-lg">Category: Flags</h1>
        <div className="text-white text-base sm:text-lg">Level: {level} | Score: {totalScore}</div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center px-4 sm:px-0">
        <Image
          src={currentWord.image}
          alt="Flag Image"
          width={150}
          height={150}
          className="mb-4 sm:mb-6 sm:w-[200px] sm:h-[200px]"
        />

        {/* Answer Slots */}
        <div className={`flex flex-wrap justify-center ${gapClass} bg-white rounded-2xl ${paddingClass} mb-2 max-w-full`}>
          {currentWord.answer.split('').map((char, index) => (
            <div key={index} className={`${fontSizeClass} font-bold underline text-gray-400`}>
              {selectedLetters[index] || '_'}
            </div>
          ))}
        </div>

        {/* Backspace and Clear Buttons */}
        <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={handleBackspace}
            className="bg-white text-black rounded-full p-3 sm:p-2 hover:bg-gray-200"
            disabled={selectedLetters.length === 0}
          >
            <IoBackspaceOutline size={20} className="sm:size-24" />
          </button>
          <button
            onClick={handleClear}
            className="bg-white text-black rounded-full p-3 sm:p-2 hover:bg-gray-200"
            disabled={selectedLetters.length === 0}
          >
            <IoTrashOutline size={20} className="sm:size-24" />
          </button>
        </div>

        {/* Letter Options */}
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 sm:gap-4 bg-white p-4 sm:p-6 rounded-2xl max-w-md sm:max-w-lg">
          {currentWord.options.map((letter, index) => (
            <button
              key={index}
              onClick={() => handleLetterClick(letter)}
              className="text-lg sm:text-2xl font-bold underline text-gray-700 hover:text-blue-500 p-2 sm:p-3"
              disabled={selectedLetters.length >= currentWord.answer.length}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Next Button */}
      <div className="w-full flex flex-col items-center gap-4 px-6 sm:px-8 mt-4 sm:mt-0">
        <button
          onClick={handleNext}
          className="bg-white text-black font-bold rounded-full px-10 sm:px-12 py-2 sm:py-3 text-base sm:text-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed w-full sm:w-auto"
          disabled={!isComplete}
        >
          NEXT
        </button>
      </div>
    </div>
  );
}