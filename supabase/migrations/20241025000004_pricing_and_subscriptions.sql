-- ====================================================================
-- AFriGain : Gestion Dynamique des Tarifs & Abonnements
-- Conforme aux spécifications sans faux paiement
-- ====================================================================

-- 1. TABLE DES FORMULES TARIFAIRES (Modifiable par l'administrateur sans toucher au code)
CREATE TABLE IF NOT EXISTS public.pricing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('subscription', 'sponsored_ad', 'advertising', 'free')),
    target_role TEXT DEFAULT 'all', -- 'entrepreneur', 'client', 'partner', 'all'
    price_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'XOF',
    duration_days INT, -- ex: 7, 15, 30 jours pour annonces sponsorisées, 30 jours pour abonnements
    billing_period TEXT DEFAULT 'month', -- 'once', 'month', 'year', 'free'
    description TEXT NOT NULL,
    features TEXT[] DEFAULT '{}' NOT NULL,
    is_popular BOOLEAN DEFAULT false NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    display_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. TABLE DES DEMANDES D'OFFRES PAYANTES & INTENTIONS D'ACHAT (Sans faux paiement)
CREATE TABLE IF NOT EXISTS public.pricing_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.pricing_plans(id) ON DELETE CASCADE,
    plan_code TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'XOF',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'approved', 'cancelled')),
    preferred_payment_method TEXT, -- 'momo_mtn', 'moov_money', 'celtiis_cash', 'card', 'bank_transfer'
    phone_contact TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. TABLE DES ABONNEMENTS ACTIFS (Prêt pour intégration future de paiement réel)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.pricing_plans(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending', 'cancelled')),
    starts_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ,
    is_auto_renew BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- POLITIQUES RLS SUR LES TARIFS
-- ====================================================================

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- Lecture publique des tarifs actifs pour tous les visiteurs
DROP POLICY IF EXISTS "Public can view active pricing plans" ON public.pricing_plans;
CREATE POLICY "Public can view active pricing plans" ON public.pricing_plans
    FOR SELECT USING (is_active = true OR public.is_admin());

-- Seul l'administrateur peut insérer, modifier ou supprimer des tarifs
DROP POLICY IF EXISTS "Admins can manage pricing plans" ON public.pricing_plans;
CREATE POLICY "Admins can manage pricing plans" ON public.pricing_plans
    FOR ALL USING (public.is_admin());

ALTER TABLE public.pricing_requests ENABLE ROW LEVEL SECURITY;

-- L'utilisateur connecté peut créer et voir ses propres demandes d'offres
DROP POLICY IF EXISTS "Users can view own pricing requests" ON public.pricing_requests;
CREATE POLICY "Users can view own pricing requests" ON public.pricing_requests
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create pricing requests" ON public.pricing_requests;
CREATE POLICY "Users can create pricing requests" ON public.pricing_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- L'administrateur peut traiter et mettre à jour les demandes
DROP POLICY IF EXISTS "Admins manage pricing requests" ON public.pricing_requests;
CREATE POLICY "Admins manage pricing requests" ON public.pricing_requests
    FOR UPDATE USING (public.is_admin());

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can manage subscriptions" ON public.user_subscriptions
    FOR ALL USING (public.is_admin());

-- ====================================================================
-- TARIFS OFFICIELS DE LANCEMENT AFRIGAIN (Modifiables par l'Admin)
-- ====================================================================

INSERT INTO public.pricing_plans (code, name, category, target_role, price_amount, currency, duration_days, billing_period, description, features, is_popular, display_order)
VALUES
    -- FORMULES GRATUITES DE BASE
    ('free_particulier', 'Inscription Particuliers', 'free', 'entrepreneur', 0, 'XOF', NULL, 'free', 'Accès complet pour jeunes, artisans et particuliers.', ARRAY[
        'Création de profil personnel',
        'Candidature aux offres et missions',
        'Participation aux défis communautaires',
        'Consultation du fil d''actualité',
        'Messagerie professionnelle'
    ], false, 1),

    ('free_entreprise', 'Inscription Entreprises', 'free', 'client', 0, 'XOF', NULL, 'free', 'Accès complet pour les recruteurs et entreprises.', ARRAY[
        'Création de profil entreprise',
        'Publication d''offres d''emploi et missions',
        'Réception des candidatures',
        'Recherche de talents locaux',
        'Messagerie directe avec les candidats'
    ], false, 2),

    ('free_fournisseur', 'Inscription Fournisseurs', 'free', 'partner', 0, 'XOF', NULL, 'free', 'Accès complet pour les fournisseurs de matières premières et distributeurs.', ARRAY[
        'Création de vitrine fournisseur B2B',
        'Ajout de produits au catalogue',
        'Réponse aux cotations',
        'Présentation de l''activité',
        'Messagerie d''affaires'
    ], false, 3),

    -- PROFILS PROFESSIONNELS AVANCÉS
    ('pro_base', 'Profil Professionnel de Base', 'free', 'all', 0, 'XOF', NULL, 'free', 'La base indispensable pour exercer votre activité.', ARRAY[
        'Vitrine avec 1 photo de réalisation',
        'Création de devis et factures conformes',
        'Référencement dans l''annuaire standard',
        'Accès aux opportunités du jour'
    ], false, 4),

    ('pro_plus', 'Profil Professionnel Plus', 'subscription', 'all', 1000, 'XOF', 30, 'month', 'Visibilité renforcée pour développer votre clientèle locale.', ARRAY[
        'Tous les avantages du profil de Base',
        'Galerie étendue jusqu''à 5 photos de réalisations',
        'Badge de mise en avant sur l''annuaire',
        'Édition illimitée de devis et factures',
        'Positionnement prioritaire dans « Près de moi »'
    ], true, 5),

    ('pro_premium', 'Profil Professionnel Premium', 'subscription', 'all', 2500, 'XOF', 30, 'month', 'La solution ultime pour les entreprises et indépendants leaders.', ARRAY[
        'Tous les avantages du Profil Plus',
        'Accès direct en avant-première aux demandes « Je recherche »',
        'Publication instantanée d''annonces sans délai de modération',
        'Vérification prioritaire des dossiers d''identité',
        'Assistance et support prioritaire dédié'
    ], false, 6),

    -- OPTIONS DE VISIBILITÉ : ANNONCES SPONSORISÉES
    ('sponsor_7j', 'Annonce Sponsorisée (7 jours)', 'sponsored_ad', 'all', 500, 'XOF', 7, 'once', 'Mise en tête de liste de votre offre ou service pendant 7 jours.', ARRAY[
        'Épinglage en haut du fil AfriGain',
        'Mention « Annonce Sponsorisée »',
        'Visibilité maximale sur mobile et ordinateur',
        'Statistiques de vues et de clics réelles'
    ], false, 7),

    ('sponsor_15j', 'Annonce Sponsorisée (15 jours)', 'sponsored_ad', 'all', 1000, 'XOF', 15, 'once', 'Visibilité continue pendant deux semaines pour trouver vos clients.', ARRAY[
        'Épinglage pendant 15 jours consécutifs',
        'Mention « Annonce Sponsorisée »',
        'Diffusion prioritaire dans les résultats de recherche',
        'Rapport de performance'
    ], true, 8),

    ('sponsor_30j', 'Annonce Sponsorisée (30 jours)', 'sponsored_ad', 'all', 2000, 'XOF', 30, 'once', 'Campagne complète d''un mois pour un impact économique maximal.', ARRAY[
        'Épinglage pendant 30 jours complets',
        'Présence continue dans les opportunités du jour',
        'Recommandation algorithmique ciblée par compétence/ville',
        'Visibilité dans les alertes emails/notifications'
    ], false, 9),

    -- PUBLICITÉ PROFESSIONNELLE SUR MESURE
    ('ad_custom', 'Publicité Professionnelle B2B', 'advertising', 'all', 5000, 'XOF', NULL, 'custom', 'Bannières dédiées, partenariats événementiels AfriGain Live et campagnes de marque.', ARRAY[
        'Bannière exclusive dans les espaces clés de la plateforme',
        'Sponsoring officiel d''ateliers AfriGain Live',
        'Mise en avant ciblée par pays et secteur d''activité',
        'Accompagnement commercial sur mesure par l''administrateur'
    ], false, 10)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    price_amount = EXCLUDED.price_amount,
    currency = EXCLUDED.currency,
    features = EXCLUDED.features,
    description = EXCLUDED.description;
