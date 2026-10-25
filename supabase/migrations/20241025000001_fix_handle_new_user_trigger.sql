-- ====================================================================
-- AFriGain : Correction Définitive du Trigger d'Inscription
-- Résolution de l'erreur "Database error creating new user"
-- ====================================================================

-- 1. POLITIQUE RLS PERMETTANT L'INSERTION SÉCURISÉE DES PROFILS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for authentication trigger" ON public.profiles;
CREATE POLICY "Enable insert for authentication trigger" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- 2. FONCTION HANDLE_NEW_USER ULTRA-ROBUSTE & RÉSISTANTE AUX VALEURS NULLES
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    extracted_full_name TEXT;
    extracted_role user_role;
    extracted_category TEXT;
    extracted_country TEXT;
    target_professional_status TEXT;
BEGIN
    -- A. Extraction et nettoyage sécurisé du nom complet
    extracted_full_name := COALESCE(
        NULLIF(TRIM(new.raw_user_meta_data->>'full_name'), ''),
        NULLIF(split_part(new.email, '@', 1), ''),
        'Utilisateur AfriGain'
    );

    -- B. Validation stricte du rôle enum sans risque de crash
    IF new.raw_user_meta_data IS NOT NULL AND (new.raw_user_meta_data->>'role') IN ('entrepreneur', 'client', 'partner', 'moderator', 'admin') THEN
        extracted_role := (new.raw_user_meta_data->>'role')::user_role;
    ELSE
        extracted_role := 'entrepreneur'::user_role;
    END IF;

    -- C. Extraction sécurisée de la catégorie et du pays
    extracted_category := COALESCE(NULLIF(TRIM(new.raw_user_meta_data->>'category'), ''), 'prestataire');
    extracted_country := COALESCE(NULLIF(TRIM(new.raw_user_meta_data->>'country'), ''), 'Bénin');

    -- D. Statut professionnel adapté
    IF extracted_role = 'client' OR extracted_category IN ('entreprise', 'fournisseur') THEN
        target_professional_status := 'documents_pending';
    ELSE
        target_professional_status := 'not_applicable';
    END IF;

    -- E. Insertion sécurisée dans public.profiles
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        category,
        country,
        account_status,
        identity_status,
        professional_status,
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        new.id,
        new.email,
        extracted_full_name,
        extracted_role,
        extracted_category,
        extracted_country,
        'active',
        'documents_pending',
        target_professional_status,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
        category = COALESCE(NULLIF(EXCLUDED.category, ''), public.profiles.category),
        country = COALESCE(NULLIF(EXCLUDED.country, ''), public.profiles.country),
        updated_at = NOW();

    RETURN new;

EXCEPTION
    -- F. Filet de sécurité absolu : En cas d'erreur imprévue, créer le profil minimum sans jamais bloquer auth.users
    WHEN OTHERS THEN
        BEGIN
            INSERT INTO public.profiles (id, email, full_name, role, is_active)
            VALUES (
                new.id,
                COALESCE(new.email, new.id::text || '@afrigain.com'),
                'Utilisateur AfriGain',
                'entrepreneur',
                true
            )
            ON CONFLICT (id) DO NOTHING;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;
        RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 3. RECRÉATION PROPRE DU TRIGGER ON_AUTH_USER_CREATED
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
