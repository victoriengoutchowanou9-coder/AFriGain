"use client";

import { useState, useEffect } from "react";
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
  PlusCircle,
  FileCheck,
  Tag
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface OpportunityItem {
  id: string;
  title: string;
  description: string;
  budget_amount: number;
  budget_currency: string;
  deadline: string | null;
  location_mode: string;
  location_country: string;
  location_city: string | null;
  skills_required: string[];
  status: string;
  created_at: string;
  profiles?: {
    full_name: string;
    company_name: string | null;
  };
}

const TYPE_FILTERS = [
  { id: "all", label: "Toutes les opportunités", icon: Layers },
  { id: "remote", label: "Télétravail & Distance", icon: Globe2 },
  { id: "on_site", label: "Sur place (Local)", icon: MapPin },
  { id: "hybrid", label: "Hybride", icon: Target },
];

export default function OpportunitesPage() {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRealOpportunities() {
      setIsLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("job_posts")
        .select(`
          id, title, description, budget_amount, budget_currency, deadline,
          location_mode, location_country, location_city, skills_required, status, created_at,
          profiles:client_id (full_name, company_name)
        `)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (data) {
        setOpportunities(data as any);
      }
      setIsLoading(false);
    }
    loadRealOpportunities();
  }, []);

  const filteredOpportunities = opportunities.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.profiles?.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location_city || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "all" || item.location_mode === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Opportunités Réelles • Données Vérifiées Supabase
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Index des Opportunités Économiques
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
            Missions rémunérées, emplois, prestations freelance et marchés réels publiés par les entreprises et recruteurs sur AfriGain.
          </p>
        </div>

        <Link
          href="/missions/create"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs self-start md:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Publier une opportunité
        </Link>
      </div>

      {/* Barre de recherche et filtres de types */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Rechercher par mot-clé, compétence ou ville (ex: Développeur, Cotonou, Gestion)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste des opportunités réelles */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-400">
          Chargement des opportunités vérifiées depuis Supabase...
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-brand-500 mx-auto" />
          <h4 className="font-bold text-slate-900 text-base">Aucune opportunité disponible dans cette sélection</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Toutes les opportunités affichées sur AfriGain proviennent d'offres réelles soumises par des recruteurs et clients partenaires.
          </p>
          <div className="pt-2">
            <Link
              href="/missions/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Publier la première offre
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-brand-500/60 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200 uppercase">
                    {opp.location_mode === "remote" ? "À distance" : opp.location_mode === "hybrid" ? "Hybride" : "Sur site"}
                  </span>
                  <span className="text-xs font-black text-slate-900">
                    {opp.budget_amount.toLocaleString("fr-FR")} {opp.budget_currency}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">{opp.title}</h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {opp.description}
                </p>

                {opp.skills_required && opp.skills_required.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {opp.skills_required.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {opp.location_city ? `${opp.location_city}, ` : ""}{opp.location_country}
                </span>

                <Link
                  href={`/missions`}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                >
                  Postuler <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
