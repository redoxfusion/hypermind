import { useState } from 'react';

export default function MathGame() {
  const [question, setQuestion] = useState('2 + 3 = ___');
  const [options, setOptions] = useState(['5', '6', '2', '1', '7', '8', '3', '10', '11', '21']);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8058F5] to-[#573CFF] flex flex-col items-center justify-between py-8 px-4 relative">
      {/* Back Button */}
      <div className="w-full flex items-start">
        <button className="text-white text-sm flex items-center">
          <span className="mr-2">←</span> Back
        </button>
      </div>

      {/* Question Box */}
      <div className="bg-white px-10 py-6 rounded-2xl mt-12 shadow-md w-full max-w-md">
        <h1 className="text-black text-3xl font-bold text-center tracking-wide">{question}</h1>
      </div>

      {/* Options Grid */}
      <div className="bg-white px-10 py-6 rounded-2xl mt-6 shadow-md w-full max-w-md grid grid-cols-5 gap-4 text-center">
        {options.map((num, idx) => (
          <div
            key={idx}
            className="text-black text-2xl font-bold tracking-widest cursor-pointer"
          >
            {num}
          </div>
        ))}
      </div>

      {/* Next Button */}
      <button className="bg-white text-black font-semibold text-lg px-12 py-3 rounded-full shadow mt-6">
        NEXT
      </button>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl py-4 flex justify-around text-black">
        <div className="flex flex-col items-center text-xs">
          <span>🏠</span>
          <p className="mt-1 font-medium">Dashboard</p>
        </div>
        <div className="flex flex-col items-center text-xs text-gray-400">
          <span>👑</span>
          <p className="mt-1">score</p>
        </div>
        <div className="flex flex-col items-center text-xs text-gray-400">
          <span>👤</span>
          <p className="mt-1">Profile</p>
        </div>
      </div>
    </div>
  );
}