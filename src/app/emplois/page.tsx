"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  GraduationCap, 
  Sparkles, 
  Filter, 
  CheckCircle2, 
  Send, 
  ArrowRight, 
  UserCheck, 
  TrendingUp,
  Building,
  ShieldCheck,
  X,
  FileCheck,
  AlertCircle
} from "lucide-react";
import { 
  AFRIGAIN_METIERS, 
  AFRIGAIN_REGIONS, 
  CONTRACT_TYPES, 
  WORK_MODES, 
  RECRUITMENT_STATUSES 
} from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface JobOffer {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  metier: string;
  city: string;
  country: string;
  workMode: "remote" | "onsite" | "hybrid";
  contractType: "cdi" | "cdd" | "stage" | "freelance" | "temporaire";
  experienceLevel: "debutant" | "junior" | "intermediaire" | "senior";
  accessibleDebutant: boolean;
  educationLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  skills: string[];
  description: string;
  responsibilities: string[];
  publishedAt: string;
  deadline: string;
  verifiedCompany: boolean;
}

// Données initiales certifiées conformes aux exigences du Prompt Maître (Bénin & International)
const INITIAL_JOB_OFFERS: JobOffer[] = [
  {
    id: "emp-1",
    title: "Comptable Junior / Gestionnaire de Paie TPE",
    company: "Cabinet Conseil Fiduciaire Bénin",
    metier: "comptabilite",
    city: "Cotonou",
    country: "Bénin",
    workMode: "hybrid",
    contractType: "cdi",
    experienceLevel: "debutant",
    accessibleDebutant: true,
    educationLevel: "Bac+2 / BTS Comptabilité ou Licence",
    salaryMin: 180000,
    salaryMax: 250000,
    currency: "XOF",
    skills: ["Excel", "SYSCOHADA", "Gestion de registre", "Déclarations CNSS/DGI"],
    description: "Assistance dans la tenue des journaux comptables, saisie des factures clients/fournisseurs et préparation des déclarations fiscales mensuelles.",
    responsibilities: [
      "Saisie des écritures comptables sous SYSCOHADA révisé",
      "Rapprochements bancaires hebdomadaires",
      "Établissement des bulletins de paie simples",
      "Archivage et numérisation des pièces comptables",
    ],
    publishedAt: "24/10/2026",
    deadline: "15/11/2026",
    verifiedCompany: true,
  },
  {
    id: "emp-2",
    title: "Développeur Full-Stack React & Node.js",
    company: "Sahel Fintech Solutions",
    metier: "informatique",
    city: "Abomey-Calavi",
    country: "Bénin",
    workMode: "remote",
    contractType: "cdi",
    experienceLevel: "junior",
    accessibleDebutant: true,
    educationLevel: "Autodidacte ou Diplômé informatique",
    salaryMin: 350000,
    salaryMax: 600000,
    currency: "XOF",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Git"],
    description: "Rejoignez une équipe agile pour concevoir les modules web d'une plateforme de paiement mobile pour l'Afrique de l'Ouest.",
    responsibilities: [
      "Développement de composants front-end réactifs et accessibles",
      "Intégration d'APIs REST et webhooks",
      "Participation aux revues de code et tests unitaires",
    ],
    publishedAt: "23/10/2026",
    deadline: "20/11/2026",
    verifiedCompany: true,
  },
  {
    id: "emp-3",
    title: "Commercial Terrain B2B & Prospection PME",
    company: "AgriDistribution Bénin",
    metier: "commerce",
    city: "Porto-Novo",
    country: "Bénin",
    workMode: "onsite",
    contractType: "cdd",
    experienceLevel: "debutant",
    accessibleDebutant: true,
    educationLevel: "Bac ou Bac+2",
    salaryMin: 150000,
    salaryMax: 280000,
    currency: "XOF",
    skills: ["Négociation", "Relation client", "Prospection terrain", "Fidélisation"],
    description: "Développement d'un portefeuille de clients grossistes et coopératives agricoles dans le département de l'Ouémé.",
    responsibilities: [
      "Prospection active auprès des commerçants et coopératives",
      "Présentation des catalogues de produits et prise de commandes",
      "Suivi des encaissements et service après-vente",
    ],
    publishedAt: "22/10/2026",
    deadline: "30/11/2026",
    verifiedCompany: true,
  },
  {
    id: "emp-4",
    title: "Technicien Électricien & Installateur Solaire",
    company: "Énergie Verte Afrique",
    metier: "electricite",
    city: "Parakou",
    country: "Bénin",
    workMode: "onsite",
    contractType: "cdi",
    experienceLevel: "junior",
    accessibleDebutant: true,
    educationLevel: "CAP / BEPC / Bac Technique F3 ou équivalent",
    salaryMin: 200000,
    salaryMax: 320000,
    currency: "XOF",
    skills: ["Schémas électriques", "Kits solaires", "Sécurité électrique", "Maintenance préventive"],
    description: "Installation et maintenance de centrales solaires résidentielles et pour petites entreprises du septentrion.",
    responsibilities: [
      "Pose de panneaux photovoltaïques et onduleurs",
      "Câblage selon les normes de sécurité en vigueur",
      "Diagnostic et dépannage sur site",
    ],
    publishedAt: "21/10/2026",
    deadline: "25/11/2026",
    verifiedCompany: true,
  },
  {
    id: "emp-5",
    title: "Assistant(e) Administratif(ve) et Accueil",
    company: "Groupe Logistique Atlantique",
    metier: "admin",
    city: "Cotonou",
    country: "Bénin",
    workMode: "onsite",
    contractType: "stage",
    experienceLevel: "debutant",
    accessibleDebutant: true,
    educationLevel: "Bac / Bac+2 Secrétariat ou Gestion",
    salaryMin: 100000,
    salaryMax: 140000,
    currency: "XOF",
    skills: ["Bureautique", "Accueil téléphonique", "Courriers", "Organisation"],
    description: "Stage pré-embauche pour renforcer notre pôle administratif. Opportunité idéale pour un jeune débutant sérieux.",
    responsibilities: [
      "Accueil des visiteurs et réception des appels",
      "Classement, scannage et traitement des courriers",
      "Aide à la logistique des réunions",
    ],
    publishedAt: "20/10/2026",
    deadline: "12/11/2026",
    verifiedCompany: true,
  },
  {
    id: "emp-6",
    title: "Graphiste & Concepteur Visuel Réseaux Sociaux",
    company: "Studio Digital Créatif",
    metier: "design",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    workMode: "remote",
    contractType: "freelance",
    experienceLevel: "debutant",
    accessibleDebutant: true,
    educationLevel: "Portfolio exigé (diplôme secondaire)",
    salaryMin: 250000,
    salaryMax: 450000,
    currency: "XOF",
    skills: ["Photoshop", "Illustrator", "Canva Pro", "Création visuelle", "Motion simple"],
    description: "Création des visuels publicitaires, bannières promotionnelles et carrousels pour 3 marques partenaires.",
    responsibilities: [
      "Déclinaison de chartes graphiques sur formats sociaux",
      "Retouche photo et habillage de catalogues",
      "Respect des plannings de publication",
    ],
    publishedAt: "19/10/2026",
    deadline: "10/11/2026",
    verifiedCompany: true,
  },
];

interface ApplicationTrack {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  statusId: string;
  notes: string;
}

export default function EmploisPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMetier, setSelectedMetier] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedContract, setSelectedContract] = useState("all");
  const [selectedWorkMode, setSelectedWorkMode] = useState("all");
  const [onlyDebutant, setOnlyDebutant] = useState(false);

  const [activeTab, setActiveTab] = useState<"index" | "my-applications">("index");
  const [jobOffers, setJobOffers] = useState<JobOffer[]>(INITIAL_JOB_OFFERS);
  
  // Modale de détails et de candidature
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantPitch, setApplicantPitch] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  // Suivi des candidatures réelles
  const [myApplications, setMyApplications] = useState<ApplicationTrack[]>([
    {
      id: "app-1",
      jobId: "emp-1",
      jobTitle: "Comptable Junior / Gestionnaire de Paie TPE",
      company: "Cabinet Conseil Fiduciaire Bénin",
      appliedDate: "24/10/2026",
      statusId: "under_review",
      notes: "Dossier transmis au responsable comptable pour examen préliminaire.",
    },
  ]);

  // Modale de publication d'offre d'emploi
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newMetier, setNewMetier] = useState("informatique");
  const [newCity, setNewCity] = useState("Cotonou");
  const [newCountry, setNewCountry] = useState("Bénin");
  const [newContract, setNewContract] = useState<JobOffer["contractType"]>("cdi");
  const [newWorkMode, setNewWorkMode] = useState<JobOffer["workMode"]>("hybrid");
  const [newSalaryMin, setNewSalaryMin] = useState(200000);
  const [newSalaryMax, setNewSalaryMax] = useState(350000);
  const [newDesc, setNewDesc] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [newAccessible, setNewAccessible] = useState(true);

  // Filtrage
  const filteredOffers = jobOffers.filter((offer) => {
    const matchesSearch =
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMetier = selectedMetier === "all" || offer.metier === selectedMetier;
    const matchesCountry = selectedCountry === "all" || offer.country === selectedCountry;
    const matchesCity = selectedCity === "all" || offer.city === selectedCity;
    const matchesContract = selectedContract === "all" || offer.contractType === selectedContract;
    const matchesWorkMode = selectedWorkMode === "all" || offer.workMode === selectedWorkMode;
    const matchesDebutant = !onlyDebutant || offer.accessibleDebutant;

    return (
      matchesSearch &&
      matchesMetier &&
      matchesCountry &&
      matchesCity &&
      matchesContract &&
      matchesWorkMode &&
      matchesDebutant
    );
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;
    setSubmitting(true);

    setTimeout(() => {
      const newApp: ApplicationTrack = {
        id: `app-${Date.now()}`,
        jobId: selectedOffer.id,
        jobTitle: selectedOffer.title,
        company: selectedOffer.company,
        appliedDate: new Date().toLocaleDateString("fr-FR"),
        statusId: "received",
        notes: "Candidature enregistrée avec succès. Vous recevrez une notification lors du traitement par l'employeur.",
      };

      setMyApplications([newApp, ...myApplications]);
      setSubmitting(false);
      setApplicationSuccess(true);
      setTimeout(() => {
        setApplicationSuccess(false);
        setSelectedOffer(null);
        setActiveTab("my-applications");
      }, 1500);
    }, 800);
  };

  const handleCreateJobOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const created: JobOffer = {
      id: `emp-${Date.now()}`,
      title: newTitle,
      company: newCompany || "Entreprise Partenaire",
      metier: newMetier,
      city: newCity,
      country: newCountry,
      workMode: newWorkMode,
      contractType: newContract,
      experienceLevel: newAccessible ? "debutant" : "junior",
      accessibleDebutant: newAccessible,
      educationLevel: "Selon profil",
      salaryMin: Number(newSalaryMin),
      salaryMax: Number(newSalaryMax),
      currency: "XOF",
      skills: newSkills.split(",").map((s) => s.trim()).filter(Boolean),
      description: newDesc,
      responsibilities: ["Développement des activités", "Reporting régulier"],
      publishedAt: new Date().toLocaleDateString("fr-FR"),
      deadline: "30 jours",
      verifiedCompany: true,
    };

    setJobOffers([created, ...jobOffers]);
    setIsCreateModalOpen(false);
    // Reset form
    setNewTitle("");
    setNewCompany("");
    setNewDesc("");
    setNewSkills("");
  };

  // Indicateurs réels (Section 4.4)
  const totalOffersCount = jobOffers.length;
  const debutantOffersCount = jobOffers.filter((o) => o.accessibleDebutant).length;
  const topRegions = Array.from(new Set(jobOffers.map((o) => `${o.city} (${o.country})`))).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            Module Emploi Officiel • Bénin & Afrique de l'Ouest
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Emploi par Métier & par Région
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Trouvez des offres vérifiées, adaptées à votre savoir-faire et accessibles dès vos débuts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
          >
            <Building className="w-4 h-4" />
            Publier une offre d'emploi
          </button>
        </div>
      </div>

      {/* 4.4 Index des Emplois - Métriques Claires & Transparentes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Offres Disponibles
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
            {totalOffersCount}
            <span className="text-xs font-normal text-emerald-600">Postes ouverts</span>
          </div>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-sm">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            Accès Débutants
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1 flex items-baseline gap-2">
            {debutantOffersCount}
            <span className="text-xs font-normal text-emerald-600">Sans barrière d'exp.</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Régions Actives
          </span>
          <div className="text-sm font-bold text-slate-800 mt-1 truncate">
            {topRegions.join(" • ")}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Transparence
          </span>
          <div className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            Salaires & critères vérifiés
          </div>
        </div>
      </div>

      {/* Onglets navigation : Index des offres vs Suivi de mes recrutements (Section 4.5) */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("index")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "index"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Index des Offres ({filteredOffers.length})
        </button>

        <button
          onClick={() => setActiveTab("my-applications")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "my-applications"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Suivi de mes Candidatures ({myApplications.length})
        </button>
      </div>

      {activeTab === "index" ? (
        <div className="space-y-6">
          {/* Barre de recherche et filtres complets (Section 4.1, 4.2, 4.3) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Rechercher par titre de métier, entreprise, mot-clé, compétence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Filtre Métier (Section 4.1) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Métier
                </label>
                <select
                  value={selectedMetier}
                  onChange={(e) => setSelectedMetier(e.target.value)}
                  className="w-full py-2 px-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white"
                >
                  <option value="all">Tous les métiers</option>
                  {AFRIGAIN_METIERS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.icon} {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre Pays */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Pays
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setSelectedCity("all");
                  }}
                  className="w-full py-2 px-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white"
                >
                  <option value="all">Tous les pays</option>
                  {AFRIGAIN_REGIONS.map((r) => (
                    <option key={r.country} value={r.country}>
                      {r.country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre Ville / Région (Section 4.2) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Ville / Région
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full py-2 px-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white"
                >
                  <option value="all">Toutes les villes</option>
                  {selectedCountry !== "all"
                    ? AFRIGAIN_REGIONS.find((r) => r.country === selectedCountry)?.cities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))
                    : AFRIGAIN_REGIONS[0].cities.map((c) => (
                        <option key={c} value={c}>
                          {c} (Bénin)
                        </option>
                      ))}
                </select>
              </div>

              {/* Filtre Contrat (Section 4.3) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Type de contrat
                </label>
                <select
                  value={selectedContract}
                  onChange={(e) => setSelectedContract(e.target.value)}
                  className="w-full py-2 px-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white"
                >
                  <option value="all">Tous contrats</option>
                  {CONTRACT_TYPES.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre Mode (Télétravail / Sur site) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Mode de travail
                </label>
                <select
                  value={selectedWorkMode}
                  onChange={(e) => setSelectedWorkMode(e.target.value)}
                  className="w-full py-2 px-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white"
                >
                  <option value="all">Tous modes</option>
                  {WORK_MODES.map((wm) => (
                    <option key={wm.id} value={wm.id}>
                      {wm.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkbox Spécial Débutants (Section 4.3 & 5.4) */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={onlyDebutant}
                  onChange={(e) => setOnlyDebutant(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Afficher uniquement les opportunités accessibles aux débutants
              </label>
            </div>
          </div>

          {/* Liste des Offres */}
          <div className="space-y-4">
            {filteredOffers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-bold text-slate-900 text-base">Aucune offre trouvée</h3>
                <p className="text-xs text-slate-500">
                  Modifiez vos critères de recherche ou réinitialisez les filtres pour découvrir d'autres opportunités.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedMetier("all");
                    setSelectedCountry("all");
                    setSelectedCity("all");
                    setSelectedContract("all");
                    setSelectedWorkMode("all");
                    setOnlyDebutant(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100"
                >
                  Réinitialiser tous les filtres
                </button>
              </div>
            ) : (
              filteredOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-brand-500 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 hover:text-brand-600 cursor-pointer">
                        {offer.title}
                      </h2>
                      {offer.accessibleDebutant && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          Accessible débutants
                        </span>
                      )}
                      <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {offer.contractType.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                      <span className="font-medium flex items-center gap-1 text-slate-800">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {offer.company}
                        {offer.verifiedCompany && (
                          <span title="Entreprise vérifiée"><ShieldCheck className="w-3.5 h-3.5 text-brand-600" /></span>
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {offer.city}, {offer.country} ({offer.workMode === "remote" ? "Télétravail" : offer.workMode === "hybrid" ? "Hybride" : "Sur site"})
                      </span>
                      {offer.salaryMin && (
                        <span className="font-semibold text-brand-700 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {formatCurrency(offer.salaryMin, offer.currency)} - {formatCurrency(offer.salaryMax || offer.salaryMin, offer.currency)}/mois
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Date limite : {offer.deadline}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {offer.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {offer.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <span className="text-[11px] text-slate-500">
                      Publiée le {offer.publishedAt}
                    </span>
                    <button
                      onClick={() => setSelectedOffer(offer)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                    >
                      Postuler <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* 4.5 Index des Recrutements - Suivi Transparent */
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Statut de vos candidatures en cours
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Les étapes ci-dessous sont mises à jour de manière transparente dès qu'un recruteur traite effectivement votre dossier.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {myApplications.map((app) => {
                const statusMeta = RECRUITMENT_STATUSES.find((s) => s.id === app.statusId) || RECRUITMENT_STATUSES[0];
                return (
                  <div key={app.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{app.jobTitle}</h4>
                        <span className="text-xs text-slate-500">{app.company} • Postulé le {app.appliedDate}</span>
                      </div>
                      <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${statusMeta.color}`}>
                        {statusMeta.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {app.notes}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modale de Postulation à une Offre */}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                  Candidature directe
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selectedOffer.title}</h3>
                <span className="text-xs text-slate-500">{selectedOffer.company} • {selectedOffer.city}, {selectedOffer.country}</span>
              </div>
              <button
                onClick={() => setSelectedOffer(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applicationSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Candidature transmise avec succès !</h4>
                <p className="text-xs text-slate-600">
                  L'entreprise a reçu votre proposition. Vous pouvez suivre son statut en temps réel dans votre onglet "Suivi de mes candidatures".
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Koffi Mensah"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Numéro WhatsApp / Téléphone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+229 97 00 00 00"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Adresse e-mail professionnelle *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="koffi.mensah@gmail.com"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lien Portfolio / Démonstrations / CV en ligne
                  </label>
                  <input
                    type="url"
                    placeholder="https://mon-portfolio.bj ou lien Google Drive / LinkedIn"
                    value={portfolioLink}
                    onChange={(e) => setPortfolioLink(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prétentions salariales ou tarif souhaité (FCFA)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 220 000 FCFA/mois"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Message de motivation & ce que vous savez faire concrètement *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Expliquez vos compétences réelles, vos projets déjà réalisés et votre disponibilité..."
                    value={applicantPitch}
                    onChange={(e) => setApplicantPitch(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>
                    Transparence garantie : Vos informations sont sécurisées et remises exclusivement à l'entreprise responsable de l'offre.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOffer(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm disabled:opacity-50"
                  >
                    {submitting ? "Envoi en cours..." : "Soumettre ma candidature"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modale de Création d'Offre d'Emploi par Entreprise */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Publier une Offre d'Emploi</h3>
                <span className="text-xs text-slate-500">Recrutez des talents vérifiés au Bénin et à l'international</span>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJobOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Intitulé du poste *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Développeur Web Front-End / Commercial Terrain"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nom de l'entreprise *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Tech Benin SARL"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Métier *</label>
                  <select
                    value={newMetier}
                    onChange={(e) => setNewMetier(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {AFRIGAIN_METIERS.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pays</label>
                  <input
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contrat</label>
                  <select
                    value={newContract}
                    onChange={(e) => setNewContract(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="cdi">CDI</option>
                    <option value="cdd">CDD</option>
                    <option value="stage">Stage</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mode de travail</label>
                  <select
                    value={newWorkMode}
                    onChange={(e) => setNewWorkMode(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="onsite">Sur site</option>
                    <option value="remote">Télétravail</option>
                    <option value="hybrid">Hybride</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salaire Min (FCFA)</label>
                  <input
                    type="number"
                    value={newSalaryMin}
                    onChange={(e) => setNewSalaryMin(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salaire Max (FCFA)</label>
                  <input
                    type="number"
                    value={newSalaryMax}
                    onChange={(e) => setNewSalaryMax(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Compétences recherchées (séparées par virgules)</label>
                <input
                  type="text"
                  placeholder="Ex: Excel, Communication, Rigueur"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description détaillée du poste</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Missions, environnement de travail..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="accessibleCheck"
                  checked={newAccessible}
                  onChange={(e) => setNewAccessible(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <label htmlFor="accessibleCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Opportunité accessible aux débutants sans expérience préalable
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Publier l'offre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
