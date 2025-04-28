"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { IoHome, IoTrophy, IoPerson } from "react-icons/io5";

export default function BottomNavBar() {
  return (
    <div className="flex justify-around bg-white border-t border-gray-200 py-3">
      <button className="flex flex-col items-center text-indigo-600">
        <IoHome size={24} />
        <span className="text-xs mt-1 font-poppins font-medium">Dashboard</span>
      </button>
      <button className="flex flex-col items-center text-gray-400">
        <IoTrophy size={24} />
        <span className="text-xs mt-1 font-poppins">Score</span>
      </button>
      <button className="flex flex-col items-center text-gray-400">
        <IoPerson size={24} />
        <span className="text-xs mt-1 font-poppins">Profile</span>
      </button>
      <SignedOut>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}
