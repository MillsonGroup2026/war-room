-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  guest BOOLEAN DEFAULT FALSE,
  favorite_team_id INTEGER,
  espn_league_id INTEGER DEFAULT 81511270,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Ballpark ratings table
CREATE TABLE ballpark_ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  park_id TEXT NOT NULL,
  location_score DECIMAL(4,2) DEFAULT 5.0 CHECK (location_score >= 0 AND location_score <= 10),
  field_dynamics_score DECIMAL(4,2) DEFAULT 5.0 CHECK (field_dynamics_score >= 0 AND field_dynamics_score <= 10),
  park_structure_score DECIMAL(4,2) DEFAULT 5.0 CHECK (park_structure_score >= 0 AND park_structure_score <= 10),
  atmosphere_score DECIMAL(4,2) DEFAULT 5.0 CHECK (atmosphere_score >= 0 AND atmosphere_score <= 10),
  historic_score DECIMAL(4,2) DEFAULT 5.0 CHECK (historic_score >= 0 AND historic_score <= 10),
  food_merch_score DECIMAL(4,2) DEFAULT 5.0 CHECK (food_merch_score >= 0 AND food_merch_score <= 10),
  overall_score DECIMAL(4,2) DEFAULT 5.0 CHECK (overall_score >= 0 AND overall_score <= 10),
  tdf_bonus DECIMAL(4,2) DEFAULT 0.0 CHECK (tdf_bonus >= 0 AND tdf_bonus <= 5),
  visited BOOLEAN DEFAULT FALSE,
  visited_date DATE,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, park_id)
);

ALTER TABLE ballpark_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all ballpark ratings"
  ON ballpark_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own ratings"
  ON ballpark_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON ballpark_ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- MLB stats cache
CREATE TABLE mlb_stats_cache (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ballpark_ratings_updated_at
  BEFORE UPDATE ON ballpark_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Aggregated community ratings view
CREATE VIEW community_ballpark_ratings AS
SELECT
  park_id,
  COUNT(*) AS rating_count,
  AVG(
    location_score * 0.15 +
    field_dynamics_score * 0.15 +
    park_structure_score * 0.15 +
    atmosphere_score * 0.15 +
    historic_score * 0.10 +
    food_merch_score * 0.05 +
    overall_score * 0.25 +
    tdf_bonus * 0.10
  ) AS avg_total_score,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY overall_score) AS median_overall,
  AVG(overall_score) AS avg_overall,
  COUNT(*) FILTER (WHERE visited = true) AS visited_count
FROM ballpark_ratings
GROUP BY park_id;
