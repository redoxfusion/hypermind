'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoArrowBack } from 'react-icons/io5';

export default function EnglishGame() {
  const [words, setWords] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWords() {
      const res = await fetch('/api/words');
      const data = await res.json();
      setWords(data);
      setLoading(false);
    }

    fetchWords();
  }, []);

  if (loading) return <div className="text-center mt-20 text-white">Loading...</div>;

  const currentWord = words[current];

  const handleLetterClick = (letter) => {
    if (selectedLetters.length < currentWord.answer.length) {
      setSelectedLetters([...selectedLetters, letter]);
    }
  };

  const handleNext = () => {
    setSelectedLetters([]);
    setCurrent((prev) => (prev + 1) % words.length);
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
        <div className="flex gap-4 bg-white rounded-2xl px-8 py-4 mb-6">
          {currentWord.answer.split('').map((char, index) => (
            <div key={index} className="text-4xl font-bold underline">
              {selectedLetters[index] || '_'}
            </div>
          ))}
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
