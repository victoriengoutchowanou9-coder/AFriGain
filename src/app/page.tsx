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
  GraduationCap,
  MessageSquare,
  Video,
  Flame,
  Award
} from "lucide-react";
import { StoriesBar } from "@/components/StoriesBar";
import { AfriGainFeed } from "@/components/AfriGainFeed";
import { DailyOpportunitiesHub } from "@/components/DailyOpportunitiesHub";
import { NearMeHub } from "@/components/NearMeHub";
import { AfriGainLiveHub } from "@/components/AfriGainLiveHub";
import { MarketplaceRequestHub } from "@/components/MarketplaceRequestHub";
import { ChallengesWidget } from "@/components/ChallengesWidget";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedObjective, setSelectedObjective] = useState<string | null>("emploi");
  const [activeTab, setActiveTab] = useState<"feed" | "opportunites" | "pres-de-moi" | "live" | "recherche">("feed");

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

  const TABS = [
    { id: "feed", label: "Le Fil AfriGain", icon: MessageSquare, badge: "Actu" },
    { id: "opportunites", label: "Opportunités du jour", icon: Briefcase, badge: "Nouveau" },
    { id: "pres-de-moi", label: "Près de moi", icon: MapPin },
    { id: "live", label: "AfriGain Live", icon: Video },
    { id: "recherche", label: "Marketplace & Approvisionnement", icon: Package },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Hero Section compacte et professionnelle */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-slate-50 border-b border-slate-200/80 pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              Écosystème Numérique Professionnel • Afrique & International
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Des compétences aux opportunités. <br />
              <span className="text-brand-600">Des opportunités aux revenus.</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              AFriGain réunit les particuliers, jeunes, indépendants, entreprises et fournisseurs pour échanger, publier, découvrir des opportunités concrètes et développer leurs affaires.
            </p>

            {/* Moteur de recherche unifié (Section 16) */}
            <div className="max-w-xl mx-auto pt-1">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    window.location.href = `/emplois?q=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                className="flex items-center bg-white rounded-2xl border border-slate-300 shadow-xs p-1.5 focus-within:ring-2 focus-within:ring-brand-500"
              >
                <Search className="w-4 h-4 text-slate-400 ml-3" />
                <input
                  type="text"
                  placeholder="Métier, opportunité, produit, ville (ex: Couturier, Cotonou)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
                >
                  Rechercher
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TABLEAU DE BORD VIVANT PRINCIPAL (Section 15 du PDF) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Barre de Stories (Section 6) */}
        <StoriesBar />

        {/* Disposition épurée et non encombrante (Main Feed 8 cols + Sidebar 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Colonne Principale (8 colonnes) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Système d'onglets dynamique pour fluidifier l'expérience */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-t-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 border-b-2 ${
                      active
                        ? "border-brand-600 text-brand-600 bg-white"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="text-[9px] font-extrabold bg-brand-100 text-brand-700 px-1.5 py-0.2 rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Contenu de l'onglet sélectionné */}
            <div className="transition-all animate-fade-in">
              {activeTab === "feed" && <AfriGainFeed />}
              {activeTab === "opportunites" && <DailyOpportunitiesHub />}
              {activeTab === "pres-de-moi" && <NearMeHub />}
              {activeTab === "live" && <AfriGainLiveHub />}
              {activeTab === "recherche" && <MarketplaceRequestHub />}
            </div>
          </div>

          {/* Colonne Latérale / Widgets Utiles (4 colonnes) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Widget Défis AfriGain (Section 8) */}
            <ChallengesWidget />

            {/* Assistant Intelligent AfriGain AI (Section 11) */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-2xl border border-amber-200/80 p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Assistant Business IA</h4>
                  <span className="text-[10px] text-amber-900">Transformez vos idées en action</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Besoin d'aide pour rédiger une offre, valoriser vos compétences ou calculer vos tarifs ?
              </p>

              <div className="space-y-1.5 pt-1">
                <Link
                  href="/dashboard/coach-ia?mode=skills"
                  className="w-full text-left p-2 rounded-xl bg-white/80 border border-amber-200 text-[11px] font-semibold text-slate-800 hover:bg-white flex items-center justify-between"
                >
                  <span>Identifier mes compétences</span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                </Link>
                <Link
                  href="/dashboard/coach-ia?mode=pitch"
                  className="w-full text-left p-2 rounded-xl bg-white/80 border border-amber-200 text-[11px] font-semibold text-slate-800 hover:bg-white flex items-center justify-between"
                >
                  <span>Générer un pitch commercial</span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                </Link>
                <Link
                  href="/dashboard/quotes"
                  className="w-full text-left p-2 rounded-xl bg-white/80 border border-amber-200 text-[11px] font-semibold text-slate-800 hover:bg-white flex items-center justify-between"
                >
                  <span>Créer un devis aux normes UEMOA</span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                </Link>
              </div>
            </div>

            {/* Parcours Débutants "Je commence" */}
            <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200/80 p-4 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Débutant sans expérience ?
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apprenez des compétences concrètes grâce à nos parcours d'action guidés pas-à-pas.
              </p>
              <Link
                href="/commencer"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-1"
              >
                Découvrir le programme →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ASSISTANT D'ORIENTATION INTERACTIF "Quel est votre objectif ?" */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
              Orientation Métier & Entreprise
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Quel est votre objectif aujourd'hui ?
            </h2>
            <p className="text-slate-500 text-xs">
              Sélectionnez votre profil pour afficher immédiatement vos actions recommandées :
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
                      ? "border-brand-600 bg-brand-50/80 shadow-xs font-bold text-brand-900"
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
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Parcours Recommandé</span>
                <h3 className="text-sm font-bold text-slate-900">{currentObj.title}</h3>
                <p className="text-xs text-slate-600">{currentObj.desc}</p>
              </div>
              <Link
                href={currentObj.targetUrl}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto shrink-0"
              >
                {currentObj.actionText} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
