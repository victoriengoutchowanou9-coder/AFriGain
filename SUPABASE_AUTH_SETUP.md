# Guide de Configuration Supabase Auth & Intégration SMTP AFriGain

Ce document récapitule l'ensemble des configurations manuelles requises sur la console **Supabase** et sur votre compte **Google** pour que la confirmation des e-mails d'inscription soit 100 % opérationnelle avec l'adresse d'expédition **agossouv79@gmail.com**, sans simulation et en totale sécurité.

---

## 1. Activation de l'obligation de confirmation par e-mail dans Supabase

1. Connectez-vous à votre console [Supabase Dashboard](https://supabase.com/dashboard) sur votre projet (`jettndhbtczjirhakoxz`).
2. Dans le menu de gauche, rendez-vous sur **Authentication** > **Providers**.
3. Cliquez sur **Email**.
4. Assurez-vous que :
   - **Enable Email provider** est activé (**ON**).
   - **Confirm email** est activé (**ON**). *(Obligation de confirmer avant que la session ne soit validée).*
5. Cliquez sur **Save**.

---

## 2. Configuration des URLs de redirection (Redirect URLs)

Pour que les liens de confirmation cliqués dans l'e-mail redirigent l'utilisateur vers votre application :

1. Dans **Authentication**, rendez-vous sur **URL Configuration**.
2. Dans le champ **Site URL** :
   - En développement local : `http://localhost:3000`
   - En production : `https://votre-domaine-afrigain.com`
3. Dans la section **Redirect URLs**, ajoutez les adresses suivantes :
   - `http://localhost:3000/auth/confirm`
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`
   - `https://votre-domaine-afrigain.com/auth/confirm` (pour la production)
   - `https://votre-domaine-afrigain.com/auth/callback` (pour la production)
   - `https://votre-domaine-afrigain.com/dashboard` (pour la production)
4. Cliquez sur **Save**.

---

## 3. Configuration du service SMTP Gmail (`agossouv79@gmail.com`)

Pour envoyer de véritables e-mails via l'adresse `agossouv79@gmail.com`, Google impose l'utilisation d'un **Mot de passe d'application** sécurisé (l'authentification simple par mot de passe normal est désactivée par Google).

### Étape A : Générer le mot de passe d'application Google (sur `agossouv79@gmail.com`)
1. Connectez-vous à votre compte Google avec l'adresse `agossouv79@gmail.com`.
2. Allez sur **[Mon Compte Google > Sécurité](https://myaccount.google.com/security)**.
3. Vérifiez que la **Validation en deux étapes (2FA)** est bien activée. *(Indispensable).*
4. Dans la barre de recherche en haut, tapez **Mots de passe des applications** (ou descendez dans la section « Comment vous connecter à Google » > « Validation en deux étapes » > « Mots de passe des applications »).
5. Donnez un nom à l'application, par exemple : `AFriGain Supabase Auth`.
6. Cliquez sur **Créer**.
7. Google affiche un code de **16 caractères** (ex: `abcd efgh ijkl mnop`).
   > *Conservez précieusement ce code pour l'étape suivante, sans jamais le partager publiquement.*

### Étape B : Renseigner les paramètres SMTP dans Supabase
1. Dans votre console Supabase, allez dans **Project Settings** (icône d'engrenage en bas à gauche) > **Authentication**.
2. Descendez jusqu'à la section **SMTP Settings**.
3. Activez l'option **Enable Custom SMTP** (**ON**).
4. Remplissez les champs avec les valeurs suivantes :
   - **Sender email** : `agossouv79@gmail.com`
   - **Sender name** : `AFriGain`
   - **Host** : `smtp.gmail.com`
   - **Port** : `465` (SSL) ou `587` (TLS)
   - **Minimum TLS version** : `1.2`
   - **User** : `agossouv79@gmail.com`
   - **Password** : *(Collez ici votre mot de passe d'application Google de 16 caractères)*
5. Cliquez sur **Save changes**.

---

## 4. Personnalisation du modèle d'e-mail aux couleurs d'AFriGain

1. Dans le menu Supabase, rendez-vous sur **Authentication** > **Email Templates**.
2. Cliquez sur l'onglet **Confirm signup**.
3. Renseignez :
   - **Subject** : `Confirmez votre adresse e-mail — AFriGain`
   - **Body (HTML)** : Ouvrez le fichier de votre projet situé à `supabase/email-templates/confirm-signup.html`, copiez l'intégralité de son contenu et collez-le dans l'éditeur Supabase.
4. Cliquez sur **Save changes**.

*(Facultatif : Vous pouvez également personnaliser le modèle « Reset Password » avec le fichier fourni `supabase/email-templates/reset-password.html`).*

---

## 5. Fonctionnement technique dans l'application AFriGain

L'application intègre désormais l'ensemble des sécurités demandées :

| Composant | Fichier source | Rôle & Fonctionnement |
|---|---|---|
| **Middleware de protection** | `src/middleware.ts` + `src/lib/supabase/middleware.ts` | Intercepte les accès aux routes `/dashboard/:path*` et `/missions/create`. Si l'utilisateur n'est pas connecté, il est redirigé vers `/auth/login`. Si son e-mail n'est pas confirmé (`email_confirmed_at` null), l'accès est bloqué et il est redirigé vers `/auth/verify-email`. |
| **Page d'attente & renvoi** | `src/app/auth/verify-email/page.tsx` | Affiche l'adresse e-mail en attente, le rappel des dossiers Spams, permet de renvoyer l'e-mail avec cooldown de 60s, et détecte automatiquement la confirmation en temps réel. |
| **Gestionnaire de liens** | `src/app/auth/confirm/page.tsx` & `src/app/auth/callback/route.ts` | Valide les jetons OTP (`token_hash`) et codes PKCE (`code`), affiche les statuts de succès ou d'erreur compréhensibles, et permet le renvoi immédiat en cas d'expiration. |
| **Inscription** | `src/app/auth/register/page.tsx` | Appelle véritablement Supabase Auth avec `emailRedirectTo`, sans simulation de réussite, et oriente vers la confirmation. |
| **Connexion** | `src/app/auth/login/page.tsx` | Intercepte spécifiquement l'erreur « Email not confirmed », propose un bouton de renvoi direct et un lien vers la page d'attente. |
| **Layout Dashboard** | `src/app/dashboard/layout.tsx` | Double contrôle client : affiche un bandeau d'alerte si non confirmé et prévient les actions non autorisées. |
| **Données réelles** | Dashboard, Devis, Factures, Services, Missions | Suppression des données fictives codées en dur, persistance intégrale dans les tables PostgreSQL de Supabase avec états vides soignés. |

---

## 6. Procédure de vérification de bout en bout

1. Lancez l'application : `npm run dev`.
2. Ouvrez `http://localhost:3000/auth/register`.
3. Créez un compte avec une adresse e-mail valide.
4. Vérifiez que la page `/auth/verify-email` s'affiche avec votre e-mail.
5. Tentez d'accéder directement à `http://localhost:3000/dashboard` : vous devez être automatiquement redirigé vers `/auth/verify-email?required=1` avec un message d'accès restreint.
6. Ouvrez votre boîte e-mail : vous recevez le courriel brandé AFriGain expédié par `agossouv79@gmail.com`.
7. Cliquez sur **« Confirmer mon adresse e-mail »**.
8. L'application valide le jeton, affiche l'écran de succès et vous redirige vers le tableau de bord avec accès complet.
