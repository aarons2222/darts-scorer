import { supabase as _supabase } from '@/lib/supabase';

// Type-safe wrapper
const supabase = _supabase as any;
import { Database, DbPlayer, DbMatch, DbLeg, DbThrow, PlayerStats, MatchSummary, MatchConfig } from '@/types/database';
import { GameMatch, GameLeg, GamePlayer } from '@/types/game';

// Player operations
export async function createOrGetPlayer(name: string): Promise<DbPlayer> {
  // First, try to find existing player by name
  const { data: existingPlayer, error: findError } = await (supabase as any)
    .from('darts_players')
    .select('*')
    .eq('name', name)
    .single();

  if (existingPlayer && !findError) {
    return existingPlayer;
  }

  // If not found, create new player
  const { data: newPlayer, error: createError } = await supabase
    .from('darts_players')
    .insert({ name })
    .select('*')
    .single();

  if (createError) {
    throw new Error(`Failed to create player: ${createError.message}`);
  }

  return newPlayer!;
}

export async function getPlayers(): Promise<DbPlayer[]> {
  const { data, error } = await supabase
    .from('darts_players')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch players: ${error.message}`);
  }

  return data || [];
}

// Match operations
export async function createMatch(config: MatchConfig): Promise<DbMatch> {
  const { data: match, error: matchError } = await supabase
    .from('darts_matches')
    .insert({
      config,
      status: 'in_progress'
    })
    .select('*')
    .single();

  if (matchError) {
    throw new Error(`Failed to create match: ${matchError.message}`);
  }

  // Create match players
  const matchPlayers = config.players.map((player, index) => ({
    match_id: match?.id,
    player_id: player.id,
    starting_score: player.startingScore,
    position: index
  }));

  const { error: playersError } = await supabase
    .from('darts_match_players')
    .insert(matchPlayers);

  if (playersError) {
    throw new Error(`Failed to create match players: ${playersError.message}`);
  }

  return match!;
}

export async function getMatch(matchId: string): Promise<DbMatch | null> {
  const { data: match, error: matchError } = await supabase
    .from('darts_matches')
    .select(`
      *,
      darts_match_players (
        *,
        darts_players (*)
      ),
      darts_legs (
        *,
        darts_throws (*),
        winner:darts_players (*)
      )
    `)
    .eq('id', matchId)
    .single();

  if (matchError) {
    if (matchError.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch match: ${matchError.message}`);
  }

  return match as any;
}

export async function getCurrentMatch(): Promise<DbMatch | null> {
  const { data: match, error } = await supabase
    .from('darts_matches')
    .select(`
      *,
      darts_match_players (
        *,
        darts_players (*)
      ),
      darts_legs (
        *,
        darts_throws (*),
        winner:darts_players (*)
      )
    `)
    .eq('status', 'in_progress')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No in-progress match
    }
    throw new Error(`Failed to fetch current match: ${error.message}`);
  }

  return match as any;
}

export async function updateMatchStatus(matchId: string, status: 'completed', winnerId?: string): Promise<void> {
  const updates: any = {
    status,
    completed_at: new Date().toISOString()
  };

  if (winnerId) {
    updates.winner_id = winnerId;
  }

  const { error } = await supabase
    .from('darts_matches')
    .update(updates)
    .eq('id', matchId);

  if (error) {
    throw new Error(`Failed to update match status: ${error.message}`);
  }
}

// Leg operations
export async function createLeg(matchId: string, setNumber: number, legNumber: number): Promise<DbLeg> {
  const { data: leg, error } = await supabase
    .from('darts_legs')
    .insert({
      match_id: matchId,
      set_number: setNumber,
      leg_number: legNumber
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create leg: ${error.message}`);
  }

  return leg!;
}

export async function completeLeg(legId: string, winnerId: string): Promise<void> {
  const { error } = await supabase
    .from('darts_legs')
    .update({
      winner_id: winnerId,
      completed_at: new Date().toISOString()
    })
    .eq('id', legId);

  if (error) {
    throw new Error(`Failed to complete leg: ${error.message}`);
  }
}

// Throw operations
export async function addThrow(
  legId: string, 
  playerId: string, 
  roundNumber: number, 
  score: number, 
  isCheckout: boolean = false
): Promise<DbThrow> {
  const { data: throwData, error } = await supabase
    .from('darts_throws')
    .insert({
      leg_id: legId,
      player_id: playerId,
      round_number: roundNumber,
      score,
      is_checkout: isCheckout
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to add throw: ${error.message}`);
  }

  return throwData!;
}

export async function getThrowsForLeg(legId: string): Promise<DbThrow[]> {
  const { data, error } = await supabase
    .from('darts_throws')
    .select(`
      *,
      darts_players (*)
    `)
    .eq('leg_id', legId)
    .order('created_at');

  if (error) {
    throw new Error(`Failed to fetch throws: ${error.message}`);
  }

  return data as any;
}

export async function removeLastThrow(legId: string, playerId: string): Promise<void> {
  // Get the most recent throw for this player in this leg
  const { data: lastThrow, error: fetchError } = await supabase
    .from('darts_throws')
    .select('*')
    .eq('leg_id', legId)
    .eq('player_id', playerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (fetchError || !lastThrow) {
    throw new Error('No throw to remove');
  }

  const { error: deleteError } = await supabase
    .from('darts_throws')
    .delete()
    .eq('id', lastThrow.id);

  if (deleteError) {
    throw new Error(`Failed to remove throw: ${deleteError.message}`);
  }
}

// Statistics operations
export async function getPlayerStats(): Promise<PlayerStats[]> {
  const { data, error } = await supabase
    .from('darts_player_stats')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch player stats: ${error.message}`);
  }

  return (data || []).map((player: any) => ({
    ...player,
    win_percentage: player.matches_played > 0 
      ? Math.round((player.matches_won / player.matches_played) * 100)
      : 0
  }));
}

export async function getMatchHistory(): Promise<MatchSummary[]> {
  const { data, error } = await supabase
    .from('darts_match_summary')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch match history: ${error.message}`);
  }

  return data || [];
}

// Utility functions for converting between game state and database
export function convertDbMatchToGameMatch(dbMatch: DbMatch): GameMatch {
  const legs: GameLeg[] = [];
  
  // Group legs and build game state
  if (dbMatch.legs) {
    dbMatch.legs.forEach((leg: any) => {
      const throws = leg.darts_throws || [];
      const players: GamePlayer[] = dbMatch.config.players.map(configPlayer => {
        const playerThrows = throws
          .filter((t: any) => t.player_id === configPlayer.id)
          .map((t: any) => ({
            score: t.score,
            roundNumber: t.round_number,
            isCheckout: t.is_checkout
          }));

        const totalScore = playerThrows.reduce((sum: number, t: any) => sum + t.score, 0);

        return {
          id: configPlayer.id,
          name: configPlayer.name,
          startingScore: configPlayer.startingScore,
          currentScore: configPlayer.startingScore - totalScore,
          throws: playerThrows,
          isFinished: leg.winner_id === configPlayer.id
        };
      });

      legs.push({
        id: leg.id,
        setNumber: leg.set_number,
        legNumber: leg.leg_number,
        players,
        winnerId: leg.winner_id || undefined,
        currentPlayerIndex: 0, // This would need to be calculated
        currentRound: Math.max(...players.map(p => p.throws.length)) + 1,
        isCompleted: !!leg.winner_id
      });
    });
  }

  // Group legs into sets
  const setsMap = new Map();
  legs.forEach(leg => {
    if (!setsMap.has(leg.setNumber)) {
      setsMap.set(leg.setNumber, {
        setNumber: leg.setNumber,
        legs: [],
        winnerId: undefined,
        isCompleted: false
      });
    }
    setsMap.get(leg.setNumber).legs.push(leg);
  });

  const sets = Array.from(setsMap.values()).sort((a, b) => a.setNumber - b.setNumber);

  return {
    id: dbMatch.id,
    config: dbMatch.config,
    sets,
    currentSetIndex: Math.max(0, sets.length - 1),
    currentLegIndex: sets.length > 0 ? Math.max(0, sets[sets.length - 1].legs.length - 1) : 0,
    status: dbMatch.status,
    winnerId: dbMatch.winner_id || undefined,
    timestamp: new Date(dbMatch.created_at).getTime()
  };
}

// Head-to-head statistics
export async function getHeadToHeadStats(player1Id: string, player2Id: string): Promise<{
  player1Wins: number;
  player2Wins: number;
  totalMatches: number;
}> {
  // Get all completed matches between these two players
  const { data, error } = await supabase
    .from('darts_matches')
    .select(`
      id,
      winner_id,
      darts_match_players!inner (player_id)
    `)
    .eq('status', 'completed')
    .in('winner_id', [player1Id, player2Id]);

  if (error) {
    throw new Error(`Failed to fetch head-to-head stats: ${error.message}`);
  }

  // Filter to matches where both players participated
  const headToHeadMatches = (data || []).filter((match: any) => {
    const playerIds = match.darts_match_players.map((mp: any) => mp.player_id);
    return playerIds.includes(player1Id) && playerIds.includes(player2Id);
  });

  const player1Wins = headToHeadMatches.filter((m: any) => m.winner_id === player1Id).length;
  const player2Wins = headToHeadMatches.filter((m: any) => m.winner_id === player2Id).length;

  return {
    player1Wins,
    player2Wins,
    totalMatches: headToHeadMatches.length
  };
}