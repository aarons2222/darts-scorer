import { useState, useEffect, useCallback, useMemo } from 'react';
import { GameMatch, GameLeg, GamePlayer, GameThrow } from '@/types/game';
import { DbMatch } from '@/types/database';
import { 
  getCurrentMatch, 
  convertDbMatchToGameMatch, 
  addThrow, 
  completeLeg, 
  updateMatchStatus, 
  createLeg,
  getMatch
} from '@/utils/database';
import { 
  isBust, 
  isValidScore, 
  getCheckoutSuggestions, 
  isCheckoutAttempt,
  calculateGameStats
} from '@/utils/gameLogic';

export type GameState = 'loading' | 'playing' | 'leg_won' | 'match_won' | 'error' | 'no_match';

export interface UseGameResult {
  // Game state
  match: GameMatch | null;
  dbMatch: DbMatch | null;
  gameState: GameState;
  error: string | null;
  
  // Current game info
  currentLeg: GameLeg | null;
  currentPlayer: GamePlayer | null;
  currentPlayerIndex: number;
  isCheckoutPossible: boolean;
  checkoutSuggestions: Array<{ combination: string; description: string; }>;
  
  // Game actions
  submitScore: (score: number) => Promise<boolean>;
  undoLastThrow: () => Promise<boolean>;
  startNextLeg: () => Promise<boolean>;
  quitMatch: () => Promise<void>;
  
  // Game statistics
  legWins: Record<string, number>;
  setWins: Record<string, number>;
  gameStats: Record<string, ReturnType<typeof calculateGameStats>>;
  
  // Loading states
  isSubmittingScore: boolean;
  isLoadingMatch: boolean;
}

export function useGame(): UseGameResult {
  const [match, setMatch] = useState<GameMatch | null>(null);
  const [dbMatch, setDbMatch] = useState<DbMatch | null>(null);
  const [gameState, setGameState] = useState<GameState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [isLoadingMatch, setIsLoadingMatch] = useState(true);

  // Load initial match
  useEffect(() => {
    loadCurrentMatch();
  }, []);

  const loadCurrentMatch = useCallback(async () => {
    setIsLoadingMatch(true);
    setError(null);
    
    try {
      const currentMatch = await getCurrentMatch();
      if (!currentMatch) {
        setGameState('no_match');
        return;
      }
      
      setDbMatch(currentMatch);
      const gameMatch = convertDbMatchToGameMatch(currentMatch);
      setMatch(gameMatch);
      
      if (currentMatch.status === 'completed') {
        setGameState('match_won');
      } else {
        // Check if current leg is completed
        const currentSet = gameMatch.sets[gameMatch.currentSetIndex];
        const currentLeg = currentSet?.legs[gameMatch.currentLegIndex];
        
        if (currentLeg?.isCompleted) {
          setGameState('leg_won');
        } else {
          setGameState('playing');
        }
      }
    } catch (err) {
      console.error('Failed to load match:', err);
      setError('Failed to load match');
      setGameState('error');
    } finally {
      setIsLoadingMatch(false);
    }
  }, []);

  const refreshMatch = useCallback(async () => {
    if (!dbMatch) return;
    
    try {
      const updatedMatch = await getMatch(dbMatch.id);
      if (updatedMatch) {
        setDbMatch(updatedMatch);
        const gameMatch = convertDbMatchToGameMatch(updatedMatch);
        setMatch(gameMatch);
      }
    } catch (err) {
      console.error('Failed to refresh match:', err);
    }
  }, [dbMatch]);

  // Current game info
  const currentSet = useMemo(() => {
    if (!match) return null;
    return match.sets[match.currentSetIndex] || null;
  }, [match]);

  const currentLeg = useMemo(() => {
    if (!currentSet) return null;
    return currentSet.legs[match!.currentLegIndex] || null;
  }, [currentSet, match]);

  const currentPlayer = useMemo(() => {
    if (!currentLeg) return null;
    return currentLeg.players[currentLeg.currentPlayerIndex] || null;
  }, [currentLeg]);

  const currentPlayerIndex = useMemo(() => {
    return currentLeg?.currentPlayerIndex || 0;
  }, [currentLeg]);

  const isCheckoutPossible = useMemo(() => {
    if (!currentPlayer) return false;
    return isCheckoutAttempt(currentPlayer.currentScore);
  }, [currentPlayer]);

  const checkoutSuggestions = useMemo(() => {
    if (!currentPlayer || !isCheckoutPossible) return [];
    return getCheckoutSuggestions(currentPlayer.currentScore);
  }, [currentPlayer, isCheckoutPossible]);

  // Game statistics
  const legWins = useMemo(() => {
    if (!match) return {};
    
    const wins: Record<string, number> = {};
    match.config.players.forEach(p => {
      wins[p.id] = 0;
    });

    match.sets.forEach(set => {
      set.legs.forEach(leg => {
        if (leg.winnerId) {
          wins[leg.winnerId] = (wins[leg.winnerId] || 0) + 1;
        }
      });
    });

    return wins;
  }, [match]);

  const setWins = useMemo(() => {
    if (!match || !match.config.numberOfSets) return {};
    
    const wins: Record<string, number> = {};
    match.config.players.forEach(p => {
      wins[p.id] = 0;
    });

    match.sets.forEach(set => {
      if (set.winnerId) {
        wins[set.winnerId] = (wins[set.winnerId] || 0) + 1;
      }
    });

    return wins;
  }, [match]);

  const gameStats = useMemo(() => {
    if (!match) return {};
    
    const stats: Record<string, ReturnType<typeof calculateGameStats>> = {};
    match.config.players.forEach(player => {
      const allThrows: GameThrow[] = [];
      
      match.sets.forEach(set => {
        set.legs.forEach(leg => {
          const legPlayer = leg.players.find(p => p.id === player.id);
          if (legPlayer) {
            allThrows.push(...legPlayer.throws);
          }
        });
      });

      stats[player.id] = calculateGameStats(allThrows);
    });

    return stats;
  }, [match]);

  // Game actions
  const submitScore = useCallback(async (score: number): Promise<boolean> => {
    if (!currentLeg || !currentPlayer || !dbMatch) return false;
    
    if (!isValidScore(score)) {
      setError('Invalid score');
      return false;
    }

    setIsSubmittingScore(true);
    setError(null);

    try {
      const wasCheckoutAttempt = isCheckoutAttempt(currentPlayer.currentScore);
      
      if (isBust(currentPlayer.currentScore, score)) {
        // Bust - record throw with 0 score so it doesn't affect the total
        await addThrow(currentLeg.id, currentPlayer.id, currentLeg.currentRound, 0, false);
        setError('BUST! Score remains unchanged.');
      } else {
        const newScore = currentPlayer.currentScore - score;
        const isCheckout = newScore === 0;
        
        // Add throw to database
        await addThrow(currentLeg.id, currentPlayer.id, currentLeg.currentRound, score, isCheckout);
        
        if (isCheckout) {
          // Player finished - complete the leg
          await completeLeg(currentLeg.id, currentPlayer.id);
          
          // Check if match is complete
          const updatedMatch = await getMatch(dbMatch.id);
          if (updatedMatch) {
            const gameMatch = convertDbMatchToGameMatch(updatedMatch);
            const isMatchComplete = checkMatchComplete(gameMatch, currentPlayer.id);
            
            if (isMatchComplete) {
              await updateMatchStatus(dbMatch.id, 'completed', currentPlayer.id);
              setGameState('match_won');
            } else {
              setGameState('leg_won');
            }
          }
        }
      }

      // Refresh the match data
      await refreshMatch();
      return true;
    } catch (err) {
      console.error('Failed to add score:', err);
      setError('Failed to record score. Please try again.');
      return false;
    } finally {
      setIsSubmittingScore(false);
    }
  }, [currentLeg, currentPlayer, dbMatch, refreshMatch]);

  const undoLastThrow = useCallback(async (): Promise<boolean> => {
    // TODO: Implement undo functionality
    return false;
  }, []);

  const startNextLeg = useCallback(async (): Promise<boolean> => {
    if (!dbMatch || !match) return false;

    try {
      const nextSetNumber = match.currentSetIndex + 1;
      const nextLegNumber = (currentSet?.legs.length || 0) + 1;
      
      await createLeg(dbMatch.id, nextSetNumber, nextLegNumber);
      await refreshMatch();
      setGameState('playing');
      return true;
    } catch (err) {
      console.error('Failed to start next leg:', err);
      setError('Failed to start next leg');
      return false;
    }
  }, [dbMatch, match, currentSet, refreshMatch]);

  const quitMatch = useCallback(async (): Promise<void> => {
    if (!dbMatch) return;

    try {
      await updateMatchStatus(dbMatch.id, 'completed');
    } catch (err) {
      console.error('Failed to quit match:', err);
    }
  }, [dbMatch]);

  return {
    // Game state
    match,
    dbMatch,
    gameState,
    error,
    
    // Current game info
    currentLeg,
    currentPlayer,
    currentPlayerIndex,
    isCheckoutPossible,
    checkoutSuggestions,
    
    // Game actions
    submitScore,
    undoLastThrow,
    startNextLeg,
    quitMatch,
    
    // Game statistics
    legWins,
    setWins,
    gameStats,
    
    // Loading states
    isSubmittingScore,
    isLoadingMatch,
  };
}

// Helper function to check if match is complete
function checkMatchComplete(match: GameMatch, winnerId: string): boolean {
  const config = match.config;
  
  if (config.numberOfSets) {
    // Count sets won by this player
    const setsWon = match.sets.filter(set => set.winnerId === winnerId).length;
    const setsNeeded = Math.ceil(config.numberOfSets / 2);
    return setsWon >= setsNeeded;
  } else {
    // Count legs won by this player
    let legsWon = 0;
    match.sets.forEach(set => {
      set.legs.forEach(leg => {
        if (leg.winnerId === winnerId) {
          legsWon++;
        }
      });
    });
    const legsNeeded = Math.ceil(config.numberOfLegs / 2);
    return legsWon >= legsNeeded;
  }
}