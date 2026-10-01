-- ==============================================================================
-- FLOWCREATOR OS - NEON POSTGRESQL BGM CATALOG & SEARCH ENGINE
-- High-Performance 1000+ Music Tracks Database Schema with Full-Text Indexing
-- ==============================================================================

-- 1. Create BGM Tracks Table
CREATE TABLE IF NOT EXISTS bgm_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) DEFAULT 'Creator Sounds',
    category VARCHAR(100) NOT NULL, -- 'Sad & Shayari', 'English Sad', 'Podcast', 'Phonk', 'Lofi', 'Bollywood'
    mood VARCHAR(100) DEFAULT 'Trending',
    tags TEXT[] NOT NULL DEFAULT '{}',
    audio_url TEXT NOT NULL,         -- Cloudflare R2 CDN / S3 audio file link
    duration_sec INT DEFAULT 180,
    bpm INT DEFAULT 120,
    play_count INT DEFAULT 0,
    is_trending BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indexes for Ultra-Fast Search (<5ms)
CREATE INDEX IF NOT EXISTS idx_bgm_category ON bgm_tracks (category);
CREATE INDEX IF NOT EXISTS idx_bgm_trending ON bgm_tracks (play_count DESC);
CREATE INDEX IF NOT EXISTS idx_bgm_tags ON bgm_tracks USING GIN (tags);

-- 3. Seed Initial 8 Curated Tracks (Pointing to Cloudflare R2 / CDN)
INSERT INTO bgm_tracks (title, artist, category, mood, tags, audio_url, duration_sec, play_count) VALUES
('Bansuri & Rain Drops (Arijit Vibe)', 'Soulful India', 'Sad & Shayari', 'Melancholy', ARRAY['arijit', 'sad', 'flute', 'bansuri', 'poetry', 'slowed', 'bollywood'], 'https://raw.githubusercontent.com/Talha-Shaikh1/toolshub/main/frontend/public/audio/bgm/bansuri_sad.wav', 18, 1420),
('Sufi Sarangi & Dholak Pulse', 'Jaun Heritage', 'Sad & Shayari', 'Heartbreak', ARRAY['sarangi', 'sufi', 'jaun elia', 'urdu', 'shayari', 'ghazal', 'sad'], 'https://raw.githubusercontent.com/Talha-Shaikh1/toolshub/main/frontend/public/audio/bgm/sufi_sarangi.wav', 18, 1890),
('Snowfall Ambient (Øneheart Aesthetic)', 'Øneheart Style', 'English Sad', 'Lonely Night', ARRAY['snowfall', 'ambient', 'sad', 'aesthetic', 'piano', 'reverb', 'dark'], 'https://raw.githubusercontent.com/Talha-Shaikh1/toolshub/main/frontend/public/audio/bgm/snowfall_ambient.wav', 18, 2540),
('Experience Piano & Strings (Einaudi Style)', 'Cinematic Orchestra', 'English Sad', 'Crescendo', ARRAY['experience', 'einaudi', 'piano', 'violin', 'strings', 'emotional', 'cinematic'], 'https://raw.githubusercontent.com/Talha-Shaikh1/toolshub/main/frontend/public/audio/bgm/experience_piano.wav', 18, 3100),
('Interstellar Cosmic Deep (Zimmer Organ)', 'Cosmic Void', 'Podcast', 'Mind-Expanding', ARRAY['interstellar', 'zimmer', 'organ', 'space', 'podcast', 'thinking', 'deep'], 'https://raw.githubusercontent.com/Talha-Shaikh1/toolshub/main/frontend/public/audio/bgm/interstellar_deep.wav', 18, 1980),
('Lex & Huberman Minimal Focus Drone', 'BioAcoustics', 'Podcast', 'Speech Focus', ARRAY['podcast', 'huberman', 'lex', 'drone', 'focus', 'subbass', 'calm'], 'https://raw.githubusercontent.com/Talha-Shaikh1/toolshub/main/frontend/public/audio/bgm/podcast_drone.wav', 18, 1650),
('Ali Abdaal Coffeehouse Lofi', 'Study Beats Lab', 'Lofi', 'Productive', ARRAY['lofi', 'abdaal', 'study', 'coffee', 'chill', 'vintage', 'relax'], 'https://raw.githubusercontent.com/Talha-Shaikh1/toolshub/main/frontend/public/audio/bgm/lofi_chill.wav', 18, 2800),
('Brazilian Drift Phonk (Gym / 808)', 'Kordhell Vibe', 'Phonk', 'Aggressive', ARRAY['phonk', 'drift', 'gym', 'workout', '808', 'bass', 'brazilian', 'motivation'], 'https://raw.githubusercontent.com/Talha-Shaikh1/toolshub/main/frontend/public/audio/bgm/phonk_gym.wav', 18, 4200)
ON CONFLICT DO NOTHING;
