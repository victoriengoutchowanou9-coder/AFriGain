-- ====================================================================
-- AFriGain : Innovations Stratégiques & Collectif
-- Tables réelles pour Passport, Collectif, Ressources, Challenges & Studio
-- ====================================================================

-- 1. Table des Projets Collectifs (Innovation 4 : AfriGain Collectif)
CREATE TABLE IF NOT EXISTS public.collectif_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    problem_to_solve TEXT NOT NULL,
    activity_planned TEXT NOT NULL,
    objectives TEXT NOT NULL,
    available_skills TEXT[] DEFAULT '{}',
    needed_skills TEXT[] DEFAULT '{}',
    needed_resources TEXT,
    location_city TEXT DEFAULT 'Cotonou',
    location_country TEXT DEFAULT 'Bénin',
    timeline TEXT,
    estimated_budget NUMERIC,
    currency TEXT DEFAULT 'XOF',
    funding_status TEXT DEFAULT 'auto_finance' CHECK (funding_status IN ('auto_finance', 'recherche_fonds', 'finance_valide', 'pret_d_honneur')),
    status TEXT DEFAULT 'open' CHECK (status IN ('draft', 'open', 'team_building', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membres et candidatures aux projets collectifs
CREATE TABLE IF NOT EXISTS public.collectif_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.collectif_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_assigned TEXT,
    skills_contributed TEXT[] DEFAULT '{}',
    motivation TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des Équipements & Ressources Partagées (Innovation 5 : AfriGain Ressources)
CREATE TABLE IF NOT EXISTS public.shared_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('informatique', 'photo_video', 'textile_couture', 'btp_outillage', 'agricole', 'espaces_ateliers', 'autre')),
    description TEXT NOT NULL,
    photos TEXT[] DEFAULT '{}',
    location_city TEXT DEFAULT 'Cotonou',
    location_country TEXT DEFAULT 'Bénin',
    terms_of_use TEXT,
    price_per_day NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'XOF',
    is_free_sharing BOOLEAN DEFAULT FALSE,
    deposit_required NUMERIC DEFAULT 0,
    availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'reserved', 'maintenance', 'unavailable')),
    verification_status TEXT DEFAULT 'verified',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Réservations de ressources
CREATE TABLE IF NOT EXISTS public.resource_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID REFERENCES public.shared_resources(id) ON DELETE CASCADE,
    borrower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'in_use', 'returned', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table des Références & Badges Passport (Innovation 2 : AfriGain Passport)
CREATE TABLE IF NOT EXISTS public.passport_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    credential_type TEXT NOT NULL CHECK (credential_type IN ('declared_skill', 'evaluated_skill', 'confirmed_experience', 'verified_certification', 'portfolio_item')),
    title TEXT NOT NULL,
    issuer_or_verifier TEXT,
    verification_level INT DEFAULT 1 CHECK (verification_level BETWEEN 1 AND 5), -- 1: Déclaré, 2: Documenté, 3: Évalué, 4: Confirmé tiers, 5: Certifié officiel
    proof_document_url TEXT,
    issue_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table des Soumissions aux Défis (Innovation 3 : AfriGain Challenges)
CREATE TABLE IF NOT EXISTS public.challenge_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    proposal_text TEXT NOT NULL,
    portfolio_link TEXT,
    document_url TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'accepted', 'declined')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.collectif_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collectif_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passport_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_proposals ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture publique
CREATE POLICY "Public read collectif_projects" ON public.collectif_projects FOR SELECT USING (true);
CREATE POLICY "Public read shared_resources" ON public.shared_resources FOR SELECT USING (true);
CREATE POLICY "Public read passport_credentials" ON public.passport_credentials FOR SELECT USING (true);
CREATE POLICY "Public read challenge_proposals" ON public.challenge_proposals FOR SELECT USING (true);

-- Politiques de modification par propriétaire
CREATE POLICY "Owners update collectif_projects" ON public.collectif_projects FOR ALL USING (auth.uid() = creator_id OR public.is_admin());
CREATE POLICY "Members manage collectif_members" ON public.collectif_members FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Owners update shared_resources" ON public.shared_resources FOR ALL USING (auth.uid() = owner_id OR public.is_admin());
CREATE POLICY "Users manage reservations" ON public.resource_reservations FOR ALL USING (auth.uid() = borrower_id OR public.is_admin());
CREATE POLICY "Users manage passport" ON public.passport_credentials FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users manage challenge_proposals" ON public.challenge_proposals FOR ALL USING (auth.uid() = author_id OR public.is_admin());

-- Permissions aux rôles
GRANT ALL ON TABLE public.collectif_projects TO authenticated, anon, service_role;
GRANT ALL ON TABLE public.collectif_members TO authenticated, anon, service_role;
GRANT ALL ON TABLE public.shared_resources TO authenticated, anon, service_role;
GRANT ALL ON TABLE public.resource_reservations TO authenticated, anon, service_role;
GRANT ALL ON TABLE public.passport_credentials TO authenticated, anon, service_role;
GRANT ALL ON TABLE public.challenge_proposals TO authenticated, anon, service_role;
