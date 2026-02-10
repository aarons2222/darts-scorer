export interface Player {
  id: string;
  name: string;
  startingScore: number;
  currentScore: number;
  scores: number[];
  isFinished: boolean;
  checkoutAttempts: number;
  successfulCheckouts: number;
}

export interface GameSettings {
  numberOfSets?: number; // undefined means no sets
  numberOfLegs: number;
  players: Omit<Player, 'currentScore' | 'scores' | 'isFinished' | 'checkoutAttempts' | 'successfulCheckouts'>[];
}

export interface LegStats {
  playerId: string;
  dartCount: number;
  average: number;
  highestScore: number;
  scores100Plus: number;
  scores140Plus: number;
  scores180: number;
  firstNineDartAvg?: number;
}

export interface Leg {
  id: string;
  players: Player[];
  winnerId?: string;
  stats: Record<string, LegStats>;
  currentPlayerIndex: number;
}

export interface Set {
  id: string;
  legs: Leg[];
  winnerId?: string;
}

export interface Match {
  id: string;
  timestamp: number;
  settings: GameSettings;
  sets: Set[];
  currentSetIndex: number;
  currentLegIndex: number;
  isFinished: boolean;
  winnerId?: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    bestAverage: number;
    highestScore: number;
    highestCheckout: number;
    totalDartsThrown: number;
    totalScore: number;
  };
  headToHead: Record<string, { wins: number; losses: number }>;
}

export type CheckoutSuggestion = {
  combination: string;
  description: string;
};