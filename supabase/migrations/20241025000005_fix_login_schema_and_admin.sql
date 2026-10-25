-- ====================================================================
-- AFriGain : Résolution Urgente "Database error querying schema"
-- Réparation complète des permissions, RLS et du compte admin
-- ====================================================================

-- 1. PERMISSIONS TOTALES SUR LE SCHÉMA PUBLIC (Résout les erreurs schema GoTrue & PostgREST)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role, supabase_auth_admin, postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role, supabase_auth_admin, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role, supabase_auth_admin, postgres;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role, supabase_auth_admin, postgres;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role, supabase_auth_admin, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role, supabase_auth_admin, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role, supabase_auth_admin, postgres;

-- 2. POLITIQUE RLS PERMISSIVE SUR PROFILES POUR LA CONNEXION & LECTURE
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are visible" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Autorise la lecture pour que l'app et le client d'authentification puissent lire les profils sans bloquer
CREATE POLICY "Allow public read" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Enable insert for authentication trigger" ON public.profiles;
CREATE POLICY "Enable insert for authentication trigger" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- 3. NETTOYAGE & RÉCRÉATION PROPRE DU COMPTE ADMIN DANS AUTH.USERS + AUTH.IDENTITIES
-- La cause racine de "Database error querying schema" est l'absence de la ligne auth.identities correspondant à l'admin
DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'admin@afrigain.com');
DELETE FROM auth.users WHERE email = 'admin@afrigain.com';

DO $$
DECLARE
    new_admin_id UUID := gen_random_uuid();
    admin_email TEXT := 'admin@afrigain.com';
    encrypted_pw TEXT := crypt('AdminAfriGain2026!', gen_salt('bf'));
BEGIN
    -- A. Insertion complète dans auth.users avec TOUS les champs GoTrue
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_admin_id,
        'authenticated',
        'authenticated',
        admin_email,
        encrypted_pw,
        NOW(),
        NULL,
        '',
        NULL,
        '',
        NULL,
        '',
        '',
        NULL,
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Administrateur AfriGain","role":"admin"}'::jsonb,
        FALSE,
        NOW(),
        NOW(),
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        FALSE,
        NULL
    );

    -- B. Insertion OBLIGATOIRE dans auth.identities (qui manquait et causait l'erreur schema !)
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        new_admin_id::text,
        new_admin_id,
        format('{"sub":"%s","email":"%s"}', new_admin_id::text, admin_email)::jsonb,
        'email',
        admin_email,
        NOW(),
        NOW(),
        NOW()
    );

    -- C. Mise à jour ou création du profil administrateur
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        is_active,
        account_status,
        identity_status,
        professional_status,
        verification_status,
        created_at,
        updated_at
    ) VALUES (
        new_admin_id,
        admin_email,
        'Administrateur Suprême',
        'admin',
        true,
        'active',
        'verified',
        'verified',
        'verified',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        is_active = true,
        account_status = 'active',
        identity_status = 'verified',
        professional_status = 'verified',
        verification_status = 'verified',
        updated_at = NOW();

    RAISE NOTICE 'Compte admin et identités GoTrue réparés avec succès !';
END $$;
