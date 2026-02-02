'use client';

import { useState, useEffect } from 'react';
import './globals.css';

const CameeEconomySimulator = () => {
  // Game state
  const [playerA, setPlayerA] = useState({
    crystals: 1000,
    statusPoints: 0,
    totalSpent: 0,
  });

  const [playerB, setPlayerB] = useState({
    crystals: 500,
    statusPoints: 0,
    ratingPoints: 0,
    totalEarned: 0,
    weeklyActivityMinutes: 0,
    weeklyActivityPoints: 0,
  });

  const [economy, setEconomy] = useState({
    crystalToUSD: 0.0073,
    statusPointMultiplier: 1.0, // For spend
    ratingMultiplier: 0.4, // For earn
    payoutPercentage: 40,
  });

  const [animation, setAnimation] = useState({
    showTransfer: false,
    transferAmount: 0,
  });

  // Gift packs
  const giftPacks = [
    { name: 'Tiny', crystals: 150, usd: 1.57 },
    { name: 'Small', crystals: 300, usd: 3.13 },
    { name: 'Medium', crystals: 1000, usd: 10.44 },
    { name: 'Large', crystals: 2000, usd: 20.88 },
    { name: 'Huge', crystals: 5000, usd: 52.19 },
  ];

  const handleBuyPack = (pack) => {
    if (playerA.crystals >= pack.crystals) {
      const usdValue = pack.crystals * economy.crystalToUSD;
      const newStatusPoints = playerA.statusPoints + usdValue * economy.statusPointMultiplier;
      
      setPlayerA({
        crystals: playerA.crystals - pack.crystals,
        statusPoints: newStatusPoints,
        totalSpent: playerA.totalSpent + usdValue,
      });
    }
  };

  const handleSendGift = (crystalAmount) => {
    if (playerA.crystals >= crystalAmount) {
      const usdValue = crystalAmount * economy.crystalToUSD;
      const ratingGain = usdValue * economy.ratingMultiplier;
      const statusGainA = usdValue * economy.statusPointMultiplier;
      
      setAnimation({ showTransfer: true, transferAmount: crystalAmount });
      
      setTimeout(() => {
        setPlayerA({
          ...playerA,
          crystals: playerA.crystals - crystalAmount,
          statusPoints: playerA.statusPoints + statusGainA,
          totalSpent: playerA.totalSpent + usdValue,
        });
        
        setPlayerB({
          ...playerB,
          crystals: playerB.crystals + crystalAmount,
          ratingPoints: playerB.ratingPoints + ratingGain,
          totalEarned: playerB.totalEarned + usdValue,
        });
        
        setAnimation({ showTransfer: false, transferAmount: 0 });
      }, 500);
    }
  };

  const handleActivityChange = (minutes) => {
    const activityPoints = Math.floor(minutes / 90) * 2;
    const newPayoutPercentage = Math.min(40 + activityPoints, 60);
    
    setPlayerB({
      ...playerB,
      weeklyActivityMinutes: minutes,
      weeklyActivityPoints: activityPoints,
    });
    
    setEconomy({
      ...economy,
      payoutPercentage: newPayoutPercentage,
    });
  };

  const formatUSD = (value) => `$${value.toFixed(2)}`;
  const formatCrystals = (value) => `${Math.floor(value)} 💎`;

  return (
    <div className="bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-2">Camee Economy Simulator</h1>
        <p className="text-gray-200 text-center mb-8">Interactive model of Status & Rating systems</p>

        <div className="grid grid-cols-3 gap-8 mb-8">
          {/* Player A - Spender */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-300 mb-4">👤 Player A (Spender)</h2>
            
            <div className="space-y-3 mb-6">
              <div className="bg-black/30 p-3 rounded">
                <p className="text-gray-300 text-sm">Crystals</p>
                <p className="text-2xl font-bold text-cyan-400">{formatCrystals(playerA.crystals)}</p>
              </div>
              <div className="bg-black/30 p-3 rounded">
                <p className="text-gray-300 text-sm">Status Points</p>
                <p className="text-2xl font-bold text-yellow-400">{Math.floor(playerA.statusPoints)}</p>
              </div>
              <div className="bg-black/30 p-3 rounded">
                <p className="text-gray-300 text-sm">Total Spent</p>
                <p className="text-xl font-bold text-pink-400">{formatUSD(playerA.totalSpent)}</p>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-white mb-3">Gift Packs</h3>
            <div className="space-y-2">
              {giftPacks.map((pack, i) => (
                <button
                  key={i}
                  onClick={() => handleBuyPack(pack)}
                  disabled={playerA.crystals < pack.crystals}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-sm font-semibold transition"
                >
                  {pack.name}: {formatCrystals(pack.crystals)} ({formatUSD(pack.usd)})
                </button>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-white mb-3 mt-6">Send Gift</h3>
            <input
              type="number"
              min="10"
              max={playerA.crystals}
              defaultValue="500"
              id="giftAmount"
              className="w-full bg-black/30 border border-white/20 text-white px-3 py-2 rounded mb-2"
              placeholder="Crystals to send"
            />
            <button
              onClick={() => handleSendGift(parseInt(document.getElementById('giftAmount').value))}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-2 px-3 rounded font-semibold transition"
            >
              Send Gift →
            </button>
          </div>

          {/* Economy Dashboard */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-yellow-300 mb-4">⚙️ Economy Settings</h2>
            
            <div className="space-y-4">
              <div className="bg-black/30 p-4 rounded">
                <label className="text-sm text-gray-300 block mb-2">Crystal → USD Rate</label>
                <input
                  type="number"
                  step="0.0001"
                  value={economy.crystalToUSD}
                  onChange={(e) => setEconomy({ ...economy, crystalToUSD: parseFloat(e.target.value) })}
                  className="w-full bg-black/30 border border-white/20 text-white px-3 py-2 rounded"
                />
                <p className="text-xs text-gray-400 mt-1">1 crystal = {formatUSD(economy.crystalToUSD)}</p>
              </div>

              <div className="bg-black/30 p-4 rounded">
                <label className="text-sm text-gray-300 block mb-2">Payout %</label>
                <p className="text-2xl font-bold text-green-400">{economy.payoutPercentage}%</p>
                <p className="text-xs text-gray-400 mt-1">Base 40% + Activity Bonus</p>
              </div>

              <div className="bg-black/30 p-4 rounded">
                <label className="text-sm text-gray-300 block mb-2">Weekly Activity Minutes</label>
                <input
                  type="range"
                  min="0"
                  max="900"
                  value={playerB.weeklyActivityMinutes}
                  onChange={(e) => handleActivityChange(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-sm text-white mt-2">{playerB.weeklyActivityMinutes} / 900 min</p>
                <p className="text-xs text-yellow-400">Activity Points: {playerB.weeklyActivityPoints} / 20</p>
              </div>

              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded border border-purple-500/30">
                <p className="text-xs text-gray-300 mb-2">Status Calc:</p>
                <p className="text-sm text-white">1 USD spent = 1 status point</p>
              </div>

              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 p-4 rounded border border-green-500/30">
                <p className="text-xs text-gray-300 mb-2">Rating Calc:</p>
                <p className="text-sm text-white">1 USD earned = 0.4 rating points</p>
              </div>
            </div>
          </div>

          {/* Player B - Receiver */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-green-300 mb-4">👥 Player B (Receiver)</h2>
            
            <div className="space-y-3 mb-6">
              <div className="bg-black/30 p-3 rounded">
                <p className="text-gray-300 text-sm">Crystals Received</p>
                <p className="text-2xl font-bold text-cyan-400">{formatCrystals(playerB.crystals)}</p>
              </div>
              <div className="bg-black/30 p-3 rounded">
                <p className="text-gray-300 text-sm">Status Points</p>
                <p className="text-2xl font-bold text-yellow-400">{Math.floor(playerB.statusPoints)}</p>
              </div>
              <div className="bg-black/30 p-3 rounded">
                <p className="text-gray-300 text-sm">Rating Points</p>
                <p className="text-2xl font-bold text-green-400">{Math.floor(playerB.ratingPoints)}</p>
              </div>
              <div className="bg-black/30 p-3 rounded">
                <p className="text-gray-300 text-sm">Total Earned (USD)</p>
                <p className="text-xl font-bold text-pink-400">{formatUSD(playerB.totalEarned)}</p>
              </div>
              <div className="bg-black/30 p-3 rounded">
                <p className="text-gray-300 text-sm">Available Payout</p>
                <p className="text-xl font-bold text-green-400">
                  {formatUSD(playerB.totalEarned * (economy.payoutPercentage / 100))}
                </p>
                <p className="text-xs text-gray-400 mt-1">@ {economy.payoutPercentage}% payout</p>
              </div>
            </div>

            <div className="text-center text-gray-400 text-xs">
              <p>Activity: {playerB.weeklyActivityPoints} / 20 points</p>
              <p className="mt-1 text-green-400">+{economy.payoutPercentage - 40}% bonus this week</p>
            </div>
          </div>
        </div>

        {/* Animation */}
        {animation.showTransfer && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
            <div className="animate-bounce text-6xl">💎</div>
            <p className="absolute text-white font-bold text-lg">{formatCrystals(animation.transferAmount)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameeEconomySimulator;
