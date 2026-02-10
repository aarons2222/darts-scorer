'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlayerProfile } from '@/types/game';
import { getPlayerProfiles } from '@/utils/localStorage';

export default function StatsPage() {
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'average' | 'wins' | 'games'>('name');

  useEffect(() => {
    const playerProfiles = getPlayerProfiles();
    setProfiles(playerProfiles);
  }, []);

  const sortedProfiles = [...profiles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'average':
        return b.stats.bestAverage - a.stats.bestAverage;
      case 'wins':
        return b.stats.gamesWon - a.stats.gamesWon;
      case 'games':
        return b.stats.gamesPlayed - a.stats.gamesPlayed;
      default:
        return 0;
    }
  });

  const getWinRate = (profile: PlayerProfile): number => {
    if (profile.stats.gamesPlayed === 0) return 0;
    return Math.round((profile.stats.gamesWon / profile.stats.gamesPlayed) * 100);
  };

  const getOverallAverage = (profile: PlayerProfile): number => {
    if (profile.stats.totalDartsThrown === 0) return 0;
    return Math.round(((profile.stats.totalScore / profile.stats.totalDartsThrown) * 3) * 100) / 100;
  };

  const getHeadToHeadSummary = (profile: PlayerProfile) => {
    const opponents = Object.keys(profile.headToHead);
    if (opponents.length === 0) return null;

    return opponents.map(opponentId => {
      const opponent = profiles.find(p => p.id === opponentId);
      const record = profile.headToHead[opponentId];
      return {
        opponentName: opponent?.name || 'Unknown',
        wins: record.wins,
        losses: record.losses,
        total: record.wins + record.losses
      };
    });
  };

  if (profiles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darts-dark via-darts-navy to-darts-accent">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Link href="/" className="text-darts-green hover:text-green-400 mb-6 inline-block">
              ← Back to Home
            </Link>
            <div className="bg-white/10 rounded-xl p-8 max-w-md mx-auto">
              <div className="text-4xl mb-4">📊</div>
              <h1 className="text-2xl font-bold text-white mb-4">No Player Data</h1>
              <p className="text-gray-300 mb-6">
                Play some matches to start tracking player statistics!
              </p>
              <Link
                href="/setup"
                className="bg-darts-green hover:bg-green-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Your First Match
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-darts-dark via-darts-navy to-darts-accent">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-darts-green hover:text-green-400 mb-2 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-white">📊 Player Statistics</h1>
          </div>
        </div>

        {selectedPlayer ? (
          /* Player Detail View */
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="text-darts-green hover:text-green-400 mb-4"
              >
                ← Back to All Players
              </button>
              <h2 className="text-2xl font-bold text-white mb-2">{selectedPlayer.name}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Games Stats */}
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Match Record</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Games Played:</span>
                    <span className="text-white font-semibold">{selectedPlayer.stats.gamesPlayed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Games Won:</span>
                    <span className="text-darts-green font-semibold">{selectedPlayer.stats.gamesWon}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Win Rate:</span>
                    <span className="text-white font-semibold">{getWinRate(selectedPlayer)}%</span>
                  </div>
                </div>
              </div>

              {/* Scoring Stats */}
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Scoring</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Best Average:</span>
                    <span className="text-white font-semibold">{selectedPlayer.stats.bestAverage.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Overall Average:</span>
                    <span className="text-white font-semibold">{getOverallAverage(selectedPlayer).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Highest Score:</span>
                    <span className="text-yellow-400 font-semibold">{selectedPlayer.stats.highestScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Highest Checkout:</span>
                    <span className="text-yellow-400 font-semibold">{selectedPlayer.stats.highestCheckout}</span>
                  </div>
                </div>
              </div>

              {/* Dart Stats */}
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Dart Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Darts:</span>
                    <span className="text-white font-semibold">{selectedPlayer.stats.totalDartsThrown.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Score:</span>
                    <span className="text-white font-semibold">{selectedPlayer.stats.totalScore.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Head-to-Head */}
            {getHeadToHeadSummary(selectedPlayer) && (
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Head-to-Head Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getHeadToHeadSummary(selectedPlayer)!.map((record, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{record.opponentName}</span>
                        <span className="text-gray-300 text-sm">{record.total} games</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <span className="text-darts-green font-semibold">{record.wins}W</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-darts-red font-semibold">{record.losses}L</span>
                        </div>
                        <div className="flex-1">
                          <div className="bg-white/10 rounded-full h-2">
                            <div
                              className="bg-darts-green h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(record.wins / record.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Players List View */
          <div>
            {/* Sort Controls */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <span className="text-gray-300 text-sm self-center mr-2">Sort by:</span>
                {[
                  { key: 'name', label: 'Name' },
                  { key: 'average', label: 'Best Average' },
                  { key: 'wins', label: 'Wins' },
                  { key: 'games', label: 'Games Played' }
                ].map(option => (
                  <button
                    key={option.key}
                    onClick={() => setSortBy(option.key as any)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      sortBy === option.key
                        ? 'bg-darts-green text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProfiles.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => setSelectedPlayer(profile)}
                  className="bg-white/10 hover:bg-white/20 rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                >
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">{profile.name}</h3>
                    <div className="w-16 h-16 bg-darts-green/30 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl">🎯</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Games:</span>
                      <span className="text-white">{profile.stats.gamesPlayed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Win Rate:</span>
                      <span className="text-darts-green">{getWinRate(profile)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Best Avg:</span>
                      <span className="text-white">{profile.stats.bestAverage.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">High Score:</span>
                      <span className="text-yellow-400">{profile.stats.highestScore}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="text-xs text-gray-400 text-center">
                      Click to view detailed stats →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}