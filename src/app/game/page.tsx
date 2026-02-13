'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Home, SkipForward, Target } from 'lucide-react';
import { useGame } from '@/hooks/useGame';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { cn } from '@/utils/cn';
import { useState, useEffect, useCallback } from 'react';

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-darts-background flex items-center justify-center p-4">
      <div className="bg-darts-surface border-2 border-dartboard-red rounded-lg p-8 max-w-md w-full text-center">
        <AlertTriangle className="w-12 h-12 text-dartboard-red mx-auto mb-4" />
        <h2 className="text-xl font-bold text-dartboard-red mb-2 font-mono">GAME ERROR</h2>
        <p className="text-dartboard-cream/80 mb-6 text-sm font-mono">{error}</p>
        <div className="flex gap-3">
          <button onClick={onRetry} className="flex-1 button-primary py-3 font-mono">RETRY</button>
          <button onClick={() => router.push('/')} className="flex-1 button-secondary py-3 font-mono">HOME</button>
        </div>
      </div>
    </div>
  );
}

function NoMatchState() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-darts-background flex items-center justify-center p-4">
      <div className="bg-darts-surface border-2 border-darts-border rounded-lg p-8 max-w-md w-full text-center">
        <Target className="w-12 h-12 text-dartboard-cream/60 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-dartboard-cream mb-2 font-mono">NO ACTIVE MATCH</h2>
        <p className="text-dartboard-cream/70 mb-6 font-mono">Start a new match to begin scoring</p>
        <button onClick={() => router.push('/setup')} className="w-full button-primary py-3 font-mono">START NEW MATCH</button>
      </div>
    </div>
  );
}

function WinCelebration({ winner, isMatchWon, onNextLeg, onViewStats }: {
  winner: string; isMatchWon: boolean; onNextLeg: () => void; onViewStats: () => void;
}) {
  return (
    <motion.div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="bg-darts-surface border-2 border-dartboard-green rounded-lg p-8 max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="text-6xl mb-4">{isMatchWon ? '🏆' : '🎉'}</div>
        <h3 className="text-2xl font-bold text-dartboard-green mb-2 font-mono">{winner.toUpperCase()} WINS!</h3>
        <p className="text-dartboard-cream/80 mb-8 font-mono">{isMatchWon ? 'MATCH COMPLETE!' : 'LEG COMPLETE!'}</p>
        <div className="flex gap-3">
          {!isMatchWon && (
            <button onClick={onNextLeg} className="flex-1 button-primary py-3 font-mono flex items-center justify-center gap-2">
              <SkipForward className="w-4 h-4" /> NEXT LEG
            </button>
          )}
          <button onClick={onViewStats} className={cn("button-secondary py-3 font-mono", isMatchWon ? "flex-1" : "")}>
            {isMatchWon ? 'VIEW STATS' : 'STATS'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ===== Winmau-style TV Scoreboard ===== */
function TVScoreboard({ 
  p1Name, p2Name, p1Score, p2Score, 
  p1StartScore, p2StartScore,
  p1Sets, p2Sets, p1Legs, p2Legs,
  firstTo, hasSets, activePlayer, checkoutText
}: {
  p1Name: string; p2Name: string; p1Score: number; p2Score: number;
  p1StartScore: number; p2StartScore: number;
  p1Sets: number; p2Sets: number; p1Legs: number; p2Legs: number;
  firstTo: number; hasSets: boolean; activePlayer: 0 | 1; checkoutText?: string;
}) {
  const p1Progress = p1Score / p1StartScore;
  const p2Progress = p2Score / p2StartScore;

  // Layout values from proto builder
  const C = { cardW: 520, cardH: 315, circD: 180, circX: 35, circY: 4, banH: 44, borR: 29, ringW: 20, scoreS: 50, nameS: 22, ftS: 20, numS: 40, lblS: 10, lblW: 40, centreY: 6, rowGap: 20, numGap: 16, bottomH: 36, botS: 14 };
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const circR2 = C.circD / 2;

  const ScoreCircle = ({ score, progress, color, isActive }: { 
    score: number; progress: number; color: 'red' | 'blue'; isActive: boolean 
  }) => {
    const offset = circumference * (1 - progress);
    const baseColor = color === 'red' ? '#dc2626' : '#1d4ed8';
    const brightColor = color === 'red' ? '#ef4444' : '#3b82f6';
    const glowRgb = color === 'red' ? '239,68,68' : '59,130,246';

    return (
      <div style={{ width: C.circD, height: C.circD, position: 'relative' }}>
        <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke={baseColor} strokeWidth={C.ringW} opacity="0.35" />
          <circle cx="60" cy="60" r={radius} fill="none" stroke={brightColor} strokeWidth={C.ringW}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="butt"
            style={{ transition: 'stroke-dashoffset 0.5s ease', filter: `drop-shadow(0 0 ${isActive ? 18 : 12}px rgba(${glowRgb},${isActive ? 0.9 : 0.7}))` }} />
        </svg>
        <div style={{
          position: 'absolute', inset: 16, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `radial-gradient(circle at 35% 35%, ${color === 'red' ? '#2a1525' : '#151535'} 0%, #08081a 100%)`,
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.6)',
        }}>
          <span style={{ color: 'white', fontWeight: 900, fontSize: C.scoreS, fontFamily: 'system-ui, sans-serif', lineHeight: 1, fontVariantNumeric: 'tabular-nums', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
            {score}
          </span>
        </div>
        {isActive && (
          <img src="/dart.png" alt="" style={{
            position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
            width: 24, height: 24, objectFit: 'contain',
          }} />
        )}
      </div>
    );
  };

  return (
    <div className="w-full mx-auto select-none" style={{ maxWidth: C.cardW, padding: '20px 40px' }}>
      <div style={{ position: 'relative', width: C.cardW, height: C.cardH, maxWidth: '100%' }}>
        {/* Card background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(145deg, #1e1e3e, #0e0e24)',
          borderRadius: C.borR,
          boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
          overflow: 'visible',
        }}>
          {/* Red/blue banner */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: C.banH, display: 'flex', zIndex: 1, overflow: 'hidden', borderRadius: `${C.borR}px ${C.borR}px 0 0` }}>
            <div style={{ flex: 1, background: 'linear-gradient(to right, #dc2626, #c42020)' }} />
            <div style={{ flex: 1, background: 'linear-gradient(to right, #2563eb, #1d4ed8)' }} />
          </div>

          {/* Names */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: C.banH, zIndex: 2, display: 'flex', alignItems: 'center' }}>
            <span style={{ flex: 1, textAlign: 'center', color: 'white', fontWeight: 900, fontSize: C.nameS, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'system-ui, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              {p1Name}
            </span>
            <span style={{ flex: 1, textAlign: 'center', color: 'white', fontWeight: 900, fontSize: C.nameS, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'system-ui, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              {p2Name}
            </span>
          </div>

          {/* Centre panel */}
          <div style={{ position: 'absolute', left: '50%', top: `calc(50% + ${C.centreY}px)`, transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 3 }}>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 800, fontSize: C.ftS, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: C.rowGap + 4, fontFamily: 'system-ui, sans-serif' }}>
              FIRST TO {firstTo}
            </div>
            {hasSets && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: C.numGap, marginBottom: C.rowGap }}>
                <span style={{ color: 'white', fontWeight: 900, fontSize: C.numS, width: Math.round(C.numS * 1.1), textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: 'system-ui, sans-serif' }}>{p1Sets}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: C.lblS, textTransform: 'uppercase', letterSpacing: '0.12em', width: C.lblW, textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>SETS</span>
                <span style={{ color: 'white', fontWeight: 900, fontSize: C.numS, width: Math.round(C.numS * 1.1), textAlign: 'left', fontVariantNumeric: 'tabular-nums', fontFamily: 'system-ui, sans-serif' }}>{p2Sets}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: C.numGap, marginBottom: C.rowGap }}>
              <span style={{ color: 'white', fontWeight: 900, fontSize: C.numS, width: Math.round(C.numS * 1.1), textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: 'system-ui, sans-serif' }}>{p1Legs}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: C.lblS, textTransform: 'uppercase', letterSpacing: '0.12em', width: C.lblW, textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>LEGS</span>
              <span style={{ color: 'white', fontWeight: 900, fontSize: C.numS, width: Math.round(C.numS * 1.1), textAlign: 'left', fontVariantNumeric: 'tabular-nums', fontFamily: 'system-ui, sans-serif' }}>{p2Legs}</span>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: C.bottomH,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: `0 0 ${C.borR}px ${C.borR}px`,
            background: checkoutText
              ? 'linear-gradient(to right, rgba(220,38,38,0.4), rgba(160,25,25,0.3))'
              : 'linear-gradient(to right, rgba(130,20,20,0.18), rgba(45,10,70,0.12), rgba(20,45,150,0.18))',
            zIndex: 2,
          }}>
            <span style={{
              color: checkoutText ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)',
              fontWeight: 700, fontSize: checkoutText ? C.botS : C.botS - 2,
              textTransform: 'uppercase', letterSpacing: checkoutText ? '0.1em' : '0.25em',
              fontFamily: 'system-ui, sans-serif',
            }}>
              {checkoutText ? `CHECKOUT: ${checkoutText}` : 'DARTS SCORER'}
            </span>
          </div>
        </div>

        {/* Score circles — positioned relative to board */}
        <div style={{ position: 'absolute', left: C.circX - circR2, top: '50%', transform: `translateY(calc(-50% + ${C.circY}px))`, zIndex: 4 }}>
          <ScoreCircle score={p1Score} progress={p1Progress} color="red" isActive={activePlayer === 0} />
        </div>
        <div style={{ position: 'absolute', right: C.circX - circR2, top: '50%', transform: `translateY(calc(-50% + ${C.circY}px))`, zIndex: 4 }}>
          <ScoreCircle score={p2Score} progress={p2Progress} color="blue" isActive={activePlayer === 1} />
        </div>
      </div>
    </div>
  );
}

export default function GamePage() {
  const router = useRouter();
  const game = useGame();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(null), 3000); return () => clearTimeout(t); }
    return undefined;
  }, [error]);

  const currentScore = input ? parseInt(input) : 0;
  const maxScore = 180;
  const isValid = currentScore >= 0 && currentScore <= maxScore;
  const canSubmit = isValid && currentScore > 0 && !game.isSubmittingScore;

  const handleInput = useCallback((value: string) => {
    setError(null);
    if (value === 'clear') { setInput(''); return; }
    if (value === 'backspace') { setInput(prev => prev.slice(0, -1)); return; }
    if (input.length >= 3) return;
    const newInput = input + value;
    if (parseInt(newInput) <= maxScore) setInput(newInput);
  }, [input]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    try {
      const success = await game.submitScore(currentScore);
      if (success) { setInput(''); setError(null); }
      else setError('Failed to submit score');
    } catch { setError('Failed to submit score'); }
  }, [canSubmit, currentScore, game]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleInput(e.key);
      else if (e.key === 'Backspace') handleInput('backspace');
      else if (e.key === 'Escape') handleInput('clear');
      else if (e.key === 'Enter') handleSubmit();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleInput, handleSubmit]);

  if (game.isLoadingMatch) return <FullPageLoader message="Loading match..." />;
  if (game.gameState === 'error' && game.error) return <ErrorState error={game.error} onRetry={() => window.location.reload()} />;
  if (game.gameState === 'no_match') return <NoMatchState />;
  if (!game.match || !game.currentLeg || !game.currentPlayer) return <FullPageLoader message="Preparing game..." />;

  const match = game.match;
  const currentLeg = game.currentLeg;
  const players = match.config.players;
  const hasMultipleSets = !!(match.config.numberOfSets && match.config.numberOfSets > 1);
  const is2Player = players.length === 2;

  const legWinner = currentLeg?.winnerId ? players.find(p => p.id === currentLeg?.winnerId) : null;
  const isMatchWon = game.gameState === 'match_won';

  const getPlayerScore = (playerId: string) => {
    const legPlayer = currentLeg.players.find(p => p.id === playerId);
    return legPlayer?.currentScore ?? 0;
  };

  return (
    <div className="min-h-screen bg-darts-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={() => router.push('/')} className="text-dartboard-cream/50 hover:text-dartboard-cream">
          <Home className="w-5 h-5" />
        </button>
        <button onClick={async () => { if (confirm('Quit match?')) { await game.quitMatch(); router.push('/'); } }}
          className="text-dartboard-cream/50 hover:text-dartboard-red text-xs font-mono">QUIT</button>
      </div>

      {/* TV Scoreboard */}
      <div className="px-3 mb-4">
        {is2Player ? (
          <TVScoreboard
            p1Name={players[0].name}
            p2Name={players[1].name}
            p1Score={getPlayerScore(players[0].id)}
            p2Score={getPlayerScore(players[1].id)}
            p1StartScore={players[0].startingScore}
            p2StartScore={players[1].startingScore}
            p1Sets={game.setWins[players[0].id] || 0}
            p2Sets={game.setWins[players[1].id] || 0}
            p1Legs={game.legWins[players[0].id] || 0}
            p2Legs={game.legWins[players[1].id] || 0}
            firstTo={match.config.numberOfLegs}
            hasSets={hasMultipleSets}
            activePlayer={game.currentPlayerIndex as 0 | 1}
            checkoutText={game.isCheckoutPossible && game.checkoutSuggestions.length > 0 
              ? game.checkoutSuggestions.slice(0, 2).map(s => s.combination).join(' | ')
              : undefined}
          />
        ) : (
          <div className="space-y-2">
            {currentLeg.players.map((player: any, index: number) => (
              <div key={player.id} className={cn(
                "flex items-center justify-between p-4 rounded-lg border-2",
                index === game.currentPlayerIndex ? "border-dartboard-red bg-darts-surface" : "border-darts-border bg-darts-surface"
              )}>
                <div>
                  <span className="text-lg font-bold text-dartboard-cream font-mono uppercase">{player.name}</span>
                  {index === game.currentPlayerIndex && <span className="ml-2">🎯</span>}
                </div>
                <div className="text-5xl font-bold text-dartboard-cream tabular-nums font-mono">{player.currentScore}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout now shown in scoreboard bottom bar */}

      {/* Score input + numpad - pushed to bottom */}
      {!legWinner && (
        <div className="mt-auto px-4 pb-4">
          {/* Score display with CLR button */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 bg-darts-surface border-2 border-darts-border rounded-lg px-4 py-3 text-center">
              <span className={cn(
                "text-4xl font-black tabular-nums",
                input ? "text-white" : "text-white/20"
              )} style={{ fontFamily: 'system-ui, sans-serif' }}>
                {input || '0'}
              </span>
            </div>
            <button onClick={() => handleInput('clear')}
              className="bg-darts-surface border border-darts-border rounded-lg px-4 text-sm font-bold text-dartboard-cream hover:bg-darts-border active:bg-dartboard-red/20 transition-colors"
              style={{ fontFamily: 'system-ui, sans-serif' }}>CLR</button>
          </div>

          {error && <p className="text-[#dc2626] text-xs text-center font-mono mb-2">{error}</p>}

          {/* Numpad - 3 columns */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {['1','2','3','4','5','6','7','8','9','⌫','0','GO'].map((btn) => {
              if (btn === 'GO') return (
                <button key={btn} onClick={handleSubmit} disabled={!canSubmit}
                  className={cn(
                    "rounded-lg py-4 text-base font-black transition-colors",
                    canSubmit ? "bg-[#dc2626] text-white active:bg-[#b91c1c]" : "bg-darts-surface border border-darts-border text-white/20"
                  )} style={{ fontFamily: 'system-ui, sans-serif' }}>GO</button>
              );
              return (
                <button key={btn}
                  onClick={() => {
                    if (btn === '⌫') handleInput('backspace');
                    else handleInput(btn);
                  }}
                  className="bg-darts-surface border border-darts-border rounded-lg py-4 text-xl font-bold text-dartboard-cream hover:bg-darts-border active:bg-dartboard-red/20 transition-colors"
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >{btn}</button>
              );
            })}
          </div>

          {/* Quick scores */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 justify-center flex-wrap">
            {[26, 41, 45, 60, 81, 85, 100, 140, 180].map(score => (
              <button key={score}
                onClick={() => setInput(score.toString())}
                className="bg-[#1d4ed8]/20 border border-[#1d4ed8]/30 rounded px-3 py-1 text-[11px] font-bold text-white/70 hover:bg-[#1d4ed8]/30 transition-colors"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >{score}</button>
            ))}
          </div>
        </div>
      )}

      {/* Win celebration */}
      <AnimatePresence>
        {legWinner && (
          <WinCelebration
            winner={legWinner.name}
            isMatchWon={isMatchWon}
            onNextLeg={async () => { await game.startNextLeg(); }}
            onViewStats={() => { if (game.match) router.push(`/history/${game.match.id}`); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
