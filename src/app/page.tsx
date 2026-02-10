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
      <div className="min-h-screen bg-darts-background flex items-center justify-center">
        <div className="text-dartboard-cream text-center">
          <div className="animate-spin w-8 h-8 border-2 border-dartboard-red border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darts-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-dartboard-cream mb-4 font-mono">
            🎯 DARTS
          </h1>
          <p className="text-dartboard-cream/70 text-lg">
            Oche scoring made simple
          </p>
        </div>

        {/* Resume Current Match */}
        {currentMatch && (
          <div className="bg-darts-surface border-2 border-dartboard-red rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-dartboard-cream mb-3 flex items-center font-mono">
              <span className="w-3 h-3 bg-dartboard-red rounded-full mr-3 animate-pulse"></span>
              MATCH IN PROGRESS
            </h2>
            <div className="flex items-center justify-between">
              <div className="text-dartboard-cream/80">
                <p className="text-sm font-mono">Players: {currentMatch.config.players.map(p => p.name).join(', ')}</p>
                <p className="text-xs opacity-75">
                  Started: {new Date(currentMatch.created_at).toLocaleString()}
                </p>
              </div>
              <Link 
                href="/game"
                className="button-primary"
              >
                RESUME MATCH
              </Link>
            </div>
          </div>
        )}

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/setup"
            className="button-primary text-center py-8 text-xl font-mono block"
          >
            🆕<br />NEW MATCH
          </Link>

          <Link
            href="/history"
            className="button-secondary text-center py-8 text-xl font-mono block"
          >
            📜<br />HISTORY
          </Link>

          <Link
            href="/stats"
            className="button-secondary text-center py-8 text-xl font-mono block"
          >
            📊<br />STATS
            {playerCount > 0 && (
              <div className="mt-1 text-sm text-dartboard-green">({playerCount} players)</div>
            )}
          </Link>
        </div>

        {/* Recent Matches */}
        {recentMatches.length > 0 && (
          <div className="bg-darts-surface border-2 border-darts-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-dartboard-cream mb-4 font-mono">RECENT MATCHES</h3>
            <div className="space-y-3">
              {recentMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between py-2 px-3 bg-darts-background rounded border border-darts-border">
                  <div>
                    <p className="text-dartboard-cream text-sm font-medium font-mono">
                      {match.players}
                    </p>
                    <p className="text-dartboard-cream/60 text-xs">
                      {new Date(match.created_at).toLocaleDateString()} •{' '}
                      {match.winner_name ? 
                        `Won by ${match.winner_name}` : 
                        'In Progress'
                      }
                    </p>
                  </div>
                  <Link
                    href={`/history/${match.id}`}
                    className="text-dartboard-green hover:text-green-300 text-sm font-medium transition-colors font-mono"
                  >
                    VIEW →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-darts-border">
          <p className="text-dartboard-cream/50 text-sm font-mono">
            Built for the oche • Mobile-optimized scoring
          </p>
        </div>
      </div>
    </div>
  );
}