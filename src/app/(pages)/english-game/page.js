'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoArrowBack } from 'react-icons/io5';
import { IoBackspaceOutline } from 'react-icons/io5';
import { IoTrashOutline } from 'react-icons/io5';

export default function EnglishGame() {
  const [words, setWords] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    async function fetchWords() {
      try {
        const res = await fetch(`/api/words?level=${level}`);
        if (!res.ok) throw new Error('Failed to fetch words');
        const data = await res.json();
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

    fetchWords();
  }, [level]);

  if (loading) return <div className="text-center mt-20 text-white">Loading...</div>;
  if (words.length === 0) return <div className="text-center mt-20 text-white">No words available for this level.</div>;

  const currentWord = words[current];

  const handleLetterClick = (letter) => {
    if (selectedLetters.length < currentWord.answer.length) {
      setSelectedLetters([...selectedLetters, letter]);
    }
  };

  const handleBackspace = () => {
    setSelectedLetters(selectedLetters.slice(0, -1)); // Remove the last letter
  };

  const handleClear = () => {
    setSelectedLetters([]); // Clear all selected letters
  };

  const handleNext = () => {
    setSelectedLetters([]);
    const nextIndex = current + 1;
    if (nextIndex < words.length) {
      setCurrent(nextIndex);
    } else {
      setLevel((prev) => prev + 1);
      setCurrent(0);
    }
  };

  const isComplete = selectedLetters.join('') === currentWord.answer;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-400 to-purple-500 flex flex-col items-center justify-between py-8">
      <div className="w-full px-4 flex items-center">
        <Link href="/">
          <IoArrowBack size={30} className="text-white" />
        </Link>
        <h1 className="text-white text-lg ml-2">Category</h1>
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
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-4 px-6">
        <button
          onClick={handleNext}
          className="bg-white text-black font-bold rounded-full px-12 py-3 text-lg"
          disabled={!isComplete}
        >
          NEXT
        </button>

        {/* Bottom Nav */}
        <div className="flex justify-around w-full mt-8 text-white">
          <Link href="/" className="flex flex-col items-center">
            <span>🏠</span>
            <span className="text-xs">Dashboard</span>
          </Link>
          <Link href="/score" className="flex flex-col items-center">
            <span>👑</span>
            <span className="text-xs">Score</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center">
            <span>👤</span>
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}