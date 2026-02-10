'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlayerStats } from '@/types/database';
import { getPlayerStats, getHeadToHeadStats } from '@/utils/database';

export default function StatsPage() {
  const [profiles, setProfiles] = useState<PlayerStats[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'average' | 'wins' | 'games'>('name');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayerStats();
  }, []);

  const loadPlayerStats = async () => {
    try {
      const stats = await getPlayerStats();
      setProfiles(stats);
    } catch (error) {
      console.error('Failed to load player stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedProfiles = [...profiles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'average':
        return b.overall_average - a.overall_average;
      case 'wins':
        return b.matches_won - a.matches_won;
      case 'games':
        return b.matches_played - a.matches_played;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darts-dark via-darts-navy to-darts-accent flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-darts-green border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading player statistics...</p>
        </div>
      </div>
    );
  }

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
                    <span className="text-white font-semibold">{selectedPlayer.matches_played}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Games Won:</span>
                    <span className="text-darts-green font-semibold">{selectedPlayer.matches_won}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Win Rate:</span>
                    <span className="text-white font-semibold">{selectedPlayer.win_percentage}%</span>
                  </div>
                </div>
              </div>

              {/* Scoring Stats */}
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Scoring</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Overall Average:</span>
                    <span className="text-white font-semibold">{selectedPlayer.overall_average.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Highest Score:</span>
                    <span className="text-yellow-400 font-semibold">{selectedPlayer.highest_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">100+ Scores:</span>
                    <span className="text-blue-400 font-semibold">{selectedPlayer.scores_100_plus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">140+ Scores:</span>
                    <span className="text-blue-400 font-semibold">{selectedPlayer.scores_140_plus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">180s:</span>
                    <span className="text-yellow-400 font-semibold">{selectedPlayer.scores_180}</span>
                  </div>
                </div>
              </div>

              {/* Dart Stats */}
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Throws:</span>
                    <span className="text-white font-semibold">{selectedPlayer.total_throws.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Score:</span>
                    <span className="text-white font-semibold">{selectedPlayer.total_score.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Successful Checkouts:</span>
                    <span className="text-darts-green font-semibold">{selectedPlayer.successful_checkouts}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Note: Head-to-head stats could be added here with additional queries */}
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
                      <span className="text-white">{profile.matches_played}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Win Rate:</span>
                      <span className="text-darts-green">{profile.win_percentage}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Avg:</span>
                      <span className="text-white">{profile.overall_average.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">High Score:</span>
                      <span className="text-yellow-400">{profile.highest_score}</span>
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