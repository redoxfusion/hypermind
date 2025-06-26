"use client";

import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";
import { RedirectToSignIn, useAuth } from "@clerk/nextjs";

export default function FlagsGameModeSelection() {
  const { userId } = useAuth();
  const router = useRouter();

  if (!userId) return <RedirectToSignIn />;

  const handleModeSelection = (mode) => {
    router.push(`/flag-game/${mode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-green-500 flex flex-col items-center justify-center py-8">
      <div className="w-full px-4 flex items-center justify-between">
        <Link href="/">
          <IoArrowBack size={30} className="text-white" />
        </Link>
        <h1 className="text-white text-lg">Flags Game</h1>
        <div></div>
      </div>
      <div className="flex flex-col items-center gap-6 mt-10">
        <h2 className="text-white text-2xl font-bold">Choose Game Mode</h2>
        <button
          onClick={() => handleModeSelection("quiz")}
          className="bg-white text-black font-bold rounded-full px-12 py-3 text-lg hover:bg-gray-200 cursor-pointer"
        >
          Quiz Mode
        </button>
        <button
          onClick={() => handleModeSelection("mcq")}
          className="bg-white text-black font-bold rounded-full px-12 py-3 text-lg hover:bg-gray-200 cursor-pointer"
        >
          MCQ Mode
        </button>
      </div>
    </div>
  );
}