-- ====================================================================
-- AFriGain : Schéma de base de données PostgreSQL / Supabase
-- Architecture Multi-Tenant, RLS Strict, Audit Logs & Conformité
-- ====================================================================

-- 1. EXTENSIONS & TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('entrepreneur', 'client', 'partner', 'moderator', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('unverified', 'in_review', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('draft', 'in_moderation', 'published', 'assigned', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('submitted', 'shortlisted', 'accepted', 'rejected', 'withdrawn');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contract_status AS ENUM ('proposal', 'active', 'submitted', 'revision_requested', 'completed', 'disputed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLE PROFILES (Étendu depuis auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'entrepreneur' NOT NULL,
    company_name TEXT,
    headline TEXT,
    bio TEXT,
    avatar_url TEXT,
    country TEXT DEFAULT 'Bénin' NOT NULL,
    city TEXT DEFAULT 'Cotonou',
    phone TEXT,
    currency TEXT DEFAULT 'XOF' NOT NULL,
    language TEXT DEFAULT 'fr' NOT NULL,
    verification_status verification_status DEFAULT 'unverified' NOT NULL,
    skills TEXT[] DEFAULT '{}',
    completed_missions_count INT DEFAULT 0 NOT NULL,
    average_rating NUMERIC(3, 2) DEFAULT 0.00 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. CATEGORIES & SKILLS
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. SERVICES PROPOSÉS PAR LES ENTREPRENEURS (Catalogue de services)
CREATE TABLE IF NOT EXISTS public.service_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    deliverables TEXT[] DEFAULT '{}' NOT NULL,
    delivery_days INT NOT NULL,
    price_amount NUMERIC(12, 2) NOT NULL,
    price_currency TEXT DEFAULT 'XOF' NOT NULL,
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. MISSIONS / JOB POSTS (Publiées par les clients)
CREATE TABLE IF NOT EXISTS public.job_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget_amount NUMERIC(12, 2) NOT NULL,
    budget_currency TEXT DEFAULT 'XOF' NOT NULL,
    deadline DATE,
    location_mode TEXT DEFAULT 'remote' NOT NULL, -- 'remote', 'on_site', 'hybrid'
    location_country TEXT DEFAULT 'Bénin',
    location_city TEXT,
    skills_required TEXT[] DEFAULT '{}',
    status job_status DEFAULT 'published' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. CANDIDATURES / APPLICATIONS
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES public.job_posts(id) ON DELETE CASCADE NOT NULL,
    freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    proposed_rate NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'XOF' NOT NULL,
    estimated_days INT NOT NULL,
    cover_message TEXT NOT NULL,
    status application_status DEFAULT 'submitted' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(job_id, freelancer_id)
);

-- 7. CONTRATS ET MISSIONS EN COURS
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES public.job_posts(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    agreed_amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'XOF' NOT NULL,
    status contract_status DEFAULT 'active' NOT NULL,
    start_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. JALONS ET LIVRABLES (Milestones)
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL,
    due_date TIMESTAMPTZ,
    is_completed BOOLEAN DEFAULT false NOT NULL,
    deliverable_note TEXT,
    deliverable_url TEXT,
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. DEVIS (Quotes)
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entrepreneur_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    quote_number TEXT NOT NULL,
    issue_date DATE DEFAULT CURRENT_DATE NOT NULL,
    valid_until DATE NOT NULL,
    total_ht NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 0 NOT NULL,
    total_ttc NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    currency TEXT DEFAULT 'XOF' NOT NULL,
    status TEXT DEFAULT 'sent' NOT NULL, -- draft, sent, accepted, declined
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quote_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) DEFAULT 1 NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL
);

-- 10. FACTURES (Invoices)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entrepreneur_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    invoice_number TEXT NOT NULL,
    issue_date DATE DEFAULT CURRENT_DATE NOT NULL,
    due_date DATE NOT NULL,
    total_ht NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 0 NOT NULL,
    total_ttc NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    currency TEXT DEFAULT 'XOF' NOT NULL,
    status invoice_status DEFAULT 'sent' NOT NULL,
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.invoice_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) DEFAULT 1 NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL
);

-- 11. PAIEMENTS (Rapprochement et journal avec distinction explicite du statut vérifié)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'XOF' NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    method TEXT DEFAULT 'manual_transfer' NOT NULL, -- 'momo_mtn', 'moov_money', 'celtiis_cash', 'card', 'manual_transfer'
    reference TEXT,
    is_verified BOOLEAN DEFAULT false NOT NULL, -- Règle du prompt : distinguer saisie manuelle et vérifiée
    proof_url TEXT,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. MESSAGERIE INTERNE SECURISEE
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. AVIS ET EVALUATIONS (Uniquement liés à un contrat terminé)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE UNIQUE NOT NULL,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT NOT NULL,
    is_moderated BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. USAGE DE L'ASSISTANT BUSINESS COACH IA (Quotas et suivi)
CREATE TABLE IF NOT EXISTS public.ai_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    prompt_tokens INT DEFAULT 0 NOT NULL,
    completion_tokens INT DEFAULT 0 NOT NULL,
    feature TEXT NOT NULL, -- 'quote_generation', 'service_description', 'coach_chat'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 15. AUDIT LOGS (Traçabilité des actions sensibles)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Politiques Profiles : consultation publique des profils actifs, modification restreinte au propriétaire
CREATE POLICY "Public profiles are visible" ON public.profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Politiques Services : consultation publique si publié, modification par propriétaire
CREATE POLICY "Published services visible" ON public.service_listings FOR SELECT USING (is_published = true);
CREATE POLICY "Owners manage their services" ON public.service_listings FOR ALL USING (auth.uid() = user_id);

-- Politiques Job Posts : consultation publique si statut publié
CREATE POLICY "Published jobs visible" ON public.job_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Clients manage their jobs" ON public.job_posts FOR ALL USING (auth.uid() = client_id);

-- Politiques Candidatures : seul le candidat et le client voient la candidature
CREATE POLICY "Freelancer sees own applications" ON public.applications FOR SELECT USING (auth.uid() = freelancer_id);
CREATE POLICY "Client sees job applications" ON public.applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.job_posts WHERE id = applications.job_id AND client_id = auth.uid())
);
CREATE POLICY "Freelancers can apply" ON public.applications FOR INSERT WITH CHECK (auth.uid() = freelancer_id);

-- Politiques Contrats : seuls les participants (client ou prestataire) y ont accès
CREATE POLICY "Contract participants access" ON public.contracts FOR ALL USING (
    auth.uid() = client_id OR auth.uid() = freelancer_id
);

-- Politiques Factures & Devis : propriétaires
CREATE POLICY "Entrepreneurs manage their quotes" ON public.quotes FOR ALL USING (auth.uid() = entrepreneur_id);
CREATE POLICY "Entrepreneurs manage their quote lines" ON public.quote_lines FOR ALL USING (
    EXISTS (SELECT 1 FROM public.quotes WHERE id = quote_lines.quote_id AND entrepreneur_id = auth.uid())
);
CREATE POLICY "Entrepreneurs manage their invoices" ON public.invoices FOR ALL USING (auth.uid() = entrepreneur_id);
CREATE POLICY "Entrepreneurs manage their invoice lines" ON public.invoice_lines FOR ALL USING (
    EXISTS (SELECT 1 FROM public.invoices WHERE id = invoice_lines.invoice_id AND entrepreneur_id = auth.uid())
);

-- Messages & Conversations : participants autorisés
CREATE POLICY "Conversation participants can view conversation" ON public.conversations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = conversations.id AND user_id = auth.uid())
);
CREATE POLICY "Participants view messages" ON public.messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Send message" ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);

-- Trigger automatique de création de profil lors de l'inscription Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'entrepreneur')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Données initiales des catégories (Marché Pilote)
INSERT INTO public.categories (name, slug, description, icon) VALUES
('Développement Web & Mobile', 'dev-web-mobile', 'Création de sites, plateformes SaaS et applications mobiles', 'Code'),
('Design & Identité Visuelle', 'design-graphique', 'Logos, chartes graphiques, UI/UX design et packaging', 'Palette'),
('Marketing Digital & Réseaux Sociaux', 'marketing-digital', 'Gestion de communauté, publicité en ligne et SEO', 'Share2'),
('Rédaction, Traduction & Contenu', 'redaction-contenu', 'Articles de blog, copywriting, traduction français/anglais', 'FileText'),
('Comptabilité & Gestion', 'gestion-comptabilite', 'Aide à la déclaration, bilans financiers, suivi budgétaire', 'TrendingUp')
ON CONFLICT (slug) DO NOTHING;
