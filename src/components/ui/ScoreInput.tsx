'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ScoreInputProps {
  onSubmit: (score: number) => Promise<boolean>;
  onClear?: () => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  maxScore?: number;
  className?: string;
  currentPlayer?: {
    name: string;
    currentScore: number;
  };
}

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
  { value: 'clear', label: 'Clear', className: 'bg-red-500/20 hover:bg-red-500/30 text-red-200' },
  { value: '0', label: '0' },
  { value: 'backspace', label: '⌫', className: 'bg-slate-500/20 hover:bg-slate-500/30 text-slate-200' },
];

const QUICK_SCORES = [26, 41, 45, 60, 81, 85, 95, 100, 140, 180];

export function ScoreInput({ 
  onSubmit, 
  onClear, 
  disabled = false, 
  isSubmitting = false,
  maxScore = 180,
  className,
  currentPlayer
}: ScoreInputProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showQuickScores, setShowQuickScores] = useState(false);

  const currentScore = input ? parseInt(input) : 0;
  const isValidInput = currentScore >= 0 && currentScore <= maxScore;
  const canSubmit = isValidInput && currentScore > 0 && !disabled && !isSubmitting;

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
    if (!canSubmit) return;
    
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

  return (
    <div className={cn('w-full max-w-sm mx-auto', className)}>
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
      <motion.div 
        className="mb-6"
        layout
      >
        <div className="relative">
          <input
            type="text"
            value={input}
            readOnly
            placeholder="Enter score"
            className={cn(
              "w-full text-center text-4xl font-mono font-bold",
              "bg-slate-800/50 border-2 rounded-xl px-4 py-6",
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
      <div className="flex justify-between items-center mb-4">
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
                  "transition-colors duration-150",
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
      <div className="grid grid-cols-3 gap-3 mb-6">
        {NUMPAD_BUTTONS.map((button) => (
          <motion.button
            key={button.value}
            onClick={() => button.value === 'submit' ? handleSubmit() : handleInput(button.value)}
            className={cn(
              "py-4 text-xl font-bold rounded-xl",
              "bg-slate-700/50 hover:bg-slate-600/50 text-white",
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
          "w-full py-4 text-lg font-bold rounded-xl",
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