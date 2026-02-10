export interface Database {
  public: {
    Tables: {
      darts_players: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      darts_matches: {
        Row: {
          id: string;
          config: MatchConfig;
          status: 'in_progress' | 'completed';
          created_at: string;
          completed_at: string | null;
          winner_id: string | null;
        };
        Insert: {
          id?: string;
          config: MatchConfig;
          status?: 'in_progress' | 'completed';
          created_at?: string;
          completed_at?: string | null;
          winner_id?: string | null;
        };
        Update: {
          id?: string;
          config?: MatchConfig;
          status?: 'in_progress' | 'completed';
          created_at?: string;
          completed_at?: string | null;
          winner_id?: string | null;
        };
      };
      darts_match_players: {
        Row: {
          id: string;
          match_id: string;
          player_id: string;
          starting_score: number;
          position: number;
        };
        Insert: {
          id?: string;
          match_id: string;
          player_id: string;
          starting_score: number;
          position: number;
        };
        Update: {
          id?: string;
          match_id?: string;
          player_id?: string;
          starting_score?: number;
          position?: number;
        };
      };
      darts_legs: {
        Row: {
          id: string;
          match_id: string;
          set_number: number;
          leg_number: number;
          winner_id: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          match_id: string;
          set_number?: number;
          leg_number: number;
          winner_id?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          match_id?: string;
          set_number?: number;
          leg_number?: number;
          winner_id?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      darts_throws: {
        Row: {
          id: string;
          leg_id: string;
          player_id: string;
          round_number: number;
          score: number;
          is_checkout: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          leg_id: string;
          player_id: string;
          round_number: number;
          score: number;
          is_checkout?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          leg_id?: string;
          player_id?: string;
          round_number?: number;
          score?: number;
          is_checkout?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      darts_player_stats: {
        Row: {
          id: string;
          name: string;
          matches_played: number;
          matches_won: number;
          total_throws: number;
          total_score: number;
          overall_average: number;
          highest_score: number;
          scores_100_plus: number;
          scores_140_plus: number;
          scores_180: number;
          successful_checkouts: number;
        };
      };
      darts_match_summary: {
        Row: {
          id: string;
          created_at: string;
          completed_at: string | null;
          status: 'in_progress' | 'completed';
          config: MatchConfig;
          winner_name: string | null;
          total_legs: number;
          player_count: number;
          players: string;
        };
      };
    };
  };
}

// Match configuration stored in JSONB
export interface MatchConfig {
  numberOfSets?: number;
  numberOfLegs: number;
  players: {
    id: string;
    name: string;
    startingScore: number;
  }[];
}

// Extended types for application use
export interface DbPlayer {
  id: string;
  name: string;
  created_at: string;
}

export interface DbMatch {
  id: string;
  config: MatchConfig;
  status: 'in_progress' | 'completed';
  created_at: string;
  completed_at: string | null;
  winner_id: string | null;
  players?: DbPlayer[];
  legs?: DbLeg[];
}

export interface DbMatchPlayer {
  id: string;
  match_id: string;
  player_id: string;
  starting_score: number;
  position: number;
  player?: DbPlayer;
}

export interface DbLeg {
  id: string;
  match_id: string;
  set_number: number;
  leg_number: number;
  winner_id: string | null;
  created_at: string;
  completed_at: string | null;
  throws?: DbThrow[];
  winner?: DbPlayer;
}

export interface DbThrow {
  id: string;
  leg_id: string;
  player_id: string;
  round_number: number;
  score: number;
  is_checkout: boolean;
  created_at: string;
  player?: DbPlayer;
}

export interface PlayerStats {
  id: string;
  name: string;
  matches_played: number;
  matches_won: number;
  total_throws: number;
  total_score: number;
  overall_average: number;
  highest_score: number;
  scores_100_plus: number;
  scores_140_plus: number;
  scores_180: number;
  successful_checkouts: number;
  win_percentage: number;
}

export interface MatchSummary {
  id: string;
  created_at: string;
  completed_at: string | null;
  status: 'in_progress' | 'completed';
  config: MatchConfig;
  winner_name: string | null;
  total_legs: number;
  player_count: number;
  players: string;
}