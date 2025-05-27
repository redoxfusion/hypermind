"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";
import { useAuth } from "@clerk/nextjs";
import { ClipLoader } from "react-spinners";

export default function Leaderboard() {
  const { userId } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState("All");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchScores() {
      setLoading(true);
      try {
        // Fetch scores for all games or a specific game
        const url =
          activeGame === "All"
            ? "/api/scores?allUsers=true"
            : `/api/scores?game=${activeGame}&allUsers=true`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch scores");
        const data = await response.json();

        // Aggregate scores by userId and game
        const aggregatedScores = data.reduce((acc, score) => {
          const key = `${score.userId}-${score.game.name}`;
          if (!acc[key]) {
            acc[key] = {
              userId: score.userId,
              game: score.game.name,
              totalScore: 0,
              user: score.user, // Include user metadata
            };
          }
          acc[key].totalScore += score.score;
          return acc;
        }, {});

        // Convert to array and sort by totalScore
        const sortedScores = Object.values(aggregatedScores).sort(
          (a, b) => b.totalScore - a.totalScore
        );

        setScores(sortedScores);
      } catch (err) {
        console.error("Error fetching scores:", err);
        setError("Failed to load leaderboard. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchScores();
  }, [activeGame]);

  // Helper function to format user display name
  const getDisplayName = (user) => {
    const { firstName, lastName, email } = user || {};
    if (firstName || lastName) {
      return `${firstName || ""} ${lastName || ""}`.trim();
    }
    return email || "Anonymous";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20 text-white">
        <ClipLoader
          loading={loading}
          size={80}
          color="#fff"
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-center mt-20 text-white text-lg md:text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-purple-500 text-black flex flex-col items-center py-4 sm:py-8">
      {/* Header */}
      <div className="w-full px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
        <Link href="/">
          <IoArrowBack size={24} className="text-white sm:size-30" />
        </Link>
        <h1 className="text-white text-base sm:text-lg font-bold">
          Leaderboard
        </h1>
        <div className="text-white text-base sm:text-lg">
          {userId ? `Your ID: ${userId.slice(0, 8)}...` : "Please sign in"}
        </div>
      </div>

      {/* Game Filter Tabs */}
      <div className="flex px-5 pt-5 space-x-6">
        {["All", "EnglishGame", "FlagsGame", "MathsGame"].map((game) => (
          <button
            key={game}
            className={`pb-2 font-poppins ${
              activeGame === game
                ? "border-b-2 border-indigo-600 font-semibold text-white"
                : "text-white/80 cursor-pointer"
            }`}
            onClick={() => setActiveGame(game)}
          >
            {game === "All" ? "All Games" : game.replace("Game", "")}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="w-full max-w-4xl mt-6 px-4 sm:px-6">
        <div className="bg-white rounded-2xl p-4 sm:p-6 overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-700">
                <th className="p-2 sm:p-3 font-bold">Rank</th>
                <th className="p-2 sm:p-3 font-bold">User</th>
                {activeGame === "All" && (
                  <th className="p-2 sm:p-3 font-bold">Game</th>
                )}
                <th className="p-2 sm:p-3 font-bold text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {scores.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-gray-500">
                    No scores available.
                  </td>
                </tr>
              ) : (
                scores.map((score, index) => (
                  <tr
                    key={`${score.userId}-${score.game}`}
                    className={`border-t ${
                      score.userId === userId ? "bg-indigo-100" : ""
                    }`}
                  >
                    <td className="p-2 sm:p-3">{index + 1}</td>
                    <td className="p-2 sm:p-3">{getDisplayName(score.user)}</td>
                    {activeGame === "All" && (
                      <td className="p-2 sm:p-3">
                        {score.game?.replace("Game", "")}
                      </td>
                    )}
                    <td className="p-2 sm:p-3 text-right">
                      {score.totalScore}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
