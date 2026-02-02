'use client';

import { useState, useEffect } from 'react';
import './globals.css';

const CameeEconomySimulator = () => {
  // Crystal rate - editable
  const [crystalRate, setCrystalRate] = useState(0.0073);

  // Game state
  const [playerA, setPlayerA] = useState({
    crystals: 0,
    usdBalance: 1000,
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

  const [viewMode, setViewMode] = useState('dashboard');
  const [flowAnimation, setFlowAnimation] = useState({
    running: false,
    progress: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [callMinutes, setCallMinutes] = useState(1);

  // Crystal packs
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

  // Run flow animation
  const runFlowAnimation = async () => {
    setFlowAnimation({ running: true, progress: 0 });

    // Simulate a flow: buy pack -> send gift -> calculate
    const pack = crystalPacks[2]; // 850 crystals
    const giftAmount = 5000;

    // Buy pack
    setPlayerA((prev) => ({
      ...prev,
      crystals: prev.crystals + pack.crystals,
      usdBalance: prev.usdBalance - pack.usd,
    }));

    // Animate progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise((r) => setTimeout(r, 30));
      setFlowAnimation({ running: true, progress: i });
    }

    // Send gift
    const usdValue = giftAmount * crystalRate;
    const statusGainA = usdValue * 1.0;
    const ratingGainB = usdValue * 0.4;
    const statusGainB = ratingGainB;

    setPlayerA((prev) => ({
      ...prev,
      crystals: prev.crystals - giftAmount,
      statusPoints: prev.statusPoints + statusGainA,
      totalSpent: prev.totalSpent + usdValue,
    }));

    setPlayerB((prev) => ({
      ...prev,
      statusPoints: prev.statusPoints + statusGainB,
      ratingPoints: prev.ratingPoints + ratingGainB,
      totalEarned: prev.totalEarned + usdValue,
    }));

    await new Promise((r) => setTimeout(r, 500));
    setFlowAnimation({ running: false, progress: 100 });
  };

  // Log transaction
  const logTransaction = (type, details) => {
    const timestamp = new Date().toLocaleTimeString();
    setTransactions((prev) => [
      {
        id: Date.now(),
        timestamp,
        type,
        ...details,
      },
      ...prev,
    ]);
  };

  // Actions
  const handleBuyPack = (pack) => {
    if (playerA.usdBalance >= pack.usd) {
      setPlayerA({
        ...playerA,
        crystals: playerA.crystals + pack.crystals,
        usdBalance: playerA.usdBalance - pack.usd,
      });

      logTransaction('BUY_PACK', {
        crystals: pack.crystals,
        usd: pack.usd,
        newBalance: playerA.crystals + pack.crystals,
      });
    }
  };

  const handleUseFilter = () => {
    const filterCost = 10;
    if (playerA.crystals >= filterCost) {
      const usdValue = filterCost * crystalRate;
      const statusGain = usdValue * 1.0;

      setPlayerA({
        ...playerA,
        crystals: playerA.crystals - filterCost,
        statusPoints: playerA.statusPoints + statusGain,
        totalSpent: playerA.totalSpent + usdValue,
      });

      logTransaction('USE_FILTER', {
        crystals: filterCost,
        usd: usdValue.toFixed(4),
        statusGainA: statusGain.toFixed(2),
      });
    }
  };

  const handleSendMessage = () => {
    const messageCost = 50;
    if (playerA.crystals >= messageCost) {
      const usdValue = messageCost * crystalRate;
      const statusGainA = usdValue * 1.0;
      const ratingGainB = usdValue * 0.4;
      const statusGainB = ratingGainB;

      setPlayerA({
        ...playerA,
        crystals: playerA.crystals - messageCost,
        statusPoints: playerA.statusPoints + statusGainA,
        totalSpent: playerA.totalSpent + usdValue,
      });

      setPlayerB({
        ...playerB,
        statusPoints: playerB.statusPoints + statusGainB,
        ratingPoints: playerB.ratingPoints + ratingGainB,
        totalEarned: playerB.totalEarned + usdValue,
      });

      logTransaction('SEND_MESSAGE', {
        crystals: messageCost,
        usd: usdValue.toFixed(4),
        statusGainA: statusGainA.toFixed(2),
        ratingGainB: ratingGainB.toFixed(2),
        statusGainB: statusGainB.toFixed(2),
      });
    }
  };

  const handleStartCall = () => {
    const callCost = 80 * callMinutes;
    if (playerA.crystals >= callCost) {
      const usdValue = callCost * crystalRate;
      const statusGainA = usdValue * 1.0;
      const ratingGainB = usdValue * 0.4;
      const statusGainB = ratingGainB;

      setPlayerA({
        ...playerA,
        crystals: playerA.crystals - callCost,
        statusPoints: playerA.statusPoints + statusGainA,
        totalSpent: playerA.totalSpent + usdValue,
      });

      setPlayerB({
        ...playerB,
        statusPoints: playerB.statusPoints + statusGainB,
        ratingPoints: playerB.ratingPoints + ratingGainB,
        totalEarned: playerB.totalEarned + usdValue,
      });

      logTransaction('START_CALL', {
        minutes: callMinutes,
        crystals: callCost,
        usd: usdValue.toFixed(4),
        statusGainA: statusGainA.toFixed(2),
        ratingGainB: ratingGainB.toFixed(2),
        statusGainB: statusGainB.toFixed(2),
      });
    }
  };

  const handleSendStandardGift = (gift) => {
    if (playerA.crystals >= gift.crystals) {
      const usdValue = gift.crystals * crystalRate;
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

      logTransaction('SEND_STANDARD_GIFT', {
        giftId: gift.id,
        crystals: gift.crystals,
        usd: usdValue.toFixed(4),
        statusGainA: statusGainA.toFixed(2),
        ratingGainB: ratingGainB.toFixed(2),
        statusGainB: statusGainB.toFixed(2),
      });
    }
  };

  const handleSendLimitedGift = (giftId) => {
    if (limitedGifts[giftId].remaining > 0 && playerA.crystals >= limitedGiftsPrices[giftId].crystals) {
      const gift = limitedGiftsPrices[giftId];
      const usdValue = gift.crystals * crystalRate;
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

      logTransaction('SEND_LIMITED_GIFT', {
        limitedGiftId: giftId,
        crystals: gift.crystals,
        usd: usdValue.toFixed(4),
        statusGainA: statusGainA.toFixed(2),
        ratingGainB: ratingGainB.toFixed(2),
        statusGainB: statusGainB.toFixed(2),
        remaining: limitedGifts[giftId].remaining - 1,
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

  const formatUSD = (value) => {
    if (value < 0.01) return `$${value.toFixed(6)}`;
    if (value < 0.1) return `$${value.toFixed(4)}`;
    return `$${value.toFixed(2)}`;
  };
  const formatCrystals = (value) => `${Math.floor(value)} 💎`;

  return (
    <div className="bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 min-h-screen p-4 md:p-6">
      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-0">Camee Economy Simulator</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-4 py-2 rounded font-semibold transition ${
                viewMode === 'dashboard'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-200 hover:bg-white/20'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setViewMode('flowchart')}
              className={`px-4 py-2 rounded font-semibold transition ${
                viewMode === 'flowchart'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-gray-200 hover:bg-white/20'
              }`}
            >
              🔄 Flow
            </button>
          </div>
        </div>

        {viewMode === 'dashboard' && (
          <>
            <div className="bg-black/30 p-3 rounded mb-6 max-w-xs mx-auto">
              <label className="text-sm text-gray-300">1 Crystal = </label>
              <input
                type="number"
                step="0.0001"
                value={crystalRate}
                onChange={(e) => setCrystalRate(parseFloat(e.target.value) || 0.0073)}
                className="w-full bg-black/30 border border-white/20 text-white px-2 py-1 rounded mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">Current: {formatUSD(crystalRate)}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
              {/* Player A */}
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-cyan-300 mb-4">👤 Player A</h2>

                <div className="space-y-2 mb-4">
                  <div className="bg-black/30 p-2 rounded">
                    <p className="text-gray-300 text-xs md:text-sm">USD Balance</p>
                    <p className="text-lg md:text-2xl font-bold text-green-400">{formatUSD(playerA.usdBalance)}</p>
                  </div>
                  <div className="bg-black/30 p-2 rounded">
                    <p className="text-gray-300 text-xs md:text-sm">Crystals</p>
                    <p className="text-lg md:text-2xl font-bold text-cyan-400">{formatCrystals(playerA.crystals)}</p>
                  </div>
                  <div className="bg-black/30 p-2 rounded">
                    <p className="text-gray-300 text-xs md:text-sm">Status Points (Spend)</p>
                    <p className="text-lg md:text-2xl font-bold text-yellow-400">{playerA.statusPoints.toFixed(2)}</p>
                  </div>
                  <div className="bg-black/30 p-2 rounded">
                    <p className="text-gray-300 text-xs md:text-sm">Total Spent</p>
                    <p className="text-base md:text-xl font-bold text-pink-400">{formatUSD(playerA.totalSpent)}</p>
                  </div>
                </div>

                <h3 className="text-xs md:text-sm font-semibold text-white mb-2">💰 Buy Crystal Packs</h3>
                <div className="space-y-1 md:space-y-2">
                  {crystalPacks.map((pack, i) => (
                    <button
                      key={i}
                      onClick={() => handleBuyPack(pack)}
                      disabled={playerA.usdBalance < pack.usd}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-1 md:py-2 px-2 md:px-3 rounded text-xs md:text-sm font-semibold transition"
                    >
                      {formatCrystals(pack.crystals)} → {formatUSD(pack.usd)}
                    </button>
                  ))}
                </div>

                <h3 className="text-xs md:text-sm font-semibold text-white mb-2 mt-4">🎯 Quick Actions</h3>
                <div className="space-y-1 md:space-y-2">
                  <button
                    onClick={handleUseFilter}
                    disabled={playerA.crystals < 10}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-white py-1 md:py-2 px-2 md:px-3 rounded text-xs md:text-sm font-semibold transition"
                  >
                    Use Filter (10 💎)
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={playerA.crystals < 90}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white py-1 md:py-2 px-2 md:px-3 rounded text-xs md:text-sm font-semibold transition"
                  >
                    Send Message (90 💎)
                  </button>
                </div>

                <h3 className="text-xs md:text-sm font-semibold text-white mb-2 mt-4">☎️ Voice Call (40 💎/min)</h3>
                <div className="bg-black/30 p-2 rounded mb-2">
                  <label className="text-xs text-gray-300 block mb-1">Duration: {callMinutes} min</label>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={callMinutes}
                    onChange={(e) => setCallMinutes(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-400 mt-1">Cost: {40 * callMinutes} 💎 (${(40 * callMinutes * crystalRate).toFixed(4)})</p>
                </div>
                <button
                  onClick={handleStartCall}
                  disabled={playerA.crystals < 40 * callMinutes}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:opacity-50 text-white py-1 md:py-2 px-2 md:px-3 rounded text-xs md:text-sm font-semibold transition"
                >
                  Start Call ({40 * callMinutes} 💎)
                </button>

                <h3 className="text-xs md:text-sm font-semibold text-white mb-2 mt-4">🎁 Standard Gifts</h3>
                <div className="grid grid-cols-2 gap-1 md:gap-2">
                  {standardGifts.map((gift) => (
                    <button
                      key={gift.id}
                      onClick={() => handleSendStandardGift(gift)}
                      disabled={playerA.crystals < gift.crystals}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 text-white py-1 px-1 md:px-2 rounded text-xs font-semibold transition"
                    >
                      #{gift.id}
                    </button>
                  ))}
                </div>

                <h3 className="text-xs md:text-sm font-semibold text-white mb-2 mt-4">💎 Limited Gifts</h3>
                <div className="space-y-1 md:space-y-2">
                  {Object.entries(limitedGiftsPrices).map(([id, gift]) => (
                    <button
                      key={id}
                      onClick={() => handleSendLimitedGift(parseInt(id))}
                      disabled={playerA.crystals < gift.crystals || limitedGifts[id].remaining === 0}
                      className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 disabled:opacity-50 text-white py-1 md:py-2 px-2 rounded text-xs font-semibold transition relative"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs">L#{id}</span>
                        <span className="text-xs bg-black/50 px-1 md:px-2 py-1 rounded">
                          {limitedGifts[id].remaining}/10
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Economy */}
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-yellow-300 mb-4">⚙️ Economy</h2>

                <div className="space-y-2 md:space-y-4">
                  <div className="bg-black/30 p-2 md:p-4 rounded">
                    <label className="text-xs md:text-sm text-gray-300 block mb-2">Weekly Activity Minutes</label>
                    <input
                      type="range"
                      min="0"
                      max="900"
                      value={playerB.weeklyActivityMinutes}
                      onChange={(e) => handleActivityChange(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs md:text-sm text-white mt-1 md:mt-2">{playerB.weeklyActivityMinutes} / 900 min</p>
                  </div>

                  <div className="bg-black/30 p-2 md:p-4 rounded">
                    <label className="text-xs md:text-sm text-gray-300 block mb-1 md:mb-2">Activity Points</label>
                    <p className="text-lg md:text-2xl font-bold text-yellow-400">{playerB.weeklyActivityPoints} / 20</p>
                  </div>

                  <div className="bg-black/30 p-2 md:p-4 rounded">
                    <label className="text-xs md:text-sm text-gray-300 block mb-1 md:mb-2">Payout %</label>
                    <p className="text-lg md:text-2xl font-bold text-green-400">{economy.payoutPercentage}%</p>
                    <p className="text-xs text-gray-400 mt-1">Base 40% + Activity</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-2 md:p-4 rounded border border-purple-500/30">
                    <p className="text-xs text-gray-300 mb-1">Status (Spend):</p>
                    <p className="text-xs md:text-sm text-white">1 USD = 1 point</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 p-2 md:p-4 rounded border border-green-500/30">
                    <p className="text-xs text-gray-300 mb-1">Rating (Earn):</p>
                    <p className="text-xs md:text-sm text-white">1 USD = 0.4 points</p>
                  </div>

                  <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-2 md:p-4 rounded border border-amber-500/30">
                    <p className="text-xs text-gray-300 mb-1">Status (Earn):</p>
                    <p className="text-xs md:text-sm text-white">1 USD = 0.4 points</p>
                  </div>
                </div>
              </div>

              {/* Player B */}
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-green-300 mb-4">👥 Player B</h2>

                <div className="space-y-2">
                  <div className="bg-black/30 p-2 rounded">
                    <p className="text-gray-300 text-xs md:text-sm">Status Points (Earn)</p>
                    <p className="text-lg md:text-2xl font-bold text-yellow-400">{playerB.statusPoints.toFixed(2)}</p>
                  </div>
                  <div className="bg-black/30 p-2 rounded">
                    <p className="text-gray-300 text-xs md:text-sm">Rating Points</p>
                    <p className="text-lg md:text-2xl font-bold text-green-400">{playerB.ratingPoints.toFixed(2)}</p>
                  </div>
                  <div className="bg-black/30 p-2 rounded">
                    <p className="text-gray-300 text-xs md:text-sm">Total Earned (USD)</p>
                    <p className="text-base md:text-xl font-bold text-pink-400">{formatUSD(playerB.totalEarned)}</p>
                  </div>
                  <div className="bg-black/30 p-2 rounded">
                    <p className="text-gray-300 text-xs md:text-sm">Available Payout</p>
                    <p className="text-lg md:text-2xl font-bold text-green-400">
                      {formatUSD(playerB.totalEarned * (economy.payoutPercentage / 100))}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">@ {economy.payoutPercentage}% payout</p>
                  </div>
                </div>

                <div className="mt-4 md:mt-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 p-3 md:p-4 rounded border border-green-500/30">
                  <p className="text-xs text-gray-300 mb-1 md:mb-2">Weekly Status</p>
                  <p className="text-xs md:text-sm text-white">Activity: {playerB.weeklyActivityPoints} / 20 points</p>
                  <p className="text-xs md:text-sm text-green-400 mt-1">Bonus: +{economy.payoutPercentage - 40}% this week</p>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-blue-300 mb-4">📊 Transaction History</h2>

              {transactions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No transactions yet. Make some actions!</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="bg-black/30 p-3 rounded border border-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-400">{tx.timestamp}</span>
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-white/20">
                          {tx.type === 'BUY_PACK' && '💰 Buy Pack'}
                          {tx.type === 'USE_FILTER' && '🎯 Filter'}
                          {tx.type === 'SEND_MESSAGE' && '📝 Message'}
                          {tx.type === 'START_CALL' && '☎️ Call'}
                          {tx.type === 'SEND_STANDARD_GIFT' && `🎁 Gift #${tx.giftId}`}
                          {tx.type === 'SEND_LIMITED_GIFT' && `💎 Limited #${tx.limitedGiftId}`}
                        </span>
                      </div>

                      {tx.type === 'BUY_PACK' && (
                        <div className="text-xs text-gray-300 space-y-1">
                          <p>Spent: <span className="text-green-400 font-semibold">${tx.usd}</span></p>
                          <p>Gained: <span className="text-cyan-400 font-semibold">{tx.crystals} 💎</span></p>
                          <p>New balance: <span className="text-cyan-400 font-semibold">{tx.newBalance} 💎</span></p>
                        </div>
                      )}

                      {tx.type === 'USE_FILTER' && (
                        <div className="text-xs text-gray-300 space-y-1">
                          <p>Cost: <span className="text-red-400 font-semibold">{tx.crystals} 💎</span></p>
                          <p>Value: <span className="text-yellow-400 font-semibold">${tx.usd}</span></p>
                          <p>Player A Status +<span className="text-yellow-400 font-semibold">{tx.statusGainA}</span></p>
                        </div>
                      )}

                      {tx.type === 'SEND_MESSAGE' && (
                        <div className="text-xs text-gray-300 space-y-1">
                          <p>Cost: <span className="text-red-400 font-semibold">{tx.crystals} 💎</span></p>
                          <p>Value: <span className="text-yellow-400 font-semibold">${tx.usd}</span></p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-purple-500/20 p-2 rounded">
                              <p className="text-purple-300 font-semibold">Player A</p>
                              <p className="text-yellow-400">Status +{tx.statusGainA}</p>
                            </div>
                            <div className="bg-green-500/20 p-2 rounded">
                              <p className="text-green-300 font-semibold">Player B</p>
                              <p className="text-green-400">Rating +{tx.ratingGainB}</p>
                              <p className="text-yellow-400">Status +{tx.statusGainB}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {tx.type === 'START_CALL' && (
                        <div className="text-xs text-gray-300 space-y-1">
                          <p>Duration: <span className="text-blue-400 font-semibold">{tx.minutes} min</span></p>
                          <p>Cost: <span className="text-red-400 font-semibold">{tx.crystals} 💎</span></p>
                          <p>Value: <span className="text-yellow-400 font-semibold">${tx.usd}</span></p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-purple-500/20 p-2 rounded">
                              <p className="text-purple-300 font-semibold">Player A</p>
                              <p className="text-yellow-400">Status +{tx.statusGainA}</p>
                            </div>
                            <div className="bg-green-500/20 p-2 rounded">
                              <p className="text-green-300 font-semibold">Player B</p>
                              <p className="text-green-400">Rating +{tx.ratingGainB}</p>
                              <p className="text-yellow-400">Status +{tx.statusGainB}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {(tx.type === 'SEND_STANDARD_GIFT' || tx.type === 'SEND_LIMITED_GIFT') && (
                        <div className="text-xs text-gray-300 space-y-1">
                          <p>Cost: <span className="text-red-400 font-semibold">{tx.crystals} 💎</span></p>
                          <p>Value: <span className="text-yellow-400 font-semibold">${tx.usd}</span></p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-purple-500/20 p-2 rounded">
                              <p className="text-purple-300 font-semibold">Player A</p>
                              <p className="text-yellow-400">Status +{tx.statusGainA}</p>
                            </div>
                            <div className="bg-green-500/20 p-2 rounded">
                              <p className="text-green-300 font-semibold">Player B</p>
                              <p className="text-green-400">Rating +{tx.ratingGainB}</p>
                              <p className="text-yellow-400">Status +{tx.statusGainB}</p>
                            </div>
                          </div>
                          {tx.type === 'SEND_LIMITED_GIFT' && (
                            <p className="text-rose-400 mt-2">Limited remaining: {tx.remaining}/10</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setTransactions([])}
                disabled={transactions.length === 0}
                className="w-full mt-4 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-gray-300 py-2 px-3 rounded text-xs font-semibold transition"
              >
                Clear History
              </button>
            </div>
          </>
        )}

        {viewMode === 'flowchart' && (
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-300">🔄 Economy Flow</h2>
              <button
                onClick={runFlowAnimation}
                disabled={flowAnimation.running}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white py-2 px-6 rounded font-semibold transition"
              >
                {flowAnimation.running ? `Running ${flowAnimation.progress}%` : 'Run Flow'}
              </button>
            </div>

            <div className="w-full overflow-x-auto">
              <svg width="1200" height="400" className="min-w-full">
                {/* Title */}
                <text x="50" y="30" fill="white" fontSize="18" fontWeight="bold">
                  Buy Pack (850 💎 @ ${(850 * crystalRate).toFixed(2)})
                </text>

                {/* Player A */}
                <circle cx="100" cy="120" r="35" fill="none" stroke="cyan" strokeWidth="2" />
                <text x="100" y="130" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">
                  Player A
                </text>

                {/* Arrow to gift action */}
                <line x1="135" y1="120" x2="250" y2="120" stroke="white" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="190" y="110" fill="white" fontSize="12">
                  Send Gift 5K 💎
                </text>

                {/* Gift filter calc */}
                <rect x="250" y="95" width="100" height="50" fill="none" stroke="orange" strokeWidth="2" rx="5" />
                <text x="300" y="120" fill="white" textAnchor="middle" fontSize="12" fontWeight="bold">
                  Spend Calc
                </text>
                <text x="300" y="135" fill="white" textAnchor="middle" fontSize="10">
                  5K × {crystalRate.toFixed(4)}
                </text>

                {/* Arrow to Player A status */}
                <line x1="350" y1="120" x2="450" y2="70" stroke="white" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="380" y="100" fill="yellow" fontSize="11">
                  +1 Status
                </text>

                {/* Player A Status */}
                <circle cx="500" cy="70" r="30" fill="none" stroke="yellow" strokeWidth="2" />
                <text x="500" y="75" fill="white" textAnchor="middle" fontSize="12" fontWeight="bold">
                  Status
                </text>

                {/* Arrow to Player B */}
                <line x1="135" y1="120" x2="250" y2="250" stroke="white" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="white" />
                  </marker>
                </defs>

                {/* Rating calc */}
                <rect x="250" y="225" width="100" height="50" fill="none" stroke="green" strokeWidth="2" rx="5" />
                <text x="300" y="250" fill="white" textAnchor="middle" fontSize="12" fontWeight="bold">
                  Rating Calc
                </text>
                <text x="300" y="265" fill="white" textAnchor="middle" fontSize="10">
                  5K × {crystalRate.toFixed(4)} × 0.4
                </text>

                {/* Arrow to Player B */}
                <line x1="350" y1="250" x2="450" y2="250" stroke="white" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="380" y="240" fill="green" fontSize="11">
                  +0.4 Rating
                </text>

                {/* Player B */}
                <circle cx="500" cy="250" r="35" fill="none" stroke="lime" strokeWidth="2" />
                <text x="500" y="255" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">
                  Player B
                </text>

                {/* Arrow to withdraw */}
                <line x1="535" y1="250" x2="650" y2="250" stroke="white" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="580" y="240" fill="white" fontSize="11">
                  Withdraw
                </text>

                {/* Withdraw box */}
                <polygon points="680,220 720,250 680,280 640,250" fill="none" stroke="cyan" strokeWidth="2" />
                <text x="680" y="255" fill="white" textAnchor="middle" fontSize="12" fontWeight="bold">
                  💰
                </text>

                {/* Progress bar */}
                <rect x="50" y="350" width="600" height="30" fill="black" stroke="white" strokeWidth="1" rx="5" />
                <rect
                  x="50"
                  y="350"
                  width={6 * flowAnimation.progress}
                  height="30"
                  fill="url(#progressGradient)"
                  rx="5"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <text x="350" y="372" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">
                  {flowAnimation.progress}%
                </text>
              </svg>
            </div>

            <div className="mt-6 text-white text-sm">
              <p>💡 Click "Run Flow" to simulate a complete transaction:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Buy crystal pack (850 💎 for ${(850 * crystalRate).toFixed(2)})</li>
                <li>Send gift (5000 💎) to Player B</li>
                <li>Calculate status & rating based on USD value</li>
                <li>Player B receives rating points and can withdraw earnings</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameeEconomySimulator;
