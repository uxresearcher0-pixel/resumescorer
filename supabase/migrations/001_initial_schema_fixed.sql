-- ============================================================
-- ResumeFit AI — Full Idempotent Schema Migration
-- Safe to run even if tables already exist (uses IF NOT EXISTS)
-- Replaces CREATE POLICY IF NOT EXISTS (unsupported) with
-- DROP POLICY IF EXISTS → CREATE POLICY pattern
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES (all use IF NOT EXISTS — safe to re-run)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
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

CREATE TABLE IF NOT EXISTS public.resumes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS public.job_descriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_title            TEXT NOT NULL,
  company_name         TEXT,
  description_text     TEXT NOT NULL,
  role_category        TEXT,
  extracted_keywords   JSONB,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_id            UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  job_description_id   UUID NOT NULL REFERENCES public.job_descriptions(id) ON DELETE CASCADE,
  overall_score        SMALLINT,
  ats_score            SMALLINT,
  keyword_score        SMALLINT,
  skills_score         SMALLINT,
  experience_score     SMALLINT,
  impact_score         SMALLINT,
  formatting_score     SMALLINT,
  strengths            JSONB,
  weaknesses           JSONB,
  ats_issues           JSONB,
  matched_keywords     JSONB,
  missing_keywords     JSONB,
  skills_matched       JSONB,
  skills_missing       JSONB,
  bullet_rewrites      JSONB,
  section_suggestions  JSONB,
  status               TEXT DEFAULT 'pending'
                         CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message        TEXT,
  processing_time_ms   INTEGER,
  ai_tokens_used       INTEGER,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan                      TEXT NOT NULL,
  status                    TEXT DEFAULT 'active',
  stripe_customer_id        TEXT,
  stripe_subscription_id    TEXT,
  current_period_start      TIMESTAMPTZ,
  current_period_end        TIMESTAMPTZ,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- INDEXES (IF NOT EXISTS supported in PG 9.5+)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_resumes_user_id       ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_jd_user_id            ON public.job_descriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id       ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at    ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status        ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_resume_id     ON public.reports(resume_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions    ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (safe even if they don't exist)
DROP POLICY IF EXISTS "profiles_select_own"      ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"      ON public.profiles;
DROP POLICY IF EXISTS "resumes_all_own"          ON public.resumes;
DROP POLICY IF EXISTS "jd_all_own"               ON public.job_descriptions;
DROP POLICY IF EXISTS "reports_all_own"          ON public.reports;
DROP POLICY IF EXISTS "admin_read_all"           ON public.reports;
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;

-- Re-create policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "resumes_all_own" ON public.resumes
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "jd_all_own" ON public.job_descriptions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reports_all_own" ON public.reports
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_read_all" ON public.reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  true,
  5242880,
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: allow authenticated users to upload/read their own files
DROP POLICY IF EXISTS "resumes_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "resumes_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "resumes_storage_delete" ON storage.objects;

CREATE POLICY "resumes_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = 'resumes' AND (storage.foldername(name))[2] = auth.uid()::text);

CREATE POLICY "resumes_storage_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = 'resumes' AND (storage.foldername(name))[2] = auth.uid()::text);

CREATE POLICY "resumes_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = 'resumes' AND (storage.foldername(name))[2] = auth.uid()::text);
