'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameMatch, GameLeg, GamePlayer } from '@/types/game';
import { DbMatch } from '@/types/database';
import { 
  getCurrentMatch, 
  convertDbMatchToGameMatch, 
  addThrow, 
  completeLeg, 
  updateMatchStatus, 
  createLeg,
  getMatch
} from '@/utils/database';
import { isBust, isValidScore, getCheckoutSuggestions, isCheckoutAttempt } from '@/utils/gameLogic';

export default function GamePage() {
  const router = useRouter();
  const [match, setMatch] = useState<GameMatch | null>(null);
  const [dbMatch, setDbMatch] = useState<DbMatch | null>(null);
  const [scoreInput, setScoreInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentMatch();
  }, []);

  const loadCurrentMatch = async () => {
    try {
      const currentMatch = await getCurrentMatch();
      if (!currentMatch) {
        router.push('/setup');
        return;
      }
      
      setDbMatch(currentMatch);
      setMatch(convertDbMatchToGameMatch(currentMatch));
    } catch (error) {
      console.error('Failed to load match:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const refreshMatch = async () => {
    if (!dbMatch) return;
    
    try {
      const updatedMatch = await getMatch(dbMatch.id);
      if (updatedMatch) {
        setDbMatch(updatedMatch);
        setMatch(convertDbMatchToGameMatch(updatedMatch));
      }
    } catch (error) {
      console.error('Failed to refresh match:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darts-dark via-darts-navy to-darts-accent flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-darts-green border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading match...</p>
        </div>
      </div>
    );
  }

  if (!match || !dbMatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darts-dark via-darts-navy to-darts-accent flex items-center justify-center">
        <div className="text-white text-center">
          <p>No active match found</p>
          <button 
            onClick={() => router.push('/setup')}
            className="mt-4 bg-darts-green hover:bg-green-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Start New Match
          </button>
        </div>
      </div>
    );
  }

  const currentSet = match.sets[match.currentSetIndex];
  if (!currentSet) {
    return <div>Error: No current set found</div>;
  }
  
  const currentLeg = currentSet.legs[match.currentLegIndex];
  if (!currentLeg) {
    return <div>Error: No current leg found</div>;
  }

  const currentPlayer = currentLeg.players[currentLeg.currentPlayerIndex];
  const isCheckoutPossible = isCheckoutAttempt(currentPlayer.currentScore);

  const addScore = async (score: number) => {
    if (!isValidScore(score)) {
      alert('Invalid score');
      return;
    }

    try {
      const wasCheckoutAttempt = isCheckoutAttempt(currentPlayer.currentScore);
      
      if (isBust(currentPlayer.currentScore, score)) {
        alert('BUST! Score remains unchanged.');
        // Still record the throw but don't change score
        await addThrow(currentLeg.id, currentPlayer.id, currentLeg.currentRound, score, false);
      } else {
        const newScore = currentPlayer.currentScore - score;
        const isCheckout = newScore === 0;
        
        // Add throw to database
        await addThrow(currentLeg.id, currentPlayer.id, currentLeg.currentRound, score, isCheckout);
        
        if (isCheckout) {
          // Player finished - complete the leg
          await completeLeg(currentLeg.id, currentPlayer.id);
          
          // Check if match is won
          await checkMatchComplete();
        }
      }

      // Refresh the match data
      await refreshMatch();
      setScoreInput('');
    } catch (error) {
      console.error('Failed to add score:', error);
      alert('Failed to record score. Please try again.');
    }
  };

  const checkMatchComplete = async () => {
    if (!dbMatch) return;

    // This is a simplified version - you'd need more complex logic for sets
    const config = dbMatch.config;
    
    // For now, just check if we have enough legs for the first player who won this leg
    // In a real implementation, you'd need to count legs per set, sets per match, etc.
    
    // For simplicity, let's just mark as completed when someone wins
    // You can implement proper set/leg logic later
    await updateMatchStatus(dbMatch.id, 'completed', currentPlayer.id);
    
    // Navigate to match results
    router.push(`/history/${dbMatch.id}`);
  };

  const handleScoreSubmit = () => {
    const score = parseInt(scoreInput);
    if (!isNaN(score) && score >= 0) {
      addScore(score);
    }
  };

  const quitMatch = async () => {
    if (confirm('Are you sure you want to quit this match?')) {
      try {
        if (dbMatch) {
          await updateMatchStatus(dbMatch.id, 'completed');
        }
        router.push('/');
      } catch (error) {
        console.error('Failed to quit match:', error);
        router.push('/');
      }
    }
  };

  const getMatchStatus = () => {
    if (match.config.numberOfSets) {
      return `Set ${currentLeg.setNumber}, Leg ${currentLeg.legNumber}`;
    } else {
      return `Leg ${currentLeg.legNumber}`;
    }
  };

  const getLegScores = () => {
    const legWins: Record<string, number> = {};
    match.config.players.forEach(p => {
      legWins[p.id] = 0;
      match.sets.forEach(set => {
        legWins[p.id] += set.legs.filter(leg => leg.winnerId === p.id).length;
      });
    });
    return legWins;
  };

  const legScores = getLegScores();
  const checkoutSuggestions = isCheckoutPossible ? getCheckoutSuggestions(currentPlayer.currentScore) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-darts-dark via-darts-navy to-darts-accent">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">🎯 {getMatchStatus()}</h1>
          <p className="text-gray-300 text-sm">{match.config.players.map(p => p.name).join(' vs ')}</p>
        </div>

        {/* Leg Scores */}
        <div className="bg-white/10 rounded-lg p-3 mb-4 backdrop-blur-sm">
          <h3 className="text-white text-sm font-medium mb-2 text-center">Legs Won</h3>
          <div className="flex justify-around">
            {match.config.players.map(player => (
              <div key={player.id} className="text-center">
                <div className="text-white text-xl font-bold">{legScores[player.id]}</div>
                <div className="text-gray-300 text-xs">{player.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Scores */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {currentLeg.players.map((player, index) => {
            const playerThrows = player.throws;
            const average = playerThrows.length > 0 
              ? Math.round(((playerThrows.reduce((sum, t) => sum + t.score, 0) / playerThrows.length) * 3) * 10) / 10
              : 0;
            const highest = playerThrows.length > 0 
              ? Math.max(...playerThrows.map(t => t.score))
              : 0;
            const scores180 = playerThrows.filter(t => t.score === 180).length;

            return (
              <div
                key={player.id}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  index === currentLeg.currentPlayerIndex && !currentLeg.isCompleted
                    ? 'border-darts-green bg-darts-green/20 shadow-lg shadow-darts-green/25'
                    : player.isFinished
                    ? 'border-green-400 bg-green-400/20'
                    : 'border-white/20 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white text-lg font-semibold flex items-center">
                      {player.name}
                      {index === currentLeg.currentPlayerIndex && !currentLeg.isCompleted && (
                        <span className="ml-2 text-xs bg-darts-green px-2 py-1 rounded-full">THROWING</span>
                      )}
                      {player.isFinished && (
                        <span className="ml-2 text-xs bg-green-500 px-2 py-1 rounded-full">WINNER</span>
                      )}
                    </h3>
                    <div className="text-gray-300 text-sm">
                      Avg: {average} • High: {highest} • 180s: {scores180}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold score-display ${
                      player.currentScore === 0 ? 'text-green-400' : 'text-white'
                    }`}>
                      {player.currentScore}
                    </div>
                    {playerThrows.length > 0 && (
                      <div className="text-gray-400 text-sm">
                        Last: {playerThrows[playerThrows.length - 1].score}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Recent scores */}
                {playerThrows.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <div className="flex flex-wrap gap-1">
                      {playerThrows.slice(-5).map((throwData, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-1 rounded ${
                            throwData.score >= 100 ? 'bg-yellow-600/30 text-yellow-200' :
                            throwData.score >= 80 ? 'bg-blue-600/30 text-blue-200' :
                            'bg-white/10 text-gray-300'
                          }`}
                        >
                          {throwData.score}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Checkout Suggestions */}
        {isCheckoutPossible && checkoutSuggestions.length > 0 && (
          <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
            <h4 className="text-yellow-200 font-semibold mb-2 text-center">🎯 Checkout Available!</h4>
            <div className="space-y-1">
              {checkoutSuggestions.slice(0, 3).map((suggestion, idx) => (
                <div key={idx} className="text-center">
                  <span className="text-yellow-100 font-medium">{suggestion.combination}</span>
                  <span className="text-yellow-300 text-sm ml-2">({suggestion.description})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score Input */}
        {!currentLeg.isCompleted && (
          <div className="bg-white/10 rounded-xl p-6 mb-6 backdrop-blur-sm">
            <div className="text-center mb-4">
              <h3 className="text-white text-lg font-semibold mb-1">
                {currentPlayer.name}'s Turn
              </h3>
              <p className="text-gray-300 text-sm">Enter 3-dart total</p>
            </div>

            <div className="mb-4">
              <input
                type="number"
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleScoreSubmit()}
                placeholder="Enter score (0-180)"
                className="w-full text-center text-2xl bg-white/20 border border-white/30 rounded-lg px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-darts-green focus:bg-white/30"
                autoFocus
              />
            </div>

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => setScoreInput(scoreInput + num.toString())}
                  className="bg-white/20 hover:bg-white/30 text-white text-xl font-semibold py-3 rounded-lg transition-colors"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setScoreInput('')}
                className="bg-darts-red/50 hover:bg-darts-red/70 text-white py-3 rounded-lg transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setScoreInput(scoreInput + '0')}
                className="bg-white/20 hover:bg-white/30 text-white text-xl font-semibold py-3 rounded-lg transition-colors"
              >
                0
              </button>
              <button
                onClick={() => setScoreInput(scoreInput.slice(0, -1))}
                className="bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg transition-colors"
              >
                ⌫
              </button>
            </div>

            <button
              onClick={handleScoreSubmit}
              disabled={!scoreInput || parseInt(scoreInput) < 0 || parseInt(scoreInput) > 180}
              className="w-full bg-darts-green hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
            >
              Submit Score
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={quitMatch}
            className="flex-1 bg-darts-red/50 hover:bg-darts-red/70 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Quit Match
          </button>
        </div>
      </div>
    </div>
  );
}