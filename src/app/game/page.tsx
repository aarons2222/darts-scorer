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
    <div className="min-h-screen bg-darts-background flex items-center justify-center p-4">
      <motion.div
        className="bg-darts-surface border-2 border-dartboard-red rounded-lg p-8 max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <AlertTriangle className="w-12 h-12 text-dartboard-red mx-auto mb-4" />
        <h2 className="text-xl font-bold text-dartboard-red mb-2 font-mono">GAME ERROR</h2>
        <p className="text-dartboard-cream/80 mb-6 text-sm font-mono">{error}</p>
        
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 button-primary py-3 px-4 font-mono"
          >
            RETRY
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 button-secondary py-3 px-4 font-mono"
          >
            HOME
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function NoMatchState() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-darts-background flex items-center justify-center p-4">
      <motion.div
        className="bg-darts-surface border-2 border-darts-border rounded-lg p-8 max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Target className="w-12 h-12 text-dartboard-cream/60 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-dartboard-cream mb-2 font-mono">NO ACTIVE MATCH</h2>
        <p className="text-dartboard-cream/70 mb-6 font-mono">Start a new match to begin scoring</p>
        
        <button
          onClick={() => router.push('/setup')}
          className="w-full button-primary py-3 font-mono"
        >
          START NEW MATCH
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
      className="fixed inset-0 bg-dartboard-black/90 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-darts-surface border-2 border-dartboard-green rounded-lg p-8 max-w-md w-full text-center"
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
          {isMatchWon ? '🎯' : '🎉'}
        </motion.div>
        
        <h3 className="text-2xl font-bold text-dartboard-green mb-2 font-mono">
          {winner.toUpperCase()} WINS!
        </h3>
        
        <p className="text-dartboard-cream/80 mb-8 font-mono">
          {isMatchWon ? 'MATCH COMPLETE!' : 'LEG COMPLETE!'}
        </p>

        <div className="flex gap-3">
          {!isMatchWon && (
            <button
              onClick={onNextLeg}
              className="flex-1 button-primary py-3 px-4 font-mono flex items-center justify-center gap-2"
            >
              <SkipForward className="w-4 h-4" />
              NEXT LEG
            </button>
          )}
          
          <button
            onClick={onViewStats}
            className={cn(
              "button-secondary py-3 px-4 font-mono",
              isMatchWon ? "flex-1" : ""
            )}
          >
            {isMatchWon ? 'VIEW MATCH STATS' : 'VIEW STATS'}
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
            "p-6 rounded-lg border-2 transition-all duration-300",
            index === currentPlayerIndex 
              ? "border-dartboard-red bg-darts-surface shadow-lg" 
              : "border-darts-border bg-darts-surface"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-dartboard-cream uppercase tracking-wider font-mono">
                  {player.name}
                  {index === currentPlayerIndex && (
                    <span className="ml-3 text-dartboard-red">🎯</span>
                  )}
                </h3>
                <div className="text-dartboard-cream/70 text-sm font-mono">
                  Legs: {legWins[player.id] || 0}
                  {hasMultipleSets && ` | Sets: ${setWins?.[player.id] || 0}`}
                </div>
              </div>
              <div className="text-6xl font-bold text-dartboard-cream tabular-nums font-mono">
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
      {/* Main scoreboard container with dartboard styling */}
      <div className="bg-dartboard-wire p-1 rounded-lg shadow-2xl">
        <div className="bg-darts-surface rounded-lg p-6 relative overflow-hidden">
          
          {/* Player name banners */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-dartboard-red py-3 px-4 text-center relative">
              <div className="text-dartboard-cream font-bold text-lg uppercase tracking-wider font-mono">
                {player1.name}
              </div>
              {isPlayer1Active && (
                <motion.div 
                  className="absolute -right-1 top-1/2 transform -translate-y-1/2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Target className="w-6 h-6 text-dartboard-cream" />
                </motion.div>
              )}
            </div>
            <div className="bg-dartboard-green py-3 px-4 text-center relative">
              <div className="text-dartboard-cream font-bold text-lg uppercase tracking-wider font-mono">
                {player2.name}
              </div>
              {isPlayer2Active && (
                <motion.div 
                  className="absolute -left-1 top-1/2 transform -translate-y-1/2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Target className="w-6 h-6 text-dartboard-cream" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Main score circles */}
          <div className="grid grid-cols-3 gap-4 items-center mb-6">
            
            {/* Player 1 Score Circle */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full border-4 border-dartboard-red bg-dartboard-red/10 p-1 shadow-lg">
                  <div className="bg-dartboard-black rounded-full w-32 h-32 flex items-center justify-center border-2 border-dartboard-wire">
                    <div className="text-5xl font-bold text-dartboard-cream tabular-nums font-mono">
                      {player1.currentScore}
                    </div>
                  </div>
                </div>
                {isPlayer1Active && (
                  <motion.div 
                    className="absolute inset-0 rounded-full border-2 border-dartboard-cream animate-pulse"
                  />
                )}
              </div>
            </div>

            {/* Center Match Info */}
            <div className="bg-darts-background rounded p-4 text-center border-2 border-darts-border">
              <div className="text-dartboard-cream font-bold text-sm uppercase tracking-wider mb-2 font-mono">
                FIRST TO {match.config.numberOfLegs}
              </div>
              
              {hasMultipleSets && (
                <div className="flex justify-between items-center text-dartboard-cream font-bold mb-2">
                  <span className="text-dartboard-red text-xl font-mono">{setWins?.[player1.id] || 0}</span>
                  <span className="text-xs text-dartboard-cream/70 mx-2 font-mono">SETS</span>
                  <span className="text-dartboard-green text-xl font-mono">{setWins?.[player2.id] || 0}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-dartboard-cream font-bold">
                <span className="text-dartboard-red text-xl font-mono">{legWins[player1.id] || 0}</span>
                <span className="text-xs text-dartboard-cream/70 mx-2 font-mono">LEGS</span>
                <span className="text-dartboard-green text-xl font-mono">{legWins[player2.id] || 0}</span>
              </div>
            </div>

            {/* Player 2 Score Circle */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full border-4 border-dartboard-green bg-dartboard-green/10 p-1 shadow-lg">
                  <div className="bg-dartboard-black rounded-full w-32 h-32 flex items-center justify-center border-2 border-dartboard-wire">
                    <div className="text-5xl font-bold text-dartboard-cream tabular-nums font-mono">
                      {player2.currentScore}
                    </div>
                  </div>
                </div>
                {isPlayer2Active && (
                  <motion.div 
                    className="absolute inset-0 rounded-full border-2 border-dartboard-cream animate-pulse"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Bottom match info banner */}
          <div className="bg-darts-background border-t border-dartboard-wire py-2 px-4 text-center">
            <div className="text-dartboard-cream text-sm font-medium uppercase tracking-wider font-mono">
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
    <div className="min-h-screen bg-darts-background">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        
        {/* Minimal header */}
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => router.push('/')}
            className="text-dartboard-cream/70 hover:text-dartboard-cream transition-colors"
          >
            <Home className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h1 className="text-lg font-bold text-dartboard-cream uppercase tracking-wider font-mono">LIVE DARTS</h1>
          </div>

          <button
            onClick={handleQuitMatch}
            className="text-dartboard-cream/70 hover:text-dartboard-red transition-colors text-sm font-medium font-mono"
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
              className="bg-dartboard-red/20 border-2 border-dartboard-red rounded-lg p-4 mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h4 className="text-dartboard-cream font-bold text-center mb-3 uppercase tracking-wider font-mono">
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
                    <span className="text-dartboard-cream font-mono font-bold text-lg">
                      {suggestion.combination}
                    </span>
                    <span className="text-dartboard-cream/70 text-sm ml-3 font-mono">
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