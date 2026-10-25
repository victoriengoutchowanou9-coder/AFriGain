-- ====================================================================
-- AFriGain : Migration Écosystème Complet selon Cahier des Charges PDF
-- Sections 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18
-- ====================================================================

-- 1. FIL D'ACTUALITÉ DYNAMIQUE : LE FIL AFRIGAIN (Section 4)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    post_type TEXT NOT NULL DEFAULT 'general' CHECK (post_type IN ('general', 'business', 'product', 'service', 'opportunity', 'advice')),
    media_urls TEXT[] DEFAULT '{}',
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    is_moderated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Interactions sur les publications (J'aime, Réactions, Favoris)
CREATE TABLE IF NOT EXISTS public.post_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL DEFAULT 'like' CHECK (interaction_type IN ('like', 'love', 'insightful', 'bookmark')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(post_id, user_id, interaction_type)
);

-- Commentaires et réponses imbriquées sur les publications
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    is_moderated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. STORIES AFRIGAIN (Visibilité 24 heures - Section 6)
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    duration_hours INT DEFAULT 24 NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours') NOT NULL,
    views_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. SYSTÈME DE DÉFIS, POINTS ET BADGES (« DÉFIS AFRIGAIN » - Section 8)
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('profile', 'service', 'business', 'community', 'learning')),
    points_reward INT NOT NULL DEFAULT 10,
    badge_name TEXT,
    badge_icon TEXT,
    frequency TEXT NOT NULL DEFAULT 'milestone' CHECK (frequency IN ('daily', 'weekly', 'milestone')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
    progress INT DEFAULT 0,
    points_awarded INT DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_name TEXT NOT NULL,
    badge_icon TEXT NOT NULL,
    awarded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, badge_name)
);

-- 4. ÉVÉNEMENTS PROFESSIONNELS : AFRIGAIN LIVE (Section 9)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    estimated_duration_minutes INT DEFAULT 60,
    format TEXT NOT NULL DEFAULT 'online' CHECK (format IN ('online', 'in_person', 'hybrid')),
    access_link TEXT,
    location_address TEXT,
    city TEXT DEFAULT 'Cotonou',
    country TEXT DEFAULT 'Bénin',
    max_attendees INT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_confirmed BOOLEAN DEFAULT true,
    UNIQUE(event_id, user_id)
);

-- 5. FONCTIONNALITÉ « JE RECHERCHE » MARKETPLACE (Section 10.3)
CREATE TABLE IF NOT EXISTS public.search_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    quantity TEXT,
    specifications TEXT,
    location_city TEXT DEFAULT 'Cotonou',
    budget_indicative NUMERIC(12, 2),
    currency TEXT DEFAULT 'XOF',
    target_date DATE,
    contact_info TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'fulfilled', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.search_request_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.search_requests(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    proposal_text TEXT NOT NULL,
    price_offer NUMERIC(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. NOTIFICATIONS INTELLIGENTES (Section 12)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('message', 'comment', 'reaction', 'follower', 'opportunity', 'application', 'quote', 'order', 'event', 'challenge', 'system')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. ABONNEMENTS ET RELATIONS ENTRE UTILISATEURS (Section 4 & 7)
CREATE TABLE IF NOT EXISTS public.user_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS public.blocked_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, blocked_user_id)
);

-- ====================================================================
-- POLITIQUES ROW LEVEL SECURITY (RLS) SÉCURISÉES
-- ====================================================================

-- POSTS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active posts" ON public.posts;
CREATE POLICY "Public can view active posts" ON public.posts
    FOR SELECT USING (is_moderated = false);

DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
CREATE POLICY "Users can insert own posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update own posts" ON public.posts;
CREATE POLICY "Authors can update own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = author_id OR public.is_admin());

DROP POLICY IF EXISTS "Authors can delete own posts" ON public.posts;
CREATE POLICY "Authors can delete own posts" ON public.posts
    FOR DELETE USING (auth.uid() = author_id OR public.is_admin());

-- POST INTERACTIONS
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view interactions" ON public.post_interactions;
CREATE POLICY "Public can view interactions" ON public.post_interactions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage own interactions" ON public.post_interactions;
CREATE POLICY "Users manage own interactions" ON public.post_interactions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- COMMENTS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view comments" ON public.comments;
CREATE POLICY "Public can view comments" ON public.comments
    FOR SELECT USING (is_moderated = false);

DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
CREATE POLICY "Users can create comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Users can delete own comments" ON public.comments
    FOR DELETE USING (auth.uid() = author_id OR public.is_admin());

-- STORIES (Visibles seulement tant qu'elles ne sont pas expirées)
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active stories" ON public.stories;
CREATE POLICY "Public can view active stories" ON public.stories
    FOR SELECT USING (expires_at > NOW());

DROP POLICY IF EXISTS "Users can insert own stories" ON public.stories;
CREATE POLICY "Users can insert own stories" ON public.stories
    FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own stories" ON public.stories;
CREATE POLICY "Users can delete own stories" ON public.stories
    FOR DELETE USING (auth.uid() = author_id OR public.is_admin());

-- CHALLENGES & BADGES
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view challenges" ON public.challenges;
CREATE POLICY "Public can view challenges" ON public.challenges
    FOR SELECT USING (is_active = true);

ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own challenges" ON public.user_challenges;
CREATE POLICY "Users view own challenges" ON public.user_challenges
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users insert or update challenges" ON public.user_challenges;
CREATE POLICY "Users insert or update challenges" ON public.user_challenges
    FOR ALL USING (auth.uid() = user_id OR public.is_admin());

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view badges" ON public.user_badges;
CREATE POLICY "Public can view badges" ON public.user_badges
    FOR SELECT USING (true);

-- EVENTS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view scheduled events" ON public.events;
CREATE POLICY "Public can view scheduled events" ON public.events
    FOR SELECT USING (status != 'cancelled');

DROP POLICY IF EXISTS "Users can create events" ON public.events;
CREATE POLICY "Users can create events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "Organizers can update own events" ON public.events;
CREATE POLICY "Organizers can update own events" ON public.events
    FOR UPDATE USING (auth.uid() = organizer_id OR public.is_admin());

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can register to events" ON public.event_registrations;
CREATE POLICY "Users can register to events" ON public.event_registrations
    FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- SEARCH REQUESTS ("Je recherche")
ALTER TABLE public.search_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view search requests" ON public.search_requests;
CREATE POLICY "Public can view search requests" ON public.search_requests
    FOR SELECT USING (status = 'open' OR auth.uid() = author_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create search requests" ON public.search_requests;
CREATE POLICY "Users can create search requests" ON public.search_requests
    FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors manage search requests" ON public.search_requests;
CREATE POLICY "Authors manage search requests" ON public.search_requests
    FOR UPDATE USING (auth.uid() = author_id OR public.is_admin());

ALTER TABLE public.search_request_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Responses visible to author and supplier" ON public.search_request_responses;
CREATE POLICY "Responses visible to author and supplier" ON public.search_request_responses
    FOR SELECT USING (
        auth.uid() = supplier_id OR 
        EXISTS (SELECT 1 FROM public.search_requests WHERE id = request_id AND author_id = auth.uid()) OR
        public.is_admin()
    );

DROP POLICY IF EXISTS "Suppliers can insert responses" ON public.search_request_responses;
CREATE POLICY "Suppliers can insert responses" ON public.search_request_responses
    FOR INSERT WITH CHECK (auth.uid() = supplier_id);

-- NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view and manage own notifications" ON public.notifications;
CREATE POLICY "Users view and manage own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- FOLLOWERS & BLOCKS
ALTER TABLE public.user_followers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view followers" ON public.user_followers;
CREATE POLICY "Public can view followers" ON public.user_followers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage followers" ON public.user_followers;
CREATE POLICY "Users manage followers" ON public.user_followers
    FOR ALL USING (auth.uid() = follower_id);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage block list" ON public.blocked_users;
CREATE POLICY "Users manage block list" ON public.blocked_users
    FOR ALL USING (auth.uid() = user_id);

-- ====================================================================
-- DONNÉES DE BASE (Défis d'accueil Section 8)
-- ====================================================================
INSERT INTO public.challenges (title, description, category, points_reward, badge_name, badge_icon, frequency)
VALUES
    ('Compléter son profil à 100%', 'Renseignez votre photo, pays, compétences et biographie professionnelle.', 'profile', 20, 'Profil d''Or', 'ShieldCheck', 'milestone'),
    ('Publier son premier service', 'Présentez une prestation claire avec vos tarifs et délais.', 'service', 30, 'Pionnier des Services', 'Briefcase', 'milestone'),
    ('Explorer les opportunités du jour', 'Consultez les dernières missions et emplois du jour sur AfriGain.', 'community', 10, 'Chercheur Actif', 'Compass', 'daily'),
    ('Obtenir un premier avis vérifié', 'Finalisez une mission ou une commande pour recevoir une évaluation 5 étoiles.', 'business', 50, 'Excellence Reconnue', 'Star', 'milestone'),
    ('Participer à un atelier AfriGain Live', 'Inscrivez-vous et suivez un webinaire ou atelier pratique.', 'learning', 25, 'Apprenant Agile', 'GraduationCap', 'weekly')
ON CONFLICT DO NOTHING;
