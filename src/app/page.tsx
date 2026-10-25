"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  CheckCircle2, 
  Briefcase, 
  FileSpreadsheet, 
  Bot, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles,
  Users,
  Compass,
  Building2,
  Package,
  Layers,
  Search,
  MapPin,
  ChevronRight,
  Target,
  GraduationCap
} from "lucide-react";
import { AFRIGAIN_METIERS } from "@/lib/constants";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedObjective, setSelectedObjective] = useState<string | null>("emploi");

  // Les 10 Objectifs Concrets de la Section 15 du Prompt Maître
  const OBJECTIVES = [
    {
      id: "emploi",
      title: "Je cherche un emploi",
      desc: "Découvrez des postes en CDI, CDD et stages, notamment accessibles aux débutants.",
      targetUrl: "/emplois",
      actionText: "Voir les offres d'emploi",
      color: "bg-blue-50 border-blue-200 text-blue-800",
    },
    {
      id: "mission",
      title: "Je cherche une mission rémunérée",
      desc: "Prestations pour indépendants et freelances avec budgets clairs et acomptes.",
      targetUrl: "/missions",
      actionText: "Parcourir les missions",
      color: "bg-emerald-50 border-emerald-200 text-emerald-800",
    },
    {
      id: "premiers-clients",
      title: "Je veux trouver mes premiers clients",
      desc: "L'assistant IA vous aide à rédiger votre offre et vos messages de prospection.",
      targetUrl: "/dashboard/coach-ia",
      actionText: "Lancer l'assistant prospection",
      color: "bg-amber-50 border-amber-200 text-amber-800",
    },
    {
      id: "proposer-services",
      title: "Je veux proposer mes services",
      desc: "Créez votre vitrine avec photos de vos réalisations (couturier, artisan, dev...).",
      targetUrl: "/services",
      actionText: "Créer ma vitrine de services",
      color: "bg-purple-50 border-purple-200 text-purple-800",
    },
    {
      id: "vendre-produits",
      title: "Je veux vendre mes produits",
      desc: "Rejoignez le catalogue B2B pour trouver des grossistes et distributeurs.",
      targetUrl: "/fournisseurs",
      actionText: "Espace Marketplace B2B",
      color: "bg-indigo-50 border-indigo-200 text-indigo-800",
    },
    {
      id: "fournisseurs",
      title: "Je cherche des fournisseurs",
      desc: "Matières premières, emballages, outillage et produits certifiés au Bénin.",
      targetUrl: "/fournisseurs",
      actionText: "Consulter les fournisseurs",
      color: "bg-teal-50 border-teal-200 text-teal-800",
    },
    {
      id: "recruter",
      title: "Je veux recruter un talent",
      desc: "Publiez une offre ou une mission et recevez des propositions comparables.",
      targetUrl: "/missions/create",
      actionText: "Publier une mission ou offre",
      color: "bg-rose-50 border-rose-200 text-rose-800",
    },
    {
      id: "developper-entreprise",
      title: "Je veux développer mon entreprise",
      desc: "Devis aux normes, suivi de trésorerie et coaching commercial stratégique.",
      targetUrl: "/dashboard/quotes",
      actionText: "Accéder aux outils de gestion",
      color: "bg-cyan-50 border-cyan-200 text-cyan-800",
    },
    {
      id: "apprendre",
      title: "Je veux apprendre une compétence",
      desc: "Fiches d'action courtes, pratiques et sans jargon pour agir immédiatement.",
      targetUrl: "/commencer",
      actionText: "Programme 'Je commence'",
      color: "bg-green-50 border-green-200 text-green-800",
    },
    {
      id: "partenaires",
      title: "Je veux trouver des partenaires",
      desc: "Mise en relation d'affaires entre entreprises locales et régionales.",
      targetUrl: "/entreprises",
      actionText: "Annuaire des entreprises",
      color: "bg-orange-50 border-orange-200 text-orange-800",
    },
  ];

  const currentObj = OBJECTIVES.find((o) => o.id === selectedObjective) || OBJECTIVES[0];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50 border-b border-slate-200/80 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              Plateforme Intelligente de Transformation Économique • Afrique & International
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Des compétences aux opportunités. <br />
              <span className="text-brand-600">Des opportunités aux revenus.</span> <br />
              Et des entreprises aux marchés.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              AFriGain connecte les jeunes, artisans, indépendants, entreprises et fournisseurs avec des opportunités réelles, la gestion intégrée (Devis & Factures) et l'intelligence artificielle pour bâtir une valeur économique durable.
            </p>

            {/* Moteur de recherche unifié (Section 21 & 26) */}
            <div className="max-w-xl mx-auto pt-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    window.location.href = `/emplois?q=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                className="flex items-center bg-white rounded-2xl border border-slate-300 shadow-md p-1.5 focus-within:ring-2 focus-within:ring-brand-500"
              >
                <Search className="w-5 h-5 text-slate-400 ml-3" />
                <input
                  type="text"
                  placeholder="Métier, compétence, produit, ville (ex: Comptable, Cotonou)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
                >
                  Rechercher
                </button>
              </form>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/commencer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all"
              >
                <Compass className="w-4 h-4" />
                Je commence sans expérience (Parcours Débutants)
              </Link>
              <Link
                href="/emplois"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 shadow-sm transition-all"
              >
                <Briefcase className="w-4 h-4 text-brand-600" />
                Consulter les offres d'emploi
              </Link>
            </div>

            {/* Règle de transparence absolue */}
            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-brand-600" />
              <span>Données réelles vérifiées • Zéro promesse d'enrichissement facile sans travail</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 15 DU PROMPT : ASSISTANT D'ORIENTATION "Quel est ton objectif aujourd'hui ?" */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
              Orientation Interactive (Section 15)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Quel est votre objectif aujourd'hui ?
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Sélectionnez votre situation pour afficher instantanément votre parcours sur mesure :
            </p>
          </div>

          {/* Grille des boutons d'objectifs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {OBJECTIVES.map((obj) => {
              const active = selectedObjective === obj.id;
              return (
                <button
                  key={obj.id}
                  onClick={() => setSelectedObjective(obj.id)}
                  className={`p-3 rounded-2xl text-left border transition-all text-xs flex flex-col justify-between h-24 ${
                    active
                      ? "border-brand-600 bg-brand-50/80 shadow-sm font-bold text-brand-900"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="leading-snug">{obj.title}</span>
                  <span className={`text-[10px] font-semibold flex items-center gap-1 ${active ? "text-brand-600" : "text-slate-400"}`}>
                    Choisir <ChevronRight className="w-3 h-3" />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Carte du parcours recommandé */}
          {currentObj && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Parcours Recommandé</span>
                <h3 className="text-base font-bold text-slate-900">{currentObj.title}</h3>
                <p className="text-xs text-slate-600">{currentObj.desc}</p>
              </div>
              <Link
                href={currentObj.targetUrl}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors self-start sm:self-auto shrink-0"
              >
                {currentObj.actionText} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* MODULES PHARES : Emplois, Missions, Fournisseurs & Gestion */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Un écosystème économique complet et fonctionnel
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Tous les modules communiquent entre eux pour transformer vos compétences en valeur financière.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-brand-500 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Emplois & Missions Débutants</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Offres d'emploi par métier et par région (Cotonou, Parakou, UEMOA) et missions avec budgets garantis et filtres sans expérience.
              </p>
            </div>
            <Link
              href="/emplois"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 pt-2"
            >
              Consulter les emplois <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-brand-500 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">AfriGain AI & Business Coach</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Diagnostic de vos compétences, générateur de CV pro sans mentir, générateur d'offres vendables et calculateur de prix à la marge.
              </p>
            </div>
            <Link
              href="/dashboard/coach-ia"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 pt-2"
            >
              Ouvrir l'assistant IA <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-brand-500 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Devis & Factures Professionnels</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Édition conforme UEMOA en FCFA / EUR, conversion en facture en 1 clic, impression PDF officielle et relances de paiement.
              </p>
            </div>
            <Link
              href="/dashboard/quotes"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 pt-2"
            >
              Créer un devis gratuit <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Marketplace B2B & Fournisseurs (Section 9 & 10) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
              Marketplace B2B & Approvisionnement (Section 9 & 10)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Trouvez des fournisseurs de matières premières et des distributeurs certifiés
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Agroalimentaire, textile, emballages et matériaux BTP au Bénin et en Afrique de l'Ouest. Publiez vos besoins d'approvisionnement ou obtenez des cotations directes.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/fournisseurs"
              className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs text-center transition-colors shadow-md"
            >
              Catalogue Fournisseurs
            </Link>
            <Link
              href="/entreprises"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center border border-slate-700 transition-colors"
            >
              Annuaire Entreprises
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
