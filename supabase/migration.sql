-- Create darts tables with proper foreign keys and RLS disabled (public access)

-- Players table
CREATE TABLE IF NOT EXISTS darts_players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table with config stored as JSONB
CREATE TABLE IF NOT EXISTS darts_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    winner_id UUID REFERENCES darts_players(id)
);

-- Match players junction table (for tracking player order and starting scores)
CREATE TABLE IF NOT EXISTS darts_match_players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES darts_matches(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES darts_players(id),
    starting_score INTEGER NOT NULL DEFAULT 501,
    position INTEGER NOT NULL,
    UNIQUE(match_id, player_id),
    UNIQUE(match_id, position)
);

-- Legs table (tracks individual legs within matches)
CREATE TABLE IF NOT EXISTS darts_legs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES darts_matches(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL DEFAULT 1,
    leg_number INTEGER NOT NULL,
    winner_id UUID REFERENCES darts_players(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(match_id, set_number, leg_number)
);

-- Throws table (individual dart throws)
CREATE TABLE IF NOT EXISTS darts_throws (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    leg_id UUID NOT NULL REFERENCES darts_legs(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES darts_players(id),
    round_number INTEGER NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 180),
    is_checkout BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create views for statistics
CREATE OR REPLACE VIEW darts_player_stats AS
SELECT 
    p.id,
    p.name,
    COUNT(DISTINCT m.id) as matches_played,
    COUNT(DISTINCT CASE WHEN m.winner_id = p.id THEN m.id END) as matches_won,
    COUNT(t.id) as total_throws,
    COALESCE(SUM(t.score), 0) as total_score,
    CASE 
        WHEN COUNT(t.id) > 0 THEN ROUND(COALESCE(SUM(t.score), 0)::decimal / COUNT(t.id), 2)
        ELSE 0
    END as overall_average,
    COALESCE(MAX(t.score), 0) as highest_score,
    COUNT(CASE WHEN t.score >= 100 THEN 1 END) as scores_100_plus,
    COUNT(CASE WHEN t.score >= 140 THEN 1 END) as scores_140_plus,
    COUNT(CASE WHEN t.score = 180 THEN 1 END) as scores_180,
    COUNT(CASE WHEN l.winner_id = p.id THEN 1 END) as successful_checkouts
FROM darts_players p
LEFT JOIN darts_matches m ON m.config::jsonb ? p.id::text OR m.winner_id = p.id
LEFT JOIN darts_legs l ON l.winner_id = p.id
LEFT JOIN darts_throws t ON t.player_id = p.id
GROUP BY p.id, p.name;

CREATE OR REPLACE VIEW darts_match_summary AS
SELECT 
    m.id,
    m.created_at,
    m.completed_at,
    m.status,
    m.config,
    winner.name as winner_name,
    COUNT(DISTINCT l.id) as total_legs,
    JSONB_ARRAY_LENGTH(m.config->'players') as player_count,
    STRING_AGG(DISTINCT players.name, ', ' ORDER BY players.name) as players
FROM darts_matches m
LEFT JOIN darts_players winner ON winner.id = m.winner_id
LEFT JOIN darts_legs l ON l.match_id = m.id
LEFT JOIN LATERAL (
    SELECT p.name
    FROM darts_players p
    WHERE p.id = ANY(
        SELECT jsonb_array_elements_text(
            jsonb_path_query_array(m.config, '$.players[*].id')
        )::uuid
    )
) players ON true
GROUP BY m.id, m.created_at, m.completed_at, m.status, m.config, winner.name;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_darts_matches_status ON darts_matches(status);
CREATE INDEX IF NOT EXISTS idx_darts_matches_config ON darts_matches USING GIN(config);
CREATE INDEX IF NOT EXISTS idx_darts_match_players_match_id ON darts_match_players(match_id);
CREATE INDEX IF NOT EXISTS idx_darts_match_players_player_id ON darts_match_players(player_id);
CREATE INDEX IF NOT EXISTS idx_darts_legs_match_id ON darts_legs(match_id);
CREATE INDEX IF NOT EXISTS idx_darts_throws_leg_id ON darts_throws(leg_id);
CREATE INDEX IF NOT EXISTS idx_darts_throws_player_id ON darts_throws(player_id);

-- Disable RLS (Row Level Security) for public access - no auth required
ALTER TABLE darts_players DISABLE ROW LEVEL SECURITY;
ALTER TABLE darts_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE darts_match_players DISABLE ROW LEVEL SECURITY;
ALTER TABLE darts_legs DISABLE ROW LEVEL SECURITY;
ALTER TABLE darts_throws DISABLE ROW LEVEL SECURITY;

-- Grant public access to all tables and views
GRANT ALL ON darts_players TO anon, authenticated;
GRANT ALL ON darts_matches TO anon, authenticated;
GRANT ALL ON darts_match_players TO anon, authenticated;
GRANT ALL ON darts_legs TO anon, authenticated;
GRANT ALL ON darts_throws TO anon, authenticated;
GRANT SELECT ON darts_player_stats TO anon, authenticated;
GRANT SELECT ON darts_match_summary TO anon, authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;