import { CheckoutSuggestion } from '@/types/game';

export const isBust = (currentScore: number, scoreToSubtract: number): boolean => {
  const newScore = currentScore - scoreToSubtract;
  return newScore < 0 || newScore === 1;
};

export const isValidScore = (score: number): boolean => {
  if (score < 0 || score > 180) return false;
  if (score <= 60) return true; // All scores 0-60 are possible
  
  // For scores above 60, check if they're achievable with 3 darts
  // This is a simplified check - in reality, some combinations might not be possible
  // but for the app's purposes, we'll allow 1-180
  return true;
};

export const calculateAverage = (scores: number[]): number => {
  if (scores.length === 0) return 0;
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  return Math.round((totalScore / scores.length) * 100) / 100;
};

export const calculateFirstNineDartAverage = (scores: number[]): number | undefined => {
  if (scores.length < 3) return undefined;
  const firstThreeScores = scores.slice(0, 3);
  return calculateAverage(firstThreeScores);
};

export const getCheckoutSuggestions = (score: number): CheckoutSuggestion[] => {
  if (score <= 0 || score > 170) return [];
  
  const suggestions: CheckoutSuggestion[] = [];
  
  // Common checkout combinations
  const checkouts: Record<number, CheckoutSuggestion[]> = {
    170: [{ combination: 'T20, T20, Bull', description: 'Triple 20, Triple 20, Bullseye' }],
    167: [{ combination: 'T20, T19, Bull', description: 'Triple 20, Triple 19, Bullseye' }],
    164: [{ combination: 'T20, T18, Bull', description: 'Triple 20, Triple 18, Bullseye' }],
    161: [{ combination: 'T20, T17, Bull', description: 'Triple 20, Triple 17, Bullseye' }],
    160: [{ combination: 'T20, T20, D20', description: 'Triple 20, Triple 20, Double 20' }],
    158: [{ combination: 'T20, T20, D19', description: 'Triple 20, Triple 20, Double 19' }],
    156: [{ combination: 'T20, T20, D18', description: 'Triple 20, Triple 20, Double 18' }],
    154: [{ combination: 'T20, T18, D20', description: 'Triple 20, Triple 18, Double 20' }],
    152: [{ combination: 'T20, T20, D16', description: 'Triple 20, Triple 20, Double 16' }],
    151: [{ combination: 'T20, T17, D20', description: 'Triple 20, Triple 17, Double 20' }],
    150: [{ combination: 'T20, T18, D18', description: 'Triple 20, Triple 18, Double 18' }],
    // Add more common checkouts
    100: [{ combination: 'T20, D20', description: 'Triple 20, Double 20' }],
    110: [{ combination: 'T20, Bull', description: 'Triple 20, Bullseye' }],
    120: [{ combination: 'T20, S20, D20', description: 'Triple 20, Single 20, Double 20' }],
    // Simple doubles for lower scores
  };

  if (checkouts[score]) {
    suggestions.push(...checkouts[score]);
  }

  // For scores not in the predefined list, suggest common patterns
  if (suggestions.length === 0 && score <= 40 && score % 2 === 0) {
    const doubleNeeded = score / 2;
    if (doubleNeeded <= 20) {
      suggestions.push({
        combination: `D${doubleNeeded}`,
        description: `Double ${doubleNeeded}`
      });
    }
  }

  // If score is odd and <= 39, suggest single + double
  if (suggestions.length === 0 && score <= 39 && score % 2 === 1) {
    suggestions.push({
      combination: `S1, D${(score - 1) / 2}`,
      description: `Single 1, Double ${(score - 1) / 2}`
    });
  }

  return suggestions;
};

export const isCheckoutAttempt = (currentScore: number): boolean => {
  return currentScore <= 170;
};

export const count100PlusScores = (scores: number[]): number => {
  return scores.filter(score => score >= 100).length;
};

export const count140PlusScores = (scores: number[]): number => {
  return scores.filter(score => score >= 140).length;
};

export const count180Scores = (scores: number[]): number => {
  return scores.filter(score => score === 180).length;
};

export const getHighestScore = (scores: number[]): number => {
  return scores.length > 0 ? Math.max(...scores) : 0;
};

export const generatePlayerId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

export const generateMatchId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};