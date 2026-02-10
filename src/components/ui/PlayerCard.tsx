'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { GamePlayer, GameThrow } from '@/types/game';

interface PlayerCardProps {
  player: GamePlayer;
  isActive?: boolean;
  isWinner?: boolean;
  showDetailedStats?: boolean;
  position?: number;
  className?: string;
}

interface StatItemProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  className?: string;
}

function StatItem({ label, value, highlight, className }: StatItemProps) {
  return (
    <div className={cn("text-center", className)}>
      <div className={cn(
        "font-mono font-bold",
        highlight ? "text-dartboard-red" : "text-dartboard-cream",
        typeof value === 'number' && value >= 100 ? "text-lg" : "text-sm"
      )}>
        {value}
      </div>
      <div className="text-xs text-dartboard-cream/60 uppercase tracking-wide font-mono">
        {label}
      </div>
    </div>
  );
}

function RecentScores({ throws }: { throws: GameThrow[] }) {
  const recent = throws.slice(-5);
  
  return (
    <div className="flex justify-center gap-1 mt-2">
      <AnimatePresence>
        {recent.map((throwData, idx) => (
          <motion.span
            key={`${throwData.roundNumber}-${idx}`}
            className={cn(
              "text-xs px-2 py-1 rounded font-mono font-medium border",
              throwData.score >= 140 ? "bg-dartboard-red/30 text-dartboard-cream border-dartboard-red" :
              throwData.score >= 100 ? "bg-dartboard-green/30 text-dartboard-cream border-dartboard-green" :
              throwData.score >= 80 ? "bg-dartboard-green/20 text-dartboard-cream border-dartboard-green/50" :
              "bg-darts-surface text-dartboard-cream border-darts-border",
              throwData.isCheckout && "ring-2 ring-dartboard-red"
            )}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            {throwData.score}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function PlayerCard({ 
  player, 
  isActive = false, 
  isWinner = false, 
  showDetailedStats = false,
  position,
  className 
}: PlayerCardProps) {
  const stats = calculatePlayerStats(player);
  
  return (
    <motion.div
      className={cn(
        "relative rounded-lg border-2 transition-all duration-300",
        "bg-darts-surface",
        isActive && "border-dartboard-red bg-darts-surface shadow-lg",
        isWinner && "border-dartboard-green bg-darts-surface shadow-lg",
        !isActive && !isWinner && "border-darts-border",
        className
      )}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Position indicator */}
      {position && (
        <div className={cn(
          "absolute -top-3 -left-3 w-8 h-8 rounded-full",
          "bg-darts-surface border-2 border-darts-border",
          "flex items-center justify-center text-sm font-bold text-dartboard-cream font-mono",
          isActive && "bg-dartboard-red border-dartboard-red",
          isWinner && "bg-dartboard-green border-dartboard-green"
        )}>
          {position}
        </div>
      )}

      {/* Active indicator */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute -top-1 -right-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <div className="flex items-center gap-1 bg-dartboard-red text-dartboard-cream text-xs font-bold px-2 py-1 rounded font-mono">
              <div className="w-2 h-2 bg-dartboard-cream rounded-full animate-pulse" />
              THROWING
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner indicator */}
      <AnimatePresence>
        {isWinner && (
          <motion.div
            className="absolute -top-1 -right-1"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
          >
            <div className="flex items-center gap-1 bg-dartboard-green text-dartboard-cream text-xs font-bold px-2 py-1 rounded font-mono">
              🎯 WINNER
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4">
        {/* Player name and current score */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className={cn(
              "text-lg font-bold font-mono",
              isActive ? "text-dartboard-red" :
              isWinner ? "text-dartboard-green" :
              "text-dartboard-cream"
            )}>
              {player.name.toUpperCase()}
            </h3>
            {showDetailedStats && (
              <div className="text-xs text-dartboard-cream/60 font-mono">
                Starting: {player.startingScore}
              </div>
            )}
          </div>
          
          <div className="text-right">
            <motion.div 
              className={cn(
                "text-3xl font-mono font-bold tabular-nums",
                player.currentScore === 0 ? "text-dartboard-green" :
                player.currentScore <= 40 ? "text-dartboard-red" :
                "text-dartboard-cream"
              )}
              key={player.currentScore}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {player.currentScore}
            </motion.div>
            
            {player.throws.length > 0 && (
              <div className="text-xs text-dartboard-cream/60 font-mono">
                Last: <span className="font-mono">{player.throws[player.throws.length - 1]?.score}</span>
              </div>
            )}
          </div>
        </div>

        {/* Basic stats row */}
        <div className="grid grid-cols-3 gap-3 mb-2">
          <StatItem 
            label="Average" 
            value={stats.average.toFixed(1)} 
            highlight={stats.average >= 80}
          />
          <StatItem 
            label="High" 
            value={stats.highestScore} 
            highlight={stats.highestScore >= 140}
          />
          <StatItem 
            label="180s" 
            value={stats.scores180} 
            highlight={stats.scores180 > 0}
          />
        </div>

        {/* Detailed stats (if enabled) */}
        {showDetailedStats && (
          <motion.div
            className="grid grid-cols-4 gap-2 pt-3 border-t border-darts-border"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.2 }}
          >
            <StatItem label="Throws" value={stats.totalThrows} />
            <StatItem label="100+" value={stats.scores100Plus} />
            <StatItem label="140+" value={stats.scores140Plus} />
            <StatItem 
              label="First 9" 
              value={stats.first9DartAverage > 0 ? stats.first9DartAverage.toFixed(1) : '-'} 
            />
          </motion.div>
        )}

        {/* Recent scores */}
        {player.throws.length > 0 && (
          <RecentScores throws={player.throws} />
        )}
      </div>

      {/* Checkout indicator */}
      <AnimatePresence>
        {player.currentScore <= 170 && player.currentScore > 1 && !isWinner && (
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-dartboard-red bg-dartboard-red/10"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="absolute top-2 left-2 bg-dartboard-red text-dartboard-cream text-xs font-bold px-2 py-1 rounded font-mono">
              ON A FINISH
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Helper function to calculate player statistics
function calculatePlayerStats(player: GamePlayer) {
  const throws = player.throws;
  
  if (throws.length === 0) {
    return {
      totalThrows: 0,
      average: 0,
      first9DartAverage: 0,
      highestScore: 0,
      scores100Plus: 0,
      scores140Plus: 0,
      scores180: 0,
    };
  }

  const totalScore = throws.reduce((sum, t) => sum + t.score, 0);
  const average = (totalScore / throws.length) * 3;

  // First 9 dart average (first 3 rounds)
  const first9Throws = throws.slice(0, 3);
  const first9Score = first9Throws.reduce((sum, t) => sum + t.score, 0);
  const first9DartAverage = first9Throws.length > 0 ? (first9Score / first9Throws.length) * 3 : 0;

  return {
    totalThrows: throws.length,
    average: Math.round(average * 10) / 10,
    first9DartAverage: Math.round(first9DartAverage * 10) / 10,
    highestScore: Math.max(...throws.map(t => t.score), 0),
    scores100Plus: throws.filter(t => t.score >= 100).length,
    scores140Plus: throws.filter(t => t.score >= 140).length,
    scores180: throws.filter(t => t.score === 180).length,
  };
}