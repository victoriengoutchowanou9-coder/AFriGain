"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Search, 
  Briefcase, 
  GraduationCap, 
  Target, 
  Trophy, 
  FileSpreadsheet, 
  Layers, 
  Building2, 
  Globe2, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck,
  ExternalLink,
  Tag
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface EconomicOpportunity {
  id: string;
  title: string;
  type: 
    | "emploi" 
    | "stage" 
    | "mission" 
    | "appel_projet" 
    | "formation" 
    | "concours" 
    | "marche" 
    | "sous_traitance" 
    | "fournisseur" 
    | "partenariat" 
    | "international";
  organization: string;
  location: string;
  country: string;
  budgetOrGrant?: string;
  deadline: string;
  description: string;
  conditions: string[];
  beginnerFriendly: boolean;
  officialSource?: string;
  sourceUrl?: string;
  isInternational: boolean;
}

const OPPORTUNITIES_LIST: EconomicOpportunity[] = [
  {
    id: "opp-1",
    title: "Programme d'Accompagnement et Subvention Jeunes PME Agro",
    type: "concours",
    organization: "Fonds d'Appui à l'Entrepreneuriat Agricole Bénin",
    location: "Cotonou & Parakou",
    country: "Bénin",
    budgetOrGrant: "Jusqu'à 5 000 000 FCFA de dotation",
    deadline: "20/11/2026",
    description: "Appel à candidatures pour financer et accompagner 25 jeunes entrepreneurs béninois actifs dans la transformation agroalimentaire locale.",
    conditions: ["Entreprise enregistrée au Bénin", "Moins de 35 ans", "Projet à impact direct"],
    beginnerFriendly: true,
    officialSource: "Ministère de l'Agriculture et PME",
    sourceUrl: "https://afrigain.bj/opportunites/agro-2026",
    isInternational: false,
  },
  {
    id: "opp-2",
    title: "Appel d'Offres : Numérisation des archives et saisie de registres",
    type: "marche",
    organization: "Coopérative Régionale du Littoral",
    location: "Cotonou",
    country: "Bénin",
    budgetOrGrant: "1 800 000 FCFA",
    deadline: "12/11/2026",
    description: "Mission de sous-traitance ouverte aux indépendants ou petites agences pour scanner, indexer et classer 4 000 dossiers comptables.",
    conditions: ["Maîtrise de la suite bureautique", "Disponibilité immédiate", "Garantie de confidentialité"],
    beginnerFriendly: true,
    officialSource: "CRL Bénin",
    isInternational: false,
  },
  {
    id: "opp-3",
    title: "Formation Pratique Accélérée : Commerce Digital & Vente WhatsApp Business",
    type: "formation",
    organization: "Académie Numérique AfriGain",
    location: "En ligne / À distance",
    country: "Bénin & UEMOA",
    budgetOrGrant: "Gratuit (100% pris en charge)",
    deadline: "30/11/2026",
    description: "Atelier intensif orienté résultat : apprenez à structurer votre catalogue, lancer vos premières publicités et convertir des prospects en clients payants.",
    conditions: ["Avoir un smartphone connecté", "Aucun diplôme prérequis"],
    beginnerFriendly: true,
    officialSource: "AfriGain Academy",
    isInternational: false,
  },
  {
    id: "opp-4",
    title: "Mission Freelance : Développement Interface Mobile React Native",
    type: "mission",
    organization: "Fintech Atlantique",
    location: "Télétravail",
    country: "International",
    budgetOrGrant: "650 000 FCFA",
    deadline: "18/11/2026",
    description: "Développement des écrans de tableau de bord client avec intégration d'API GraphQL. Contrat de mission court de 4 semaines.",
    conditions: ["Expérience prouvée sur React ou React Native", "Code propre documenté"],
    beginnerFriendly: false,
    officialSource: "Fintech Atlantique via AfriGain",
    isInternational: true,
  },
  {
    id: "opp-5",
    title: "Recherche de Distributeurs Régionaux de Produits Bio & Cosmétiques Naturels",
    type: "partenariat",
    organization: "BioBénin Laboratoires",
    location: "Bénin, Togo, Côte d'Ivoire",
    country: "Afrique de l'Ouest",
    budgetOrGrant: "Marges commerciales de 25% à 40%",
    deadline: "Permanent",
    description: "Opportunité de partenariat commercial pour jeunes commerçants et boutiques souhaitant distribuer une gamme certifiée de beurres de karité et huiles pures.",
    conditions: ["Point de vente physique ou vente en ligne active", "Première commande test minimale"],
    beginnerFriendly: true,
    officialSource: "BioBénin Lab",
    isInternational: false,
  },
  {
    id: "opp-6",
    title: "Stage d'Initiation Pratique : Électricité Bâtiment & Solaire",
    type: "stage",
    organization: "Solaire Plus Bénin",
    location: "Abomey-Calavi",
    country: "Bénin",
    budgetOrGrant: "Indemnité 90 000 FCFA/mois",
    deadline: "15/11/2026",
    description: "Immersion sur chantiers avec un tuteur expérimenté pour apprendre la pose d'onduleurs, le câblage et la maintenance d'installations solaires.",
    conditions: ["Motivation et respect des consignes de sécurité", "Ouvert aux débutants"],
    beginnerFriendly: true,
    officialSource: "Solaire Plus Bénin",
    isInternational: false,
  },
];

const TYPE_FILTERS = [
  { id: "all", label: "Toutes les opportunités", icon: Layers },
  { id: "emploi", label: "Offres d'emploi", icon: Briefcase },
  { id: "stage", label: "Stages & Apprentissage", icon: GraduationCap },
  { id: "mission", label: "Missions Indépendantes", icon: Target },
  { id: "concours", label: "Concours & Subventions", icon: Trophy },
  { id: "formation", label: "Formations Pratiques", icon: Sparkles },
  { id: "marche", label: "Marchés & Appels d'offres", icon: FileSpreadsheet },
  { id: "partenariat", label: "Partenariats & Distribution", icon: Building2 },
];

export default function OpportunitesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [onlyBeginner, setOnlyBeginner] = useState(false);
  const [onlyInternational, setOnlyInternational] = useState(false);

  const filteredOpportunities = OPPORTUNITIES_LIST.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.organization.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "all" || item.type === selectedType;
    const matchesBeginner = !onlyBeginner || item.beginnerFriendly;
    const matchesInternational = !onlyInternational || item.isInternational;

    return matchesSearch && matchesType && matchesBeginner && matchesInternational;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          Section 13 du Référentiel AfriGain
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Index des Opportunités Économiques
        </h1>
        <p className="text-slate-600 text-sm mt-1 max-w-3xl">
          Espace unifié recensant les emplois, stages, missions freelances, subventions, appels d'offres et programmes de distribution vérifiés au Bénin, en Afrique et à l'international.
        </p>
      </div>

      {/* Barre de recherche et filtres de types */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Rechercher une opportunité, un appel d'offres, un concours, une formation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
        </div>

        {/* Boutons types d'opportunités */}
        <div className="flex flex-wrap gap-2 pt-1">
          {TYPE_FILTERS.map((filter) => {
            const Icon = filter.icon;
            const active = selectedType === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedType(filter.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-brand-600 text-white shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Filtres secondaires */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <input
              type="checkbox"
              checked={onlyBeginner}
              onChange={(e) => setOnlyBeginner(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
            />
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Accessible aux débutants sans expérience
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
            <input
              type="checkbox"
              checked={onlyInternational}
              onChange={(e) => setOnlyInternational(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <Globe2 className="w-3.5 h-3.5 text-blue-600" />
            Opportunités Internationales
          </label>
        </div>
      </div>

      {/* Liste des opportunités */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOpportunities.map((opp) => (
          <div
            key={opp.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 border border-brand-100">
                  {opp.type.replace("_", " ")}
                </span>
                {opp.beginnerFriendly && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Débutants bienvenus
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {opp.title}
              </h3>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {opp.organization}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {opp.location}
                </span>
              </div>

              {opp.budgetOrGrant && (
                <div className="text-xs font-bold text-brand-700 bg-brand-50/50 p-2 rounded-lg border border-brand-100/60">
                  💰 {opp.budgetOrGrant}
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed">
                {opp.description}
              </p>

              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-semibold text-slate-700 block">Conditions clés :</span>
                <ul className="text-xs text-slate-500 space-y-0.5 list-disc list-inside">
                  {opp.conditions.map((cond, idx) => (
                    <li key={idx}>{cond}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Date limite : {opp.deadline}
              </span>

              {opp.sourceUrl ? (
                <a
                  href={opp.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700"
                >
                  Modalités officielles <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <Link
                  href="/missions"
                  className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700"
                >
                  Candidater <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
