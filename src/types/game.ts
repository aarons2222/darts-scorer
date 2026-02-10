// Game state types - used for active matches in memory
export interface GameThrow {
  score: number;
  roundNumber: number;
  isCheckout: boolean;
}

export interface GamePlayer {
  id: string;
  name: string;
  startingScore: number;
  currentScore: number;
  throws: GameThrow[];
  isFinished: boolean;
}

export interface GameLeg {
  id: string;
  setNumber: number;
  legNumber: number;
  players: GamePlayer[];
  winnerId?: string;
  currentPlayerIndex: number;
  currentRound: number;
  isCompleted: boolean;
}

export interface GameSet {
  setNumber: number;
  legs: GameLeg[];
  winnerId?: string;
  isCompleted: boolean;
}

export interface GameMatch {
  id: string;
  config: {
    numberOfSets?: number;
    numberOfLegs: number;
    players: Array<{ id: string; name: string; startingScore: number }>;
  };
  sets: GameSet[];
  currentSetIndex: number;
  currentLegIndex: number;
  status: 'in_progress' | 'completed';
  winnerId?: string;
  timestamp: number;
}

// Legacy types for compatibility (gradually remove these)
export interface GameSettings {
  numberOfSets?: number;
  numberOfLegs: number;
  players: { id: string; name: string; startingScore: number }[];
}

export type CheckoutSuggestion = {
  combination: string;
  description: string;
};

export interface LegStats {
  playerId: string;
  playerName: string;
  darts: number;
  average: number;
  firstNineDartAverage: number;
  scores100Plus: number;
  scores140Plus: number;
  scores180: number;
  highestScore: number;
  finishingScore?: number;
  isWinner: boolean;
}

export interface PlayerProfile {
  id: string;
  name: string;
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  bestAverage: number;
  highestScore: number;
  averagePerGame: number;
}

// Type aliases for backward compatibility
export type Match = GameMatch;
export type Player = GamePlayer; 
export type Leg = GameLeg;
export type Set = GameSet;