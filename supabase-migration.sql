-- Darts Scorer Database Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players table - simple name-based identification
CREATE TABLE darts_players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table - stores match configuration and status
CREATE TABLE darts_matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    config JSONB NOT NULL, -- stores sets/legs configuration and other match settings
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    winner_id UUID REFERENCES darts_players(id)
);

-- Match players - links players to matches with their starting scores
CREATE TABLE darts_match_players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES darts_matches(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES darts_players(id) ON DELETE CASCADE,
    starting_score INTEGER NOT NULL,
    position INTEGER NOT NULL, -- player order in the match
    UNIQUE(match_id, player_id),
    UNIQUE(match_id, position)
);

-- Legs table - individual legs within matches
CREATE TABLE darts_legs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES darts_matches(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL DEFAULT 1,
    leg_number INTEGER NOT NULL,
    winner_id UUID REFERENCES darts_players(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(match_id, set_number, leg_number)
);

-- Throws table - individual dart throws/rounds
CREATE TABLE darts_throws (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    leg_id UUID NOT NULL REFERENCES darts_legs(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES darts_players(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL, -- which round in this leg
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 180),
    is_checkout BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_darts_players_name ON darts_players(name);
CREATE INDEX idx_darts_matches_status ON darts_matches(status);
CREATE INDEX idx_darts_matches_created_at ON darts_matches(created_at DESC);
CREATE INDEX idx_darts_match_players_match_id ON darts_match_players(match_id);
CREATE INDEX idx_darts_legs_match_id ON darts_legs(match_id);
CREATE INDEX idx_darts_legs_match_set_leg ON darts_legs(match_id, set_number, leg_number);
CREATE INDEX idx_darts_throws_leg_id ON darts_throws(leg_id);
CREATE INDEX idx_darts_throws_player_id ON darts_throws(player_id);
CREATE INDEX idx_darts_throws_created_at ON darts_throws(created_at DESC);

-- Row Level Security (RLS) - Allow all operations for anon users
ALTER TABLE darts_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE darts_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE darts_match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE darts_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE darts_throws ENABLE ROW LEVEL SECURITY;

-- Policies to allow all operations for anonymous users
CREATE POLICY "Allow all operations on darts_players" ON darts_players
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on darts_matches" ON darts_matches
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on darts_match_players" ON darts_match_players
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on darts_legs" ON darts_legs
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on darts_throws" ON darts_throws
    FOR ALL USING (true) WITH CHECK (true);

-- Helpful views for common queries

-- Player statistics view
CREATE VIEW darts_player_stats AS
SELECT 
    p.id,
    p.name,
    COUNT(DISTINCT m.id) as matches_played,
    COUNT(DISTINCT CASE WHEN m.winner_id = p.id THEN m.id END) as matches_won,
    COUNT(DISTINCT t.id) as total_throws,
    COALESCE(SUM(t.score), 0) as total_score,
    COALESCE(AVG(t.score) * 3, 0) as overall_average, -- 3-dart average
    COALESCE(MAX(t.score), 0) as highest_score,
    COUNT(CASE WHEN t.score >= 100 THEN 1 END) as scores_100_plus,
    COUNT(CASE WHEN t.score >= 140 THEN 1 END) as scores_140_plus,
    COUNT(CASE WHEN t.score = 180 THEN 1 END) as scores_180,
    COUNT(CASE WHEN t.is_checkout THEN 1 END) as successful_checkouts
FROM darts_players p
LEFT JOIN darts_match_players mp ON p.id = mp.player_id
LEFT JOIN darts_matches m ON mp.match_id = m.id AND m.status = 'completed'
LEFT JOIN darts_legs l ON m.id = l.match_id
LEFT JOIN darts_throws t ON l.id = t.leg_id AND t.player_id = p.id
GROUP BY p.id, p.name;

-- Match summary view
CREATE VIEW darts_match_summary AS
SELECT 
    m.id,
    m.created_at,
    m.completed_at,
    m.status,
    m.config,
    w.name as winner_name,
    COUNT(DISTINCT l.id) as total_legs,
    COUNT(DISTINCT mp.player_id) as player_count,
    STRING_AGG(p.name, ' vs ' ORDER BY mp.position) as players
FROM darts_matches m
LEFT JOIN darts_players w ON m.winner_id = w.id
LEFT JOIN darts_match_players mp ON m.id = mp.match_id
LEFT JOIN darts_players p ON mp.player_id = p.id
LEFT JOIN darts_legs l ON m.id = l.match_id
GROUP BY m.id, m.created_at, m.completed_at, m.status, m.config, w.name;