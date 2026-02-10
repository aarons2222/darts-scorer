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
  { value: 'clear', label: 'CLR', className: 'numpad-button' },
  { value: '0', label: '0' },
  { value: 'backspace', label: '⌫', className: 'numpad-button' },
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
  colorScheme: 'red' | 'green' 
}) {
  const ringColor = colorScheme === 'red' ? 'border-dartboard-red bg-dartboard-red/10' : 'border-dartboard-green bg-dartboard-green/10';

  return (
    <div className="relative">
      {/* Dart icon for active player */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className={cn(
              "absolute -top-8 left-1/2 -translate-x-1/2",
              "flex items-center gap-2 px-3 py-1 rounded",
              "bg-dartboard-cream/90 text-dartboard-black text-sm font-bold shadow-lg font-mono"
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

      {/* Outer ring */}
      <div className={cn(
        "w-40 h-40 md:w-48 md:h-48 rounded-full",
        "border-4", ringColor,
        "p-2 shadow-lg shadow-black/50",
        isActive && "animate-pulse"
      )}>
        {/* Inner dark circle */}
        <div className="w-full h-full bg-dartboard-black rounded-full flex items-center justify-center border-2 border-dartboard-wire">
          <motion.div 
            className="text-dartboard-cream font-bold font-mono tabular-nums text-center"
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
      <div className="text-center mt-4 text-dartboard-cream">
        <div className="text-sm opacity-75 font-mono">
          Last: <span className="font-mono font-bold">
            {player.throws.length > 0 ? player.throws[player.throws.length - 1].score : '-'}
          </span>
        </div>
        <div className="text-xs opacity-60 font-mono">
          Avg: {player.throws.length > 0 
            ? ((player.throws.reduce((sum, t) => sum + t.score, 0) / player.throws.length) * 3).toFixed(1)
            : '-'
          }
        </div>
      </div>
    </div>
  );
}

function PlayerBanner({ name, colorScheme }: { name: string; colorScheme: 'red' | 'green' }) {
  const bgColor = colorScheme === 'red' ? 'bg-dartboard-red' : 'bg-dartboard-green';
  
  return (
    <div className={cn("text-center py-3 px-6", bgColor)}>
      <h2 className="text-dartboard-cream font-bold text-xl uppercase tracking-wider font-mono">
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
    <div className="flex flex-col items-center justify-center text-dartboard-cream space-y-4">
      {/* First To X label */}
      <div className="text-center">
        <div className="text-lg font-bold uppercase tracking-wider font-mono">
          FIRST TO {firstTo}
        </div>
        <div className="text-sm opacity-75 font-mono">
          {hasMultipleSets ? 'SETS' : 'LEGS'}
        </div>
      </div>

      {/* Sets row (if applicable) */}
      {hasMultipleSets && (
        <div className="text-center">
          <div className="text-sm uppercase tracking-wide text-dartboard-cream/70 mb-1 font-mono">SETS</div>
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold font-mono tabular-nums">
              {setWins[players[0].id] || 0}
            </div>
            <div className="text-lg text-dartboard-wire">|</div>
            <div className="text-2xl font-bold font-mono tabular-nums">
              {setWins[players[1].id] || 0}
            </div>
          </div>
        </div>
      )}

      {/* Legs row */}
      <div className="text-center">
        <div className="text-sm uppercase tracking-wide text-dartboard-cream/70 mb-1 font-mono">LEGS</div>
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-bold font-mono tabular-nums">
            {legWins[players[0].id] || 0}
          </div>
          <div className="text-lg text-dartboard-wire">|</div>
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
          <h3 className="text-xl font-bold text-dartboard-cream mb-1 font-mono">
            {currentPlayer.name.toUpperCase()}'S TURN
          </h3>
          <p className="text-dartboard-cream/70 text-sm">
            Score remaining: <span className="font-mono text-lg text-dartboard-red">{currentPlayer.currentScore}</span>
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
              "bg-darts-surface border-3 rounded-lg px-4 py-4",
              "text-dartboard-cream placeholder-dartboard-cream/40",
              "transition-all duration-200",
              isValidInput 
                ? "border-dartboard-green focus:border-dartboard-green" 
                : "border-dartboard-red focus:border-dartboard-red",
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
                    ? "bg-dartboard-green text-dartboard-cream" 
                    : "bg-dartboard-red text-dartboard-cream"
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
              className="text-dartboard-red text-sm mt-2 text-center font-mono"
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
            "text-sm px-3 py-1 rounded transition-colors font-mono",
            "bg-darts-surface hover:bg-darts-border text-dartboard-cream border border-darts-border"
          )}
          disabled={disabled}
        >
          {showQuickScores ? 'HIDE' : 'SHOW'} QUICK SCORES
        </button>
        
        {input && (
          <div className="text-xs text-dartboard-cream/60 font-mono">
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
                  "py-2 px-1 text-xs font-bold rounded border-2",
                  "bg-dartboard-green hover:bg-green-700 text-dartboard-cream border-green-800",
                  "transition-colors duration-150 font-mono",
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
              "numpad-button",
              "disabled:opacity-50 disabled:cursor-not-allowed",
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
          "w-full py-3 text-lg font-bold rounded-lg border-3",
          "transition-all duration-200 font-mono",
          canSubmit
            ? "button-primary"
            : "bg-darts-surface border-darts-border text-dartboard-cream/50 cursor-not-allowed",
          isSubmitting && "animate-pulse"
        )}
        whileHover={canSubmit ? { scale: 1.02 } : {}}
        whileTap={canSubmit ? { scale: 0.98 } : {}}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-dartboard-cream/30 border-t-dartboard-cream rounded-full animate-spin" />
            SUBMITTING...
          </div>
        ) : (
          'SUBMIT SCORE'
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
        className="rounded-lg overflow-hidden shadow-2xl border-4 border-dartboard-wire bg-darts-background"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Player Name Banners */}
        <div className="grid grid-cols-2">
          <PlayerBanner name={matchConfig1.name} colorScheme="red" />
          <PlayerBanner name={matchConfig2.name} colorScheme="green" />
        </div>

        {/* Main Scoreboard */}
        <div className="bg-darts-surface">
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
                colorScheme="green"
              />
            </div>
          </div>

          {/* Match Info Banner */}
          <div className="border-t border-dartboard-wire px-8 py-4">
            <div className="text-center text-dartboard-cream">
              <div className="text-lg font-semibold font-mono uppercase">
                {match.config.numberOfSets ? `SET ${match.currentSetIndex + 1}` : 'MATCH'}, 
                LEG {match.currentLegIndex + 1}
                {!legWinner && currentPlayer && (
                  <span className="ml-4 text-dartboard-green">
                    • ROUND {Math.floor(currentLeg.players[0].throws.length) + 1}
                  </span>
                )}
              </div>
              {legWinner && (
                <motion.div 
                  className="text-2xl font-bold text-dartboard-cream mt-2 font-mono"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  🎯 {legWinner.name.toUpperCase()} WINS THE LEG! 🎯
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