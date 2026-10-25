# Guide Officiel : Configuration Supabase & Activation de l'Espace Administrateur Invisible

Ce guide vous donne la procédure pas-à-pas pour exécuter la mise à niveau de votre base de données **Supabase** pour la plateforme **AFriGain**, créer le **compte administrateur invisible** (sans aucune trace publique sur la plateforme) et rendre l'inscription des utilisateurs 100 % opérationnelle.

---

## 1. Exécution de la Migration SQL dans Supabase (En 1 Seul Clic)

1. Connectez-vous à votre console [Supabase Dashboard](https://supabase.com/dashboard).
2. Sélectionnez votre projet AFriGain (**`jettndhbtczjirhakoxz`**).
3. Dans le menu vertical de gauche, cliquez sur **SQL Editor** (icône `>_`).
4. Cliquez sur **New query** (Nouvelle requête).
5. Ouvrez le fichier de migration créé dans votre projet :
   `supabase/migrations/20241025000000_identity_galleries_admin.sql`
6. Copiez l'intégralité du texte et collez-le dans l'éditeur SQL de Supabase.
7. Cliquez sur le bouton vert **Run** (ou `Ctrl + Entrée`).
8. Le message **`Success. No rows returned`** s'affiche. Toutes les tables, colonnes, triggers, politiques de sécurité RLS, buckets de stockage et le compte administrateur sont immédiatement créés et configurés !

---

## 2. Le Compte Administrateur Invisible (Créé et 100% Opérationnel)

Conformément à votre demande stricte :
> *"Le compte administrateur n'existe pas encore tu dois créer et sur la plateforme on ne verra pas sa trace"*

### Identifiants créés automatiquement par le script SQL :
- **Adresse e-mail :** `admin@afrigain.com`
- **Mot de passe initial :** `AdminAfriGain2026!`
- **Statut de l'e-mail :** Déjà confirmé automatiquement (`email_confirmed_at = NOW()`), aucune attente d'e-mail requise.

### Pourquoi le compte administrateur est STRICTEMENT INVISIBLE sur la plateforme :
1. **Au niveau de la base de données (RLS PostgreSQL) :**
   La politique `Public profiles are visible` filtre expressément :
   `USING (is_active = true AND role != 'admin')`.
   Aucun visiteur, utilisateur, API publique ou moteur de recherche ne peut voir le profil administrateur dans la liste des prestataires, ni dans l'annuaire des entreprises, ni parmi les fournisseurs.
2. **Au niveau de l'interface utilisateur (Dashboard) :**
   Pour tous les utilisateurs normaux (indépendants, entreprises, étudiants, artisans), le bouton et l'onglet « Administration Plateforme » sont **totalement invisibles et inexistants**.
   Seule une session connectée avec le rôle `admin` débloque l'onglet d'administration ou permet l'accès à la route privée `/admin`. Si un utilisateur ordinaire tente de saisir `/admin`, il est automatiquement redirigé vers son espace sans aucun indice sur la console.

### Accéder à la console d'administration :
1. Allez sur `http://localhost:3000/auth/login` (ou votre URL en ligne).
2. Saisissez `admin@afrigain.com` et `AdminAfriGain2026!`.
3. Cliquez sur **Se connecter** : vous accédez directement à la **Console de Gouvernance & Vérification** (`/dashboard` avec le 4ème onglet administrateur activé, ou sur `/admin`).

*(Note : Si vous préférez utiliser votre propre adresse e-mail personnelle comme administrateur, exécutez simplement dans l'éditeur SQL : `SELECT public.set_admin_role_by_email('votre-email@domaine.com');`).*

---

## 3. Configuration des Buckets de Stockage (Supabase Storage)

Le script SQL a déjà configuré les 4 compartiments (buckets) et leurs règles de confidentialité :

| Compartiment | Visibilité | Règle de Confidentialité | Contenu |
|---|---|---|---|
| **`identity-documents`** | **Privé** | Accessible uniquement par le titulaire du compte et les administrateurs | CNI (recto/verso), Passeports, Photos d'identité, Cartes d'étudiant |
| **`business-documents`** | **Privé** | Accessible uniquement par l'entreprise et les administrateurs | Extraits RCCM, Certificats IFU, Kbis, Attestations fiscales |
| **`company-galleries`** | **Public** | Lecture publique / Écriture restreinte à l'entreprise propriétaire | Galerie d'activité de l'entreprise (**strictement limitée à 5 photos max**) |
| **`product-galleries`** | **Public** | Lecture publique / Écriture restreinte au fournisseur | Galerie photos produits B2B (**au moins 5 photos par référence**) |

---

## 4. Ce que fait désormais le Système d'Inscription des Utilisateurs

À chaque nouvelle inscription sur `/auth/register` :
1. **Choix du Profil Principal :**
   - **Prestataire / Indépendant** (Entrepreneur individuel, artisan, étudiant, particulier).
   - **Entreprise / Donneur d'ordre** (Société, recruteur, fournisseur B2B).
2. **Précision de la Catégorie :**
   - **Étudiant :** Inscription simplifiée **sans obligation d'IFU ni de RCCM**. Un justificatif étudiant ou certificat de scolarité est demandé uniquement pour l'obtention du badge étudiant vérifié.
   - **Particulier / Demandeur d'opportunités :** Accès direct sans contrainte d'entreprise.
   - **Prestataire / Artisan :** Valorisation du métier.
   - **Entreprise / Fournisseur B2B :** Déclaration de la raison sociale, du pays et des identifiants commerciaux.
3. **Afrique & International :**
   - Sélection du pays (Bénin, Togo, Côte d'Ivoire, Sénégal, Cameroun, Niger, Burkina Faso, France, Canada, etc.).
   - Les utilisateurs étrangers fournissent leurs documents nationaux (CNI, Passeport, Titre de séjour). Aucun document béninois n'est exigé aux non-béninois.
4. **Sécurité & Mots de passe :**
   - Minimum 8 caractères.
   - Vérification de la confirmation du mot de passe.
   - Chiffrement fort `bcrypt` via Supabase Auth (aucun mot de passe en clair).
   - Validation du format d'e-mail.
5. **Enregistrement dans Supabase :**
   - Le compte est créé dans `auth.users`.
   - Le trigger PostgreSQL crée automatiquement la ligne correspondante dans `public.profiles` avec la catégorie, le pays, `account_status = 'active'`, `identity_status = 'documents_pending'`, et `is_active = true`.

---

## 5. Comment Fonctionne la Vérification Manuelle par l'Administrateur

1. L'utilisateur connecté se rend sur `/dashboard/verification`.
2. Il téléverse ses documents :
   - Photo d'identité (portrait).
   - Recto et verso de sa pièce d'identité (ou passeport).
   - Carte d'étudiant (si étudiant).
   - IFU et RCCM (si entreprise).
3. Les documents sont stockés dans le bucket privé. Le profil passe au statut `En attente de vérification` (`pending`).
4. L'administrateur se connecte sur `/admin` (ou `/dashboard` onglet Administration) :
   - Il filtre par pays, profil ou statut.
   - Il clique sur **« Examiner le dossier »**.
   - Il prévisualise les images en haute résolution.
   - Il choisit l'une des 3 décisions obligatoires :
     - **Approuver & Certifier :** Attribue le badge vérifié officiel.
     - **Demander correction :** Saisit le motif spécifique (ex: *"Photo floue"*), le statut passe à `correction_needed` et l'utilisateur est invité à remplacer la pièce.
     - **Rejeter le dossier :** Saisit le motif de rejet (ex: *"Document falsifié"*).
   - La décision, l'ID de l'admin et la date sont tracés dans `verification_requests` et `audit_logs`.

---

## 6. Vérification Finale de Bon Fonctionnement

1. Lancez l'application en local : `npm run dev`.
2. Testez l'inscription d'un étudiant étranger sans IFU sur `/auth/register`.
3. Testez la connexion avec l'administrateur `admin@afrigain.com` / `AdminAfriGain2026!`.
4. Constatez que sur `/services`, `/entreprises` et `/fournisseurs`, **aucune trace** de l'administrateur n'apparaît !
