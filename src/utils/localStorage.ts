import { Match, PlayerProfile } from '@/types/game';

const MATCH_HISTORY_KEY = 'darts_match_history';
const PLAYER_PROFILES_KEY = 'darts_player_profiles';
const CURRENT_MATCH_KEY = 'darts_current_match';

export const saveMatch = (match: Match): void => {
  try {
    const existingMatches = getMatchHistory();
    const updatedMatches = [match, ...existingMatches.filter(m => m.id !== match.id)];
    localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(updatedMatches));
  } catch (error) {
    console.error('Failed to save match:', error);
  }
};

export const getMatchHistory = (): Match[] => {
  try {
    const stored = localStorage.getItem(MATCH_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load match history:', error);
    return [];
  }
};

export const saveCurrentMatch = (match: Match): void => {
  try {
    localStorage.setItem(CURRENT_MATCH_KEY, JSON.stringify(match));
  } catch (error) {
    console.error('Failed to save current match:', error);
  }
};

export const getCurrentMatch = (): Match | null => {
  try {
    const stored = localStorage.getItem(CURRENT_MATCH_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load current match:', error);
    return null;
  }
};

export const clearCurrentMatch = (): void => {
  try {
    localStorage.removeItem(CURRENT_MATCH_KEY);
  } catch (error) {
    console.error('Failed to clear current match:', error);
  }
};

export const savePlayerProfile = (profile: PlayerProfile): void => {
  try {
    const profiles = getPlayerProfiles();
    const updatedProfiles = profiles.filter(p => p.id !== profile.id);
    updatedProfiles.push(profile);
    localStorage.setItem(PLAYER_PROFILES_KEY, JSON.stringify(updatedProfiles));
  } catch (error) {
    console.error('Failed to save player profile:', error);
  }
};

export const getPlayerProfiles = (): PlayerProfile[] => {
  try {
    const stored = localStorage.getItem(PLAYER_PROFILES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load player profiles:', error);
    return [];
  }
};

export const getPlayerProfile = (playerId: string): PlayerProfile | null => {
  try {
    const profiles = getPlayerProfiles();
    return profiles.find(p => p.id === playerId) || null;
  } catch (error) {
    console.error('Failed to load player profile:', error);
    return null;
  }
};

export const updatePlayerStats = (match: Match): void => {
  try {
    const profiles = getPlayerProfiles();
    
    match.settings.players.forEach(player => {
      let profile = profiles.find(p => p.id === player.id);
      
      if (!profile) {
        profile = {
          id: player.id,
          name: player.name,
          stats: {
            gamesPlayed: 0,
            gamesWon: 0,
            bestAverage: 0,
            highestScore: 0,
            highestCheckout: 0,
            totalDartsThrown: 0,
            totalScore: 0,
          },
          headToHead: {},
        };
        profiles.push(profile);
      }
      
      // Update basic stats
      profile.stats.gamesPlayed += 1;
      if (match.winnerId === player.id) {
        profile.stats.gamesWon += 1;
      }
      
      // Calculate stats from all legs in all sets
      let totalScore = 0;
      let dartCount = 0;
      let highestScore = 0;
      let highestCheckout = 0;
      
      match.sets.forEach(set => {
        set.legs.forEach(leg => {
          const legPlayer = leg.players.find(p => p.id === player.id);
          if (legPlayer) {
            const playerScores = legPlayer.scores;
            totalScore += playerScores.reduce((sum, score) => sum + score, 0);
            dartCount += playerScores.length * 3; // 3 darts per turn
            
            const legHighest = Math.max(...playerScores);
            if (legHighest > highestScore) {
              highestScore = legHighest;
            }
            
            // Check for checkouts (when player finished the leg)
            if (leg.winnerId === player.id && playerScores.length > 0) {
              const finalScore = playerScores[playerScores.length - 1];
              if (finalScore > highestCheckout) {
                highestCheckout = finalScore;
              }
            }
          }
        });
      });
      
      // Update profile stats
      if (dartCount > 0) {
        const average = (totalScore / dartCount) * 3; // 3-dart average
        if (average > profile.stats.bestAverage) {
          profile.stats.bestAverage = Math.round(average * 100) / 100;
        }
      }
      
      if (highestScore > profile.stats.highestScore) {
        profile.stats.highestScore = highestScore;
      }
      
      if (highestCheckout > profile.stats.highestCheckout) {
        profile.stats.highestCheckout = highestCheckout;
      }
      
      profile.stats.totalDartsThrown += dartCount;
      profile.stats.totalScore += totalScore;
      
      // Update head-to-head records
      match.settings.players.forEach(opponent => {
        if (opponent.id !== player.id) {
          if (!profile!.headToHead[opponent.id]) {
            profile!.headToHead[opponent.id] = { wins: 0, losses: 0 };
          }
          
          if (match.winnerId === player.id) {
            profile!.headToHead[opponent.id].wins += 1;
          } else if (match.winnerId === opponent.id) {
            profile!.headToHead[opponent.id].losses += 1;
          }
        }
      });
    });
    
    localStorage.setItem(PLAYER_PROFILES_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Failed to update player stats:', error);
  }
};