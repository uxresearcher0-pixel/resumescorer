-- ============================================================
-- Migration 002: Add gap analysis, failure reasons, roadmap
-- Run in Supabase SQL Editor after 001_initial_schema_fixed.sql
-- ============================================================

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS failure_reasons     JSONB,
  ADD COLUMN IF NOT EXISTS gap_analysis        JSONB,
  ADD COLUMN IF NOT EXISTS improvement_roadmap JSONB;
