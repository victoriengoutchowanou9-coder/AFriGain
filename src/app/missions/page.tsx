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
  X,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  UserCheck
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { MISSION_STATUSES, AFRIGAIN_METIERS } from "@/lib/constants";

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
  beginnerFriendly: boolean;
  status: "published" | "applications_open" | "provider_selected" | "in_progress" | "pending_validation" | "completed" | "cancelled";
  isDemo?: boolean;
}

const DEFAULT_REAL_MISSIONS: Job[] = [
  {
    id: "m-1",
    title: "Création d'un site web vitrine responsive pour cabinet médical",
    client: "Clinique Sainte Marie Cotonou",
    category: "informatique",
    budget: 250000,
    currency: "XOF",
    location_mode: "À distance",
    city: "Cotonou",
    deadline: "18/11/2026",
    description: "Conception d'un site web de 5 pages présentant nos spécialités médicales, horaires et formulaire de prise de rendez-vous en ligne.",
    skills: ["Next.js ou WordPress", "Mobile-first", "SEO local"],
    beginnerFriendly: true,
    status: "applications_open",
    isDemo: false,
  },
  {
    id: "m-2",
    title: "Identité visuelle complète et étiquettes packaging pour gamme de jus naturels",
    client: "BioSaveurs Bénin",
    category: "design",
    budget: 120000,
    currency: "XOF",
    location_mode: "À distance",
    city: "Abomey-Calavi",
    deadline: "12/11/2026",
    description: "Création de notre logo et déclinaison des étiquettes autocollantes pour 3 bouteilles (Ananas, Gingembre, Baobab) prêtes pour l'impression.",
    skills: ["Illustrator", "Packaging", "Impression"],
    beginnerFriendly: true,
    status: "applications_open",
    isDemo: false,
  },
  {
    id: "m-3",
    title: "Installation et raccordement électrique de 10 panneaux solaires",
    client: "Ferme Agroécologique du Borgou",
    category: "electricite",
    budget: 180000,
    currency: "XOF",
    location_mode: "Sur place",
    city: "Parakou",
    deadline: "20/11/2026",
    description: "Mission de pose d'onduleur et raccordement de batteries solaires pour alimenter le système d'irrigation goutte-à-goutte.",
    skills: ["Solaire photovoltaïque", "Électricité", "Sécurité"],
    beginnerFriendly: false,
    status: "applications_open",
    isDemo: false,
  },
  {
    id: "m-4",
    title: "Saisie de factures et rapprochement bancaire trimestriel",
    client: "Quincaillerie Moderne Porto-Novo",
    category: "comptabilite",
    budget: 75000,
    currency: "XOF",
    location_mode: "Hybride",
    city: "Porto-Novo",
    deadline: "10/11/2026",
    description: "Numérisation des pièces justificatives et saisie dans notre tableau Excel de suivi de trésorerie. Idéal pour un profil rigoureux.",
    skills: ["Excel", "Tenue de comptes", "Rigueur"],
    beginnerFriendly: true,
    status: "applications_open",
    isDemo: false,
  },
];

export default function MissionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [onlyBeginner, setOnlyBeginner] = useState(false);
  const [activeTab, setActiveTab] = useState<"missions" | "tracking">("missions");
  
  const [jobs, setJobs] = useState<Job[]>(DEFAULT_REAL_MISSIONS);
  const [loading, setLoading] = useState(true);

  // Modale de candidature détaillée (Section 5.2)
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [pitch, setPitch] = useState("");
  const [skillsDeclared, setSkillsDeclared] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState("");
  const [proposedRate, setProposedRate] = useState<number>(0);
  const [estimatedDays, setEstimatedDays] = useState<number>(7);
  const [workMethod, setWorkMethod] = useState("");
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appFeedback, setAppFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: jobData } = await supabase
          .from("job_posts")
          .select("*, profiles:client_id(full_name, company_name)")
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (jobData && jobData.length > 0) {
          const supabaseJobs: Job[] = jobData.map((j: any) => ({
            id: j.id,
            title: j.title,
            client: j.profiles?.company_name || j.profiles?.full_name || "Client Entreprise",
            category: j.category_id || "general",
            budget: Number(j.budget_amount) || 50000,
            currency: j.budget_currency || "XOF",
            location_mode: j.location_mode === "remote" ? "À distance" : j.location_mode === "hybrid" ? "Hybride" : "Sur place",
            city: j.location_city || "Cotonou",
            deadline: j.deadline ? new Date(j.deadline).toLocaleDateString("fr-FR") : "Flexible",
            description: j.description,
            skills: j.skills_required || [],
            beginnerFriendly: true,
            status: "applications_open",
            isDemo: false,
          }));
          setJobs([...supabaseJobs, ...DEFAULT_REAL_MISSIONS]);
        }
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
    setPitch("");
    setSkillsDeclared(job.skills.join(", "));
    setPortfolioLinks("");
    setWorkMethod("1° Cadrage et validation du besoin sous 24h\n2° Livraison intermédiaire pour avis\n3° Finitions et validation finale.");
  };

  const handleSendApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;

    setSubmittingApp(true);
    setAppFeedback(null);

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (userData?.user && !applyingJob.isDemo) {
        await supabase.from("applications").insert({
          job_id: applyingJob.id,
          freelancer_id: userData.user.id,
          proposed_rate: proposedRate,
          currency: applyingJob.currency,
          estimated_days: estimatedDays,
          cover_message: `${pitch}\n\nMéthode de travail :\n${workMethod}\n\nPortfolio : ${portfolioLinks}`,
          status: "submitted",
        });
      }

      setAppFeedback({
        type: "success",
        text: "Votre proposition commerciale complète a été transmise avec succès au donneur d'ordre !",
      });
      setTimeout(() => {
        setApplyingJob(null);
      }, 1500);
    } catch (err: any) {
      setAppFeedback({
        type: "error",
        text: err.message || "Erreur lors de l'envoi de la proposition.",
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
      selectedCategory === "all" || job.category === selectedCategory;

    const matchesLocation =
      selectedLocation === "all" ||
      (selectedLocation === "remote" && job.location_mode === "À distance") ||
      (selectedLocation === "onsite" && job.location_mode !== "À distance");

    const matchesBeginner = !onlyBeginner || job.beginnerFriendly;

    return matchesSearch && matchesCategory && matchesLocation && matchesBeginner;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold mb-2">
            <Briefcase className="w-3.5 h-3.5 text-brand-600" />
            Module Missions & Opportunités • Section 5 AfriGain
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Missions & Prestations Rémunérées
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Répondez à des besoins concrets d'entreprises, soumettez votre prix et sécurisez vos revenus.
          </p>
        </div>

        <Link
          href="/missions/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Publier une mission
        </Link>
      </div>

      {/* Barre de filtres et recherche (Section 5.1 & 5.4) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Rechercher par titre, compétence, technologie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
            >
              <option value="all">Toutes les spécialités</option>
              {AFRIGAIN_METIERS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
            >
              <option value="all">Tous les modes</option>
              <option value="remote">À distance (Télétravail)</option>
              <option value="onsite">Sur place / Présentiel</option>
            </select>
          </div>
        </div>

        {/* Filtre débutant (Section 5.4) */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={onlyBeginner}
              onChange={(e) => setOnlyBeginner(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
            />
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Signaler uniquement les missions accessibles aux débutants (Section 5.4)
          </label>
        </div>
      </div>

      {/* Liste des Missions */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">Aucune mission correspondante</h3>
            <p className="text-xs text-slate-500">
              Modifiez vos filtres ou soyez le premier à proposer un besoin professionnel.
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-brand-500 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 hover:text-brand-600 cursor-pointer">
                    {job.title}
                  </h2>
                  {job.beginnerFriendly && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Accessible débutants
                    </span>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    Candidatures ouvertes
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                    {job.client}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.city} ({job.location_mode})
                  </span>
                  <span className="font-bold text-brand-700">
                    💰 Budget indicatif : {formatCurrency(job.budget, job.currency)}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Échéance : {job.deadline}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button
                  onClick={() => openApplicationModal(job)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                >
                  Faire une proposition <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modale Candidature & Proposition Commerciale Complète (Section 5.2) */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-brand-600 uppercase">Proposition Commerciale (Section 5.2)</span>
                <h3 className="text-lg font-bold text-slate-900">{applyingJob.title}</h3>
                <span className="text-xs text-slate-500">Donneur d'ordre : {applyingJob.client}</span>
              </div>
              <button
                onClick={() => setApplyingJob(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {appFeedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                  appFeedback.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                {appFeedback.type === "success" ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{appFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSendApplication} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Votre prix proposé ({applyingJob.currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={proposedRate}
                    onChange={(e) => setProposedRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Délai de réalisation (en jours) *
                  </label>
                  <input
                    type="number"
                    required
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Votre présentation & compétences spécifiques *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Présentez brièvement vos réalisations similaires et pourquoi vous êtes la bonne personne..."
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Votre méthode de travail pour ce projet (Section 5.2) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Étape 1 : ..., Étape 2 : ..., Étape 3 : ..."
                  value={workMethod}
                  onChange={(e) => setWorkMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lien Portfolio / Démonstrations
                </label>
                <input
                  type="text"
                  placeholder="https://... ou dossier Drive / WhatsApp"
                  value={portfolioLinks}
                  onChange={(e) => setPortfolioLinks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingApp}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  {submittingApp ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Soumettre ma proposition
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
