'use client';

import { useState } from 'react';
import Image from 'next/image';
import Head from 'next/head';

export default function GameDashboard() {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <>
      <Head>
        <title>Game Dashboard</title>
      </Head>

      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="px-5 pt-5 pb-8">
          <br />
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white leading-tight font-poppins">
              Ready To<br />
              <span className="text-yellow-400">Learn?</span>
            </h1>
            <p className="mt-3 text-white/80 text-sm font-poppins">Choose your Game.</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-t-3xl overflow-hidden">
          {/* Tabs */}
          <div className="flex px-5 pt-5 space-x-6">
            <button
              className={`pb-2 font-poppins ${activeTab === 'All' ? 'border-b-2 border-indigo-600 font-semibold text-black' : 'text-gray-500'}`}
              onClick={() => setActiveTab('All')}
            >
              All
            </button>
            <button
              className={`pb-2 font-poppins ${activeTab === 'Favourite' ? 'border-b-2 border-indigo-600 font-semibold text-black' : 'text-gray-500'}`}
              onClick={() => setActiveTab('Favourite')}
            >
              Favourite
            </button>
          </div>

          {/* Game Cards */}
          <div className="p-4 grid grid-cols-2 gap-4">
            <GameCard
              title="English Game"
              backgroundColor="#FFD6D6"
              iconSource="/english-Game.png"
            />
            <GameCard
              title="Maths Game"
              backgroundColor="#D6FFF3"
              iconSource="/Maths-Game.png"
            />
            <GameCard
              title="Flags Game"
              backgroundColor="#D6E6FF"
              iconSource="/Flag-Game.png"
            />
            <GameCard
              title="Talking Avatar"
              backgroundColor="#FFCEC0"
              iconSource="/Avatar.png"
            />
          </div>
        </div>
      </div>
    </>
  );
}

function GameCard({ title, backgroundColor, iconSource }) {
  return (
    <div
      className="flex flex-col items-center justify-center p-5 rounded-2xl aspect-square"
      style={{ backgroundColor }}
    >
      <div className="mb-3">
        <Image src={iconSource} alt={title} width={60} height={60} className="rounded-lg" />
      </div>
      <h3 className="text-sm text-gray-800 font-poppins font-medium text-center">{title}</h3>
    </div>
  );
}
