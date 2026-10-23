"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Clock, 
  Filter, 
  Briefcase, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  Send,
  Loader2,
  X
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface Job {
  id: string;
  title: string;
  client: string;
  category: string;
  budget: number;
  currency: string;
  location_mode: string;
  city: string;
  deadline: string;
  description: string;
  skills: string[];
  isDemo?: boolean;
}

export default function MissionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Modale de candidature
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [proposedRate, setProposedRate] = useState<number>(0);
  const [estimatedDays, setEstimatedDays] = useState<number>(7);
  const [coverMessage, setCoverMessage] = useState("");
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appFeedback, setAppFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        
        // Charger catégories réelles
        const { data: catData } = await supabase.from("categories").select("id, name, slug");
        if (catData) setCategories(catData);

        // Charger missions réelles
        const { data: jobData, error: jobErr } = await supabase
          .from("job_posts")
          .select("*, profiles:client_id(full_name, company_name)")
          .eq("status", "published")
          .order("created_at", { ascending: false });

        const realJobs: Job[] = (jobData || []).map((j: any) => ({
          id: j.id,
          title: j.title,
          client: j.profiles?.company_name || j.profiles?.full_name || "Client Entreprise",
          category: j.category_id || "general",
          budget: Number(j.budget_amount),
          currency: j.budget_currency || "XOF",
          location_mode: j.location_mode === "remote" ? "À distance" : j.location_mode === "hybrid" ? "Hybride" : "Sur place",
          city: j.location_city || "Cotonou",
          deadline: j.deadline ? new Date(j.deadline).toLocaleDateString("fr-FR") : "Flexible",
          description: j.description,
          skills: j.skills_required || [],
          isDemo: false,
        }));

        // Missions témoins pilotes si pas encore assez de données dans la base fraîche
        const demoMissions: Job[] = [
          {
            id: "demo-1",
            title: "Développement d'une application de gestion de stock pour boutique locale",
            client: "AgroBénin SARL",
            category: "dev-web-mobile",
            budget: 350000,
            currency: "XOF",
            location_mode: "À distance",
            city: "Cotonou",
            deadline: "Dans 15 jours",
            description: "Nous recherchons un développeur full-stack pour concevoir un outil simple d'inventaire accessible sur tablette et mobile avec alertes de réapprovisionnement.",
            skills: ["React", "Node.js", "PostgreSQL", "Mobile-first"],
            isDemo: true,
          },
          {
            id: "demo-2",
            title: "Création de la charte graphique et du packaging de jus de fruits naturels",
            client: "BioSaveurs Afrique",
            category: "design-graphique",
            budget: 150000,
            currency: "XOF",
            location_mode: "Hybride",
            city: "Calavi",
            deadline: "Dans 10 jours",
            description: "Conception de l'étiquette bouteille 500ml et 1L, logo rafraîchi et déclinaisons pour les réseaux sociaux de notre marque locale.",
            skills: ["Illustrator", "Photoshop", "Packaging", "Identité Visuelle"],
            isDemo: true,
          },
        ];

        setJobs([...realJobs, ...demoMissions]);
      } catch (err) {
        console.error("Erreur de chargement des missions", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const openApplicationModal = (job: Job) => {
    setApplyingJob(job);
    setProposedRate(job.budget);
    setAppFeedback(null);
    setCoverMessage("");
  };

  const handleSendApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;

    setSubmittingApp(true);
    setAppFeedback(null);

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        setAppFeedback({
          type: "error",
          text: "Veuillez vous connecter pour envoyer votre proposition.",
        });
        setSubmittingApp(false);
        return;
      }

      // Si c'est une mission réelle dans Supabase (uuid)
      if (!applyingJob.isDemo) {
        const { error } = await supabase.from("applications").insert({
          job_id: applyingJob.id,
          freelancer_id: userData.user.id,
          proposed_rate: proposedRate,
          currency: applyingJob.currency,
          estimated_days: estimatedDays,
          cover_message: coverMessage,
          status: "submitted",
        });

        if (error) {
          throw error;
        }
      }

      setAppFeedback({
        type: "success",
        text: "Votre candidature a été transmise avec succès au donneur d'ordre !",
      });
      setTimeout(() => {
        setApplyingJob(null);
      }, 1500);
    } catch (err: any) {
      setAppFeedback({
        type: "error",
        text: err.message || "Erreur lors de l'envoi de la candidature.",
      });
    } finally {
      setSubmittingApp(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" ||
      job.category === selectedCategory ||
      categories.some(c => c.slug === selectedCategory && c.id === job.category);

    const matchesLocation =
      selectedLocation === "all" ||
      (selectedLocation === "remote" && job.location_mode === "À distance") ||
      (selectedLocation === "onsite" && job.location_mode !== "À distance");

    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Missions & Opportunités
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Parcourez les besoins exprimés par des entreprises au Bénin et en Afrique de l'Ouest.
          </p>
        </div>
        <Link
          href="/missions/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Publier une mission
        </Link>
      </div>

      {/* Barre de filtres et recherche */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Rechercher par titre, compétence, technologie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="all">Tous les modes</option>
            <option value="remote">À distance uniquement</option>
            <option value="onsite">Sur place / Hybride</option>
          </select>
        </div>
      </div>

      {/* Liste des résultats */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
            <span className="text-xs text-slate-500">Chargement des missions en direct depuis Supabase...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
            <p className="text-slate-600 font-semibold text-sm">
              Aucune mission ne correspond à ces critères.
            </p>
            <Link
              href="/missions/create"
              className="inline-flex items-center gap-1.5 text-xs text-brand-600 font-bold hover:underline"
            >
              Soyez le premier à publier une mission dans cette catégorie →
            </Link>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 hover:border-brand-500 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {job.client}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-medium border border-brand-200">
                    {job.location_mode} {job.city && `• ${job.city}`}
                  </span>
                  {job.isDemo && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                      Exemple pilote
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors">
                  {job.title}
                </h3>

                <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bloc Budget & Action */}
              <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 gap-3">
                <div className="text-left md:text-right">
                  <span className="text-xs text-slate-500 block">Budget indicatif</span>
                  <span className="text-xl font-extrabold text-brand-700">
                    {formatCurrency(job.budget, job.currency)}
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    Échéance : {job.deadline}
                  </span>
                </div>

                <button
                  onClick={() => openApplicationModal(job)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  Postuler / Devis
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modale de Candidature Réelle */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Postuler à la mission</h3>
                <p className="text-xs text-slate-500 truncate max-w-sm">{applyingJob.title}</p>
              </div>
              <button
                onClick={() => setApplyingJob(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {appFeedback && (
              <div
                className={`p-3 rounded-xl flex items-center gap-2 text-xs ${
                  appFeedback.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {appFeedback.type === "success" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <span>{appFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSendApplication} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Votre tarif proposé ({applyingJob.currency})</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={proposedRate}
                    onChange={(e) => setProposedRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Délai estimé (jours)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Message & Argumentaire pour le client</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Présentez votre approche, vos réalisations similaires et votre disponibilité pour cette mission..."
                  value={coverMessage}
                  onChange={(e) => setCoverMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingApp}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  {submittingApp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Envoyer la proposition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
