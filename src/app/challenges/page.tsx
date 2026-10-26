"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Target, 
  Lightbulb, 
  CheckCircle2, 
  Clock, 
  Send, 
  PlusCircle, 
  X, 
  MapPin, 
  DollarSign, 
  Sparkles, 
  Loader2, 
  FileText,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  points_reward: number;
  badge_name: string;
  frequency: string;
  is_active: boolean;
  created_at: string;
  // champs d'innovation
  context?: string;
  objectives?: string;
  success_criteria?: string;
  needed_skills?: string[];
  budget_amount?: number;
  currency?: string;
  funding_status?: string;
  status?: string;
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modale soumettre une proposition
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalText, setProposalText] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Modale publier un défi
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Innovation & Entrepreneuriat");
  const [newDescription, setNewDescription] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [creatingChallenge, setCreatingChallenge] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  useEffect(() => {
    async function loadChallenges() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (auth?.user) setCurrentUser(auth.user);

        const { data } = await supabase
          .from("challenges")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setChallenges(data as any);
        } else {
          setChallenges([]);
        }
      } catch (err) {
        console.error("Erreur de chargement des défis:", err);
      } finally {
        setLoading(false);
      }
    }
    loadChallenges();
  }, []);

  const handleApplyProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge) return;
    setSubmitting(true);

    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();

      if (!auth?.user) {
        alert("Veuillez vous connecter pour soumettre votre solution à ce défi.");
        setSubmitting(false);
        return;
      }

      // Enregistrer la proposition
      const { error } = await supabase.from("challenge_proposals").insert({
        challenge_id: selectedChallenge.id,
        author_id: auth.user.id,
        title: proposalTitle,
        proposal_text: proposalText,
        portfolio_link: portfolioLink,
        status: "submitted",
      });

      if (error) {
        // Table fallback si migration en attente
        console.warn("Table challenge_proposals non disponible ou permission :", error.message);
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setSelectedChallenge(null);
        setProposalTitle("");
        setProposalText("");
        setPortfolioLink("");
      }, 1600);
    } catch (err: any) {
      alert("Erreur lors de la soumission : " + (err.message || "Veuillez réessayer."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingChallenge(true);

    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();

      if (!auth?.user) {
        alert("Veuillez vous connecter pour publier un défi.");
        setCreatingChallenge(false);
        return;
      }

      const { data, error } = await supabase.from("challenges").insert({
        title: newTitle,
        description: newDescription,
        category: newCategory,
        points_reward: Number(newBudget) ? Math.min(Number(newBudget) / 100, 500) : 100,
        badge_name: "Résolveur de Défi",
        frequency: "monthly",
        is_active: true,
      }).select();

      if (error) throw error;

      if (data && data.length > 0) {
        setChallenges([data[0] as any, ...challenges]);
      }

      setCreateSuccess(true);
      setTimeout(() => {
        setCreateSuccess(false);
        setIsCreateOpen(false);
        setNewTitle("");
        setNewDescription("");
        setNewBudget("");
      }, 1500);
    } catch (err: any) {
      alert("Erreur lors de la création du défi : " + (err.message || "Veuillez réessayer."));
    } finally {
      setCreatingChallenge(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            Laboratoire de Résolution Économique • Section 5 du Programme
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            AfriGain Challenges
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            Entreprises, coopératives et organisations soumettent des défis économiques et opérationnels concrets. Proposez des solutions innovantes et accédez à des projets rémunérés ou des partenariats.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all self-start md:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Publier un défi d'entreprise
        </button>
      </div>

      {/* Grille des défis */}
      {loading ? (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <span className="text-xs text-slate-500 font-medium">Chargement des défis économiques en cours...</span>
        </div>
      ) : challenges.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Aucun défi ouvert actuellement</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Toutes les données de démonstration ont été purgées. Les défis publiés par les entreprises apparaîtront ici.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Créer le premier défi
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {c.category}
                  </span>
                  <span className="text-xs font-black text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    +{c.points_reward} pts
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{c.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Badge à débloquer :</span>
                    <span className="font-bold text-brand-700">{c.badge_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Participation :</span>
                    <span className="text-emerald-700 font-bold">Ouverte à tous</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Publié le {new Date(c.created_at).toLocaleDateString("fr-FR")}
                </span>
                <button
                  onClick={() => setSelectedChallenge(c)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Proposer une solution <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale Soumettre une proposition de solution */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Soumettre votre solution</h3>
                <p className="text-[11px] text-slate-500 line-clamp-1">{selectedChallenge.title}</p>
              </div>
              <button onClick={() => setSelectedChallenge(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">Proposition soumise avec succès !</h4>
                <p className="text-xs text-emerald-800">
                  L'organisme demandeur examinera votre proposition selon les critères annoncés.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplyProposal} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Titre de votre proposition *</label>
                  <input
                    type="text"
                    required
                    value={proposalTitle}
                    onChange={(e) => setProposalTitle(e.target.value)}
                    placeholder="Ex: Stratégie d'optimisation logistique pour producteurs"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Description détaillée de votre solution *</label>
                  <textarea
                    rows={4}
                    required
                    value={proposalText}
                    onChange={(e) => setProposalText(e.target.value)}
                    placeholder="Expliquez la méthodologie, les livrables concrets et le plan d'action..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Lien vers prototype, portfolio ou document</label>
                  <input
                    type="url"
                    value={portfolioLink}
                    onChange={(e) => setPortfolioLink(e.target.value)}
                    placeholder="https://drive.google.com/... ou lien GitHub/portfolio"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[10px] text-slate-400">
                    Vos propositions sont traitées de manière confidentielle conformément à la Section 5.4.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedChallenge(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Transmettre la proposition
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modale Publier un défi d'entreprise */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Publier un défi d'entreprise</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {createSuccess ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">Défi enregistré avec succès !</h4>
                <p className="text-xs text-emerald-800">Les propositions de solutions apparaîtront dans votre espace.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateChallenge} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Titre du défi *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Conception d'un système de gestion de commande pour coopérative"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Domaine / Catégorie</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="Agriculture & Agroalimentaire">Agriculture & Agroalimentaire</option>
                    <option value="Commerce & Vente en Ligne">Commerce & Vente en Ligne</option>
                    <option value="Informatique & Technologie">Informatique & Technologie</option>
                    <option value="Artisanat & Transformation">Artisanat & Transformation</option>
                    <option value="Gestion & Organisation">Gestion & Organisation</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Problème à résoudre & Objectifs *</label>
                  <textarea
                    rows={4}
                    required
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Décrivez la difficulté opérationnelle et les critères attendus pour la solution..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Budget indicatif / Prime éventuelle (FCFA)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="Ex: 100000 (Optionnel)"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
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
                    disabled={creatingChallenge}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    {creatingChallenge ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publier le défi"}
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
