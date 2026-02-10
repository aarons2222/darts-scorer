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
      <div className="min-h-screen bg-darts-background flex items-center justify-center">
        <div className="text-dartboard-cream text-center">
          <div className="animate-spin w-8 h-8 border-2 border-dartboard-red border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="font-mono">Loading player statistics...</p>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="min-h-screen bg-darts-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Link href="/" className="text-dartboard-green hover:text-green-300 mb-6 inline-block font-mono">
              ← BACK TO HOME
            </Link>
            <div className="bg-darts-surface border-2 border-darts-border rounded-lg p-8 max-w-md mx-auto">
              <div className="text-4xl mb-4">📊</div>
              <h1 className="text-2xl font-bold text-dartboard-cream mb-4 font-mono">NO PLAYER DATA</h1>
              <p className="text-dartboard-cream/70 mb-6 font-mono">
                Play some matches to start tracking player statistics!
              </p>
              <Link
                href="/setup"
                className="button-primary px-6 py-3 font-mono"
              >
                START YOUR FIRST MATCH
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darts-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-dartboard-green hover:text-green-300 mb-2 inline-block font-mono">
              ← BACK TO HOME
            </Link>
            <h1 className="text-3xl font-bold text-dartboard-cream font-mono">📊 PLAYER STATISTICS</h1>
          </div>
        </div>

        {selectedPlayer ? (
          /* Player Detail View */
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="text-dartboard-green hover:text-green-300 mb-4 font-mono"
              >
                ← BACK TO ALL PLAYERS
              </button>
              <h2 className="text-2xl font-bold text-dartboard-cream mb-2 font-mono">{selectedPlayer.name.toUpperCase()}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Games Stats */}
              <div className="bg-darts-surface border-2 border-darts-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-dartboard-cream mb-4 font-mono">MATCH RECORD</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-dartboard-cream/70 font-mono">Games Played:</span>
                    <span className="text-dartboard-cream font-bold font-mono">{selectedPlayer.matches_played}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dartboard-cream/70 font-mono">Games Won:</span>
                    <span className="text-dartboard-green font-bold font-mono">{selectedPlayer.matches_won}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dartboard-cream/70 font-mono">Win Rate:</span>
                    <span className="text-dartboard-cream font-bold font-mono">{selectedPlayer.win_percentage}%</span>
                  </div>
                </div>
              </div>

              {/* Scoring Stats */}
              <div className="bg-darts-surface border-2 border-darts-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-dartboard-cream mb-4 font-mono">SCORING</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-dartboard-cream/70 font-mono">Overall Average:</span>
                    <span className="text-dartboard-cream font-bold font-mono">{selectedPlayer.overall_average.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dartboard-cream/70 font-mono">Highest Score:</span>
                    <span className="text-dartboard-red font-bold font-mono">{selectedPlayer.highest_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dartboard-cream/70 font-mono">100+ Scores:</span>
                    <span className="text-dartboard-green font-bold font-mono">{selectedPlayer.scores_100_plus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dartboard-cream/70 font-mono">140+ Scores:</span>
                    <span className="text-dartboard-green font-bold font-mono">{selectedPlayer.scores_140_plus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dartboard-cream/70 font-mono">180s:</span>
                    <span className="text-dartboard-red font-bold font-mono">{selectedPlayer.scores_180}</span>
                  </div>
                </div>
              </div>

              {/* Dart Stats */}
              <div className="bg-darts-surface border-2 border-darts-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-dartboard-cream mb-4 font-mono">STATISTICS</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-dartboard-cream/70 font-mono">Total Throws:</span>
                    <span className="text-dartboard-cream font-bold font-mono">{selectedPlayer.total_throws.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dartboard-cream/70 font-mono">Total Score:</span>
                    <span className="text-dartboard-cream font-bold font-mono">{selectedPlayer.total_score.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dartboard-cream/70 font-mono">Successful Checkouts:</span>
                    <span className="text-dartboard-green font-bold font-mono">{selectedPlayer.successful_checkouts}</span>
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
                <span className="text-dartboard-cream/70 text-sm self-center mr-2 font-mono">SORT BY:</span>
                {[
                  { key: 'name', label: 'NAME' },
                  { key: 'average', label: 'BEST AVERAGE' },
                  { key: 'wins', label: 'WINS' },
                  { key: 'games', label: 'GAMES PLAYED' }
                ].map(option => (
                  <button
                    key={option.key}
                    onClick={() => setSortBy(option.key as any)}
                    className={`px-3 py-1 rounded border text-sm transition-colors font-mono font-bold ${
                      sortBy === option.key
                        ? 'bg-dartboard-red border-dartboard-red text-dartboard-cream'
                        : 'bg-darts-surface border-darts-border text-dartboard-cream/70 hover:bg-darts-border'
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
                  className="bg-darts-surface hover:bg-darts-border border-2 border-darts-border rounded-lg p-6 cursor-pointer transition-colors duration-200"
                >
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-dartboard-cream mb-2 font-mono">{profile.name.toUpperCase()}</h3>
                    <div className="w-16 h-16 bg-dartboard-green/30 border-2 border-dartboard-green rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl">🎯</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-dartboard-cream/70 font-mono">Games:</span>
                      <span className="text-dartboard-cream font-mono font-bold">{profile.matches_played}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dartboard-cream/70 font-mono">Win Rate:</span>
                      <span className="text-dartboard-green font-mono font-bold">{profile.win_percentage}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dartboard-cream/70 font-mono">Avg:</span>
                      <span className="text-dartboard-cream font-mono font-bold">{profile.overall_average.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dartboard-cream/70 font-mono">High Score:</span>
                      <span className="text-dartboard-red font-mono font-bold">{profile.highest_score}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-darts-border">
                    <div className="text-xs text-dartboard-cream/60 text-center font-mono">
                      CLICK TO VIEW DETAILED STATS →
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