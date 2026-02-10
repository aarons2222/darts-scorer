'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Match } from '@/types/game';
import { getMatchHistory } from '@/utils/localStorage';

export default function HistoryPage() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    setMatches(getMatchHistory());
  }, []);

  const formatMatchDuration = (match: Match): string => {
    // This is a simplified calculation - in a real app you'd track actual duration
    const totalLegs = match.sets.reduce((total, set) => total + set.legs.length, 0);
    const estimatedMinutes = totalLegs * 10; // Rough estimate: 10 min per leg
    
    if (estimatedMinutes < 60) {
      return `~${estimatedMinutes}m`;
    } else {
      const hours = Math.floor(estimatedMinutes / 60);
      const minutes = estimatedMinutes % 60;
      return `~${hours}h ${minutes}m`;
    }
  };

  const getMatchResult = (match: Match) => {
    if (!match.winnerId) return 'In Progress';
    
    const winner = match.settings.players.find(p => p.id === match.winnerId);
    return winner ? `${winner.name} Won` : 'Completed';
  };

  const getMatchStats = (match: Match) => {
    let totalScores: number[] = [];
    let highestScore = 0;
    let totalCheckouts = 0;
    let successfulCheckouts = 0;

    match.sets.forEach(set => {
      set.legs.forEach(leg => {
        leg.players.forEach(player => {
          totalScores.push(...player.scores);
          const playerHigh = Math.max(...(player.scores.length > 0 ? player.scores : [0]));
          if (playerHigh > highestScore) {
            highestScore = playerHigh;
          }
          totalCheckouts += player.checkoutAttempts;
          successfulCheckouts += player.successfulCheckouts;
        });
      });
    });

    const averageScore = totalScores.length > 0 
      ? (totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length) * 3 
      : 0;

    const checkoutPercentage = totalCheckouts > 0 
      ? Math.round((successfulCheckouts / totalCheckouts) * 100) 
      : 0;

    return {
      averageScore: Math.round(averageScore * 100) / 100,
      highestScore,
      checkoutPercentage,
      totalLegs: match.sets.reduce((total, set) => total + set.legs.length, 0)
    };
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
            const stats = getMatchStats(match);
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
                        {match.settings.players.map(p => p.name).join(' vs ')}
                      </h3>
                      {isRecent && (
                        <span className="bg-darts-green/30 text-darts-green text-xs px-2 py-1 rounded-full">
                          Recent
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        match.isFinished 
                          ? 'bg-green-600/30 text-green-300' 
                          : 'bg-yellow-600/30 text-yellow-300'
                      }`}>
                        {match.isFinished ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                    
                    <div className="text-gray-300 text-sm space-y-1">
                      <p>
                        {new Date(match.timestamp).toLocaleDateString()} at{' '}
                        {new Date(match.timestamp).toLocaleTimeString()}
                      </p>
                      <p>{getMatchResult(match)}</p>
                      <p>
                        Format: {match.settings.numberOfSets ? `Best of ${match.settings.numberOfSets} sets, ` : ''}
                        Best of {match.settings.numberOfLegs} legs • Duration: {formatMatchDuration(match)}
                      </p>
                    </div>
                  </div>

                  {/* Match Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-4 lg:mb-0">
                    <div className="text-center">
                      <div className="text-white font-semibold text-lg">{stats.totalLegs}</div>
                      <div className="text-gray-400 text-xs">Legs Played</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold text-lg">{stats.averageScore.toFixed(1)}</div>
                      <div className="text-gray-400 text-xs">Avg Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-400 font-semibold text-lg">{stats.highestScore}</div>
                      <div className="text-gray-400 text-xs">High Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-darts-green font-semibold text-lg">{stats.checkoutPercentage}%</div>
                      <div className="text-gray-400 text-xs">Checkout %</div>
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

                {/* Player Scores Preview */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {match.settings.players.map(player => {
                      const playerScores: number[] = [];
                      let playerHighest = 0;
                      
                      match.sets.forEach(set => {
                        set.legs.forEach(leg => {
                          const legPlayer = leg.players.find(p => p.id === player.id);
                          if (legPlayer) {
                            playerScores.push(...legPlayer.scores);
                            const legHigh = Math.max(...(legPlayer.scores.length > 0 ? legPlayer.scores : [0]));
                            if (legHigh > playerHighest) {
                              playerHighest = legHigh;
                            }
                          }
                        });
                      });

                      const playerAvg = playerScores.length > 0 
                        ? Math.round(((playerScores.reduce((sum, s) => sum + s, 0) / playerScores.length) * 3) * 10) / 10
                        : 0;

                      return (
                        <div key={player.id} className="bg-white/5 rounded p-3 text-center">
                          <div className="text-white font-medium text-sm mb-1">{player.name}</div>
                          <div className="text-gray-300 text-xs">
                            Avg: {playerAvg} • High: {playerHighest}
                          </div>
                          {match.winnerId === player.id && (
                            <div className="text-darts-green text-xs mt-1 font-semibold">🏆 WINNER</div>
                          )}
                        </div>
                      );
                    })}
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
                {matches.reduce((total, match) => 
                  total + match.sets.reduce((setTotal, set) => setTotal + set.legs.length, 0), 0
                )}
              </div>
              <div className="text-gray-300 text-sm">Total Legs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {Math.max(...matches.flatMap(match => 
                  match.sets.flatMap(set =>
                    set.legs.flatMap(leg =>
                      leg.players.flatMap(player => 
                        player.scores.length > 0 ? player.scores : [0]
                      )
                    )
                  )
                ))}
              </div>
              <div className="text-gray-300 text-sm">Highest Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">
                {matches.filter(match => match.isFinished).length}
              </div>
              <div className="text-gray-300 text-sm">Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}