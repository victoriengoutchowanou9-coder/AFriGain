"use client";

import { useState, useEffect } from "react";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  X,
  FileCheck
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Opportunity {
  id: string;
  client_id: string;
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

export function DailyOpportunitiesHub() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocationMode, setSelectedLocationMode] = useState<string>("all");

  // Candidature Modal
  const [activeApplyOpp, setActiveApplyOpp] = useState<Opportunity | null>(null);
  const [proposedRate, setProposedRate] = useState<number>(0);
  const [estimatedDays, setEstimatedDays] = useState<number>(3);
  const [coverMessage, setCoverMessage] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Mes candidatures pour éviter les doublons et afficher les statuts
  const [myApplications, setMyApplications] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
      if (data.user) loadMyApplications(data.user.id);
    });
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("job_posts")
      .select(`
        id, client_id, title, description, budget_amount, budget_currency, deadline,
        location_mode, location_country, location_city, skills_required, status, created_at,
        profiles:client_id (full_name, company_name)
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(30);

    if (data) {
      setOpportunities(data as any);
    }
    setIsLoading(false);
  };

  const loadMyApplications = async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("applications")
      .select("job_id, status")
      .eq("freelancer_id", userId);

    if (data) {
      const map: Record<string, string> = {};
      data.forEach((app) => {
        map[app.job_id] = app.status;
      });
      setMyApplications(map);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }
    if (!activeApplyOpp) return;

    setIsApplying(true);
    const supabase = createClient();

    const { error } = await supabase.from("applications").insert({
      job_id: activeApplyOpp.id,
      freelancer_id: currentUser.id,
      proposed_rate: proposedRate || activeApplyOpp.budget_amount,
      currency: activeApplyOpp.budget_currency || "XOF",
      estimated_days: estimatedDays,
      cover_message: coverMessage.trim(),
      status: "submitted",
    });

    setIsApplying(false);
    if (!error) {
      setApplySuccess(true);
      setMyApplications((prev) => ({ ...prev, [activeApplyOpp.id]: "submitted" }));
      setTimeout(() => {
        setActiveApplyOpp(null);
        setApplySuccess(false);
        setCoverMessage("");
      }, 1500);
    } else {
      alert("Erreur lors de la candidature : " + error.message);
    }
  };

  const filtered = opportunities.filter((opp) => {
    if (selectedLocationMode !== "all" && opp.location_mode !== selectedLocationMode) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filtres compacts */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setSelectedLocationMode("all")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              selectedLocationMode === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Tous modes
          </button>
          <button
            onClick={() => setSelectedLocationMode("remote")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              selectedLocationMode === "remote" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            À distance
          </button>
          <button
            onClick={() => setSelectedLocationMode("on_site")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              selectedLocationMode === "on_site" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Sur place
          </button>
          <button
            onClick={() => setSelectedLocationMode("hybrid")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              selectedLocationMode === "hybrid" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Hybride
          </button>
        </div>

        <a
          href="/missions/create"
          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-brand-200 hover:bg-brand-50"
        >
          + Publier une opportunité
        </a>
      </div>

      {/* Liste des opportunités */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          Chargement des opportunités du jour...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
          <Briefcase className="w-8 h-8 text-brand-500 mx-auto" />
          <h4 className="font-bold text-slate-900 text-sm">Aucune opportunité active pour l'instant</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Les nouvelles offres d'emplois, missions freelance et appels d'offres vérifiés apparaîtront ici chaque jour.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filtered.map((opp) => {
            const hasApplied = myApplications[opp.id];

            return (
              <div
                key={opp.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3 hover:border-brand-500/60 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/50">
                      {opp.location_mode === "remote" ? "À distance" : opp.location_mode === "hybrid" ? "Hybride" : "Sur site"}
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      {opp.budget_amount.toLocaleString("fr-FR")} {opp.budget_currency}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    {opp.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>

                  {/* Compétences demandées */}
                  {opp.skills_required && opp.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {opp.skills_required.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="text-slate-400 text-[10px] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {opp.location_city ? `${opp.location_city}, ` : ""}{opp.location_country}
                  </span>

                  {hasApplied ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Candidature : {hasApplied}
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        if (!currentUser) window.location.href = "/auth/login";
                        else {
                          setActiveApplyOpp(opp);
                          setProposedRate(opp.budget_amount);
                        }
                      }}
                      className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                    >
                      Postuler
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Candidature (Section 5.3) */}
      {activeApplyOpp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Candidature directe</span>
                <h3 className="font-bold text-slate-900 text-base">{activeApplyOpp.title}</h3>
              </div>
              <button
                onClick={() => setActiveApplyOpp(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applySuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-base">Candidature envoyée !</h4>
                <p className="text-xs text-slate-500">
                  Le recruteur a reçu votre proposition. Vous pouvez suivre l'état de votre candidature dans votre espace.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Votre tarif proposé ({activeApplyOpp.budget_currency}) *
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={proposedRate}
                      onChange={(e) => setProposedRate(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Délai de réalisation (en jours) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Message au recruteur / Présentation de votre approche *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Expliquez brièvement comment vous allez réaliser la mission et vos expériences similaires..."
                    value={coverMessage}
                    onChange={(e) => setCoverMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveApplyOpp(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl disabled:opacity-50"
                  >
                    {isApplying ? "Envoi..." : "Envoyer ma candidature"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
