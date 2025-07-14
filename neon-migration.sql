-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
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

-- Create meme_drop_entries table
CREATE TABLE IF NOT EXISTS meme_drop_entries (
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
CREATE INDEX IF NOT EXISTS idx_meme_drop_entries_token_name ON meme_drop_entries(token_name);
CREATE INDEX IF NOT EXISTS idx_meme_drop_entries_created_at ON meme_drop_entries(created_at); 