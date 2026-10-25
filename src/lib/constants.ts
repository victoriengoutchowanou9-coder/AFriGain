// Constantes officielles du projet AfriGain basées sur le Prompt Maître

export interface JobCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export const AFRIGAIN_METIERS: JobCategory[] = [
  { id: "informatique", name: "Informatique & Développement Logiciel", slug: "informatique-dev", icon: "💻" },
  { id: "comptabilite", name: "Comptabilité & Gestion d'Entreprise", slug: "comptabilite-gestion", icon: "📊" },
  { id: "commerce", name: "Commerce, Vente & Négociation", slug: "commerce-vente", icon: "🛍️" },
  { id: "marketing", name: "Marketing Digital & Communication", slug: "marketing-com", icon: "📢" },
  { id: "design", name: "Design Graphique, UI/UX & Branding", slug: "design-graphique", icon: "🎨" },
  { id: "agriculture", name: "Agriculture, Élevage & Agroalimentaire", slug: "agriculture-elevage", icon: "🌱" },
  { id: "btp", name: "Bâtiment & Travaux Publics (BTP)", slug: "btp-travaux", icon: "🏗️" },
  { id: "electricite", name: "Électricité, Plomberie & Énergies Solaires", slug: "electricite-plomberie", icon: "⚡" },
  { id: "couture", name: "Couture, Mode & Artisanat d'Art", slug: "couture-artisanat", icon: "✂️" },
  { id: "transport", name: "Transport, Logistique & Livraison", slug: "transport-logistique", icon: "🚚" },
  { id: "restauration", name: "Restauration, Cuisine & Hôtellerie", slug: "restauration-hotellerie", icon: "🍽️" },
  { id: "education", name: "Éducation, Tutorat & Formation", slug: "education-formation", icon: "📚" },
  { id: "sante", name: "Santé & Soins (Certifications requises)", slug: "sante-soins", icon: "🩺" },
  { id: "industrie", name: "Industrie, Mécanique & Maintenance", slug: "industrie-maintenance", icon: "🔧" },
  { id: "admin", name: "Services Administratifs & Secrétariat", slug: "services-administratifs", icon: "📁" },
  { id: "metiers-numeriques", name: "Métiers Numériques & Data", slug: "metiers-numeriques", icon: "🤖" },
  { id: "autres", name: "Autres Professions & Services", slug: "autres-professions", icon: "✨" },
];

export const AFRIGAIN_REGIONS = [
  { country: "Bénin", cities: ["Cotonou", "Abomey-Calavi", "Porto-Novo", "Parakou", "Bohicon", "Natitingou", "Ouidah", "Djougou"] },
  { country: "Togo", cities: ["Lomé", "Kara", "Sokodé"] },
  { country: "Côte d'Ivoire", cities: ["Abidjan", "Bouaké", "Yamoussoukro", "San-Pédro"] },
  { country: "Sénégal", cities: ["Dakar", "Thiès", "Saint-Louis"] },
  { country: "Cameroun", cities: ["Douala", "Yaoundé"] },
  { country: "Burkina Faso", cities: ["Ouagadougou", "Bobo-Dioulasso"] },
  { country: "Niger", cities: ["Niamey", "Maradi"] },
  { country: "International", cities: ["France", "Belgique", "Canada", "USA", "Autre International"] },
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
  { code: "XOF", label: "FCFA (XOF)", symbol: "FCFA" },
  { code: "EUR", label: "Euro (€)", symbol: "€" },
  { code: "USD", label: "Dollar US ($)", symbol: "$" },
  { code: "XAF", label: "FCFA (XAF)", symbol: "FCFA" },
  { code: "NGN", label: "Naira (₦)", symbol: "₦" },
];
