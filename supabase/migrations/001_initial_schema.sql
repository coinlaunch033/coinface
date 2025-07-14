-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tokens table
CREATE TABLE IF NOT EXISTS tokens (
    id SERIAL PRIMARY KEY,
    token_name TEXT NOT NULL,
    token_address TEXT NOT NULL,
    chain TEXT NOT NULL,
    logo_url TEXT,
    theme TEXT NOT NULL DEFAULT 'dark',
    button_style TEXT NOT NULL DEFAULT 'rounded',
    font_style TEXT NOT NULL DEFAULT 'sans',
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meme_drops table
CREATE TABLE IF NOT EXISTS meme_drops (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    token_name TEXT NOT NULL,
    chain TEXT NOT NULL,
    twitter TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tokens_token_name ON tokens(token_name);
CREATE INDEX IF NOT EXISTS idx_tokens_chain ON tokens(chain);
CREATE INDEX IF NOT EXISTS idx_tokens_created_at ON tokens(created_at);
CREATE INDEX IF NOT EXISTS idx_meme_drops_token_name ON meme_drops(token_name);
CREATE INDEX IF NOT EXISTS idx_meme_drops_created_at ON meme_drops(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE meme_drops ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to tokens and meme_drops
CREATE POLICY "Allow public read access to tokens" ON tokens
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to meme_drops" ON meme_drops
    FOR SELECT USING (true);

-- Create policies for authenticated insert access
CREATE POLICY "Allow authenticated insert to tokens" ON tokens
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated insert to meme_drops" ON meme_drops
    FOR INSERT WITH CHECK (true);

-- Create policies for authenticated update access
CREATE POLICY "Allow authenticated update to tokens" ON tokens
    FOR UPDATE USING (true);

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_token_view_count(token_name_param TEXT)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE tokens 
    SET view_count = view_count + 1 
    WHERE token_name ILIKE token_name_param
    RETURNING view_count INTO new_count;
    
    RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql; 