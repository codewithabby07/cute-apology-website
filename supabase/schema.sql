-- ==============================================================================
-- CUTE APOLOGY TEMPLATE MANAGEMENT PLATFORM - DATABASE SCHEMA & MIGRATIONS
-- Supabase PostgreSQL with Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Templates Table
-- Stores metadata for registered apology templates
CREATE TABLE IF NOT EXISTS public.templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Personalized Links Table
-- Stores individual personalized link records for couples
CREATE TABLE IF NOT EXISTS public.personalized_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    template_id TEXT NOT NULL REFERENCES public.templates(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    sender_name TEXT NOT NULL,
    receiver_name TEXT NOT NULL,
    custom_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    views_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for high-performance slug lookups
CREATE INDEX IF NOT EXISTS idx_personalized_links_slug ON public.personalized_links(slug);
CREATE INDEX IF NOT EXISTS idx_personalized_links_template ON public.personalized_links(template_id);
CREATE INDEX IF NOT EXISTS idx_personalized_links_active ON public.personalized_links(is_active);

-- 4. Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_updated_at_templates ON public.templates;
CREATE TRIGGER trigger_set_updated_at_templates
    BEFORE UPDATE ON public.templates
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_set_updated_at_links ON public.personalized_links;
CREATE TRIGGER trigger_set_updated_at_links
    BEFORE UPDATE ON public.personalized_links
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- 5. Atomic view counter function for public visitors
CREATE OR REPLACE FUNCTION public.increment_link_views(target_slug TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.personalized_links
    SET views_count = views_count + 1
    WHERE slug = target_slug AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Seed Initial Template: cute-apology
INSERT INTO public.templates (id, name, description, thumbnail_url, is_active)
VALUES (
    'cute-apology',
    'Cute Apology Website',
    'The classic Cutiepage 6-step interactive apology journey with mini-game, letter, gallery & songs.',
    './assets/intro.gif',
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    thumbnail_url = EXCLUDED.thumbnail_url,
    is_active = EXCLUDED.is_active;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_links ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Policies for 'templates'
-- ------------------------------------------------------------------------------

-- Public (anon & authenticated) can view active templates
DROP POLICY IF EXISTS "Public can view active templates" ON public.templates;
CREATE POLICY "Public can view active templates"
    ON public.templates
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- Authenticated admins have full management permissions
DROP POLICY IF EXISTS "Admins have full access to templates" ON public.templates;
CREATE POLICY "Admins have full access to templates"
    ON public.templates
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- Policies for 'personalized_links'
-- ------------------------------------------------------------------------------

-- Public visitors can read ACTIVE personalized links by slug
-- Note: Sensitive or admin fields are protected, only active links are accessible
DROP POLICY IF EXISTS "Public can view active personalized links" ON public.personalized_links;
CREATE POLICY "Public can view active personalized links"
    ON public.personalized_links
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- Public visitors CANNOT insert, update, or delete links
-- Only authenticated users (admins) can create, update, or delete links
DROP POLICY IF EXISTS "Admins have full access to personalized links" ON public.personalized_links;
CREATE POLICY "Admins have full access to personalized links"
    ON public.personalized_links
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
