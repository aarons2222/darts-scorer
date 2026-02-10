'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCurrentMatch, getMatchHistory, getPlayerStats } from '@/utils/database';
import { DbMatch, MatchSummary } from '@/types/database';

export default function HomePage() {
  const [currentMatch, setCurrentMatch] = useState<DbMatch | null>(null);
  const [recentMatches, setRecentMatches] = useState<MatchSummary[]>([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [current, history, playerStats] = await Promise.all([
          getCurrentMatch(),
          getMatchHistory(),
          getPlayerStats()
        ]);
        
        setCurrentMatch(current);
        setRecentMatches(history.slice(0, 3));
        setPlayerCount(playerStats.length);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darts-dark via-darts-navy to-darts-accent flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-darts-green border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-darts-dark via-darts-navy to-darts-accent">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎯 Darts Scorer
          </h1>
          <p className="text-gray-300 text-lg">
            Professional darts scoring and statistics
          </p>
        </div>

        {/* Resume Current Match */}
        {currentMatch && (
          <div className="bg-darts-navy/50 border border-darts-accent rounded-xl p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
              <span className="w-3 h-3 bg-darts-green rounded-full mr-3 animate-pulse"></span>
              Match in Progress
            </h2>
            <div className="flex items-center justify-between">
              <div className="text-gray-300">
                <p className="text-sm">Players: {currentMatch.config.players.map(p => p.name).join(', ')}</p>
                <p className="text-xs opacity-75">
                  Started: {new Date(currentMatch.created_at).toLocaleString()}
                </p>
              </div>
              <Link 
                href="/game"
                className="bg-darts-green hover:bg-green-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                Resume Match
              </Link>
            </div>
          </div>
        )}

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link
            href="/setup"
            className="group bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-8 text-center transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
          >
            <div className="text-4xl mb-4">🆕</div>
            <h3 className="text-xl font-semibold text-white mb-2">New Match</h3>
            <p className="text-gray-300 text-sm">Start a new darts match with custom settings</p>
          </Link>

          <Link
            href="/stats"
            className="group bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-8 text-center transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">Player Stats</h3>
            <p className="text-gray-300 text-sm">View player profiles and statistics</p>
            {playerCount > 0 && (
              <div className="mt-2 text-xs text-darts-green">{playerCount} players tracked</div>
            )}
          </Link>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/history"
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 transition-all duration-300 backdrop-blur-sm"
          >
            <div className="flex items-center">
              <div className="text-2xl mr-4">📜</div>
              <div>
                <h4 className="text-lg font-medium text-white">Match History</h4>
                <p className="text-gray-400 text-sm">View past matches and results</p>
              </div>
            </div>
          </Link>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="text-2xl mr-4">⚙️</div>
              <div>
                <h4 className="text-lg font-medium text-white">Settings</h4>
                <p className="text-gray-400 text-sm">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Matches */}
        {recentMatches.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Matches</h3>
            <div className="space-y-3">
              {recentMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white text-sm font-medium">
                      {match.players}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(match.created_at).toLocaleDateString()} •{' '}
                      {match.winner_name ? 
                        `Won by ${match.winner_name}` : 
                        'In Progress'
                      }
                    </p>
                  </div>
                  <Link
                    href={`/history/${match.id}`}
                    className="text-darts-green hover:text-green-400 text-sm font-medium transition-colors"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-white/10">
          <p className="text-gray-400 text-sm">
            Built for the oche • Mobile-optimized scoring
          </p>
        </div>
      </div>
    </div>
  );
}