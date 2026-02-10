'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MatchSummary } from '@/types/database';
import { getMatchHistory } from '@/utils/database';

export default function HistoryPage() {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatchHistory();
  }, []);

  const loadMatchHistory = async () => {
    try {
      const history = await getMatchHistory();
      setMatches(history);
    } catch (error) {
      console.error('Failed to load match history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darts-dark via-darts-navy to-darts-accent flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-darts-green border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading match history...</p>
        </div>
      </div>
    );
  }

  const formatMatchDuration = (match: MatchSummary): string => {
    const estimatedMinutes = match.total_legs * 10; // Rough estimate: 10 min per leg
    
    if (estimatedMinutes < 60) {
      return `~${estimatedMinutes}m`;
    } else {
      const hours = Math.floor(estimatedMinutes / 60);
      const minutes = estimatedMinutes % 60;
      return `~${hours}h ${minutes}m`;
    }
  };

  const getMatchResult = (match: MatchSummary) => {
    if (match.status !== 'completed') return 'In Progress';
    return match.winner_name ? `${match.winner_name} Won` : 'Completed';
  };

  if (matches.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darts-dark via-darts-navy to-darts-accent">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Link href="/" className="text-darts-green hover:text-green-400 mb-6 inline-block">
              ← Back to Home
            </Link>
            <div className="bg-white/10 rounded-xl p-8 max-w-md mx-auto">
              <div className="text-4xl mb-4">📜</div>
              <h1 className="text-2xl font-bold text-white mb-4">No Match History</h1>
              <p className="text-gray-300 mb-6">
                Your completed matches will appear here once you finish some games.
              </p>
              <Link
                href="/setup"
                className="bg-darts-green hover:bg-green-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Play Your First Match
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
        <div className="mb-8">
          <Link href="/" className="text-darts-green hover:text-green-400 mb-2 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">📜 Match History</h1>
          <p className="text-gray-300">{matches.length} matches played</p>
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          {matches.map((match, index) => {
            const isRecent = index < 3;

            return (
              <div
                key={match.id}
                className={`bg-white/10 hover:bg-white/15 rounded-xl p-6 transition-all duration-300 backdrop-blur-sm ${
                  isRecent ? 'border border-darts-green/30' : 'border border-white/10'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Match Info */}
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {match.players}
                      </h3>
                      {isRecent && (
                        <span className="bg-darts-green/30 text-darts-green text-xs px-2 py-1 rounded-full">
                          Recent
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        match.status === 'completed' 
                          ? 'bg-green-600/30 text-green-300' 
                          : 'bg-yellow-600/30 text-yellow-300'
                      }`}>
                        {match.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                    
                    <div className="text-gray-300 text-sm space-y-1">
                      <p>
                        {new Date(match.created_at).toLocaleDateString()} at{' '}
                        {new Date(match.created_at).toLocaleTimeString()}
                      </p>
                      <p>{getMatchResult(match)}</p>
                      <p>
                        Format: {match.config.numberOfSets ? `Best of ${match.config.numberOfSets} sets, ` : ''}
                        Best of {match.config.numberOfLegs} legs • Duration: {formatMatchDuration(match)}
                      </p>
                    </div>
                  </div>

                  {/* Match Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-0">
                    <div className="text-center">
                      <div className="text-white font-semibold text-lg">{match.total_legs}</div>
                      <div className="text-gray-400 text-xs">Legs Played</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold text-lg">{match.player_count}</div>
                      <div className="text-gray-400 text-xs">Players</div>
                    </div>
                    <div className="text-center">
                      <div className="text-darts-green font-semibold text-lg">{match.status === 'completed' ? '✓' : '⏳'}</div>
                      <div className="text-gray-400 text-xs">Status</div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="lg:ml-6">
                    <Link
                      href={`/history/${match.id}`}
                      className="bg-darts-green hover:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 inline-block w-full lg:w-auto text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-12 bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Your Darts Journey</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-darts-green mb-1">{matches.length}</div>
              <div className="text-gray-300 text-sm">Total Matches</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">
                {matches.reduce((total, match) => total + match.total_legs, 0)}
              </div>
              <div className="text-gray-300 text-sm">Total Legs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {matches.reduce((total, match) => total + match.player_count, 0)}
              </div>
              <div className="text-gray-300 text-sm">Total Players</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">
                {matches.filter(match => match.status === 'completed').length}
              </div>
              <div className="text-gray-300 text-sm">Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}