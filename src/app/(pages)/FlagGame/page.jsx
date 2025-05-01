import Image from 'next/image';
import { useState } from 'react';

export default function FlagGame() {
  const [country, setCountry] = useState('Anguilla');
  const [options, setOptions] = useState('qwerttyunnfg');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8058F5] to-[#A368F5] flex flex-col items-center justify-start py-8 px-4 pb-24 relative">
      {/* Back Button */}
      <div className="w-full flex items-start">
        <button className="text-white text-sm flex items-center">
          <span className="mr-1">←</span> Back
        </button>
      </div>

      {/* Flag Image */}
      <div className="mt-4">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white">
          <Image
            src="/anguilla-flag.png" // Replace with the actual flag image path
            alt="Anguilla Flag"
            width={128}
            height={128}
            className="object-cover"
          />
        </div>
      </div>

      {/* Country Name */}
      <div className="bg-white px-8 py-4 rounded-2xl mt-6 shadow-md">
        <h1 className="text-black text-2xl font-bold tracking-widest">{country}</h1>
      </div>

      {/* Letters Grid */}
      <div className="bg-white px-8 py-4 rounded-2xl mt-6 shadow-md text-center">
        <p className="text-black text-2xl font-bold tracking-widest whitespace-pre">{options}</p>
      </div>

      {/* Next Button */}
      <button className="bg-white text-black font-semibold text-lg px-12 py-2 rounded-full shadow mt-6">
        NEXT
      </button>

      {/* Bottom Navigation Fixed in Layout */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-inner py-3 px-6 flex justify-around items-center text-[#8058F5]">
        <div className="flex flex-col items-center text-xs">
          <span>🏠</span>
          <p>Dashboard</p>
        </div>
        <div className="flex flex-col items-center text-xs">
          <span>👑</span>
          <p>Score</p>
        </div>
        <div className="flex flex-col items-center text-xs">
          <span>👤</span>
          <p>Profile</p>
        </div>
      </div>
    </div>
  );
}
