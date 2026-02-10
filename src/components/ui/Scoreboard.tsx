'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PlayerCard } from './PlayerCard';
import { cn } from '@/utils/cn';
import { GameMatch, GameLeg } from '@/types/game';

interface ScoreboardProps {
  match: GameMatch;
  currentLeg: GameLeg;
  currentPlayerIndex: number;
  legWins: Record<string, number>;
  setWins: Record<string, number>;
  className?: string;
}

interface MatchInfoProps {
  match: GameMatch;
  legWins: Record<string, number>;
  setWins?: Record<string, number>;
}

function MatchInfo({ match, legWins, setWins }: MatchInfoProps) {
  const currentSet = match.sets[match.currentSetIndex];
  const hasMultipleSets = match.config.numberOfSets && match.config.numberOfSets > 1;

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-600/30">
      {/* Match header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white mb-1">
          🎯 {hasMultipleSets ? `Set ${match.currentSetIndex + 1}` : 'Match'}
          {currentSet && `, Leg ${match.currentLegIndex + 1}`}
        </h2>
        <p className="text-slate-300 text-sm">
          {match.config.players.map(p => p.name).join(' vs ')}
        </p>
      </div>

      {/* Format info */}
      <div className="flex justify-center items-center gap-4 text-sm text-slate-400 mb-4">
        {hasMultipleSets && (
          <span>Best of {match.config.numberOfSets} sets</span>
        )}
        <span>Best of {match.config.numberOfLegs} legs</span>
      </div>

      {/* Set scores (if applicable) */}
      {hasMultipleSets && setWins && (
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-center text-sm font-medium text-slate-300 mb-2">Sets</h3>
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${match.config.players.length}, 1fr)` }}>
            {match.config.players.map(player => (
              <div key={player.id} className="text-center">
                <div className="text-2xl font-bold text-white">
                  {setWins[player.id] || 0}
                </div>
                <div className="text-xs text-slate-400">{player.name}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Leg scores */}
      <div>
        <h3 className="text-center text-sm font-medium text-slate-300 mb-2">
          {hasMultipleSets ? 'Current Set - Legs' : 'Legs'}
        </h3>
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${match.config.players.length}, 1fr)` }}>
          {match.config.players.map(player => (
            <motion.div 
              key={player.id} 
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="text-3xl font-bold text-white"
                key={legWins[player.id]}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {legWins[player.id] || 0}
              </motion.div>
              <div className="text-xs text-slate-400">{player.name}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CheckoutBanner({ player }: { player: { name: string; currentScore: number } }) {
  if (player.currentScore > 170 || player.currentScore <= 1) return null;

  return (
    <motion.div
      className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="text-center">
        <h4 className="text-yellow-200 font-bold mb-1">
          🎯 {player.name} on a finish!
        </h4>
        <p className="text-yellow-300 text-sm">
          {player.currentScore} remaining
        </p>
      </div>
    </motion.div>
  );
}

function WinnerCelebration({ winner }: { winner: { name: string } }) {
  return (
    <motion.div
      className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-6 mb-4 text-center"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <motion.div
        className="text-4xl mb-2"
        animate={{ 
          rotate: [0, -10, 10, -10, 0],
          scale: [1, 1.1, 1, 1.1, 1]
        }}
        transition={{ 
          duration: 0.6, 
          repeat: Infinity, 
          repeatDelay: 2,
          ease: "easeInOut"
        }}
      >
        🏆
      </motion.div>
      <h3 className="text-2xl font-bold text-emerald-400 mb-2">
        {winner.name} Wins!
      </h3>
      <p className="text-emerald-300">
        Leg Complete
      </p>
    </motion.div>
  );
}

export function Scoreboard({ 
  match, 
  currentLeg, 
  currentPlayerIndex, 
  legWins, 
  setWins,
  className 
}: ScoreboardProps) {
  const currentPlayer = currentLeg.players[currentPlayerIndex];
  const legWinner = currentLeg.winnerId 
    ? match.config.players.find(p => p.id === currentLeg.winnerId)
    : null;

  const playerCount = match.config.players.length;
  const isTwoPlayer = playerCount === 2;

  return (
    <div className={cn('w-full max-w-6xl mx-auto', className)}>
      {/* Match Info */}
      <MatchInfo 
        match={match} 
        legWins={legWins} 
        setWins={setWins}
      />

      {/* Checkout banner */}
      <AnimatePresence>
        {currentPlayer && !legWinner && (
          <CheckoutBanner player={currentPlayer} />
        )}
      </AnimatePresence>

      {/* Winner celebration */}
      <AnimatePresence>
        {legWinner && (
          <WinnerCelebration winner={legWinner} />
        )}
      </AnimatePresence>

      {/* Player Cards */}
      <motion.div 
        className={cn(
          "grid gap-4",
          isTwoPlayer ? "grid-cols-1 md:grid-cols-2" : 
          playerCount <= 4 ? `grid-cols-1 md:grid-cols-${Math.min(playerCount, 2)}` :
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )}
        layout
      >
        <AnimatePresence>
          {currentLeg.players.map((player, index) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              <PlayerCard
                player={player}
                isActive={index === currentPlayerIndex && !legWinner}
                isWinner={player.id === currentLeg.winnerId}
                showDetailedStats={playerCount <= 4} // Show detailed stats for smaller games
                position={index + 1}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Game status indicator */}
      <motion.div 
        className="text-center mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {legWinner ? (
          <p className="text-emerald-400 font-medium">
            Leg completed • {legWinner.name} wins
          </p>
        ) : currentPlayer ? (
          <p className="text-slate-400">
            {currentPlayer.name}'s turn • Round {Math.floor(currentLeg.players[0].throws.length) + 1}
          </p>
        ) : null}
      </motion.div>

      {/* Match statistics preview */}
      {currentLeg.players.some(p => p.throws.length > 0) && (
        <motion.div
          className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-600/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <h4 className="text-slate-300 text-sm font-medium mb-3 text-center">
            Current Leg Statistics
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-white font-bold">
                {Math.max(...currentLeg.players.map(p => 
                  p.throws.length > 0 ? Math.max(...p.throws.map(t => t.score)) : 0
                ))}
              </div>
              <div className="text-xs text-slate-400">Highest Score</div>
            </div>
            <div>
              <div className="text-white font-bold">
                {currentLeg.players.reduce((sum, p) => 
                  sum + p.throws.filter(t => t.score === 180).length, 0
                )}
              </div>
              <div className="text-xs text-slate-400">180s Hit</div>
            </div>
            <div>
              <div className="text-white font-bold">
                {Math.round(currentLeg.players.reduce((sum, p) => {
                  if (p.throws.length === 0) return sum;
                  const avg = (p.throws.reduce((s, t) => s + t.score, 0) / p.throws.length) * 3;
                  return sum + avg;
                }, 0) / currentLeg.players.length * 10) / 10}
              </div>
              <div className="text-xs text-slate-400">Avg Score</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}