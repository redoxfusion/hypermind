"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { useRouter } from "nextjs-toploader/app";
import { IoHome, IoTrophy, IoPerson } from "react-icons/io5";

export default function BottomNavBar() {
  const router = useRouter();

  const handleDashboardClick = () => {
    router.push("/");
  };

  const handleScoreClick = () => {
    router.push("/score");
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  return (
    <div className="flex justify-around bg-white border-t border-gray-200 py-3">
      <button
        onClick={handleDashboardClick}
        className="flex flex-col items-center text-indigo-600 cursor-pointer"
      >
        <IoHome size={24} />
        <span className="text-xs mt-1 font-poppins font-medium">Dashboard</span>
      </button>
      <button
        onClick={handleScoreClick}
        className="flex flex-col items-center text-gray-400 cursor-pointer"
      >
        <IoTrophy size={24} />
        <span className="text-xs mt-1 font-poppins">Score</span>
      </button>
      {/* <button
        onClick={handleProfileClick}
        className="flex flex-col items-center text-gray-400 cursor-pointer"
      >
        <IoPerson size={24} />
        <span className="text-xs mt-1 font-poppins">Profile</span>
      </button> */}
      <SignedOut>
        <SignInButton className="text-gray-500 cursor-pointer" />
        <SignUpButton className="text-gray-500 cursor-pointer" />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}
