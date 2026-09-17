-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. USER PROFILES TABLE
-- Stores profile data including username, birthday countdown, bank account info, savings, and transactions
-- ================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    birthday_days_left INT NOT NULL DEFAULT 100,
    savings_dollars NUMERIC(12, 2) NOT NULL DEFAULT 10.00,
    birthday_date DATE,
    bank_name TEXT DEFAULT 'Banco Principal',
    account_number TEXT DEFAULT '**** **** 1234',
    bank_notes TEXT DEFAULT 'Cuenta de Ahorros Personal',
    transactions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backwards compatibility: user_stats table as view or table
CREATE TABLE IF NOT EXISTS public.user_stats (
    id TEXT PRIMARY KEY DEFAULT 'default_user',
    birthday_days_left INT NOT NULL DEFAULT 100,
    savings_dollars NUMERIC(12, 2) NOT NULL DEFAULT 10.00,
    birthday_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS) policies for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to user_profiles"
    ON public.user_profiles FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert and update to user_profiles"
    ON public.user_profiles FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public delete to user_profiles"
    ON public.user_profiles FOR DELETE
    USING (true);

-- Row Level Security (RLS) policies for user_stats
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to user_stats"
    ON public.user_stats FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert and update to user_stats"
    ON public.user_stats FOR ALL
    USING (true)
    WITH CHECK (true);


-- ================================================
-- 2. TELEMETRY LOGS TABLE
-- Stores user interactions, game responses, reactions, and choices in real-time
-- ================================================
CREATE TABLE IF NOT EXISTS public.telemetry_logs (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    game_title TEXT NOT NULL,
    action TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    timestamp TEXT NOT NULL,
    username TEXT DEFAULT 'Carolina',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS) policies for telemetry_logs
ALTER TABLE public.telemetry_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to telemetry_logs"
    ON public.telemetry_logs FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert access to telemetry_logs"
    ON public.telemetry_logs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public delete access to telemetry_logs"
    ON public.telemetry_logs FOR DELETE
    USING (true);


-- ================================================
-- 3. GAME CONFIGURATIONS TABLE
-- Stores custom questions, choices, jokes, and roulette prizes set by admin
-- ================================================
CREATE TABLE IF NOT EXISTS public.game_configs (
    game_id TEXT PRIMARY KEY,
    config_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS) policies for game_configs
ALTER TABLE public.game_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to game_configs"
    ON public.game_configs FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert and update access to game_configs"
    ON public.game_configs FOR ALL
    USING (true)
    WITH CHECK (true);


-- ================================================
-- 4. INITIAL DATA MIGRATION FOR CAROLINA
-- Migrate default user data into Carolina profile if not existing
-- ================================================
INSERT INTO public.user_profiles (id, username, birthday_days_left, savings_dollars, bank_name, account_number, bank_notes, transactions)
VALUES (
    'profile_carolina',
    'Carolina',
    100,
    10.00,
    'Banco Principal',
    '**** **** 4821',
    'Cuenta Ahorro Cumpleaños Carolina',
    '[{"id":"tx_init","type":"deposit","amount":10,"description":"Saldo Inicial Migrado","date":"2025-01-01"}]'::jsonb
)
ON CONFLICT (username) DO NOTHING;


-- ================================================
-- 5. REALTIME REPLICATION SETUP
-- Enables Supabase Realtime broadcast and changes for all tables
-- ================================================
BEGIN;
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
      CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
    ELSE
      ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
      ALTER PUBLICATION supabase_realtime ADD TABLE public.user_stats;
      ALTER PUBLICATION supabase_realtime ADD TABLE public.telemetry_logs;
      ALTER PUBLICATION supabase_realtime ADD TABLE public.game_configs;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      NULL;
  END $$;
COMMIT;

-- Set replica identity to FULL for realtime change tracking
ALTER TABLE public.user_profiles REPLICA IDENTITY FULL;
ALTER TABLE public.user_stats REPLICA IDENTITY FULL;
ALTER TABLE public.telemetry_logs REPLICA IDENTITY FULL;
ALTER TABLE public.game_configs REPLICA IDENTITY FULL;
