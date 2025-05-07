'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoArrowBack, IoBackspaceOutline, IoTrashOutline } from 'react-icons/io5';
import { useAuth } from '@clerk/nextjs';

export default function EnglishGame() {
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
        const progressRes = await fetch('/api/user-progress?game=EnglishGame');
        if (!progressRes.ok) throw new Error('Failed to fetch progress');
        const { levelsPassed } = await progressRes.json();
        const initialLevel = levelsPassed + 1; // Start at next level
        setLevel(initialLevel);

        // Fetch words for the level
        const wordsRes = await fetch(`/api/words?level=${initialLevel}&game=EnglishGame`);
        if (!wordsRes.ok) throw new Error('Failed to fetch words');
        const data = await wordsRes.json();
        if (data.length === 0) {
          setLoading(false);
          return;
        }
        setWords(data);
        setLoading(false);

        // Fetch total score
        const scoresRes = await fetch('/api/scores?game=EnglishGame');
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

    // Calculate score (e.g., 10 points per correct answer)
    const levelScore = 10;
    setScore(score + levelScore);
    setTotalScore(totalScore + levelScore);

    // Save score
    try {
      const scoreRes = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, score: levelScore, game: 'EnglishGame' }),
      });
      if (!scoreRes.ok) throw new Error('Failed to save score');
    } catch (error) {
      console.error('Error saving score:', error);
    }

    // Update progress
    try {
      const progressRes = await fetch('/api/user-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ levelsPassed: level, game: 'EnglishGame' }),
      });
      if (!progressRes.ok) throw new Error('Failed to update progress');
    } catch (error) {
      console.error('Error updating progress:', error);
    }

    // Move to next word or level
    setSelectedLetters([]);
    const nextIndex = current + 1;
    if (nextIndex < words.length) {
      setCurrent(nextIndex);
    } else {
      setLevel((prev) => prev + 1);
      setCurrent(0);
      setWords([]);
      setLoading(true);
      // Fetch new words for next level
      try {
        const wordsRes = await fetch(`/api/words?level=${level + 1}?game=EnglishGame`);
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

  if (loading) return <div className="text-center mt-20 text-white">Loading...</div>;
  if (!userId) return <div className="text-center mt-20 text-white">Please sign in to play.</div>;
  if (words.length === 0) return <div className="text-center mt-20 text-white">No words available for this level.</div>;

  const currentWord = words[current];
  const isComplete = selectedLetters.join('') === currentWord.answer;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-400 to-purple-500 flex flex-col items-center justify-between py-8">
      <div className="w-full px-4 flex items-center justify-between">
        <Link href="/">
          <IoArrowBack size={30} className="text-white" />
        </Link>
        <h1 className="text-white text-lg">Category: Animals</h1>
        <div className="text-white text-lg">Level: {level} | Score: {totalScore}</div>
      </div>

      <div className="flex flex-col items-center">
        <Image
          src={currentWord.image}
          alt="Word Image"
          width={200}
          height={200}
          className="mb-4"
        />

        {/* Selected Letters */}
        <div className="flex gap-4 bg-white rounded-2xl px-8 py-4 mb-2">
          {currentWord.answer.split('').map((char, index) => (
            <div key={index} className="text-4xl font-bold underline text-gray-400">
              {selectedLetters[index] || '_'}
            </div>
          ))}
        </div>

        {/* Backspace and Clear Buttons */}
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

        {/* Option Letters */}
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
          className="bg-white text-black font-bold rounded-full px-12 py-3 text-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          disabled={!isComplete}
        >
          NEXT
        </button>
      </div>
    </div>
  );
}