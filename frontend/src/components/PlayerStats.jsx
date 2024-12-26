import React, { useState } from "react";
import axios from "axios";

const PlayerStats = () => {
  const [playerUrl, setPlayerUrl] = useState("");
  const [playerData, setPlayerData] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!playerUrl.trim()) return;

    try {
      const response = await axios.get(
        `http://localhost:5001/scrape-player-stats?playerUrl=${playerUrl}`
      );
      setPlayerData(response.data);
      setError("");
    } catch (err) {
      setError("Player not found or an error occurred.");
      setPlayerData(null);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-2xl font-bold mb-4">Baseball Player Stats</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={playerUrl}
          onChange={(e) => setPlayerUrl(e.target.value)}
          placeholder="Enter player URL (e.g., https://www.baseball-reference.com/players/t/troutmi01.shtml)"
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Search
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {playerData && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">{playerData.playerName}</h3>
          <h4 className="text-lg font-semibold mt-4">Year-by-Year Stats</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  {playerData.headers.map((header, index) => (
                    <th key={index} className="px-4 py-2 border">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {playerData.stats.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-2 border">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerStats;
