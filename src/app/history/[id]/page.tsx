'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GameMatch } from '@/types/game';
import { DbMatch } from '@/types/database';
import { getMatch, convertDbMatchToGameMatch } from '@/utils/database';
import { calculateAverage, getHighestScore, count100PlusScores, count140PlusScores, count180Scores } from '@/utils/gameLogic';

interface MatchDetailPageProps {
  params: { id: string };
}

export default function MatchDetailPage({ params }: MatchDetailPageProps) {
  const router = useRouter();
  const [match, setMatch] = useState<DbMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'legs'>('overview');

  useEffect(() => {
    loadMatchDetails();
  }, [params.id]);

  const loadMatchDetails = async () => {
    try {
      const foundMatch = await getMatch(params.id);
      if (!foundMatch) {
        router.push('/history');
        return;
      }
      setMatch(foundMatch);
    } catch (error) {
      console.error('Failed to load match:', error);
      router.push('/history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darts-dark via-darts-navy to-darts-accent flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-darts-green border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading match details...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darts-dark via-darts-navy to-darts-accent flex items-center justify-center">
        <div className="text-white text-center">
          <p>Match not found</p>
          <Link 
            href="/history"
            className="mt-4 bg-darts-green hover:bg-green-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
          >
            Back to History
          </Link>
        </div>
      </div>
    );
  }

  const getMatchResult = () => {
    if (match.status !== 'completed') return 'Match In Progress';
    const winner = match.config.players.find(p => p.id === match.winner_id);
    return `${winner?.name} Won!`;
  };

  const calculatePlayerStats = (playerId: string) => {
    let totalScore = 0;
    let throwCount = 0;
    let highestScore = 0;
    let scores100Plus = 0;
    let scores140Plus = 0;
    let scores180 = 0;
    let legsWon = 0;

    if (match.legs) {
      match.legs.forEach((leg: any) => {
        if (leg.winner_id === playerId) {
          legsWon++;
        }
        
        if (leg.darts_throws) {
          const playerThrows = leg.darts_throws.filter((t: any) => t.player_id === playerId);
          playerThrows.forEach((t: any) => {
            totalScore += t.score;
            throwCount++;
            if (t.score > highestScore) highestScore = t.score;
            if (t.score >= 100) scores100Plus++;
            if (t.score >= 140) scores140Plus++;
            if (t.score === 180) scores180++;
          });
        }
      });
    }

    const average = throwCount > 0 ? Math.round(((totalScore / throwCount) * 3) * 100) / 100 : 0;

    return {
      average,
      highestScore,
      scores100Plus,
      scores140Plus,
      scores180,
      legsWon,
      totalThrows: throwCount,
      totalScore
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
              {new Date(match.created_at).toLocaleDateString()} at{' '}
              {new Date(match.created_at).toLocaleTimeString()}
            </p>
          </div>
          <div>
            <h4 className="text-gray-300 text-sm mb-2">Format</h4>
            <p className="text-white">
              {match.config.numberOfSets ? `Best of ${match.config.numberOfSets} sets, ` : ''}
              Best of {match.config.numberOfLegs} legs
            </p>
          </div>
          <div>
            <h4 className="text-gray-300 text-sm mb-2">Result</h4>
            <p className={`font-semibold ${match.status === 'completed' ? 'text-darts-green' : 'text-yellow-400'}`}>
              {getMatchResult()}
            </p>
          </div>
          <div>
            <h4 className="text-gray-300 text-sm mb-2">Total Legs Played</h4>
            <p className="text-white">
              {match.legs?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Player Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {match.config.players.map(player => {
          const stats = calculatePlayerStats(player.id);
          const isWinner = match.winner_id === player.id;

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
                  <span className="text-gray-300">Legs Won:</span>
                  <div className="text-white font-semibold">{stats.legsWon}</div>
                </div>
                <div>
                  <span className="text-gray-300">Total Throws:</span>
                  <div className="text-white font-semibold">{stats.totalThrows}</div>
                </div>
                <div>
                  <span className="text-gray-300">Total Score:</span>
                  <div className="text-white font-semibold">{stats.totalScore}</div>
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
      {match.legs && match.legs.length > 0 ? (
        <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Leg Results</h2>
          <div className="space-y-4">
            {match.legs.map((leg: any, legIndex: number) => (
              <div key={leg.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">
                    {match.config.numberOfSets ? `Set ${leg.set_number}, ` : ''}
                    Leg {leg.leg_number}
                  </h3>
                  {leg.winner_id && (
                    <span className="text-darts-green text-sm font-semibold">
                      {match.config.players.find(p => p.id === leg.winner_id)?.name} won
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {match.config.players.map(player => {
                    const playerThrows = leg.darts_throws?.filter((t: any) => t.player_id === player.id) || [];
                    const totalScore = playerThrows.reduce((sum: number, t: any) => sum + t.score, 0);
                    const average = playerThrows.length > 0 
                      ? Math.round(((totalScore / playerThrows.length) * 3) * 10) / 10 
                      : 0;
                    const finalScore = player.startingScore - totalScore;

                    return (
                      <div key={player.id} className="text-center">
                        <div className="text-white font-medium mb-2">{player.name}</div>
                        <div className={`text-2xl font-bold mb-1 ${
                          finalScore === 0 ? 'text-darts-green' : 'text-white'
                        }`}>
                          {finalScore}
                        </div>
                        <div className="text-gray-300 text-sm">
                          Avg: {average}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2 justify-center">
                          {playerThrows.slice(-3).map((t: any, idx: number) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-1 rounded ${
                                t.score >= 100 ? 'bg-yellow-600/30 text-yellow-200' :
                                t.score >= 80 ? 'bg-blue-600/30 text-blue-200' :
                                'bg-white/10 text-gray-300'
                              }`}
                            >
                              {t.score}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm text-center">
          <p className="text-gray-300">No leg details available</p>
        </div>
      )}
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
            {match.config.players.map(p => p.name).join(' vs ')}
          </h1>
          <p className="text-gray-300">
            {new Date(match.created_at).toLocaleDateString()} • {getMatchResult()}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-white/10 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'legs', label: 'Leg Details' }
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
      </div>
    </div>
  );
}