// Constantes officielles du projet AfriGain basées sur le Prompt Maître

export interface JobCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export const AFRIGAIN_METIERS: JobCategory[] = [
  { id: "administration", name: "Administration & Assistance", slug: "administration-assistance", icon: "📁" },
  { id: "comptabilite", name: "Comptabilité, Audit & Finance", slug: "comptabilite-finance", icon: "📊" },
  { id: "fiscalite", name: "Fiscalité & Déclarations", slug: "fiscalite-taxes", icon: "📑" },
  { id: "droit", name: "Droit & Services Juridiques", slug: "droit-juridique", icon: "⚖️" },
  { id: "rh", name: "Ressources Humaines & Recrutement", slug: "ressources-humaines", icon: "👥" },
  { id: "informatique", name: "Informatique, Développement Logiciel & Support", slug: "informatique-dev", icon: "💻" },
  { id: "ia-data", name: "Intelligence Artificielle & Données", slug: "ia-data", icon: "🤖" },
  { id: "cybersecurite", name: "Cybersécurité & Protection des Systèmes", slug: "cybersecurite", icon: "🛡️" },
  { id: "design", name: "Design Graphique, UX/UI & Branding", slug: "design-graphique", icon: "🎨" },
  { id: "communication", name: "Communication, Marketing & Publicité", slug: "communication-marketing", icon: "📢" },
  { id: "reseaux-sociaux", name: "Réseaux Sociaux & Création de Contenu", slug: "reseaux-sociaux-contenu", icon: "📱" },
  { id: "redaction", name: "Rédaction, Traduction & Interprétation", slug: "redaction-traduction", icon: "✍️" },
  { id: "audiovisuel", name: "Photographie, Vidéo & Audiovisuel", slug: "photo-video-audiovisuel", icon: "🎥" },
  { id: "commerce", name: "Vente, Commerce & Prospection", slug: "commerce-vente-prospection", icon: "🛍️" },
  { id: "service-client", name: "Service Client & Téléconseil", slug: "service-client", icon: "🎧" },
  { id: "conseil", name: "Conseil & Stratégie d'Entreprise", slug: "conseil-strategie", icon: "🧭" },
  { id: "education", name: "Formation, Enseignement & Tutorat", slug: "education-formation-tutorat", icon: "📚" },
  { id: "btp", name: "Bâtiment, Construction & Travaux", slug: "btp-construction", icon: "🏗️" },
  { id: "architecture", name: "Architecture & Ingénierie", slug: "architecture-ingenierie", icon: "📐" },
  { id: "maintenance", name: "Maintenance & Réparation", slug: "maintenance-reparation", icon: "🔧" },
  { id: "electricite", name: "Électricité, Plomberie & Énergies Renouvelables", slug: "electricite-plomberie", icon: "⚡" },
  { id: "transport", name: "Transport, Livraison & Logistique", slug: "transport-logistique", icon: "🚚" },
  { id: "agriculture", name: "Agriculture, Élevage & Pêche", slug: "agriculture-elevage-peche", icon: "🌱" },
  { id: "restauration", name: "Alimentation, Restauration & Traiteur", slug: "alimentation-restauration", icon: "🍽️" },
  { id: "tourisme", name: "Tourisme, Hôtellerie & Événementiel", slug: "tourisme-hotellerie-evenementiel", icon: "🎉" },
  { id: "nettoyage", name: "Nettoyage, Entretien & Hygiène", slug: "nettoyage-entretien", icon: "🧹" },
  { id: "beaute", name: "Beauté, Mode & Bien-être", slug: "beaute-mode-bien-etre", icon: "✂️" },
  { id: "sante", name: "Santé & Services Sociaux (Cadre Légal)", slug: "sante-services-sociaux", icon: "🩺" },
  { id: "immobilier", name: "Immobilier & Gestion de Biens", slug: "immobilier-gestion", icon: "🏠" },
  { id: "artisanat", name: "Artisanat, Fabrication & Menuiserie", slug: "artisanat-fabrication", icon: "🪵" },
  { id: "environnement", name: "Environnement, Recyclage & Énergie", slug: "environnement-energie", icon: "♻️" },
  { id: "ong", name: "ONG, Projets Sociaux & Développement", slug: "ong-developpement", icon: "🌍" },
  { id: "b2b", name: "Services B2B & Sous-traitance", slug: "services-b2b", icon: "🏢" },
  { id: "particuliers", name: "Services aux Particuliers & Aide à Domicile", slug: "services-particuliers", icon: "🤝" },
  { id: "autres", name: "Autre Prestation (Spécialité personnalisée)", slug: "autre-prestation", icon: "✨" },
];

export const AFRIGAIN_REGIONS = [
  { country: "Bénin", cities: ["Cotonou", "Abomey-Calavi", "Porto-Novo", "Parakou", "Bohicon", "Natitingou", "Ouidah", "Djougou"] },
  { country: "Togo", cities: ["Lomé", "Kara", "Sokodé"] },
  { country: "Côte d'Ivoire", cities: ["Abidjan", "Bouaké", "Yamoussoukro", "San-Pédro"] },
  { country: "Sénégal", cities: ["Dakar", "Thiès", "Saint-Louis"] },
  { country: "Cameroun", cities: ["Douala", "Yaoundé"] },
  { country: "Burkina Faso", cities: ["Ouagadougou", "Bobo-Dioulasso"] },
  { country: "Niger", cities: ["Niamey", "Maradi"] },
  { country: "Mali", cities: ["Bamako", "Sikasso", "Ségou"] },
  { country: "Guinée", cities: ["Conakry", "Kankan", "Kindia"] },
  { country: "Gabon", cities: ["Libreville", "Port-Gentil"] },
  { country: "Congo (Brazzaville)", cities: ["Brazzaville", "Pointe-Noire"] },
  { country: "RD Congo (Kinshasa)", cities: ["Kinshasa", "Lubumbashi", "Goma"] },
  { country: "Rwanda", cities: ["Kigali"] },
  { country: "Ghana", cities: ["Accra", "Kumasi"] },
  { country: "Nigeria", cities: ["Lagos", "Abuja", "Ibadan"] },
  { country: "France", cities: ["Paris", "Lyon", "Marseille"] },
  { country: "Belgique", cities: ["Bruxelles", "Liège"] },
  { country: "Canada", cities: ["Montréal", "Québec", "Toronto"] },
  { country: "États-Unis", cities: ["New York", "Washington", "Autre"] },
  { country: "Autre Afrique", cities: ["Capitale / Autre ville"] },
  { country: "Autre International", cities: ["Autre ville"] },
];

export const ALL_COUNTRIES = [
  "Bénin",
  "Togo",
  "Côte d'Ivoire",
  "Sénégal",
  "Cameroun",
  "Burkina Faso",
  "Niger",
  "Mali",
  "Guinée",
  "Gabon",
  "Congo (Brazzaville)",
  "RD Congo (Kinshasa)",
  "Rwanda",
  "Ghana",
  "Nigeria",
  "France",
  "Belgique",
  "Canada",
  "États-Unis",
  "Autre Afrique",
  "Autre International"
];

// Profils d'utilisateurs détaillés (Section 4 du prompt maître)
export interface UserProfileCategory {
  id: "etudiant" | "particulier" | "prestataire" | "artisan" | "entreprise" | "fournisseur";
  label: string;
  description: string;
  baseRole: "entrepreneur" | "client";
  badge: string;
  requiresIFU: boolean;
  requiresRCCM: boolean;
  allowedDocs: string[];
}

export const USER_PROFILE_CATEGORIES: UserProfileCategory[] = [
  {
    id: "prestataire",
    label: "Prestataire indépendant / Freelance",
    description: "Consultant, développeur, designer, gestionnaire ou expert indépendant",
    baseRole: "entrepreneur",
    badge: "Prestataire",
    requiresIFU: false,
    requiresRCCM: false,
    allowedDocs: ["cni", "passeport", "titre_sejour", "carte_consulaire"],
  },
  {
    id: "entreprise",
    label: "Entreprise / Société / Recruteur",
    description: "Donneur d'ordre, PME, startup, société commerciale ou recruteur",
    baseRole: "client",
    badge: "Entreprise",
    requiresIFU: true, // Si Bénin
    requiresRCCM: true, // Si applicable
    allowedDocs: ["rccm", "ifu", "kbis", "statuts"],
  },
  {
    id: "etudiant",
    label: "Étudiant & Jeune Diplômé",
    description: "Recherche de stage, premier projet, sans obligation d'IFU ni de RCCM",
    baseRole: "entrepreneur",
    badge: "Étudiant",
    requiresIFU: false,
    requiresRCCM: false,
    allowedDocs: ["carte_etudiant", "certificat_scolarite", "cni", "passeport"],
  },
  {
    id: "particulier",
    label: "Particulier / Demandeur d'opportunités",
    description: "Accès aux formations, opportunités et missions ponctuelles",
    baseRole: "entrepreneur",
    badge: "Particulier",
    requiresIFU: false,
    requiresRCCM: false,
    allowedDocs: ["cni", "passeport", "titre_sejour"],
  },
  {
    id: "artisan",
    label: "Artisan & Métiers d'Art",
    description: "Couturier, mécanicien, électricien, bâtisseur, métiers manuels et d'atelier",
    baseRole: "entrepreneur",
    badge: "Artisan",
    requiresIFU: false,
    requiresRCCM: false,
    allowedDocs: ["cni", "passeport", "carte_artisan", "titre_sejour"],
  },
  {
    id: "fournisseur",
    label: "Fournisseur B2B / Gros & Demi-gros",
    description: "Producteur, grossiste de matières premières ou équipements",
    baseRole: "entrepreneur",
    badge: "Fournisseur B2B",
    requiresIFU: true, // Si entreprise béninoise
    requiresRCCM: true,
    allowedDocs: ["rccm", "ifu", "agrement", "cni"],
  },
];

// Types de pièces d'identité (Section 5 du prompt)
export const ID_DOCUMENT_TYPES = [
  { id: "cni", label: "Carte Nationale d'Identité (CNI)", requiresBack: true },
  { id: "passeport", label: "Passeport International", requiresBack: false },
  { id: "titre_sejour", label: "Carte / Titre de Séjour", requiresBack: true },
  { id: "carte_etudiant", label: "Carte d'Étudiant / Certificat de Scolarité", requiresBack: false },
  { id: "carte_consulaire", label: "Carte Consulaire", requiresBack: true },
  { id: "autre", label: "Autre pièce officielle d'identité", requiresBack: false },
];

// Statuts de vérification d'identité (Section 5.3)
export const IDENTITY_STATUSES: Record<string, { label: string; color: string; description: string }> = {
  documents_pending: {
    label: "Documents non fournis",
    color: "bg-slate-100 text-slate-700 border-slate-300",
    description: "Veuillez soumettre vos pièces d'identité pour certifier votre profil.",
  },
  incomplete: {
    label: "Dossier incomplet",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    description: "Certaines pièces obligatoires manquent à votre dossier.",
  },
  pending: {
    label: "En attente de vérification",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    description: "Vos documents ont été transmis et sont en file d'attente de modération.",
  },
  in_review: {
    label: "En cours de vérification",
    color: "bg-indigo-100 text-indigo-800 border-indigo-300",
    description: "Un administrateur de conformité examine actuellement vos pièces.",
  },
  verified: {
    label: "Identité vérifiée",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    description: "Votre identité a été authentifiée officiellement avec badge vérifié.",
  },
  rejected: {
    label: "Documents rejetés",
    color: "bg-rose-100 text-rose-800 border-rose-300",
    description: "Les documents soumis n'ont pas pu être validés. Consultez le motif ci-dessous.",
  },
  correction_needed: {
    label: "Correction demandée",
    color: "bg-orange-100 text-orange-800 border-orange-300",
    description: "Une modification ou un renvoi de pièce est requis par les administrateurs.",
  },
};

// Statuts professionnels (Section 13)
export const PROFESSIONAL_STATUSES: Record<string, { label: string; color: string }> = {
  not_applicable: { label: "Non applicable", color: "bg-slate-100 text-slate-600 border-slate-200" },
  documents_pending: { label: "À compléter", color: "bg-amber-50 text-amber-700 border-amber-200" },
  pending: { label: "En attente", color: "bg-blue-50 text-blue-700 border-blue-200" },
  verified: { label: "Entreprise vérifiée", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  rejected: { label: "Rejeté", color: "bg-rose-50 text-rose-700 border-rose-200" },
  suspended: { label: "Suspendu", color: "bg-slate-200 text-slate-800 border-slate-300" },
};

// Statuts du compte utilisateur (Section 13)
export const ACCOUNT_STATUSES: Record<string, { label: string; color: string }> = {
  active: { label: "Actif", color: "bg-emerald-100 text-emerald-800" },
  suspended: { label: "Suspendu", color: "bg-rose-100 text-rose-800" },
  deactivated: { label: "Désactivé", color: "bg-slate-200 text-slate-700" },
};

// Motifs de signalement anti-arnaque (Section 14)
export const FRAUD_REPORT_REASONS = [
  { id: "demande_argent", label: "Demande d'argent avant embauche ou formation payante" },
  { id: "fausse_identite", label: "Fausse identité ou usurpation d'entreprise" },
  { id: "fausse_offre", label: "Offre d'emploi ou de mission fictive / irréaliste" },
  { id: "num_ifu_invalide", label: "Numéro IFU ou RCCM suspect ou usurpé" },
  { id: "non_paiement", label: "Non-respect des engagements financiers ou fraude au paiement" },
  { id: "autre", label: "Autre comportement suspect ou abusif" },
];

export const CONTRACT_TYPES = [
  { id: "cdi", label: "CDI (Contrat à durée indéterminée)" },
  { id: "cdd", label: "CDD (Contrat à durée déterminée)" },
  { id: "stage", label: "Stage & Apprentissage" },
  { id: "freelance", label: "Mission Freelance / Prestation" },
  { id: "temporaire", label: "Mission Temporaire" },
];

export const WORK_MODES = [
  { id: "remote", label: "À distance / Télétravail" },
  { id: "onsite", label: "Sur site / En présentiel" },
  { id: "hybrid", label: "Mode Hybride" },
];

export const RECRUITMENT_STATUSES = [
  { id: "received", label: "Candidature reçue", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "under_review", label: "Candidature en cours d'examen", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { id: "shortlisted", label: "Présélection", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "interview", label: "Entretien", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "technical_test", label: "Test technique ou professionnel", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { id: "offer_made", label: "Offre proposée", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "accepted", label: "Candidature acceptée", color: "bg-green-100 text-green-800 border-green-300" },
  { id: "rejected", label: "Candidature refusée", color: "bg-rose-50 text-rose-700 border-rose-200" },
  { id: "withdrawn", label: "Candidature retirée", color: "bg-slate-100 text-slate-700 border-slate-200" },
];

export const MISSION_STATUSES = [
  { id: "published", label: "Publiée", color: "bg-blue-50 text-blue-700" },
  { id: "applications_open", label: "Candidatures ouvertes", color: "bg-emerald-50 text-emerald-700" },
  { id: "provider_selected", label: "Prestataire sélectionné", color: "bg-purple-50 text-purple-700" },
  { id: "in_progress", label: "En cours", color: "bg-amber-50 text-amber-700" },
  { id: "pending_validation", label: "En attente de validation", color: "bg-orange-50 text-orange-700" },
  { id: "completed", label: "Terminée", color: "bg-green-100 text-green-800" },
  { id: "cancelled", label: "Annulée", color: "bg-rose-50 text-rose-700" },
];

export const SUPPORTED_CURRENCIES = [
  { code: "XOF", label: "FCFA BCEAO (XOF)", symbol: "FCFA" },
  { code: "XAF", label: "FCFA BEAC (XAF)", symbol: "FCFA" },
  { code: "EUR", label: "Euro (€)", symbol: "€" },
  { code: "USD", label: "Dollar US ($)", symbol: "$" },
  { code: "GNF", label: "Franc Guinéen (GNF)", symbol: "GNF" },
  { code: "CDF", label: "Franc Congolais (CDF)", symbol: "CDF" },
  { code: "NGN", label: "Naira (₦)", symbol: "₦" },
];
