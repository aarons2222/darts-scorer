// This file is deprecated - we now use Supabase instead of localStorage
// Keeping for backward compatibility but all functions are no-ops

export const saveMatch = (match: any): void => {
  console.warn('localStorage functions are deprecated - use Supabase instead');
};

export const getMatchHistory = (): any[] => {
  console.warn('localStorage functions are deprecated - use Supabase instead');
  return [];
};

export const saveCurrentMatch = (match: any): void => {
  console.warn('localStorage functions are deprecated - use Supabase instead');
};

export const getCurrentMatch = (): any => {
  console.warn('localStorage functions are deprecated - use Supabase instead');
  return null;
};

export const clearCurrentMatch = (): void => {
  console.warn('localStorage functions are deprecated - use Supabase instead');
};

export const savePlayerProfile = (profile: any): void => {
  console.warn('localStorage functions are deprecated - use Supabase instead');
};

export const getPlayerProfiles = (): any[] => {
  console.warn('localStorage functions are deprecated - use Supabase instead');
  return [];
};

export const getPlayerProfile = (playerId: string): any => {
  console.warn('localStorage functions are deprecated - use Supabase instead');
  return null;
};

export const updatePlayerStats = (match: any): void => {
  console.warn('localStorage functions are deprecated - use Supabase instead');
};