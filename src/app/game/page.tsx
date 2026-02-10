'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Home, SkipForward, Target } from 'lucide-react';

import { useGame } from '@/hooks/useGame';
import { ScoreInput } from '@/components/ui/ScoreInput';
import { LoadingSpinner, FullPageLoader } from '@/components/ui/LoadingSpinner';
import { cn } from '@/utils/cn';

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-400 mb-2">Game Error</h2>
        <p className="text-red-300 mb-6 text-sm">{error}</p>
        
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function NoMatchState() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        className="bg-slate-800 border border-slate-600 rounded-xl p-8 max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Active Match</h2>
        <p className="text-slate-400 mb-6">Start a new match to begin scoring</p>
        
        <button
          onClick={() => router.push('/setup')}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-medium transition-colors"
        >
          Start New Match
        </button>
      </motion.div>
    </div>
  );
}

function WinCelebration({ 
  winner, 
  isMatchWon, 
  onNextLeg, 
  onViewStats 
}: { 
  winner: string; 
  isMatchWon: boolean; 
  onNextLeg: () => void; 
  onViewStats: () => void; 
}) {
  return (
    <motion.div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-slate-800 border border-slate-600 rounded-xl p-8 max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
      >
        <motion.div
          className="text-6xl mb-4"
          animate={{ 
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.2, 1, 1.2, 1]
          }}
          transition={{ 
            duration: 1,
            repeat: 2,
            ease: "easeInOut"
          }}
        >
          {isMatchWon ? '🏆' : '🎉'}
        </motion.div>
        
        <h3 className="text-2xl font-bold text-emerald-400 mb-2">
          {winner} Wins!
        </h3>
        
        <p className="text-slate-300 mb-8">
          {isMatchWon ? 'Match Complete!' : 'Leg Complete!'}
        </p>

        <div className="flex gap-3">
          {!isMatchWon && (
            <button
              onClick={onNextLeg}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <SkipForward className="w-4 h-4" />
              Next Leg
            </button>
          )}
          
          <button
            onClick={onViewStats}
            className={cn(
              "bg-slate-600 hover:bg-slate-500 text-white py-3 px-4 rounded-lg font-medium transition-colors",
              isMatchWon ? "flex-1" : ""
            )}
          >
            {isMatchWon ? 'View Match Stats' : 'View Stats'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Professional TV-style scoreboard for 2 players
function TVScoreboard({ 
  match, 
  currentLeg, 
  currentPlayerIndex, 
  legWins, 
  setWins 
}: {
  match: any;
  currentLeg: any;
  currentPlayerIndex: number;
  legWins: Record<string, number>;
  setWins?: Record<string, number>;
}) {
  const players = match.config.players;
  const hasMultipleSets = match.config.numberOfSets && match.config.numberOfSets > 1;

  // For 3+ players, fall back to card layout
  if (players.length > 2) {
    return (
      <div className="grid gap-4">
        {currentLeg.players.map((player: any, index: number) => (
          <div key={player.id} className={cn(
            "p-6 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm",
            index === currentPlayerIndex 
              ? "border-emerald-400 bg-emerald-400/20 shadow-lg shadow-emerald-400/25" 
              : "border-slate-600/30 bg-slate-800/80"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white uppercase tracking-wider">
                  {player.name}
                  {index === currentPlayerIndex && (
                    <span className="ml-3 text-emerald-400">🎯</span>
                  )}
                </h3>
                <div className="text-slate-300 text-sm">
                  Legs: {legWins[player.id] || 0}
                  {hasMultipleSets && ` | Sets: ${setWins?.[player.id] || 0}`}
                </div>
              </div>
              <div className="text-6xl font-bold text-white tabular-nums">
                {player.currentScore}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // TV-style 2-player layout
  const player1 = currentLeg.players[0];
  const player2 = currentLeg.players[1];
  const isPlayer1Active = currentPlayerIndex === 0;
  const isPlayer2Active = currentPlayerIndex === 1;

  return (
    <div className="relative">
      {/* Main scoreboard container with gradient background */}
      <div className="bg-gradient-to-r from-red-600 via-purple-700 to-blue-600 p-1 rounded-2xl shadow-2xl">
        <div className="bg-slate-900 rounded-2xl p-6 relative overflow-hidden">
          
          {/* Player name banners */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-lg py-3 px-4 text-center relative">
              <div className="text-white font-bold text-lg uppercase tracking-wider">
                {player1.name}
              </div>
              {isPlayer1Active && (
                <motion.div 
                  className="absolute -right-1 top-1/2 transform -translate-y-1/2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Target className="w-6 h-6 text-white" />
                </motion.div>
              )}
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg py-3 px-4 text-center relative">
              <div className="text-white font-bold text-lg uppercase tracking-wider">
                {player2.name}
              </div>
              {isPlayer2Active && (
                <motion.div 
                  className="absolute -left-1 top-1/2 transform -translate-y-1/2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Target className="w-6 h-6 text-white" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Main score circles */}
          <div className="grid grid-cols-3 gap-4 items-center mb-6">
            
            {/* Player 1 Score Circle */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-orange-500 p-1 shadow-lg">
                  <div className="bg-slate-900 rounded-full w-32 h-32 flex items-center justify-center">
                    <div className="text-5xl font-bold text-white tabular-nums">
                      {player1.currentScore}
                    </div>
                  </div>
                </div>
                {isPlayer1Active && (
                  <motion.div 
                    className="absolute inset-0 rounded-full border-2 border-red-400"
                    animate={{ 
                      boxShadow: [
                        '0 0 0px rgba(248, 113, 113, 0.8)',
                        '0 0 20px rgba(248, 113, 113, 0.8)',
                        '0 0 0px rgba(248, 113, 113, 0.8)'
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>
            </div>

            {/* Center Match Info */}
            <div className="bg-slate-800/80 rounded-xl p-4 text-center border border-slate-600/30">
              <div className="text-white font-bold text-sm uppercase tracking-wider mb-2">
                FIRST TO {match.config.numberOfLegs}
              </div>
              
              {hasMultipleSets && (
                <div className="flex justify-between items-center text-white font-bold mb-2">
                  <span className="text-red-400 text-xl">{setWins?.[player1.id] || 0}</span>
                  <span className="text-xs text-slate-400 mx-2">SETS</span>
                  <span className="text-blue-400 text-xl">{setWins?.[player2.id] || 0}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-white font-bold">
                <span className="text-red-400 text-xl">{legWins[player1.id] || 0}</span>
                <span className="text-xs text-slate-400 mx-2">LEGS</span>
                <span className="text-blue-400 text-xl">{legWins[player2.id] || 0}</span>
              </div>
            </div>

            {/* Player 2 Score Circle */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-1 shadow-lg">
                  <div className="bg-slate-900 rounded-full w-32 h-32 flex items-center justify-center">
                    <div className="text-5xl font-bold text-white tabular-nums">
                      {player2.currentScore}
                    </div>
                  </div>
                </div>
                {isPlayer2Active && (
                  <motion.div 
                    className="absolute inset-0 rounded-full border-2 border-blue-400"
                    animate={{ 
                      boxShadow: [
                        '0 0 0px rgba(96, 165, 250, 0.8)',
                        '0 0 20px rgba(96, 165, 250, 0.8)',
                        '0 0 0px rgba(96, 165, 250, 0.8)'
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Bottom match info banner */}
          <div className="bg-slate-800/60 rounded-lg py-2 px-4 text-center">
            <div className="text-slate-300 text-sm font-medium uppercase tracking-wider">
              {hasMultipleSets ? `SET ${match.currentSetIndex + 1}` : 'MATCH'} • LEG {match.currentLegIndex + 1}
              {' • '}ROUND {Math.floor((currentLeg.players[currentPlayerIndex]?.throws?.length || 0)) + 1}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GamePage() {
  const router = useRouter();
  const game = useGame();

  // Show loading state
  if (game.isLoadingMatch) {
    return <FullPageLoader message="Loading match..." />;
  }

  // Show error state
  if (game.gameState === 'error' && game.error) {
    return (
      <ErrorState 
        error={game.error} 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  // Show no match state
  if (game.gameState === 'no_match') {
    return <NoMatchState />;
  }

  // Ensure we have all required data
  if (!game.match || !game.currentLeg || !game.currentPlayer) {
    return <FullPageLoader message="Preparing game..." />;
  }

  const handleQuitMatch = async () => {
    if (confirm('Are you sure you want to quit this match? Progress will be saved.')) {
      await game.quitMatch();
      router.push('/');
    }
  };

  const handleNextLeg = async () => {
    const success = await game.startNextLeg();
    if (!success) {
      // Handle error - maybe show a toast
      console.error('Failed to start next leg');
    }
  };

  const handleViewStats = () => {
    if (game.match) {
      router.push(`/history/${game.match.id}`);
    }
  };

  const legWinner = game.currentLeg?.winnerId 
    ? game.match.config.players.find(p => p.id === game.currentLeg?.winnerId)
    : null;

  const isMatchWon = game.gameState === 'match_won';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        
        {/* Minimal header */}
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => router.push('/')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h1 className="text-lg font-bold text-white uppercase tracking-wider">LIVE DARTS</h1>
          </div>

          <button
            onClick={handleQuitMatch}
            className="text-slate-400 hover:text-red-400 transition-colors text-sm font-medium"
          >
            QUIT
          </button>
        </motion.div>

        {/* TV-Style Scoreboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <TVScoreboard
            match={game.match}
            currentLeg={game.currentLeg}
            currentPlayerIndex={game.currentPlayerIndex}
            legWins={game.legWins}
            setWins={game.setWins}
          />
        </motion.div>

        {/* Checkout Suggestions */}
        <AnimatePresence>
          {game.isCheckoutPossible && game.checkoutSuggestions.length > 0 && (
            <motion.div
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h4 className="text-yellow-200 font-bold text-center mb-3 uppercase tracking-wider">
                🎯 CHECKOUT AVAILABLE - {game.currentPlayer.currentScore}
              </h4>
              <div className="space-y-2">
                {game.checkoutSuggestions.slice(0, 3).map((suggestion, idx) => (
                  <motion.div
                    key={idx}
                    className="text-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <span className="text-yellow-100 font-mono font-bold text-lg">
                      {suggestion.combination}
                    </span>
                    <span className="text-yellow-300 text-sm ml-3">
                      ({suggestion.description})
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score Input - Only show if no winner */}
        {!legWinner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ScoreInput
              onSubmit={game.submitScore}
              currentPlayer={game.currentPlayer}
              disabled={game.isSubmittingScore}
              maxScore={180}
              className="mb-6"
            />
          </motion.div>
        )}

      </div>

      {/* Win Celebration Overlay */}
      <AnimatePresence>
        {legWinner && (
          <WinCelebration
            winner={legWinner.name}
            isMatchWon={isMatchWon}
            onNextLeg={handleNextLeg}
            onViewStats={handleViewStats}
          />
        )}
      </AnimatePresence>
    </div>
  );
}