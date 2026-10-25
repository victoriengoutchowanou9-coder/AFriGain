-- ====================================================================
-- AFriGain : Migration Complète — Vérification d'Identité,
-- Sécurisation des Profils, Galeries et Compte Administrateur Invisible
-- Compatible PostgreSQL / Supabase
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMÉRATIONS & TYPES ADDITIONNELS
DO $$ BEGIN
    CREATE TYPE profile_category AS ENUM ('prestataire', 'entreprise', 'etudiant', 'particulier', 'artisan', 'fournisseur');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE account_status_type AS ENUM ('active', 'suspended', 'deactivated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. AJOUT DES COLONNES NÉCESSAIRES DANS LA TABLE PROFILES
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'prestataire',
ADD COLUMN IF NOT EXISTS trade_name TEXT,
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS identity_status TEXT DEFAULT 'documents_pending',
ADD COLUMN IF NOT EXISTS professional_status TEXT DEFAULT 'not_applicable',
ADD COLUMN IF NOT EXISTS id_document_type TEXT,
ADD COLUMN IF NOT EXISTS id_document_number TEXT,
ADD COLUMN IF NOT EXISTS id_document_country TEXT,
ADD COLUMN IF NOT EXISTS id_card_front_url TEXT,
ADD COLUMN IF NOT EXISTS id_card_back_url TEXT,
ADD COLUMN IF NOT EXISTS id_portrait_url TEXT,
ADD COLUMN IF NOT EXISTS student_card_url TEXT,
ADD COLUMN IF NOT EXISTS rccm_number TEXT,
ADD COLUMN IF NOT EXISTS ifu_number TEXT,
ADD COLUMN IF NOT EXISTS business_country TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS business_sector TEXT,
ADD COLUMN IF NOT EXISTS business_registration_url TEXT,
ADD COLUMN IF NOT EXISTS company_gallery_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Index pour accélérer les requêtes de conformité et détection de doublons (Section 6.2 & 12)
CREATE INDEX IF NOT EXISTS idx_profiles_identity_status ON public.profiles(identity_status);
CREATE INDEX IF NOT EXISTS idx_profiles_ifu_number ON public.profiles(ifu_number) WHERE ifu_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_rccm_number ON public.profiles(rccm_number) WHERE rccm_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 4. TABLE VERIFICATION_REQUESTS (Historique des décisions et audits Section 12)
CREATE TABLE IF NOT EXISTS public.verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    request_type TEXT NOT NULL, -- 'identity', 'company', 'student'
    status TEXT NOT NULL,       -- 'pending', 'in_review', 'verified', 'rejected', 'correction_needed'
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    reviewed_at TIMESTAMPTZ
);

-- 5. TABLE FRAUD_REPORTS (Signalements anti-fraude & arnaques Section 14)
CREATE TABLE IF NOT EXISTS public.fraud_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    target_id TEXT NOT NULL,
    target_type TEXT NOT NULL, -- 'profile', 'job', 'mission', 'product'
    reason TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'reviewed', 'dismissed', 'actioned'
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    resolved_at TIMESTAMPTZ
);

-- 6. TABLE SUPPLIER_PRODUCTS (Produits B2B avec galeries d'au moins 5 photos Section 8)
CREATE TABLE IF NOT EXISTS public.supplier_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    min_order_quantity TEXT NOT NULL,
    unit_price NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    currency TEXT DEFAULT 'XOF' NOT NULL,
    lead_time TEXT NOT NULL,
    payment_terms TEXT,
    gallery_urls TEXT[] DEFAULT '{}' NOT NULL, -- Au moins 5 photos requises
    primary_image_index INT DEFAULT 0 NOT NULL,
    is_available BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. MISE À JOUR DU TRIGGER AUTOMATIQUE À L'INSCRIPTION
-- Récupère les données envoyées lors de signUp (full_name, role, category, country)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        role, 
        category,
        country,
        account_status,
        identity_status,
        professional_status
    )
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'entrepreneur'),
        COALESCE(new.raw_user_meta_data->>'category', 'prestataire'),
        COALESCE(new.raw_user_meta_data->>'country', 'Bénin'),
        'active',
        'documents_pending',
        CASE 
            WHEN COALESCE(new.raw_user_meta_data->>'role', '') = 'client' THEN 'documents_pending'
            ELSE 'not_applicable'
        END
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        category = COALESCE(EXCLUDED.category, public.profiles.category),
        country = COALESCE(EXCLUDED.country, public.profiles.country);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. SÉCURITÉ ROW LEVEL SECURITY (RLS) & INVISIBILITÉ TOTALE DU COMPTE ADMIN
-- Activer RLS sur les nouvelles tables
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;

-- Politiques Profiles :
-- RÈGLE ABSOLUE DE L'UTILISATEUR : "le compte administrateur n'existe pas encore tu dois creer et sur la plateforme on ne verra pas sa trace"
-- Le profil admin est EXCLU de la visibilité publique ! Les requêtes publiques ne voient que les utilisateurs non-admins actifs.
DROP POLICY IF EXISTS "Public profiles are visible" ON public.profiles;
CREATE POLICY "Public profiles are visible" ON public.profiles
    FOR SELECT USING (is_active = true AND role != 'admin');

-- Les administrateurs peuvent consulter tous les profils (pour la modération)
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Les administrateurs peuvent mettre à jour les statuts de vérification
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques verification_requests :
-- L'utilisateur voit ses propres demandes
CREATE POLICY "Users can view own verification requests" ON public.verification_requests
    FOR SELECT USING (auth.uid() = user_id);

-- L'utilisateur peut soumettre une demande
CREATE POLICY "Users can insert own verification requests" ON public.verification_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- L'administrateur peut tout voir et mettre à jour
CREATE POLICY "Admins manage verification requests" ON public.verification_requests
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques fraud_reports :
-- Tout utilisateur authentifié ou anonyme peut soumettre un signalement
CREATE POLICY "Anyone can report fraud" ON public.fraud_reports
    FOR INSERT WITH CHECK (true);

-- Seul l'administrateur peut lire et traiter les signalements
CREATE POLICY "Admins view and manage fraud reports" ON public.fraud_reports
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques supplier_products :
CREATE POLICY "Available supplier products are visible" ON public.supplier_products
    FOR SELECT USING (is_available = true);

CREATE POLICY "Suppliers manage their products" ON public.supplier_products
    FOR ALL USING (auth.uid() = supplier_id);

-- 9. CRÉATION DES BUCKETS SUPABASE STORAGE (Sections 10.2 & 11.1)
-- Insertion dans storage.buckets (si l'extension storage est activée)
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('identity-documents', 'identity-documents', false),   -- PRIVÉ (CNI, Passeports, Cartes étudiants)
    ('business-documents', 'business-documents', false),   -- PRIVÉ (RCCM, IFU, statuts fiscaux)
    ('company-galleries', 'company-galleries', true),      -- PUBLIC (Photos d'activité max 5 photos)
    ('product-galleries', 'product-galleries', true)       -- PUBLIC (Photos produits min 5 photos)
ON CONFLICT (id) DO NOTHING;

-- Politiques Storage : Accès propriétaire + Accès administrateurs
CREATE POLICY "Owner and Admins access private identity docs" ON storage.objects
    FOR ALL USING (
        bucket_id = 'identity-documents' AND (
            auth.uid()::text = (storage.foldername(name))[1] OR
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        )
    );

CREATE POLICY "Owner and Admins access private business docs" ON storage.objects
    FOR ALL USING (
        bucket_id = 'business-documents' AND (
            auth.uid()::text = (storage.foldername(name))[1] OR
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        )
    );

CREATE POLICY "Public read company galleries" ON storage.objects
    FOR SELECT USING (bucket_id = 'company-galleries');

CREATE POLICY "Owner manage company galleries" ON storage.objects
    FOR ALL USING (
        bucket_id = 'company-galleries' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Public read product galleries" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-galleries');

CREATE POLICY "Owner manage product galleries" ON storage.objects
    FOR ALL USING (
        bucket_id = 'product-galleries' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ====================================================================
-- 10. CRÉATION DU COMPTE ADMINISTRATEUR SÉCURISÉ & TOTALEMENT INVISIBLE
-- Ce bloc crée ou promeut un utilisateur admin sans aucune trace publique.
-- ====================================================================

-- Procédure stockée d'assistance pour attribuer le rôle admin à n'importe quel email
CREATE OR REPLACE FUNCTION public.set_admin_role_by_email(admin_email TEXT)
RETURNS TEXT AS $$
DECLARE
    target_id UUID;
BEGIN
    SELECT id INTO target_id FROM auth.users WHERE email = admin_email;
    IF target_id IS NULL THEN
        RETURN 'Utilisateur introuvable dans auth.users. Veuillez d abord l inscrire ou executer le script de creation directe.';
    END IF;

    UPDATE public.profiles 
    SET 
        role = 'admin',
        is_active = true,
        account_status = 'active',
        identity_status = 'verified',
        professional_status = 'verified',
        verification_status = 'verified'
    WHERE id = target_id;

    RETURN 'Succes : Le compte ' || admin_email || ' a ete promu Administrateur Supreme invisible.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SCRIPT DIRECT DE CRÉATION DE L'ADMINISTRATEUR SUPRÊME :
-- Email : admin@afrigain.com
-- Mot de passe par défaut : AdminAfriGain2026! (À modifier ou personnaliser à volonté)
DO $$
DECLARE
    new_admin_id UUID := gen_random_uuid();
    admin_email TEXT := 'admin@afrigain.com';
    encrypted_pw TEXT := crypt('AdminAfriGain2026!', gen_salt('bf'));
BEGIN
    -- Vérifier si l'admin existe déjà
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            new_admin_id,
            'authenticated',
            'authenticated',
            admin_email,
            encrypted_pw,
            NOW(), -- Directement confirmé, pas besoin d'attendre un e-mail
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Gouvernance Plateforme","role":"admin"}',
            NOW(),
            NOW(),
            '',
            ''
        );

        -- Insérer dans profiles avec rôle 'admin'
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            role,
            category,
            country,
            is_active,
            verification_status,
            identity_status,
            professional_status,
            account_status
        ) VALUES (
            new_admin_id,
            admin_email,
            'Gouvernance Plateforme',
            'admin',
            'entreprise',
            'Bénin',
            true,
            'verified',
            'verified',
            'verified',
            'active'
        )
        ON CONFLICT (id) DO UPDATE SET role = 'admin';
    ELSE
        -- Si le compte existe déjà, le promouvoir au rôle admin
        UPDATE public.profiles SET role = 'admin' WHERE email = admin_email;
    END IF;
END $$;
