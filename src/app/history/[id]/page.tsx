'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Match } from '@/types/game';
import { getMatchHistory } from '@/utils/localStorage';
import { calculateAverage, count100PlusScores, count140PlusScores, count180Scores, getHighestScore } from '@/utils/gameLogic';

interface MatchDetailPageProps {
  params: { id: string };
}

export default function MatchDetailPage({ params }: MatchDetailPageProps) {
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'legs' | 'stats'>('overview');

  useEffect(() => {
    const matches = getMatchHistory();
    const foundMatch = matches.find(m => m.id === params.id);
    if (!foundMatch) {
      router.push('/history');
      return;
    }
    setMatch(foundMatch);
  }, [params.id, router]);

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darts-dark via-darts-navy to-darts-accent flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-darts-green border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading match details...</p>
        </div>
      </div>
    );
  }

  const getMatchResult = () => {
    if (!match.winnerId) return 'Match In Progress';
    const winner = match.settings.players.find(p => p.id === match.winnerId);
    return `${winner?.name} Won!`;
  };

  const getPlayerMatchStats = (playerId: string) => {
    let allScores: number[] = [];
    let totalCheckoutAttempts = 0;
    let successfulCheckouts = 0;
    let legsWon = 0;
    let setsWon = 0;

    match.sets.forEach(set => {
      if (set.winnerId === playerId) setsWon++;
      
      set.legs.forEach(leg => {
        if (leg.winnerId === playerId) legsWon++;
        
        const player = leg.players.find(p => p.id === playerId);
        if (player) {
          allScores.push(...player.scores);
          totalCheckoutAttempts += player.checkoutAttempts;
          successfulCheckouts += player.successfulCheckouts;
        }
      });
    });

    const average = allScores.length > 0 ? calculateAverage(allScores) : 0;
    const checkoutPercentage = totalCheckoutAttempts > 0 
      ? Math.round((successfulCheckouts / totalCheckoutAttempts) * 100) 
      : 0;

    return {
      average,
      highestScore: getHighestScore(allScores),
      scores100Plus: count100PlusScores(allScores),
      scores140Plus: count140PlusScores(allScores),
      scores180: count180Scores(allScores),
      checkoutPercentage,
      legsWon,
      setsWon,
      totalScores: allScores.length,
      totalDarts: allScores.length * 3,
    };
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Match Info */}
      <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white mb-4">Match Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-gray-300 text-sm mb-2">Date & Time</h4>
            <p className="text-white">
              {new Date(match.timestamp).toLocaleDateString()} at{' '}
              {new Date(match.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <div>
            <h4 className="text-gray-300 text-sm mb-2">Format</h4>
            <p className="text-white">
              {match.settings.numberOfSets ? `Best of ${match.settings.numberOfSets} sets, ` : ''}
              Best of {match.settings.numberOfLegs} legs
            </p>
          </div>
          <div>
            <h4 className="text-gray-300 text-sm mb-2">Result</h4>
            <p className={`font-semibold ${match.isFinished ? 'text-darts-green' : 'text-yellow-400'}`}>
              {getMatchResult()}
            </p>
          </div>
          <div>
            <h4 className="text-gray-300 text-sm mb-2">Total Legs Played</h4>
            <p className="text-white">
              {match.sets.reduce((total, set) => total + set.legs.length, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Set Scores (if applicable) */}
      {match.settings.numberOfSets && (
        <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Set Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {match.settings.players.map(player => {
              const setsWon = match.sets.filter(set => set.winnerId === player.id).length;
              return (
                <div key={player.id} className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                  <span className="text-white font-medium">{player.name}</span>
                  <span className={`text-xl font-bold ${
                    match.winnerId === player.id ? 'text-darts-green' : 'text-white'
                  }`}>
                    {setsWon}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Player Match Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {match.settings.players.map(player => {
          const stats = getPlayerMatchStats(player.id);
          const isWinner = match.winnerId === player.id;

          return (
            <div
              key={player.id}
              className={`rounded-xl p-6 backdrop-blur-sm ${
                isWinner
                  ? 'bg-darts-green/20 border-2 border-darts-green'
                  : 'bg-white/10 border border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{player.name}</h3>
                {isWinner && (
                  <span className="bg-darts-green text-white text-xs px-2 py-1 rounded-full font-semibold">
                    🏆 WINNER
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-300">3-Dart Average:</span>
                  <div className="text-white font-semibold">{stats.average.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-300">Highest Score:</span>
                  <div className="text-yellow-400 font-semibold">{stats.highestScore}</div>
                </div>
                <div>
                  <span className="text-gray-300">100+ Scores:</span>
                  <div className="text-white font-semibold">{stats.scores100Plus}</div>
                </div>
                <div>
                  <span className="text-gray-300">140+ Scores:</span>
                  <div className="text-blue-400 font-semibold">{stats.scores140Plus}</div>
                </div>
                <div>
                  <span className="text-gray-300">180s:</span>
                  <div className="text-yellow-400 font-semibold">{stats.scores180}</div>
                </div>
                <div>
                  <span className="text-gray-300">Checkout %:</span>
                  <div className="text-darts-green font-semibold">{stats.checkoutPercentage}%</div>
                </div>
                <div>
                  <span className="text-gray-300">Legs Won:</span>
                  <div className="text-white font-semibold">{stats.legsWon}</div>
                </div>
                <div>
                  <span className="text-gray-300">Total Darts:</span>
                  <div className="text-white font-semibold">{stats.totalDarts}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderLegs = () => (
    <div className="space-y-6">
      {match.sets.map((set, setIndex) => (
        <div key={set.id} className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              {match.settings.numberOfSets ? `Set ${setIndex + 1}` : 'Match'}
            </h2>
            {set.winnerId && (
              <span className="bg-darts-green text-white text-sm px-3 py-1 rounded-full">
                Won by {match.settings.players.find(p => p.id === set.winnerId)?.name}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {set.legs.map((leg, legIndex) => (
              <div key={leg.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">Leg {legIndex + 1}</h3>
                  {leg.winnerId && (
                    <span className="text-darts-green text-sm font-semibold">
                      {match.settings.players.find(p => p.id === leg.winnerId)?.name} won
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {leg.players.map(player => (
                    <div key={player.id} className="text-center">
                      <div className="text-white font-medium mb-2">{player.name}</div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {player.startingScore - player.scores.reduce((sum, s) => sum + s, 0)}
                      </div>
                      <div className="text-gray-300 text-sm">
                        Avg: {player.scores.length > 0 ? calculateAverage(player.scores).toFixed(1) : '0.0'}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2 justify-center">
                        {player.scores.slice(-3).map((score, idx) => (
                          <span
                            key={idx}
                            className={`text-xs px-2 py-1 rounded ${
                              score >= 100 ? 'bg-yellow-600/30 text-yellow-200' :
                              score >= 80 ? 'bg-blue-600/30 text-blue-200' :
                              'bg-white/10 text-gray-300'
                            }`}
                          >
                            {score}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white mb-6">Detailed Statistics</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left text-gray-300 py-2">Player</th>
                <th className="text-center text-gray-300 py-2">Avg</th>
                <th className="text-center text-gray-300 py-2">High</th>
                <th className="text-center text-gray-300 py-2">100+</th>
                <th className="text-center text-gray-300 py-2">140+</th>
                <th className="text-center text-gray-300 py-2">180s</th>
                <th className="text-center text-gray-300 py-2">Checkout %</th>
                <th className="text-center text-gray-300 py-2">Legs Won</th>
              </tr>
            </thead>
            <tbody>
              {match.settings.players.map(player => {
                const stats = getPlayerMatchStats(player.id);
                const isWinner = match.winnerId === player.id;
                
                return (
                  <tr key={player.id} className={`border-b border-white/10 ${isWinner ? 'bg-darts-green/10' : ''}`}>
                    <td className="py-3">
                      <div className="flex items-center">
                        <span className={`font-medium ${isWinner ? 'text-darts-green' : 'text-white'}`}>
                          {player.name}
                        </span>
                        {isWinner && <span className="ml-2 text-xs">🏆</span>}
                      </div>
                    </td>
                    <td className="text-center text-white py-3">{stats.average.toFixed(2)}</td>
                    <td className="text-center text-yellow-400 py-3">{stats.highestScore}</td>
                    <td className="text-center text-white py-3">{stats.scores100Plus}</td>
                    <td className="text-center text-blue-400 py-3">{stats.scores140Plus}</td>
                    <td className="text-center text-yellow-400 py-3">{stats.scores180}</td>
                    <td className="text-center text-darts-green py-3">{stats.checkoutPercentage}%</td>
                    <td className="text-center text-white py-3">{stats.legsWon}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score Distribution Chart */}
      <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white mb-4">Score Distribution</h3>
        {match.settings.players.map(player => {
          const allScores: number[] = [];
          match.sets.forEach(set => {
            set.legs.forEach(leg => {
              const legPlayer = leg.players.find(p => p.id === player.id);
              if (legPlayer) {
                allScores.push(...legPlayer.scores);
              }
            });
          });

          const scoreRanges = {
            '0-40': allScores.filter(s => s >= 0 && s <= 40).length,
            '41-80': allScores.filter(s => s >= 41 && s <= 80).length,
            '81-100': allScores.filter(s => s >= 81 && s <= 100).length,
            '101-140': allScores.filter(s => s >= 101 && s <= 140).length,
            '141+': allScores.filter(s => s >= 141).length,
          };

          const maxCount = Math.max(...Object.values(scoreRanges));

          return (
            <div key={player.id} className="mb-6 last:mb-0">
              <h4 className="text-white font-medium mb-3">{player.name}</h4>
              <div className="space-y-2">
                {Object.entries(scoreRanges).map(([range, count]) => (
                  <div key={range} className="flex items-center">
                    <div className="w-16 text-gray-300 text-sm">{range}</div>
                    <div className="flex-1 bg-white/10 rounded-full h-4 mx-3">
                      <div
                        className="bg-darts-green h-4 rounded-full transition-all duration-300"
                        style={{ width: maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%' }}
                      ></div>
                    </div>
                    <div className="w-8 text-white text-sm text-right">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-darts-dark via-darts-navy to-darts-accent">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/history" className="text-darts-green hover:text-green-400 mb-2 inline-block">
            ← Back to History
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            {match.settings.players.map(p => p.name).join(' vs ')}
          </h1>
          <p className="text-gray-300">
            {new Date(match.timestamp).toLocaleDateString()} • {getMatchResult()}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-white/10 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'legs', label: 'Leg by Leg' },
            { key: 'stats', label: 'Statistics' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedTab === tab.key
                  ? 'bg-darts-green text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'legs' && renderLegs()}
        {selectedTab === 'stats' && renderStats()}
      </div>
    </div>
  );
}