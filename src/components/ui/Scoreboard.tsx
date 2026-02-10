'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target } from 'lucide-react';
import { cn } from '@/utils/cn';
import { GameMatch, GameLeg, GamePlayer } from '@/types/game';

interface ScoreboardProps {
  match: GameMatch;
  currentLeg: GameLeg;
  currentPlayerIndex: number;
  legWins: Record<string, number>;
  setWins: Record<string, number>;
  className?: string;
  // Score input props
  onSubmit?: (score: number) => Promise<boolean>;
  onClear?: () => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  maxScore?: number;
}

// Quick score buttons
const QUICK_SCORES = [26, 41, 45, 60, 81, 85, 95, 100, 140, 180];

// Numpad buttons
const NUMPAD_BUTTONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '7', label: '7' },
  { value: '8', label: '8' },
  { value: '9', label: '9' },
  { value: 'clear', label: 'Clear', className: 'bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-500/30' },
  { value: '0', label: '0' },
  { value: 'backspace', label: '⌫', className: 'bg-slate-500/20 hover:bg-slate-500/30 text-slate-200 border-slate-500/30' },
];

function CircularScore({ 
  score, 
  player, 
  isActive, 
  colorScheme 
}: { 
  score: number; 
  player: GamePlayer;
  isActive: boolean; 
  colorScheme: 'red' | 'blue' 
}) {
  const ringColor = colorScheme === 'red' ? 'from-red-500 to-red-600' : 'from-blue-500 to-blue-600';
  const glowColor = colorScheme === 'red' ? 'shadow-red-500/20' : 'shadow-blue-500/20';

  return (
    <div className="relative">
      {/* Dart icon for active player */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className={cn(
              "absolute -top-8 left-1/2 -translate-x-1/2",
              "flex items-center gap-2 px-3 py-1 rounded-full",
              "bg-white/90 text-gray-800 text-sm font-bold shadow-lg"
            )}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Target className="w-4 h-4" />
            THROWING
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outer ring with gradient */}
      <div className={cn(
        "w-40 h-40 md:w-48 md:h-48 rounded-full",
        "bg-gradient-to-br", ringColor,
        "p-2 shadow-lg", glowColor,
        isActive && "animate-pulse"
      )}>
        {/* Inner dark navy circle */}
        <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border-2 border-slate-700">
          <motion.div 
            className="text-white font-bold font-mono tabular-nums text-center"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)' }}
            key={score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {score}
          </motion.div>
        </div>
      </div>

      {/* Player stats below */}
      <div className="text-center mt-4 text-white">
        <div className="text-sm opacity-75">
          Last: <span className="font-mono font-bold">
            {player.throws.length > 0 ? player.throws[player.throws.length - 1].score : '-'}
          </span>
        </div>
        <div className="text-xs opacity-60">
          Avg: {player.throws.length > 0 
            ? ((player.throws.reduce((sum, t) => sum + t.score, 0) / player.throws.length) * 3).toFixed(1)
            : '-'
          }
        </div>
      </div>
    </div>
  );
}

function PlayerBanner({ name, colorScheme }: { name: string; colorScheme: 'red' | 'blue' }) {
  const bgColor = colorScheme === 'red' ? 'bg-red-600' : 'bg-blue-600';
  
  return (
    <div className={cn("text-center py-3 px-6 rounded-t-lg", bgColor)}>
      <h2 className="text-white font-bold text-xl uppercase tracking-wider">
        {name}
      </h2>
    </div>
  );
}

function CenterPanel({ 
  match, 
  legWins, 
  setWins 
}: { 
  match: GameMatch; 
  legWins: Record<string, number>; 
  setWins: Record<string, number> 
}) {
  const hasMultipleSets = match.config.numberOfSets && match.config.numberOfSets > 1;
  const players = match.config.players;
  const firstTo = hasMultipleSets ? Math.ceil((match.config.numberOfSets || 1) / 2) : Math.ceil(match.config.numberOfLegs / 2);

  return (
    <div className="flex flex-col items-center justify-center text-white space-y-4">
      {/* First To X label */}
      <div className="text-center">
        <div className="text-lg font-bold uppercase tracking-wider">
          First To {firstTo}
        </div>
        <div className="text-sm opacity-75">
          {hasMultipleSets ? 'Sets' : 'Legs'}
        </div>
      </div>

      {/* Sets row (if applicable) */}
      {hasMultipleSets && (
        <div className="text-center">
          <div className="text-sm uppercase tracking-wide text-gray-300 mb-1">Sets</div>
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold font-mono tabular-nums">
              {setWins[players[0].id] || 0}
            </div>
            <div className="text-lg text-gray-400">|</div>
            <div className="text-2xl font-bold font-mono tabular-nums">
              {setWins[players[1].id] || 0}
            </div>
          </div>
        </div>
      )}

      {/* Legs row */}
      <div className="text-center">
        <div className="text-sm uppercase tracking-wide text-gray-300 mb-1">Legs</div>
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-bold font-mono tabular-nums">
            {legWins[players[0].id] || 0}
          </div>
          <div className="text-lg text-gray-400">|</div>
          <div className="text-3xl font-bold font-mono tabular-nums">
            {legWins[players[1].id] || 0}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreInput({ 
  onSubmit, 
  onClear, 
  disabled = false, 
  isSubmitting = false,
  maxScore = 180,
  currentPlayer
}: {
  onSubmit?: (score: number) => Promise<boolean>;
  onClear?: () => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  maxScore?: number;
  currentPlayer?: GamePlayer;
}) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showQuickScores, setShowQuickScores] = useState(false);

  const currentScore = input ? parseInt(input) : 0;
  const isValidInput = currentScore >= 0 && currentScore <= maxScore;
  const canSubmit = isValidInput && currentScore > 0 && !disabled && !isSubmitting && onSubmit;

  // Clear input after successful submission
  useEffect(() => {
    if (!isSubmitting && input && error === null) {
      const timer = setTimeout(() => setInput(''), 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isSubmitting, input, error]);

  // Clear error after a few seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error]);

  const handleInput = useCallback((value: string) => {
    if (disabled) return;
    
    setError(null);
    
    if (value === 'clear') {
      setInput('');
      onClear?.();
      return;
    }
    
    if (value === 'backspace') {
      setInput(prev => prev.slice(0, -1));
      return;
    }
    
    // Prevent input longer than 3 digits
    if (input.length >= 3) return;
    
    const newInput = input + value;
    const score = parseInt(newInput);
    
    if (score <= maxScore) {
      setInput(newInput);
    }
  }, [input, disabled, maxScore, onClear]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !onSubmit) return;
    
    try {
      const success = await onSubmit(currentScore);
      if (success) {
        setInput('');
        setError(null);
      } else {
        setError('Failed to submit score');
      }
    } catch (err) {
      setError('Failed to submit score');
    }
  }, [canSubmit, currentScore, onSubmit]);

  const handleQuickScore = useCallback((score: number) => {
    setInput(score.toString());
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (disabled) return;
      
      if (e.key >= '0' && e.key <= '9') {
        handleInput(e.key);
      } else if (e.key === 'Backspace') {
        handleInput('backspace');
      } else if (e.key === 'Escape') {
        handleInput('clear');
      } else if (e.key === 'Enter') {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [disabled, handleInput, handleSubmit]);

  if (!onSubmit) return null;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Current Player */}
      {currentPlayer && (
        <motion.div 
          className="text-center mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xl font-bold text-white mb-1">
            {currentPlayer.name}'s Turn
          </h3>
          <p className="text-gray-300 text-sm">
            Score remaining: <span className="font-mono text-lg">{currentPlayer.currentScore}</span>
          </p>
        </motion.div>
      )}

      {/* Score Display */}
      <motion.div className="mb-4" layout>
        <div className="relative">
          <input
            type="text"
            value={input}
            readOnly
            placeholder="Enter score"
            className={cn(
              "w-full text-center text-3xl font-mono font-bold",
              "bg-slate-800/50 border-2 rounded-xl px-4 py-4",
              "text-white placeholder-gray-400",
              "transition-all duration-200",
              isValidInput 
                ? "border-emerald-500/50 focus:border-emerald-500" 
                : "border-red-500/50 focus:border-red-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          
          {/* Score validation */}
          <AnimatePresence>
            {input && (
              <motion.div
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2",
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  isValidInput 
                    ? "bg-emerald-500 text-white" 
                    : "bg-red-500 text-white"
                )}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                {isValidInput ? '✓' : '✗'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              className="text-red-400 text-sm mt-2 text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Scores Toggle */}
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={() => setShowQuickScores(!showQuickScores)}
          className={cn(
            "text-sm px-3 py-1 rounded-full transition-colors",
            "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300"
          )}
          disabled={disabled}
        >
          {showQuickScores ? 'Hide' : 'Show'} Quick Scores
        </button>
        
        {input && (
          <div className="text-xs text-slate-400">
            {currentScore} / {maxScore}
          </div>
        )}
      </div>

      {/* Quick Scores */}
      <AnimatePresence>
        {showQuickScores && (
          <motion.div
            className="grid grid-cols-5 gap-2 mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {QUICK_SCORES.map((score) => (
              <motion.button
                key={score}
                onClick={() => handleQuickScore(score)}
                className={cn(
                  "py-2 px-1 text-xs font-medium rounded-lg",
                  "bg-blue-500/20 hover:bg-blue-500/30 text-blue-200",
                  "transition-colors duration-150 border border-blue-500/30",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                disabled={disabled}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {score}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {NUMPAD_BUTTONS.map((button) => (
          <motion.button
            key={button.value}
            onClick={() => handleInput(button.value)}
            className={cn(
              "py-3 text-lg font-bold rounded-lg",
              "bg-slate-700/50 hover:bg-slate-600/50 text-white",
              "border border-slate-600/30",
              "transition-colors duration-150",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "active:scale-95 transform",
              button.className
            )}
            disabled={disabled}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {button.label}
          </motion.button>
        ))}
      </div>

      {/* Submit Button */}
      <motion.button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={cn(
          "w-full py-3 text-lg font-bold rounded-lg",
          "transition-all duration-200",
          canSubmit
            ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
            : "bg-slate-600/50 text-slate-400 cursor-not-allowed",
          isSubmitting && "animate-pulse"
        )}
        whileHover={canSubmit ? { scale: 1.02 } : {}}
        whileTap={canSubmit ? { scale: 0.98 } : {}}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting...
          </div>
        ) : (
          'Submit Score'
        )}
      </motion.button>
    </div>
  );
}

function MultiPlayerLayout({ 
  match, 
  currentLeg, 
  currentPlayerIndex, 
  legWins, 
  setWins 
}: { 
  match: GameMatch; 
  currentLeg: GameLeg; 
  currentPlayerIndex: number; 
  legWins: Record<string, number>; 
  setWins: Record<string, number> 
}) {
  const players = match.config.players;

  return (
    <div className="space-y-4">
      {/* Match Info */}
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-600/30">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-white mb-1">
            🎯 {match.config.numberOfSets ? `Set ${match.currentSetIndex + 1}` : 'Match'}
            , Leg {match.currentLegIndex + 1}
          </h2>
          <p className="text-slate-300 text-sm">
            {players.map(p => p.name).join(' vs ')}
          </p>
        </div>

        {/* Leg scores */}
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${players.length}, 1fr)` }}>
          {players.map(player => (
            <div key={player.id} className="text-center">
              <div className="text-2xl font-bold text-white">
                {legWins[player.id] || 0}
              </div>
              <div className="text-xs text-slate-400">{player.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Player Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {currentLeg.players.map((player, index) => (
          <motion.div
            key={player.id}
            className={cn(
              "bg-slate-800/50 border rounded-xl p-4",
              index === currentPlayerIndex ? "border-emerald-500/50 bg-emerald-500/5" : "border-slate-600/30"
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{player.name}</h3>
              <div className="text-3xl font-mono font-bold text-white">
                {player.currentScore}
              </div>
            </div>
            <div className="text-sm text-slate-400 mt-2">
              Last: {player.throws.length > 0 ? player.throws[player.throws.length - 1].score : '-'}
              {' • '}
              Avg: {player.throws.length > 0 
                ? ((player.throws.reduce((sum, t) => sum + t.score, 0) / player.throws.length) * 3).toFixed(1)
                : '-'
              }
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function Scoreboard({ 
  match, 
  currentLeg, 
  currentPlayerIndex, 
  legWins, 
  setWins,
  className,
  onSubmit,
  onClear,
  disabled,
  isSubmitting,
  maxScore = 180
}: ScoreboardProps) {
  const currentPlayer = currentLeg.players[currentPlayerIndex];
  const legWinner = currentLeg.winnerId 
    ? match.config.players.find(p => p.id === currentLeg.winnerId)
    : null;

  const isTwoPlayer = match.config.players.length === 2;

  if (!isTwoPlayer) {
    return (
      <div className={cn('w-full max-w-6xl mx-auto space-y-6', className)}>
        <MultiPlayerLayout 
          match={match}
          currentLeg={currentLeg}
          currentPlayerIndex={currentPlayerIndex}
          legWins={legWins}
          setWins={setWins}
        />
        
        {/* Score Input for 3+ players */}
        {!legWinner && (
          <div className="mt-8">
            <ScoreInput
              onSubmit={onSubmit}
              onClear={onClear}
              disabled={disabled}
              isSubmitting={isSubmitting}
              maxScore={maxScore}
              currentPlayer={currentPlayer}
            />
          </div>
        )}
      </div>
    );
  }

  // TV-style layout for 2 players
  const player1 = currentLeg.players[0];
  const player2 = currentLeg.players[1];
  const matchConfig1 = match.config.players[0];
  const matchConfig2 = match.config.players[1];

  return (
    <div className={cn('w-full max-w-7xl mx-auto', className)}>
      {/* TV Scoreboard Container */}
      <motion.div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #8b5cf6 50%, #3b82f6 100%)'
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Player Name Banners */}
        <div className="grid grid-cols-2">
          <PlayerBanner name={matchConfig1.name} colorScheme="red" />
          <PlayerBanner name={matchConfig2.name} colorScheme="blue" />
        </div>

        {/* Main Scoreboard */}
        <div className="bg-slate-900/95 backdrop-blur-sm">
          <div className="grid grid-cols-5 items-center p-8 gap-8">
            {/* Player 1 Score Circle */}
            <div className="col-span-2 flex justify-center">
              <CircularScore
                score={player1.currentScore}
                player={player1}
                isActive={currentPlayerIndex === 0}
                colorScheme="red"
              />
            </div>

            {/* Center Panel */}
            <div className="col-span-1">
              <CenterPanel 
                match={match}
                legWins={legWins}
                setWins={setWins}
              />
            </div>

            {/* Player 2 Score Circle */}
            <div className="col-span-2 flex justify-center">
              <CircularScore
                score={player2.currentScore}
                player={player2}
                isActive={currentPlayerIndex === 1}
                colorScheme="blue"
              />
            </div>
          </div>

          {/* Match Info Banner */}
          <div className="border-t border-slate-700/50 px-8 py-4">
            <div className="text-center text-white">
              <div className="text-lg font-semibold">
                {match.config.numberOfSets ? `Set ${match.currentSetIndex + 1}` : 'Match'}, 
                Leg {match.currentLegIndex + 1}
                {!legWinner && currentPlayer && (
                  <span className="ml-4 text-emerald-400">
                    • Round {Math.floor(currentLeg.players[0].throws.length) + 1}
                  </span>
                )}
              </div>
              {legWinner && (
                <motion.div 
                  className="text-2xl font-bold text-yellow-400 mt-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  🏆 {legWinner.name} Wins the Leg! 🏆
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Integrated Score Input */}
      {!legWinner && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ScoreInput
            onSubmit={onSubmit}
            onClear={onClear}
            disabled={disabled}
            isSubmitting={isSubmitting}
            maxScore={maxScore}
            currentPlayer={currentPlayer}
          />
        </motion.div>
      )}
    </div>
  );
}