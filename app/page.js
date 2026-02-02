'use client';

import { useState, useEffect } from 'react';
import './globals.css';

const CameeEconomySimulator = () => {
  // Crystal rate constant
  const CRYSTAL_TO_USD = 0.0073;

  // Game state
  const [playerA, setPlayerA] = useState({
    crystals: 0,
    usdBalance: 1000, // Infinite USD for buying packs
    statusPoints: 0,
    totalSpent: 0,
  });

  const [playerB, setPlayerB] = useState({
    statusPoints: 0,
    ratingPoints: 0,
    totalEarned: 0,
    weeklyActivityMinutes: 0,
    weeklyActivityPoints: 0,
  });

  const [limitedGifts, setLimitedGifts] = useState({
    1: { limit: 10, remaining: 10 },
    2: { limit: 10, remaining: 10 },
    3: { limit: 10, remaining: 10 },
    4: { limit: 10, remaining: 10 },
    5: { limit: 10, remaining: 10 },
  });

  const [economy, setEconomy] = useState({
    payoutPercentage: 40,
  });

  // Pack prices from photo
  const crystalPacks = [
    { crystals: 130, usd: 1.99 },
    { crystals: 530, usd: 6.99 },
    { crystals: 850, usd: 10.99 },
    { crystals: 2100, usd: 24.99 },
    { crystals: 5750, usd: 64.99 },
    { crystals: 9100, usd: 94.99 },
  ];

  // Standard gifts
  const standardGifts = [
    { id: 1, crystals: 150 },
    { id: 2, crystals: 300 },
    { id: 3, crystals: 1000 },
    { id: 4, crystals: 2000 },
    { id: 5, crystals: 3000 },
    { id: 6, crystals: 5000 },
    { id: 7, crystals: 6000 },
    { id: 8, crystals: 10000 },
    { id: 9, crystals: 12000 },
    { id: 10, crystals: 20000 },
  ];

  // Limited gifts
  const limitedGiftsPrices = {
    1: { crystals: 1500 },
    2: { crystals: 4000 },
    3: { crystals: 8500 },
    4: { crystals: 25000 },
    5: { crystals: 40000 },
  };

  // Actions
  const handleBuyPack = (pack) => {
    if (playerA.usdBalance >= pack.usd) {
      setPlayerA({
        ...playerA,
        crystals: playerA.crystals + pack.crystals,
        usdBalance: playerA.usdBalance - pack.usd,
      });
    }
  };

  const handleUseFilter = () => {
    const filterCost = 10; // gems
    if (playerA.crystals >= filterCost) {
      const usdValue = filterCost * CRYSTAL_TO_USD;
      const statusGain = usdValue * 1.0; // 1 USD = 1 status point

      setPlayerA({
        ...playerA,
        crystals: playerA.crystals - filterCost,
        statusPoints: playerA.statusPoints + statusGain,
        totalSpent: playerA.totalSpent + usdValue,
      });
    }
  };

  const handleSendMessage = () => {
    const messageCost = 90; // gems
    if (playerA.crystals >= messageCost) {
      const usdValue = messageCost * CRYSTAL_TO_USD;
      const statusGain = usdValue * 1.0;

      setPlayerA({
        ...playerA,
        crystals: playerA.crystals - messageCost,
        statusPoints: playerA.statusPoints + statusGain,
        totalSpent: playerA.totalSpent + usdValue,
      });
    }
  };

  const handleSendStandardGift = (gift) => {
    if (playerA.crystals >= gift.crystals) {
      const usdValue = gift.crystals * CRYSTAL_TO_USD;
      const statusGainA = usdValue * 1.0; // Spend
      const ratingGainB = usdValue * 0.4; // Earn
      const statusGainB = ratingGainB; // Same as rating gain

      setPlayerA({
        ...playerA,
        crystals: playerA.crystals - gift.crystals,
        statusPoints: playerA.statusPoints + statusGainA,
        totalSpent: playerA.totalSpent + usdValue,
      });

      setPlayerB({
        ...playerB,
        statusPoints: playerB.statusPoints + statusGainB,
        ratingPoints: playerB.ratingPoints + ratingGainB,
        totalEarned: playerB.totalEarned + usdValue,
      });
    }
  };

  const handleSendLimitedGift = (giftId) => {
    if (limitedGifts[giftId].remaining > 0 && playerA.crystals >= limitedGiftsPrices[giftId].crystals) {
      const gift = limitedGiftsPrices[giftId];
      const usdValue = gift.crystals * CRYSTAL_TO_USD;
      const statusGainA = usdValue * 1.0;
      const ratingGainB = usdValue * 0.4;
      const statusGainB = ratingGainB;

      setPlayerA({
        ...playerA,
        crystals: playerA.crystals - gift.crystals,
        statusPoints: playerA.statusPoints + statusGainA,
        totalSpent: playerA.totalSpent + usdValue,
      });

      setPlayerB({
        ...playerB,
        statusPoints: playerB.statusPoints + statusGainB,
        ratingPoints: playerB.ratingPoints + ratingGainB,
        totalEarned: playerB.totalEarned + usdValue,
      });

      setLimitedGifts({
        ...limitedGifts,
        [giftId]: {
          ...limitedGifts[giftId],
          remaining: limitedGifts[giftId].remaining - 1,
        },
      });
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
    <div className="bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 min-h-screen p-6">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-2">Camee Economy Simulator</h1>
        <p className="text-gray-200 text-center mb-8">1 Crystal = {formatUSD(CRYSTAL_TO_USD)}</p>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Player A - Spender */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-cyan-300 mb-4">👤 Player A</h2>

            <div className="space-y-3 mb-6">
              <div className="bg-black/30 p-3 rounded">
                <p className="text-gray-300 text-sm">USD Balance</p>
                <p className="text-2xl font-bold text-green-400">{formatUSD(playerA.usdBalance)}</p>
              </div>
              <div className="bg-black/30 p-3 rounded">
                <p className="text-gray-300 text-sm">Crystals</p>
                <p className="text-2xl font-bold text-cyan-400">{formatCrystals(playerA.crystals)}</p>
              </div>
              <div className="bg-black/30 p-3 rounded">
                <p className="text-gray-300 text-sm">Status Points (Spend)</p>
                <p className="text-2xl font-bold text-yellow-400">{playerA.statusPoints.toFixed(2)}</p>
              </div>
              <div className="bg-black/30 p-3 rounded">
                <p className="text-gray-300 text-sm">Total Spent</p>
                <p className="text-xl font-bold text-pink-400">{formatUSD(playerA.totalSpent)}</p>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-white mb-3">💰 Buy Crystal Packs</h3>
            <div className="space-y-2">
              {crystalPacks.map((pack, i) => (
                <button
                  key={i}
                  onClick={() => handleBuyPack(pack)}
                  disabled={playerA.usdBalance < pack.usd}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-sm font-semibold transition"
                >
                  {formatCrystals(pack.crystals)} → {formatUSD(pack.usd)}
                </button>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-white mb-3 mt-6">🎯 Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={handleUseFilter}
                disabled={playerA.crystals < 10}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-white py-2 px-3 rounded text-sm font-semibold transition"
              >
                Use Filter (10 💎)
              </button>
              <button
                onClick={handleSendMessage}
                disabled={playerA.crystals < 90}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white py-2 px-3 rounded text-sm font-semibold transition"
              >
                Send Message (90 💎)
              </button>
            </div>

            <h3 className="text-sm font-semibold text-white mb-3 mt-6">🎁 Standard Gifts</h3>
            <div className="space-y-2">
              {standardGifts.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => handleSendStandardGift(gift)}
                  disabled={playerA.crystals < gift.crystals}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 text-white py-2 px-2 rounded text-xs font-semibold transition"
                >
                  Gift #{gift.id}: {formatCrystals(gift.crystals)}
                </button>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-white mb-3 mt-6">💎 Limited Gifts</h3>
            <div className="space-y-2">
              {Object.entries(limitedGiftsPrices).map(([id, gift]) => (
                <button
                  key={id}
                  onClick={() => handleSendLimitedGift(parseInt(id))}
                  disabled={playerA.crystals < gift.crystals || limitedGifts[id].remaining === 0}
                  className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 disabled:opacity-50 text-white py-2 px-2 rounded text-xs font-semibold transition relative"
                >
                  <div className="flex justify-between items-center">
                    <span>Limited #{id}: {formatCrystals(gift.crystals)}</span>
                    <span className="text-xs bg-black/50 px-2 py-1 rounded">
                      {limitedGifts[id].remaining}/10
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Economy Dashboard */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-yellow-300 mb-4">⚙️ Economy</h2>

            <div className="space-y-4">
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
              </div>

              <div className="bg-black/30 p-4 rounded">
                <label className="text-sm text-gray-300 block mb-2">Activity Points</label>
                <p className="text-2xl font-bold text-yellow-400">{playerB.weeklyActivityPoints} / 20</p>
              </div>

              <div className="bg-black/30 p-4 rounded">
                <label className="text-sm text-gray-300 block mb-2">Payout %</label>
                <p className="text-2xl font-bold text-green-400">{economy.payoutPercentage}%</p>
                <p className="text-xs text-gray-400 mt-1">Base 40% + Activity</p>
              </div>

              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded border border-purple-500/30">
                <p className="text-xs text-gray-300 mb-2">Status (Spend):</p>
                <p className="text-sm text-white">1 USD = 1 point</p>
              </div>

              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 p-4 rounded border border-green-500/30">
                <p className="text-xs text-gray-300 mb-2">Rating (Earn):</p>
                <p className="text-sm text-white">1 USD = 0.4 points</p>
              </div>

              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-4 rounded border border-amber-500/30">
                <p className="text-xs text-gray-300 mb-2">Status (Earn):</p>
                <p className="text-sm text-white">Same as Rating (0.4 per USD)</p>
              </div>
            </div>
          </div>

          {/* Player B - Receiver */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-green-300 mb-4">👥 Player B</h2>

            <div className="space-y-3">
              <div className="bg-black/30 p-3 rounded">
                <p className="text-gray-300 text-sm">Status Points (Earn)</p>
                <p className="text-2xl font-bold text-yellow-400">{playerB.statusPoints.toFixed(2)}</p>
              </div>
              <div className="bg-black/30 p-3 rounded">
                <p className="text-gray-300 text-sm">Rating Points</p>
                <p className="text-2xl font-bold text-green-400">{playerB.ratingPoints.toFixed(2)}</p>
              </div>
              <div className="bg-black/30 p-3 rounded">
                <p className="text-gray-300 text-sm">Total Earned (USD)</p>
                <p className="text-xl font-bold text-pink-400">{formatUSD(playerB.totalEarned)}</p>
              </div>
              <div className="bg-black/30 p-3 rounded">
                <p className="text-gray-300 text-sm">Available Payout</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatUSD(playerB.totalEarned * (economy.payoutPercentage / 100))}
                </p>
                <p className="text-xs text-gray-400 mt-1">@ {economy.payoutPercentage}% payout</p>
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 p-4 rounded border border-green-500/30">
              <p className="text-xs text-gray-300 mb-2">Weekly Status</p>
              <p className="text-sm text-white">Activity: {playerB.weeklyActivityPoints} / 20 points</p>
              <p className="text-sm text-green-400 mt-1">Bonus: +{economy.payoutPercentage - 40}% this week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameeEconomySimulator;
