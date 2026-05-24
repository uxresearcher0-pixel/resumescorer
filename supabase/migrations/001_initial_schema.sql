-- ============================================================
-- ResumeFit AI — Initial Database Schema
-- Run: npx supabase db push
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  email         TEXT UNIQUE NOT NULL,
  role          TEXT DEFAULT 'user'
                  CHECK (role IN ('user', 'admin', 'consultant')),
  plan          TEXT DEFAULT 'free'
                  CHECK (plan IN ('free', 'pro', 'enterprise')),
  scans_used    INTEGER DEFAULT 0,
  scans_limit   INTEGER DEFAULT 3,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Reset scans_used monthly (call via cron or Supabase scheduled function)
CREATE OR REPLACE FUNCTION public.reset_monthly_scans()
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles SET scans_used = 0 WHERE plan = 'free';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RESUMES
-- ============================================================
CREATE TABLE public.resumes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name        TEXT NOT NULL,
  file_url         TEXT NOT NULL,
  file_type        TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'txt')),
  file_size_kb     INTEGER,
  extracted_text   TEXT,
  parsed_sections  JSONB,
  word_count       INTEGER,
  page_count       INTEGER,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- JOB DESCRIPTIONS
-- ============================================================
CREATE TABLE public.job_descriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_title            TEXT NOT NULL,
  company_name         TEXT,
  description_text     TEXT NOT NULL,
  role_category        TEXT,
  extracted_keywords   JSONB,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE public.reports (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resume_id            UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  job_description_id   UUID NOT NULL REFERENCES job_descriptions(id) ON DELETE CASCADE,

  -- Scores (0–100)
  overall_score        SMALLINT,
  ats_score            SMALLINT,
  keyword_score        SMALLINT,
  skills_score         SMALLINT,
  experience_score     SMALLINT,
  impact_score         SMALLINT,
  formatting_score     SMALLINT,

  -- Analysis payloads (JSON arrays / objects)
  strengths            JSONB,
  weaknesses           JSONB,
  ats_issues           JSONB,
  matched_keywords     JSONB,
  missing_keywords     JSONB,
  skills_matched       JSONB,
  skills_missing       JSONB,
  bullet_rewrites      JSONB,
  section_suggestions  JSONB,

  -- Meta
  status               TEXT DEFAULT 'pending'
                         CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message        TEXT,
  processing_time_ms   INTEGER,
  ai_tokens_used       INTEGER,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTIONS (Phase 2 — Stripe)
-- ============================================================
CREATE TABLE public.subscriptions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan                      TEXT NOT NULL,
  status                    TEXT DEFAULT 'active',
  stripe_customer_id        TEXT,
  stripe_subscription_id    TEXT,
  current_period_start      TIMESTAMPTZ,
  current_period_end        TIMESTAMPTZ,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_resumes_user_id       ON resumes(user_id);
CREATE INDEX idx_jd_user_id            ON job_descriptions(user_id);
CREATE INDEX idx_reports_user_id       ON reports(user_id);
CREATE INDEX idx_reports_created_at    ON reports(created_at DESC);
CREATE INDEX idx_reports_status        ON reports(status);
CREATE INDEX idx_reports_resume_id     ON reports(resume_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports          ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions    ENABLE ROW LEVEL SECURITY;

-- Profiles: users see only their own
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Resumes: users CRUD their own
CREATE POLICY "resumes_all_own" ON resumes
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Job descriptions: users CRUD their own
CREATE POLICY "jd_all_own" ON job_descriptions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Reports: users CRUD their own
CREATE POLICY "reports_all_own" ON reports
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all
CREATE POLICY "admin_read_all" ON reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Subscriptions: users see their own
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET (run in Supabase dashboard or via API)
-- ============================================================
-- Create bucket "resumes" with max 5MB file size
-- INSERT INTO storage.buckets (id, name, file_size_limit, allowed_mime_types)
-- VALUES (
--   'resumes', 'resumes', 5242880,
--   ARRAY['application/pdf',
--         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
--         'text/plain']
-- );
