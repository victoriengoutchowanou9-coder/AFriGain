-- ====================================================================
-- AFriGain : Correction de la Récursion Infinie RLS & Accès Multi-Appareil
-- Résolution de l'erreur PostgreSQL 42P17 (infinite recursion detected)
-- ====================================================================

-- 1. FONCTION HELPER SÉCURISÉE IS_ADMIN SANS RÉCURSION
-- Grâce à SECURITY DEFINER, cette fonction vérifie le rôle admin SANS déclencher les politiques RLS en boucle
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
STABLE
AS $$
    SELECT COALESCE(
        (SELECT (role = 'admin') FROM public.profiles WHERE id = auth.uid() LIMIT 1),
        false
    );
$$;

-- 2. RESTRUCTURATION DES POLITIQUES RLS SUR PUBLIC.PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques conflictuelles
DROP POLICY IF EXISTS "Public profiles are visible" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authentication trigger" ON public.profiles;

-- A. Tout utilisateur connecté peut TOUJOURS lire son propre profil (espace personnel)
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT 
    USING (auth.uid() = id);

-- B. Les utilisateurs connectés ou visiteurs peuvent voir les autres profils publics (sauf compte admin invisible)
CREATE POLICY "Public profiles are visible" ON public.profiles
    FOR SELECT 
    USING (is_active = true AND role != 'admin');

-- C. L'administrateur peut voir tous les profils (sans récursion)
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT 
    USING (public.is_admin());

-- D. L'utilisateur peut modifier son propre profil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- E. L'administrateur peut modifier tous les profils (vérifications, blocage, etc.)
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE 
    USING (public.is_admin());

-- F. Le trigger d'inscription et l'API d'authentification peuvent insérer les profils
CREATE POLICY "Enable insert for authentication trigger" ON public.profiles
    FOR INSERT 
    WITH CHECK (true);

-- 3. OPTIMISATION DES POLITIQUES SUR LES AUTRES TABLES
DROP POLICY IF EXISTS "Admins manage verification requests" ON public.verification_requests;
CREATE POLICY "Admins manage verification requests" ON public.verification_requests
    FOR ALL 
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins view and manage fraud reports" ON public.fraud_reports;
CREATE POLICY "Admins view and manage fraud reports" ON public.fraud_reports
    FOR ALL 
    USING (public.is_admin());

-- 4. POLITIQUES STORAGE SÉCURISÉES AVEC IS_ADMIN
DROP POLICY IF EXISTS "Owner and Admins access private identity docs" ON storage.objects;
CREATE POLICY "Owner and Admins access private identity docs" ON storage.objects
    FOR ALL USING (
        bucket_id = 'identity-documents' AND (
            auth.uid()::text = (storage.foldername(name))[1] OR
            public.is_admin()
        )
    );

DROP POLICY IF EXISTS "Owner and Admins access private business docs" ON storage.objects;
CREATE POLICY "Owner and Admins access private business docs" ON storage.objects
    FOR ALL USING (
        bucket_id = 'business-documents' AND (
            auth.uid()::text = (storage.foldername(name))[1] OR
            public.is_admin()
        )
    );
