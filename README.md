# AFriGain — Plateforme SaaS pour Entrepreneurs et Entreprises

> **Architecture multilingue, mobile-first, multi-tenant avec Supabase (PostgreSQL, RLS, Auth) & Next.js.**

---

## 🎯 Présentation du Projet

**AFriGain** est une plateforme internationale de mise en relation de talents et jeunes entrepreneurs (lancement pilote au Bénin / zone UEMOA en Franc CFA - XOF) avec des entreprises clientes.

Elle intègre :
1. **Une Marketplace d'opportunités réelles** : publication de missions, catalogues de services et candidatures.
2. **Des Outils de gestion financière** : création de devis, génération de factures aux normes locales et suivi des encaissements (distinction rigoureuse des saisies manuelles et règlements confirmés).
3. **Un Business Coach IA** : aide méthodologique pour structurer les offres, fixer les prix avec calcul de marge nette, et rédiger des propositions percutantes.

---

## 🚀 Démarrage Rapide

### 1. Prérequis
* Node.js (v18+)
* npm
* Un compte [Supabase](https://supabase.com)

### 2. Configuration Supabase
1. Créez un nouveau projet sur votre tableau de bord Supabase.
2. Rendez-vous dans **SQL Editor** et exécutez le script complet situé dans :
   ```
   supabase/migrations/20241017000000_init_afrigain.sql
   ```
   Ce script configure automatiquement :
   * Les tables (`profiles`, `job_posts`, `service_listings`, `contracts`, `quotes`, `invoices`, `payments`, `reviews`, `ai_usage`, etc.)
   * La sécurité au niveau des lignes (**Row Level Security - RLS**)
   * Le déclencheur de synchronisation automatique utilisateur (`handle_new_user`)
   * Les catégories initiales du marché pilote.

3. Récupérez vos identifiants dans **Project Settings > API** et renseignez votre fichier `.env.local` :
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-publique-anon
   ```

### 3. Lancer en Local
```bash
npm run dev
```
L'application est accessible sur `http://localhost:3000`.

---

## 📂 Structure du Projet

```
AFriGain/
├── src/
│   ├── app/
│   │   ├── auth/              # Connexion & Inscription avec sélection de rôle
│   │   ├── dashboard/         # Espace de travail de l'entrepreneur
│   │   │   ├── coach-ia/      # Business Coach IA & Calculateur de marge
│   │   │   ├── invoices/      # Facturation & Rapprochement de paiements
│   │   │   └── quotes/        # Création et suivi de devis
│   │   ├── missions/          # Consultation & recherche des missions
│   │   ├── services/          # Catalogue de prestations & packs
│   │   ├── layout.tsx         # Layout racine avec navigation & footer
│   │   └── page.tsx           # Page d'accueil d'acquisition
│   ├── components/            # Composants partagés (Navbar, Footer, etc.)
│   └── lib/
│       ├── supabase/          # Clients Browser/Server Supabase & Types
│       └── utils.ts           # Formatage monétaire (XOF) et dates
└── supabase/
    └── migrations/            # Schémas et politiques RLS PostgreSQL
```

---

## 🔒 Principes Éthiques & Sécurité
* **Cloisonnement multi-tenant** : isolation totale des données entre organisations et profils grâce aux politiques RLS PostgreSQL.
* **Intégrité financière** : les paiements manuels sont clairement distingués des paiements vérifiés par webhook opérateur (MTN MoMo, Moov Money, banques).
* **Zéro fausse promesse** : priorité absolue aux contrats et compétences réels.
