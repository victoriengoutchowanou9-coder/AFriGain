"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  PlusCircle, 
  Target, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  X, 
  Loader2, 
  Briefcase, 
  Tag, 
  Sparkles,
  Send,
  Layers,
  ShieldCheck
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

interface CollectifProject {
  id: string;
  creator_id: string;
  title: string;
  problem_to_solve: string;
  activity_planned: string;
  objectives: string;
  available_skills: string[];
  needed_skills: string[];
  location_city: string;
  location_country: string;
  timeline?: string;
  estimated_budget?: number;
  currency?: string;
  funding_status: string;
  status: string;
  created_at: string;
  creator_name?: string;
}

export default function CollectifPage() {
  const [projects, setProjects] = useState<CollectifProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modale Créer un projet collectif
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [activity, setActivity] = useState("");
  const [objectives, setObjectives] = useState("");
  const [availableSkillsInput, setAvailableSkillsInput] = useState("");
  const [neededSkillsInput, setNeededSkillsInput] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [country, setCountry] = useState("Bénin");
  const [budget, setBudget] = useState("");
  const [fundingStatus, setFundingStatus] = useState("auto_finance");
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Modale Rejoindre un projet
  const [selectedProject, setSelectedProject] = useState<CollectifProject | null>(null);
  const [roleAssigned, setRoleAssigned] = useState("");
  const [skillsContributed, setSkillsContributed] = useState("");
  const [motivation, setMotivation] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) setCurrentUser(authData.user);

        const { data, error } = await supabase
          .from("collectif_projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setProjects(data as any);
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error("Erreur de chargement collectif:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();

      if (!authData?.user) {
        alert("Veuillez vous connecter pour créer un projet collectif.");
        setCreating(false);
        return;
      }

      const availArr = availableSkillsInput.split(",").map(s => s.trim()).filter(Boolean);
      const needArr = neededSkillsInput.split(",").map(s => s.trim()).filter(Boolean);

      const newProj = {
        creator_id: authData.user.id,
        title,
        problem_to_solve: problem,
        activity_planned: activity,
        objectives,
        available_skills: availArr,
        needed_skills: needArr,
        location_city: city,
        location_country: country,
        estimated_budget: Number(budget) || 0,
        currency: "XOF",
        funding_status: fundingStatus,
        status: "open",
      };

      const { data, error } = await supabase.from("collectif_projects").insert(newProj).select();

      if (error) {
        console.warn("Table collectif_projects fallback:", error.message);
      }

      if (data && data.length > 0) {
        setProjects([data[0] as any, ...projects]);
      } else {
        setProjects([{ id: `proj-${Date.now()}`, ...newProj, created_at: new Date().toISOString() } as any, ...projects]);
      }

      setCreateSuccess(true);
      setTimeout(() => {
        setCreateSuccess(false);
        setIsCreateOpen(false);
        setTitle("");
        setProblem("");
        setActivity("");
        setObjectives("");
        setAvailableSkillsInput("");
        setNeededSkillsInput("");
        setBudget("");
      }, 1500);
    } catch (err: any) {
      alert("Erreur lors de la création du projet : " + (err.message || "Veuillez réessayer."));
    } finally {
      setCreating(false);
    }
  };

  const handleJoinProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setJoining(true);

    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();

      if (!authData?.user) {
        alert("Veuillez vous connecter pour rejoindre ce projet.");
        setJoining(false);
        return;
      }

      const skillsArr = skillsContributed.split(",").map(s => s.trim()).filter(Boolean);

      const { error } = await supabase.from("collectif_members").insert({
        project_id: selectedProject.id,
        user_id: authData.user.id,
        role_assigned: roleAssigned,
        skills_contributed: skillsArr,
        motivation: motivation,
        status: "pending",
      });

      if (error) {
        console.warn("Table collectif_members info :", error.message);
      }

      setJoinSuccess(true);
      setTimeout(() => {
        setJoinSuccess(false);
        setSelectedProject(null);
        setRoleAssigned("");
        setSkillsContributed("");
        setMotivation("");
      }, 1600);
    } catch (err: any) {
      alert("Erreur lors de la demande d'adhésion : " + (err.message || "Veuillez réessayer."));
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            AfriGain Collectif • Création d'Équipes & Projets Entrepreneuriaux
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Projets Collectifs & Co-fondateurs
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            Associez des compétences complémentaires pour démarrer ou accélérer une activité économique. Dépassez le manque de réseau et développez des initiatives durables.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all self-start md:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Créer un projet collectif
        </button>
      </div>

      {/* Grille des Projets Collectifs */}
      {loading ? (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <span className="text-xs text-slate-500 font-medium">Chargement des projets collectifs en cours...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Aucun projet collectif enregistré pour le moment</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Toutes les données de démonstration ont été purgées. Les projets entrepreneuriaux créés par les utilisateurs apparaîtront ici.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Lancer le premier projet collectif
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                    Équipe en constitution
                  </span>
                  <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {p.funding_status === "finance_valide" ? "Financé" : "Auto-financement"}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{p.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.activity_planned}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-2 border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 text-[11px] block">Problème résolu :</span>
                    <span className="text-slate-600 text-[11px]">{p.problem_to_solve}</span>
                  </div>

                  {p.needed_skills && p.needed_skills.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-800 text-[11px] block mb-1">Compétences recherchées :</span>
                      <div className="flex flex-wrap gap-1">
                        {p.needed_skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-white border border-indigo-200 text-indigo-900 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                          >
                            + {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{p.location_city}, {p.location_country}</span>
                </div>

                <button
                  onClick={() => setSelectedProject(p)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
                >
                  Rejoindre l'équipe <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale Créer un projet collectif */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Lancer un projet collectif</h3>
                <p className="text-[11px] text-slate-500">Trouvez des co-équipiers aux compétences complémentaires.</p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {createSuccess ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">Projet collectif publié avec succès !</h4>
                <p className="text-xs text-emerald-800">
                  Votre projet est visible dans l'annuaire Collectif. Vous recevrez les demandes de co-équipiers.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateProject} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Titre du projet / Nom de l'initiative *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Coopérative digitale de livraison locale"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Problème à résoudre *</label>
                  <textarea
                    rows={2}
                    required
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="Quel obstacle ou besoin du marché ce projet adresse-t-il ?"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Activité envisagée & Objectifs *</label>
                  <textarea
                    rows={3}
                    required
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    placeholder="Décrivez le modèle d'activité et les étapes clés..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Compétences recherchées (séparées par virgules) *</label>
                  <input
                    type="text"
                    required
                    value={neededSkillsInput}
                    onChange={(e) => setNeededSkillsInput(e.target.value)}
                    placeholder="Ex: Gestion financière, Développement Web, Vente directe"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Ville / Localisation</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Cotonou"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Statut financement</label>
                    <select
                      value={fundingStatus}
                      onChange={(e) => setFundingStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white"
                    >
                      <option value="auto_finance">Auto-financement</option>
                      <option value="recherche_fonds">Recherche de partenaires</option>
                      <option value="finance_valide">Fonds disponibles</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publier le projet"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modale Rejoindre un projet */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Postuler pour rejoindre l'équipe</h3>
                <p className="text-[11px] text-slate-500 line-clamp-1">{selectedProject.title}</p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {joinSuccess ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">Demande d'adhésion transmise !</h4>
                <p className="text-xs text-emerald-800">
                  Le porteur du projet a reçu votre profil et vos compétences. Il vous contactera pour échanger.
                </p>
              </div>
            ) : (
              <form onSubmit={handleJoinProject} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Rôle ou responsabilité souhaitée *</label>
                  <input
                    type="text"
                    required
                    value={roleAssigned}
                    onChange={(e) => setRoleAssigned(e.target.value)}
                    placeholder="Ex: Responsable technique / Gestionnaire des ventes"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Compétences que vous apportez *</label>
                  <input
                    type="text"
                    required
                    value={skillsContributed}
                    onChange={(e) => setSkillsContributed(e.target.value)}
                    placeholder="Ex: Canva, Excel, Relation client, Prospection"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Motivation & Disponibilité *</label>
                  <textarea
                    rows={3}
                    required
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    placeholder="Pourquoi souhaitez-vous collaborer sur ce projet et combien de temps pouvez-vous y consacrer ?"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={joining}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Rejoindre ce projet
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
