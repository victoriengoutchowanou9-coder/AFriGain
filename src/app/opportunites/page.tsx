"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Search, 
  Briefcase, 
  Target, 
  Layers, 
  Building2, 
  Globe2, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck,
  PlusCircle,
  Tag,
  DollarSign,
  Clock,
  Send,
  X,
  Loader2,
  Cpu,
  Check
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { ALL_COUNTRIES } from "@/lib/constants";

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
  { id: "recommended", label: "Recommandées pour vous (Engine)", icon: Cpu },
  { id: "remote", label: "Télétravail & Distance", icon: Globe2 },
  { id: "on_site", label: "Sur place (Local)", icon: MapPin },
];

export default function OpportunitesPage() {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Modale transformer un besoin en opportunité (Innovation 1 : Opportunity Engine)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [needTitle, setNeedTitle] = useState("");
  const [needDescription, setNeedDescription] = useState("");
  const [needCategory, setNeedCategory] = useState("Gestion & Vente");
  const [needLocationCity, setNeedLocationCity] = useState("Cotonou");
  const [needCountry, setNeedCountry] = useState("Bénin");
  const [needBudget, setNeedBudget] = useState("");
  const [needSkillsInput, setNeedSkillsInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Modale Postuler
  const [applyingOpportunity, setApplyingOpportunity] = useState<OpportunityItem | null>(null);
  const [coverNote, setCoverNote] = useState("");
  const [proposedAmount, setProposedAmount] = useState("");
  const [submittingApp, setSubmittingApp] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const supabase = createClient();
      
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        setCurrentUser(userData.user);
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, full_name, skills, city, country")
          .eq("id", userData.user.id)
          .single();
        if (prof) setUserProfile(prof);
      }

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
    loadData();
  }, []);

  const calculateMatchingSkills = (opp: OpportunityItem) => {
    if (!userProfile?.skills || userProfile.skills.length === 0 || !opp.skills_required) {
      return [];
    }
    const userSkillsLower = userProfile.skills.map((s: string) => s.toLowerCase());
    return opp.skills_required.filter((s: string) =>
      userSkillsLower.some((us: string) => us.includes(s.toLowerCase()) || s.toLowerCase().includes(us))
    );
  };

  const filteredOpportunities = opportunities.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.profiles?.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location_city || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedType === "recommended") {
      const match = calculateMatchingSkills(item);
      const locMatch = userProfile?.city && item.location_city?.toLowerCase() === userProfile.city.toLowerCase();
      return match.length > 0 || locMatch;
    }

    if (selectedType === "all") return true;
    return item.location_mode === selectedType;
  });

  const handleCreateNeed = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();

      if (!authData?.user) {
        alert("Veuillez vous connecter pour publier une opportunité.");
        setCreating(false);
        return;
      }

      const skillsArray = needSkillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const { error } = await supabase.from("job_posts").insert({
        client_id: authData.user.id,
        title: needTitle,
        description: needDescription,
        budget_amount: Number(needBudget) || 0,
        budget_currency: "XOF",
        location_mode: "on_site",
        location_country: needCountry,
        location_city: needLocationCity,
        skills_required: skillsArray,
        status: "published",
      });

      if (error) throw error;

      setCreateSuccess(true);
      setTimeout(() => {
        setCreateSuccess(false);
        setIsCreateModalOpen(false);
        setNeedTitle("");
        setNeedDescription("");
        setNeedBudget("");
        setNeedSkillsInput("");
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      alert("Erreur lors de la publication : " + (err.message || "Veuillez réessayer."));
    } finally {
      setCreating(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingOpportunity) return;
    setSubmittingApp(true);

    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();

      if (!authData?.user) {
        alert("Veuillez vous connecter pour soumettre votre proposition.");
        setSubmittingApp(false);
        return;
      }

      const { error } = await supabase.from("job_applications").insert({
        job_id: applyingOpportunity.id,
        applicant_id: authData.user.id,
        cover_letter: coverNote,
        proposed_rate: Number(proposedAmount) || applyingOpportunity.budget_amount,
        status: "submitted",
      });

      if (error) throw error;

      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
        setApplyingOpportunity(null);
        setCoverNote("");
        setProposedAmount("");
      }, 1600);
    } catch (err: any) {
      alert("Erreur lors de la candidature : " + (err.message || "Veuillez réessayer."));
    } finally {
      setSubmittingApp(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête avec Opportunity Engine */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5 text-brand-600" />
            AfriGain Opportunity Engine • Informations vérifiées
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Moteur d'Opportunités Économiques
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            Transformation continue des besoins des entreprises, commerçants et producteurs en missions professionnelles. Recommandations basées sur vos compétences réelles.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all shrink-0 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Publier un besoin économique
        </button>
      </div>

      {/* Barre d'explication Opportunity Engine si utilisateur connecté */}
      {userProfile && (
        <div className="p-4 bg-gradient-to-r from-brand-50/80 via-white to-emerald-50/80 rounded-2xl border border-brand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              Moteur actif pour votre profil ({userProfile.full_name})
            </span>
            <p className="text-[11px] text-slate-600">
              Vos compétences enregistrées :{" "}
              {userProfile.skills && userProfile.skills.length > 0 ? (
                <strong className="text-brand-900">{userProfile.skills.join(", ")}</strong>
              ) : (
                <span className="italic text-slate-400">Aucune compétence enregistrée (définissez-les dans Paramètres).</span>
              )}{" "}
              • Zone : <strong>{userProfile.city || "Non spécifiée"}</strong>
            </p>
          </div>
          <Link
            href="/dashboard/settings"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 whitespace-nowrap self-start sm:self-auto"
          >
            Mettre à jour mes compétences →
          </Link>
        </div>
      )}

      {/* Barre de Recherche et Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher une opportunité, compétence, entreprise ou ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {TYPE_FILTERS.map((f) => {
            const Icon = f.icon;
            const active = selectedType === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedType(f.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  active
                    ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste des Opportunités */}
      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <span className="text-xs text-slate-400">Chargement des opportunités vérifiées...</span>
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Aucune opportunité dans cette sélection</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Toutes les données de démonstration ont été purgées. Les besoins exprimés par les entreprises et commerçants partenaires apparaîtront ici.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Publier la première opportunité
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOpportunities.map((opp) => {
            const matchingSkills = calculateMatchingSkills(opp);
            const isLocationMatch = userProfile?.city && opp.location_city?.toLowerCase() === userProfile.city.toLowerCase();

            return (
              <div
                key={opp.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Badge de Recommandation Opportunity Engine */}
                  {(matchingSkills.length > 0 || isLocationMatch) && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 font-semibold flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Recommandé par Opportunity Engine :{" "}
                        {matchingSkills.length > 0 && `Compétences compatibles [${matchingSkills.join(", ")}]`}
                        {matchingSkills.length > 0 && isLocationMatch && " • "}
                        {isLocationMatch && `Localisation idéale (${opp.location_city})`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-base leading-snug">{opp.title}</h3>
                      <p className="text-xs text-slate-500">
                        Demandeur : <strong className="text-slate-700">{opp.profiles?.company_name || opp.profiles?.full_name || "Organisme Partenaire"}</strong>
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full shrink-0">
                      {opp.budget_amount > 0 ? formatCurrency(opp.budget_amount, opp.budget_currency) : "Selon proposition"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {opp.description}
                  </p>

                  {opp.skills_required && opp.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {opp.skills_required.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {opp.location_city || opp.location_country || "Afrique"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(opp.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  <button
                    onClick={() => setApplyingOpportunity(opp)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all"
                  >
                    Postuler <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modale Transformer un besoin économique en opportunité */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-brand-600" />
                  Transformer un besoin en opportunité
                </h3>
                <p className="text-[11px] text-slate-500">
                  Permettez aux prestataires et jeunes talents de répondre à votre besoin concret.
                </p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {createSuccess ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">Opportunité publiée avec succès !</h4>
                <p className="text-xs text-emerald-800">
                  Votre besoin est désormais visible et analysé par le moteur de recommandation AfriGain.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateNeed} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Titre de l'opportunité *</label>
                  <input
                    type="text"
                    required
                    value={needTitle}
                    onChange={(e) => setNeedTitle(e.target.value)}
                    placeholder="Ex: Gestion des stocks & saisie inventaire sur Excel"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Description précise du besoin *</label>
                  <textarea
                    rows={4}
                    required
                    value={needDescription}
                    onChange={(e) => setNeedDescription(e.target.value)}
                    placeholder="Détaillez le travail attendu, la durée estimée et les conditions..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Budget prévu (FCFA)</label>
                    <input
                      type="number"
                      value={needBudget}
                      onChange={(e) => setNeedBudget(e.target.value)}
                      placeholder="Ex: 50000"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Ville / Zone *</label>
                    <input
                      type="text"
                      required
                      value={needLocationCity}
                      onChange={(e) => setNeedLocationCity(e.target.value)}
                      placeholder="Ex: Cotonou"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Compétences nécessaires (séparées par des virgules)</label>
                  <input
                    type="text"
                    value={needSkillsInput}
                    onChange={(e) => setNeedSkillsInput(e.target.value)}
                    placeholder="Ex: Maîtrise d'Excel, Gestion des stocks, Rigueur"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">
                    Ces compétences permettront au moteur d'orienter les talents qualifiés vers votre besoin.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Publier l'opportunité
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modale Postuler à l'opportunité */}
      {applyingOpportunity && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Postuler à l'opportunité</h3>
                <p className="text-[11px] text-slate-500 line-clamp-1">{applyingOpportunity.title}</p>
              </div>
              <button onClick={() => setApplyingOpportunity(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {applySuccess ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">Candidature enregistrée avec succès !</h4>
                <p className="text-xs text-emerald-800">
                  Le demandeur a reçu votre proposition. Vous pouvez suivre l'avancement dans votre espace.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Message / Proposition de prestation *</label>
                  <textarea
                    rows={4}
                    required
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Présentez vos compétences pertinentes, vos disponibilités et votre approche pour cette mission..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Rémunération proposée (FCFA)</label>
                  <input
                    type="number"
                    value={proposedAmount}
                    onChange={(e) => setProposedAmount(e.target.value)}
                    placeholder={`Budget indicatif : ${applyingOpportunity.budget_amount || "À convenir"}`}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setApplyingOpportunity(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submittingApp}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    {submittingApp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Confirmer ma candidature
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
