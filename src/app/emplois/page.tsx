"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  GraduationCap, 
  Sparkles, 
  Filter, 
  CheckCircle2, 
  Send, 
  ArrowRight, 
  UserCheck, 
  TrendingUp,
  Building,
  ShieldCheck,
  X,
  FileCheck,
  AlertCircle
} from "lucide-react";
import { 
  AFRIGAIN_METIERS, 
  AFRIGAIN_REGIONS, 
  CONTRACT_TYPES, 
  WORK_MODES, 
  RECRUITMENT_STATUSES 
} from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface JobOffer {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  metier: string;
  city: string;
  country: string;
  workMode: "remote" | "onsite" | "hybrid";
  contractType: "cdi" | "cdd" | "stage" | "freelance" | "temporaire";
  experienceLevel: "debutant" | "junior" | "intermediaire" | "senior";
  accessibleDebutant: boolean;
  educationLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  skills: string[];
  description: string;
  responsibilities: string[];
  publishedAt: string;
  deadline: string;
  verifiedCompany: boolean;
}

interface ApplicationTrack {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  statusId: "received" | "under_review" | "shortlisted" | "interview" | "accepted" | "declined";
  notes?: string;
}

export default function EmploisPage() {
  const [activeTab, setActiveTab] = useState<"index" | "my-applications">("index");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMetier, setSelectedMetier] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedContract, setSelectedContract] = useState("all");
  const [selectedWorkMode, setSelectedWorkMode] = useState("all");
  const [onlyDebutant, setOnlyDebutant] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Données réelles chargées depuis Supabase (zéro donnée fictive)
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [myApplications, setMyApplications] = useState<ApplicationTrack[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modale de détails et de candidature
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantPitch, setApplicantPitch] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  // Modale de publication d'offre d'emploi
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newMetier, setNewMetier] = useState("informatique");
  const [newCity, setNewCity] = useState("Cotonou");
  const [newCountry, setNewCountry] = useState("Bénin");
  const [newContract, setNewContract] = useState<JobOffer["contractType"]>("cdi");
  const [newWorkMode, setNewWorkMode] = useState<JobOffer["workMode"]>("hybrid");
  const [newSalaryMin, setNewSalaryMin] = useState(200000);
  const [newSalaryMax, setNewSalaryMax] = useState(350000);
  const [newDesc, setNewDesc] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [newAccessible, setNewAccessible] = useState(true);

  useEffect(() => {
    loadRealJobs();
  }, []);

  const loadRealJobs = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    setCurrentUser(authData?.user || null);

    // Charger les offres réelles depuis Supabase
    const { data: dbJobs } = await supabase
      .from("job_posts")
      .select(`
        id, title, description, budget_amount, budget_currency, deadline,
        location_mode, location_country, location_city, skills_required, status, created_at,
        profiles:client_id (full_name, company_name, verification_status)
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (dbJobs) {
      const mapped: JobOffer[] = dbJobs.map((j: any) => ({
        id: j.id,
        title: j.title,
        company: j.profiles?.company_name || j.profiles?.full_name || "Entreprise Vérifiée",
        metier: "informatique",
        city: j.location_city || "Cotonou",
        country: j.location_country || "Bénin",
        workMode: (j.location_mode as any) || "remote",
        contractType: "cdi",
        experienceLevel: "junior",
        accessibleDebutant: true,
        educationLevel: "Selon profil",
        salaryMin: j.budget_amount,
        salaryMax: j.budget_amount,
        currency: j.budget_currency || "XOF",
        skills: j.skills_required || [],
        description: j.description,
        responsibilities: ["Exécution de la mission selon le cahier des charges"],
        publishedAt: new Date(j.created_at).toLocaleDateString("fr-FR"),
        deadline: j.deadline || "À convenir",
        verifiedCompany: j.profiles?.verification_status === "verified",
      }));
      setJobOffers(mapped);
    }

    // Charger les candidatures réelles de l'utilisateur
    if (authData?.user) {
      const { data: dbApps } = await supabase
        .from("applications")
        .select(`
          id, job_id, status, created_at, cover_message,
          job_posts (title, location_city, profiles:client_id (company_name, full_name))
        `)
        .eq("freelancer_id", authData.user.id);

      if (dbApps) {
        const appsMapped: ApplicationTrack[] = dbApps.map((a: any) => ({
          id: a.id,
          jobId: a.job_id,
          jobTitle: a.job_posts?.title || "Offre",
          company: a.job_posts?.profiles?.company_name || a.job_posts?.profiles?.full_name || "Recruteur",
          appliedDate: new Date(a.created_at).toLocaleDateString("fr-FR"),
          statusId: a.status === "accepted" ? "accepted" : a.status === "shortlisted" ? "shortlisted" : "received",
          notes: "Candidature enregistrée dans Supabase.",
        }));
        setMyApplications(appsMapped);
      }
    }
    setIsLoading(false);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("applications").insert({
      job_id: selectedOffer.id,
      freelancer_id: currentUser.id,
      proposed_rate: selectedOffer.salaryMin || 0,
      currency: selectedOffer.currency,
      estimated_days: 30,
      cover_message: applicantPitch || "Candidature soumise.",
      status: "submitted",
    });

    setSubmitting(false);
    if (!error) {
      setApplicationSuccess(true);
      setTimeout(() => {
        setApplicationSuccess(false);
        setSelectedOffer(null);
        loadRealJobs();
        setActiveTab("my-applications");
      }, 1500);
    } else {
      alert("Erreur candidature : " + error.message);
    }
  };

  const handleCreateJobOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }

    const supabase = createClient();
    const skillsArr = newSkills.split(",").map((s) => s.trim()).filter(Boolean);

    const { error } = await supabase.from("job_posts").insert({
      client_id: currentUser.id,
      title: newTitle.trim(),
      description: newDesc.trim(),
      budget_amount: Number(newSalaryMin) || 0,
      budget_currency: "XOF",
      location_mode: newWorkMode,
      location_country: newCountry,
      location_city: newCity,
      skills_required: skillsArr,
      status: "published",
    });

    if (!error) {
      setIsCreateModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewSkills("");
      loadRealJobs();
    } else {
      alert("Erreur lors de la création : " + error.message);
    }
  };

  const filteredOffers = jobOffers.filter((offer) => {
    const matchesSearch =
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = selectedCity === "all" || offer.city === selectedCity;
    const matchesContract = selectedContract === "all" || offer.contractType === selectedContract;
    const matchesWorkMode = selectedWorkMode === "all" || offer.workMode === selectedWorkMode;
    const matchesDebutant = !onlyDebutant || offer.accessibleDebutant;

    return matchesSearch && matchesCity && matchesContract && matchesWorkMode && matchesDebutant;
  });

  const totalOffersCount = jobOffers.length;
  const debutantOffersCount = jobOffers.filter((o) => o.accessibleDebutant).length;
  const topRegions = Array.from(new Set(jobOffers.map((o) => `${o.city} (${o.country})`))).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            Module Emploi Officiel • Données Vérifiées Supabase
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Emplois & Postes Ouverts
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Offres réelles publiées par les entreprises et recruteurs partenaires sur AfriGain.
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) window.location.href = "/auth/login";
            else setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
        >
          <Building className="w-4 h-4" />
          Publier une offre d'emploi
        </button>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Offres Disponibles
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
            {totalOffersCount}
            <span className="text-xs font-normal text-emerald-600">Postes réels</span>
          </div>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            Accès Débutants
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1 flex items-baseline gap-2">
            {debutantOffersCount}
            <span className="text-xs font-normal text-emerald-600">Sans barrière</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Régions Actives
          </span>
          <div className="text-sm font-bold text-slate-800 mt-1 truncate">
            {topRegions.length > 0 ? topRegions.join(" • ") : "Bénin & UEMOA"}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Transparence
          </span>
          <div className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            Données réelles sans faux profils
          </div>
        </div>
      </div>

      {/* Onglets navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("index")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "index"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Index des Postes Ouverts ({filteredOffers.length})
        </button>
        <button
          onClick={() => setActiveTab("my-applications")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "my-applications"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Mes Candidatures ({myApplications.length})
        </button>
      </div>

      {/* Vue Index */}
      {activeTab === "index" && (
        <div className="space-y-6">
          {/* Recherche */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Rechercher une offre par métier, mot-clé ou entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
            />
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Chargement des offres d'emploi réelles depuis Supabase...
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Briefcase className="w-10 h-10 text-brand-500 mx-auto" />
              <h4 className="font-bold text-slate-900 text-base">Aucune offre d'emploi enregistrée pour le moment</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Toutes les offres fictives de démonstration ont été retirées. Les nouvelles annonces publiées par les entreprises réelles apparaîtront ici.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Publier la première offre d'emploi
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-brand-500/60 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200 uppercase">
                        {offer.workMode}
                      </span>
                      {offer.salaryMin && (
                        <span className="text-xs font-black text-slate-900">
                          {offer.salaryMin.toLocaleString("fr-FR")} {offer.currency}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{offer.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">{offer.company}</p>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{offer.description}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {offer.city}, {offer.country}
                    </span>

                    <button
                      onClick={() => setSelectedOffer(offer)}
                      className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      Postuler
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vue Mes Candidatures */}
      {activeTab === "my-applications" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base">Suivi de vos Candidatures</h3>
          {myApplications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Vous n'avez pas encore postulé à une offre d'emploi.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myApplications.map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{app.jobTitle}</h4>
                    <span className="text-slate-500">{app.company} • Postulé le {app.appliedDate}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg font-bold text-[10px] border border-emerald-200">
                    Statut : {app.statusId}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Postuler */}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Candidature à l'emploi</span>
                <h3 className="font-bold text-slate-900 text-base">{selectedOffer.title}</h3>
              </div>
              <button onClick={() => setSelectedOffer(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {applicationSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-base">Candidature enregistrée !</h4>
                <p className="text-xs text-slate-500">Votre profil a été transmis au recruteur avec succès.</p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Message d'accroche / Motivation *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Présentez vos compétences et pourquoi vous correspondez au poste..."
                    value={applicantPitch}
                    onChange={(e) => setApplicantPitch(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOffer(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl disabled:opacity-50"
                  >
                    {submitting ? "Envoi..." : "Confirmer ma candidature"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Créer Offre */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Publier une offre d'emploi réelle</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJobOffer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Intitulé du poste *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Responsable des Ventes & Relation Client"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ville *</label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Salaire / Budget (FCFA)</label>
                  <input
                    type="number"
                    value={newSalaryMin}
                    onChange={(e) => setNewSalaryMin(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description du poste *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Missions, responsabilités et profil recherché..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compétences requises (séparées par des virgules)</label>
                <input
                  type="text"
                  placeholder="Ex: Vente, Prospection, Gestion de stock"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl"
                >
                  Publier l'offre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
