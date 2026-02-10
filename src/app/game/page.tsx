'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Home, SkipForward } from 'lucide-react';

import { useGame } from '@/hooks/useGame';
import { Scoreboard } from '@/components/ui/Scoreboard';
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
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-6xl mb-6">🎯</div>
        <h2 className="text-2xl font-bold text-white mb-4">No Active Match</h2>
        <p className="text-slate-300 mb-8">
          There's no match in progress. Start a new match to begin playing.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/setup')}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            Start New Match
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-slate-600 hover:bg-slate-500 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function LegCompleteModal({ 
  winner, 
  onNextLeg, 
  onViewStats,
  isMatchWon = false 
}: { 
  winner: string; 
  onNextLeg: () => void;
  onViewStats: () => void;
  isMatchWon?: boolean;
}) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
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
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => router.push('/')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Home className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">Live Match</h1>
            <div className="text-xs text-slate-400">
              Round {Math.floor(game.currentPlayer.throws.length) + 1}
            </div>
          </div>

          <button
            onClick={handleQuitMatch}
            className="text-slate-400 hover:text-red-400 transition-colors text-sm font-medium"
          >
            Quit
          </button>
        </motion.div>

        {/* Scoreboard with Integrated Score Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Scoreboard
            match={game.match}
            currentLeg={game.currentLeg}
            currentPlayerIndex={game.currentPlayerIndex}
            legWins={game.legWins}
            setWins={game.setWins}
            onSubmit={game.submitScore}
            disabled={game.isSubmittingScore || isMatchWon}
            isSubmitting={game.isSubmittingScore}
            className="mb-8"
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
              <h4 className="text-yellow-200 font-bold text-center mb-3">
                🎯 Checkout Available - {game.currentPlayer.currentScore}
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
                    <span className="text-yellow-100 font-mono font-bold">
                      {suggestion.combination}
                    </span>
                    <span className="text-yellow-300 text-sm ml-2">
                      ({suggestion.description})
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score input is now integrated into the Scoreboard component */}

        {/* Error message */}
        <AnimatePresence>
          {game.error && (
            <motion.div
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-4 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <p className="text-red-400 text-sm">{game.error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading overlay for score submission */}
        <AnimatePresence>
          {game.isSubmittingScore && (
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-slate-800/90 rounded-lg p-6">
                <LoadingSpinner message="Recording score..." />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Leg/Match Complete Modal */}
        <AnimatePresence>
          {(game.gameState === 'leg_won' || game.gameState === 'match_won') && legWinner && (
            <LegCompleteModal
              winner={legWinner.name}
              onNextLeg={handleNextLeg}
              onViewStats={handleViewStats}
              isMatchWon={isMatchWon}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}