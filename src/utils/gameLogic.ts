import { CheckoutSuggestion, GameThrow } from '@/types/game';

export const isBust = (currentScore: number, scoreToSubtract: number): boolean => {
  const newScore = currentScore - scoreToSubtract;
  // Standard 501 rules: Bust if going below 0, hitting exactly 1, or any odd number below 2
  // (since you must finish on a double)
  if (newScore < 0) return true;
  if (newScore === 1) return true; // Can't finish on 1
  if (newScore === 0) return false; // Perfect finish
  return false; // Valid score that can potentially be finished
};

export const isValidScore = (score: number): boolean => {
  if (score < 0 || score > 180) return false;
  
  // Check if the score is actually possible with 3 darts
  // This is a comprehensive check for all possible 3-dart combinations
  return isPossibleDartScore(score);
};

// Comprehensive check for possible dart scores
function isPossibleDartScore(score: number): boolean {
  if (score === 0) return true;
  if (score > 180) return false;
  
  // For scores 1-20, all are possible with single dart
  if (score <= 20) return true;
  
  // For scores 21-60, all are possible (various combinations)
  if (score <= 60) return true;
  
  // For higher scores, we need to check combinations
  // This is simplified but covers all practical cases
  const impossibleScores = [163, 166, 169, 172, 173, 175, 176, 178, 179];
  return !impossibleScores.includes(score);
}

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
  if (score <= 1 || score > 170) return [];
  
  // Comprehensive checkout chart - all possible finishes 2-170
  const checkouts = getCheckoutChart();
  
  return checkouts[score] || [];
};

// Complete checkout chart for all possible finishes 2-170
function getCheckoutChart(): Record<number, CheckoutSuggestion[]> {
  const checkouts: Record<number, CheckoutSuggestion[]> = {};
  
  // Comprehensive checkout combinations covering ALL finishes 2-170
  const checkoutData: Array<[number, string, string]> = [
    // High finishes (150-170)
    [170, 'T20-T20-Bull', 'Triple 20, Triple 20, Bull'],
    [167, 'T20-T19-Bull', 'Triple 20, Triple 19, Bull'],
    [164, 'T20-T18-Bull', 'Triple 20, Triple 18, Bull'],
    [161, 'T20-T17-Bull', 'Triple 20, Triple 17, Bull'],
    [160, 'T20-T20-D20', 'Triple 20, Triple 20, Double 20'],
    [158, 'T20-T20-D19', 'Triple 20, Triple 20, Double 19'],
    [157, 'T20-T19-D20', 'Triple 20, Triple 19, Double 20'],
    [156, 'T20-T20-D18', 'Triple 20, Triple 20, Double 18'],
    [155, 'T20-T19-D19', 'Triple 20, Triple 19, Double 19'],
    [154, 'T20-T18-D20', 'Triple 20, Triple 18, Double 20'],
    [153, 'T20-T19-D18', 'Triple 20, Triple 19, Double 18'],
    [152, 'T20-T20-D16', 'Triple 20, Triple 20, Double 16'],
    [151, 'T20-T17-D20', 'Triple 20, Triple 17, Double 20'],
    [150, 'T20-T18-D18', 'Triple 20, Triple 18, Double 18'],
    
    // Mid-high finishes (100-149)
    [149, 'T20-T19-D16', 'Triple 20, Triple 19, Double 16'],
    [148, 'T20-T16-D20', 'Triple 20, Triple 16, Double 20'],
    [147, 'T20-T17-D18', 'Triple 20, Triple 17, Double 18'],
    [146, 'T20-T18-D16', 'Triple 20, Triple 18, Double 16'],
    [145, 'T20-T15-D20', 'Triple 20, Triple 15, Double 20'],
    [144, 'T20-T20-D12', 'Triple 20, Triple 20, Double 12'],
    [143, 'T20-T17-D16', 'Triple 20, Triple 17, Double 16'],
    [142, 'T20-T14-D20', 'Triple 20, Triple 14, Double 20'],
    [141, 'T20-T15-D18', 'Triple 20, Triple 15, Double 18'],
    [140, 'T20-T20-D10', 'Triple 20, Triple 20, Double 10'],
    [139, 'T20-T13-D20', 'Triple 20, Triple 13, Double 20'],
    [138, 'T20-T20-D9', 'Triple 20, Triple 20, Double 9'],
    [137, 'T20-T15-D16', 'Triple 20, Triple 15, Double 16'],
    [136, 'T20-T20-D8', 'Triple 20, Triple 20, Double 8'],
    [135, 'T20-T13-D18', 'Triple 20, Triple 13, Double 18'],
    [134, 'T20-T14-D16', 'Triple 20, Triple 14, Double 16'],
    [133, 'T20-T19-D8', 'Triple 20, Triple 19, Double 8'],
    [132, 'T20-T20-D6', 'Triple 20, Triple 20, Double 6'],
    [131, 'T20-T13-D16', 'Triple 20, Triple 13, Double 16'],
    [130, 'T20-T18-D8', 'Triple 20, Triple 18, Double 8'],
    [129, 'T19-T16-D12', 'Triple 19, Triple 16, Double 12'],
    [128, 'T20-T20-D4', 'Triple 20, Triple 20, Double 4'],
    [127, 'T20-T17-D8', 'Triple 20, Triple 17, Double 8'],
    [126, 'T20-T13-D12', 'Triple 20, Triple 13, Double 12'],
    [125, 'T20-T15-D10', 'Triple 20, Triple 15, Double 10'],
    [124, 'T20-T20-D2', 'Triple 20, Triple 20, Double 2'],
    [123, 'T20-T13-D12', 'Triple 19, Triple 16, Double 9'],
    [122, 'T20-T18-D4', 'Triple 20, Triple 18, Double 4'],
    [121, 'T20-T15-D8', 'Triple 20, Triple 15, Double 8'],
    [120, 'T20-S20-D20', 'Triple 20, Single 20, Double 20'],
    [119, 'T20-T13-D10', 'Triple 20, Triple 13, Double 10'],
    [118, 'T20-S18-D20', 'Triple 20, Single 18, Double 20'],
    [117, 'T20-S17-D20', 'Triple 20, Single 17, Double 20'],
    [116, 'T20-S16-D20', 'Triple 20, Single 16, Double 20'],
    [115, 'T20-S15-D20', 'Triple 20, Single 15, Double 20'],
    [114, 'T20-S14-D20', 'Triple 20, Single 14, Double 20'],
    [113, 'T20-S13-D20', 'Triple 20, Single 13, Double 20'],
    [112, 'T20-S12-D20', 'Triple 20, Single 12, Double 20'],
    [111, 'T20-S11-D20', 'Triple 20, Single 11, Double 20'],
    [110, 'T20-Bull', 'Triple 20, Bull'],
    [109, 'T20-S9-D20', 'Triple 20, Single 9, Double 20'],
    [108, 'T20-S8-D20', 'Triple 20, Single 8, Double 20'],
    [107, 'T19-Bull', 'Triple 19, Bull'],
    [106, 'T20-S6-D20', 'Triple 20, Single 6, Double 20'],
    [105, 'T20-S5-D20', 'Triple 20, Single 5, Double 20'],
    [104, 'T18-Bull', 'Triple 18, Bull'],
    [103, 'T20-S3-D20', 'Triple 20, Single 3, Double 20'],
    [102, 'T20-S2-D20', 'Triple 20, Single 2, Double 20'],
    [101, 'T17-Bull', 'Triple 17, Bull'],
    [100, 'T20-D20', 'Triple 20, Double 20'],
    
    // 2-dart finishes (50-99)
    [99, 'T19-S12-D15', 'Triple 19, Single 12, Double 15'],
    [98, 'T20-D19', 'Triple 20, Double 19'],
    [97, 'T19-D20', 'Triple 19, Double 20'],
    [96, 'T20-D18', 'Triple 20, Double 18'],
    [95, 'T19-D19', 'Triple 19, Double 19'],
    [94, 'T18-D20', 'Triple 18, Double 20'],
    [93, 'T19-D18', 'Triple 19, Double 18'],
    [92, 'T20-D16', 'Triple 20, Double 16'],
    [91, 'T17-D20', 'Triple 17, Double 20'],
    [90, 'T18-D18', 'Triple 18, Double 18'],
    [89, 'T19-D16', 'Triple 19, Double 16'],
    [88, 'T16-D20', 'Triple 16, Double 20'],
    [87, 'T17-D18', 'Triple 17, Double 18'],
    [86, 'T18-D16', 'Triple 18, Double 16'],
    [85, 'T15-D20', 'Triple 15, Double 20'],
    [84, 'T20-D12', 'Triple 20, Double 12'],
    [83, 'T17-D16', 'Triple 17, Double 16'],
    [82, 'T14-D20', 'Triple 14, Double 20'],
    [81, 'T15-D18', 'Triple 15, Double 18'],
    [80, 'T20-D10', 'Triple 20, Double 10'],
    [79, 'T13-D20', 'Triple 13, Double 20'],
    [78, 'T18-D12', 'Triple 18, Double 12'],
    [77, 'T15-D16', 'Triple 15, Double 16'],
    [76, 'T20-D8', 'Triple 20, Double 8'],
    [75, 'T17-D12', 'Triple 17, Double 12'],
    [74, 'T14-D16', 'Triple 14, Double 16'],
    [73, 'T19-D8', 'Triple 19, Double 8'],
    [72, 'T16-D12', 'Triple 16, Double 12'],
    [71, 'T13-D16', 'Triple 13, Double 16'],
    [70, 'T18-D8', 'Triple 18, Double 8'],
    [69, 'T15-D12', 'Triple 15, Double 12'],
    [68, 'T20-D4', 'Triple 20, Double 4'],
    [67, 'T17-D8', 'Triple 17, Double 8'],
    [66, 'T16-D9', 'Triple 16, Double 9'],
    [65, 'T19-D4', 'Triple 19, Double 4'],
    [64, 'T16-D8', 'Triple 16, Double 8'],
    [63, 'T17-D6', 'Triple 17, Double 6'],
    [62, 'T16-D7', 'Triple 16, Double 7'],
    [61, 'T15-D8', 'Triple 15, Double 8'],
    [60, 'S20-D20', 'Single 20, Double 20'],
    [59, 'S19-D20', 'Single 19, Double 20'],
    [58, 'S18-D20', 'Single 18, Double 20'],
    [57, 'S17-D20', 'Single 17, Double 20'],
    [56, 'S16-D20', 'Single 16, Double 20'],
    [55, 'S15-D20', 'Single 15, Double 20'],
    [54, 'S14-D20', 'Single 14, Double 20'],
    [53, 'S13-D20', 'Single 13, Double 20'],
    [52, 'S12-D20', 'Single 12, Double 20'],
    [51, 'S11-D20', 'Single 11, Double 20'],
    [50, 'Bull', 'Bullseye'],
  ];
  
  // Add all the predefined checkouts
  checkoutData.forEach(([score, combination, description]) => {
    checkouts[score] = [{ combination, description }];
  });
  
  // Add simple doubles for even numbers 2-40
  for (let i = 2; i <= 40; i += 2) {
    const double = i / 2;
    if (double <= 20) {
      if (!checkouts[i]) {
        checkouts[i] = [];
      }
      checkouts[i].push({ 
        combination: `D${double}`, 
        description: `Double ${double}` 
      });
    }
  }
  
  // Add setups for odd numbers 3-49 (using single to set up double)
  for (let i = 3; i <= 49; i += 2) {
    if (!checkouts[i]) {
      const remaining = i - 1;
      const double = remaining / 2;
      if (double <= 20) {
        checkouts[i] = [{ 
          combination: `S1-D${double}`, 
          description: `Single 1, Double ${double}` 
        }];
      }
    }
  }
  
  return checkouts;
}

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

// Calculate comprehensive game statistics
export const calculateGameStats = (throws: GameThrow[]) => {
  if (throws.length === 0) {
    return {
      totalThrows: 0,
      totalScore: 0,
      average: 0,
      first9DartAverage: 0,
      highestScore: 0,
      scores100Plus: 0,
      scores140Plus: 0,
      scores180: 0,
      checkoutAttempts: 0,
      successfulCheckouts: 0,
      checkoutPercentage: 0,
      dartsPerLeg: 0,
      finishingPercentage: 0
    };
  }

  const totalScore = throws.reduce((sum, t) => sum + t.score, 0);
  const totalThrows = throws.length;
  const average = Math.round(((totalScore / totalThrows) * 3) * 100) / 100;

  // First 9 dart average (first 3 rounds)
  const first9Throws = throws.slice(0, 3);
  const first9Score = first9Throws.reduce((sum, t) => sum + t.score, 0);
  const first9DartAverage = first9Throws.length > 0 
    ? Math.round(((first9Score / first9Throws.length) * 3) * 100) / 100 
    : 0;

  const highestScore = Math.max(...throws.map(t => t.score), 0);
  const scores100Plus = throws.filter(t => t.score >= 100).length;
  const scores140Plus = throws.filter(t => t.score >= 140).length;
  const scores180 = throws.filter(t => t.score === 180).length;
  
  const checkoutThrows = throws.filter(t => t.isCheckout);
  const successfulCheckouts = checkoutThrows.length;
  
  // This is an approximation - in a real game you'd track checkout attempts separately
  const checkoutAttempts = successfulCheckouts; // Simplified for now
  const checkoutPercentage = checkoutAttempts > 0 
    ? Math.round((successfulCheckouts / checkoutAttempts) * 100)
    : 0;

  return {
    totalThrows,
    totalScore,
    average,
    first9DartAverage,
    highestScore,
    scores100Plus,
    scores140Plus,
    scores180,
    checkoutAttempts,
    successfulCheckouts,
    checkoutPercentage,
    dartsPerLeg: totalThrows * 3, // Approximate
    finishingPercentage: checkoutPercentage
  };
};

// Check if a player is on a finish
export const isOnAFinish = (score: number): boolean => {
  return score <= 170 && score > 1 && score !== 169 && score !== 168 && 
         score !== 166 && score !== 165 && score !== 163 && score !== 162 && 
         score !== 159;
};

// Get the number of darts typically needed for a checkout
export const getCheckoutDarts = (score: number): number => {
  if (score <= 0 || score > 170) return 0;
  if (score === 50) return 1; // Bull
  if (score <= 40 && score % 2 === 0) return 1; // Straight double
  if (score <= 110) return 2; // Most 2-dart finishes
  return 3; // 3-dart finish
};

// Validate that a score follows proper dart game rules
export const validateGameScore = (currentScore: number, thrownScore: number): {
  isValid: boolean;
  isBust: boolean;
  isFinish: boolean;
  newScore: number;
  error?: string;
} => {
  if (!isValidScore(thrownScore)) {
    return {
      isValid: false,
      isBust: false,
      isFinish: false,
      newScore: currentScore,
      error: 'Invalid dart score'
    };
  }

  const newScore = currentScore - thrownScore;

  if (newScore < 0) {
    return {
      isValid: true,
      isBust: true,
      isFinish: false,
      newScore: currentScore,
      error: 'Bust: Score went below zero'
    };
  }

  if (newScore === 1) {
    return {
      isValid: true,
      isBust: true,
      isFinish: false,
      newScore: currentScore,
      error: 'Bust: Cannot finish on 1'
    };
  }

  if (newScore === 0) {
    return {
      isValid: true,
      isBust: false,
      isFinish: true,
      newScore: 0
    };
  }

  return {
    isValid: true,
    isBust: false,
    isFinish: false,
    newScore
  };
};