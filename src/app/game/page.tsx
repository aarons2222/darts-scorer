'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Match, Player, Leg, Set, LegStats } from '@/types/game';
import { getCurrentMatch, saveCurrentMatch, clearCurrentMatch, saveMatch, updatePlayerStats } from '@/utils/localStorage';
import { isBust, isValidScore, calculateAverage, calculateFirstNineDartAverage, getCheckoutSuggestions, isCheckoutAttempt, count100PlusScores, count140PlusScores, count180Scores, getHighestScore, generateMatchId } from '@/utils/gameLogic';

export default function GamePage() {
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [scoreInput, setScoreInput] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [undoStack, setUndoStack] = useState<Match[]>([]);

  useEffect(() => {
    const currentMatch = getCurrentMatch();
    if (!currentMatch) {
      router.push('/setup');
      return;
    }
    setMatch(currentMatch);
  }, [router]);

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darts-dark via-darts-navy to-darts-accent flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-darts-green border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading match...</p>
        </div>
      </div>
    );
  }

  const currentSet = match.sets[match.currentSetIndex];
  const currentLeg = currentSet.legs[match.currentLegIndex];
  const currentPlayer = currentLeg.players[currentLeg.currentPlayerIndex];
  const isCheckoutPossible = isCheckoutAttempt(currentPlayer.currentScore);

  const addScore = (score: number) => {
    if (!isValidScore(score)) {
      alert('Invalid score');
      return;
    }

    // Save current state for undo
    setUndoStack([...undoStack, JSON.parse(JSON.stringify(match))]);

    const newMatch = JSON.parse(JSON.stringify(match)) as Match;
    const newCurrentSet = newMatch.sets[newMatch.currentSetIndex];
    const newCurrentLeg = newCurrentSet.legs[newMatch.currentLegIndex];
    const newCurrentPlayer = newCurrentLeg.players[newCurrentLeg.currentPlayerIndex];

    const wasCheckoutAttempt = isCheckoutAttempt(newCurrentPlayer.currentScore);
    
    if (wasCheckoutAttempt) {
      newCurrentPlayer.checkoutAttempts += 1;
    }

    if (isBust(newCurrentPlayer.currentScore, score)) {
      // Bust - no score change, but move to next player
      alert('BUST! Score remains unchanged.');
    } else {
      // Valid score
      newCurrentPlayer.currentScore -= score;
      newCurrentPlayer.scores.push(score);

      // Update stats
      const playerStats = newCurrentLeg.stats[newCurrentPlayer.id];
      playerStats.dartCount += 3; // Assuming 3 darts per turn
      playerStats.average = calculateAverage(newCurrentPlayer.scores);
      playerStats.highestScore = Math.max(playerStats.highestScore, score);
      playerStats.scores100Plus = count100PlusScores(newCurrentPlayer.scores);
      playerStats.scores140Plus = count140PlusScores(newCurrentPlayer.scores);
      playerStats.scores180 = count180Scores(newCurrentPlayer.scores);
      
      if (newCurrentPlayer.scores.length === 3) {
        playerStats.firstNineDartAvg = calculateFirstNineDartAverage(newCurrentPlayer.scores);
      }

      // Check for leg win
      if (newCurrentPlayer.currentScore === 0) {
        newCurrentPlayer.isFinished = true;
        newCurrentLeg.winnerId = newCurrentPlayer.id;
        
        if (wasCheckoutAttempt) {
          newCurrentPlayer.successfulCheckouts += 1;
        }

        // Check if set is won
        const legsWon = newCurrentSet.legs.filter(leg => leg.winnerId === newCurrentPlayer.id).length;
        const legsNeeded = Math.ceil(newMatch.settings.numberOfLegs / 2);
        
        if (legsWon >= legsNeeded) {
          newCurrentSet.winnerId = newCurrentPlayer.id;
          
          // Check if match is won
          if (newMatch.settings.numberOfSets) {
            const setsWon = newMatch.sets.filter(set => set.winnerId === newCurrentPlayer.id).length;
            const setsNeeded = Math.ceil(newMatch.settings.numberOfSets / 2);
            
            if (setsWon >= setsNeeded) {
              // Match won!
              newMatch.isFinished = true;
              newMatch.winnerId = newCurrentPlayer.id;
              finishMatch(newMatch);
            } else {
              // Start new set
              startNewSet(newMatch);
            }
          } else {
            // No sets, just legs - match won!
            newMatch.isFinished = true;
            newMatch.winnerId = newCurrentPlayer.id;
            finishMatch(newMatch);
          }
        } else {
          // Start new leg
          startNewLeg(newMatch);
        }
      }
    }

    // Move to next player if leg isn't finished
    if (!newCurrentLeg.winnerId) {
      newCurrentLeg.currentPlayerIndex = (newCurrentLeg.currentPlayerIndex + 1) % newCurrentLeg.players.length;
    }

    setMatch(newMatch);
    saveCurrentMatch(newMatch);
    setScoreInput('');
    setShowCheckout(false);
  };

  const startNewLeg = (match: Match) => {
    const newLeg: Leg = {
      id: generateMatchId(),
      players: match.settings.players.map(p => ({
        id: p.id,
        name: p.name,
        startingScore: p.startingScore,
        currentScore: p.startingScore,
        scores: [],
        isFinished: false,
        checkoutAttempts: 0,
        successfulCheckouts: 0,
      })),
      stats: {},
      currentPlayerIndex: 0,
    };

    // Initialize stats
    match.settings.players.forEach(p => {
      newLeg.stats[p.id] = {
        playerId: p.id,
        dartCount: 0,
        average: 0,
        highestScore: 0,
        scores100Plus: 0,
        scores140Plus: 0,
        scores180: 0,
      };
    });

    match.sets[match.currentSetIndex].legs.push(newLeg);
    match.currentLegIndex = match.sets[match.currentSetIndex].legs.length - 1;
  };

  const startNewSet = (match: Match) => {
    const newSet: Set = {
      id: generateMatchId(),
      legs: [],
    };

    match.sets.push(newSet);
    match.currentSetIndex = match.sets.length - 1;
    match.currentLegIndex = 0;
    
    startNewLeg(match);
  };

  const finishMatch = (match: Match) => {
    clearCurrentMatch();
    saveMatch(match);
    updatePlayerStats(match);
    router.push(`/history/${match.id}`);
  };

  const undoLastScore = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setUndoStack(undoStack.slice(0, -1));
      setMatch(previousState);
      saveCurrentMatch(previousState);
      setScoreInput('');
      setShowCheckout(false);
    }
  };

  const handleScoreSubmit = () => {
    const score = parseInt(scoreInput);
    if (!isNaN(score) && score >= 0) {
      addScore(score);
    }
  };

  const getMatchStatus = () => {
    if (match.settings.numberOfSets) {
      return `Set ${match.currentSetIndex + 1}, Leg ${match.currentLegIndex + 1}`;
    } else {
      return `Leg ${match.currentLegIndex + 1}`;
    }
  };

  const getSetScores = () => {
    if (!match.settings.numberOfSets) return null;

    const setWins: Record<string, number> = {};
    match.settings.players.forEach(p => {
      setWins[p.id] = match.sets.filter(set => set.winnerId === p.id).length;
    });

    return setWins;
  };

  const getLegScores = () => {
    const legWins: Record<string, number> = {};
    match.settings.players.forEach(p => {
      legWins[p.id] = currentSet.legs.filter(leg => leg.winnerId === p.id).length;
    });

    return legWins;
  };

  const setScores = getSetScores();
  const legScores = getLegScores();
  const checkoutSuggestions = isCheckoutPossible ? getCheckoutSuggestions(currentPlayer.currentScore) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-darts-dark via-darts-navy to-darts-accent">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">🎯 {getMatchStatus()}</h1>
          <p className="text-gray-300 text-sm">{match.settings.players.map(p => p.name).join(' vs ')}</p>
        </div>

        {/* Set Scores (if applicable) */}
        {setScores && (
          <div className="bg-white/10 rounded-lg p-3 mb-4 backdrop-blur-sm">
            <h3 className="text-white text-sm font-medium mb-2 text-center">Sets</h3>
            <div className="flex justify-around">
              {match.settings.players.map(player => (
                <div key={player.id} className="text-center">
                  <div className="text-white text-xl font-bold">{setScores[player.id]}</div>
                  <div className="text-gray-300 text-xs">{player.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leg Scores */}
        <div className="bg-white/10 rounded-lg p-3 mb-4 backdrop-blur-sm">
          <h3 className="text-white text-sm font-medium mb-2 text-center">Current Set - Legs</h3>
          <div className="flex justify-around">
            {match.settings.players.map(player => (
              <div key={player.id} className="text-center">
                <div className="text-white text-xl font-bold">{legScores[player.id]}</div>
                <div className="text-gray-300 text-xs">{player.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Scores */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {currentLeg.players.map((player, index) => (
            <div
              key={player.id}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                index === currentLeg.currentPlayerIndex && !currentLeg.winnerId
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
                    {index === currentLeg.currentPlayerIndex && !currentLeg.winnerId && (
                      <span className="ml-2 text-xs bg-darts-green px-2 py-1 rounded-full">THROWING</span>
                    )}
                    {player.isFinished && (
                      <span className="ml-2 text-xs bg-green-500 px-2 py-1 rounded-full">WINNER</span>
                    )}
                  </h3>
                  <div className="text-gray-300 text-sm">
                    Avg: {calculateAverage(player.scores).toFixed(1)} • 
                    High: {getHighestScore(player.scores)} • 
                    180s: {count180Scores(player.scores)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold score-display ${
                    player.currentScore === 0 ? 'text-green-400' : 'text-white'
                  }`}>
                    {player.currentScore}
                  </div>
                  {player.scores.length > 0 && (
                    <div className="text-gray-400 text-sm">
                      Last: {player.scores[player.scores.length - 1]}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recent scores */}
              {player.scores.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <div className="flex flex-wrap gap-1">
                    {player.scores.slice(-5).map((score, idx) => (
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
              )}
            </div>
          ))}
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
        {!currentLeg.winnerId && (
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
            onClick={undoLastScore}
            disabled={undoStack.length === 0}
            className="flex-1 bg-yellow-600/50 hover:bg-yellow-600/70 disabled:bg-gray-600/50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
          >
            Undo Last
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to quit this match?')) {
                clearCurrentMatch();
                router.push('/');
              }
            }}
            className="flex-1 bg-darts-red/50 hover:bg-darts-red/70 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Quit Match
          </button>
        </div>
      </div>
    </div>
  );
}