"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Check, 
  Star, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Search, 
  MapPin, 
  Tag, 
  PlusCircle, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  Mail, 
  Image as ImageIcon,
  Sparkles,
  UserCheck,
  Send,
  Loader2,
  Filter,
  Briefcase,
  HelpCircle,
  LogIn
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AFRIGAIN_METIERS, ALL_COUNTRIES, SUPPORTED_CURRENCIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

interface TalentProfile {
  id: string;
  name: string;
  metier: string;
  metierLabel: string;
  headline: string;
  city: string;
  country: string;
  languages: string[];
  availability: "immediate" | "part_time" | "busy";
  rating: number;
  completedMissions: number;
  verified: boolean;
  startingPrice: number | null; // null => "Sur devis"
  currency: string;
  pricingUnit?: string;
  bio: string;
  skills: string[];
  references: string;
  phone?: string;
  email?: string;
  realisations: {
    title: string;
    description: string;
    category?: string;
  }[];
}

export default function ServicesPage() {
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMetier, setSelectedMetier] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [onlyVerified, setOnlyVerified] = useState(false);

  // Authentification
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modale Contact / Demande de Devis Direct
  const [contactTalent, setContactTalent] = useState<TalentProfile | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientNeed, setClientNeed] = useState("");
  const [clientBudget, setClientBudget] = useState("");
  const [clientDeadline, setClientDeadline] = useState("Sous 1 à 2 semaines");
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [quoteSuccessNumber, setQuoteSuccessNumber] = useState<string | null>(null);

  // Modale Signalement Anti-Fraude
  const [reportTalent, setReportTalent] = useState<TalentProfile | null>(null);
  const [reportReason, setReportReason] = useState("Fausse information sur les réalisations");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Modale Création de Vitrine
  const [isNewTalentModalOpen, setIsNewTalentModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newMetier, setNewMetier] = useState("comptabilite");
  const [newHeadline, setNewHeadline] = useState("");
  const [newCountry, setNewCountry] = useState("Bénin");
  const [newCity, setNewCity] = useState("Cotonou");
  const [newBio, setNewBio] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [pricingType, setPricingType] = useState<"quote" | "fixed">("quote");
  const [newPrice, setNewPrice] = useState<number | "">("");
  const [newCurrency, setNewCurrency] = useState("XOF");
  const [newPricingUnit, setNewPricingUnit] = useState("Par prestation");
  const [newPhone, setNewPhone] = useState("");
  const [newRealTitle, setNewRealTitle] = useState("");
  const [newRealDesc, setNewRealDesc] = useState("");
  const [isSubmittingTalent, setIsSubmittingTalent] = useState(false);
  const [talentSuccessMsg, setTalentSuccessMsg] = useState<string | null>(null);

  const fetchTalents = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Check current user
      const { data: authData } = await supabase.auth.getUser();
      setCurrentUser(authData?.user || null);
      if (authData?.user) {
        setClientName(authData.user.user_metadata?.full_name || "");
        setClientEmail(authData.user.email || "");
      }

      // 1. Fetch active profiles with role = 'entrepreneur'
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, full_name, company_name, category, headline, bio, city, country, average_rating, completed_missions_count, verification_status, currency, skills, phone, email, is_active")
        .eq("role", "entrepreneur")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      // 2. Fetch active service listings
      const { data: listings } = await supabase
        .from("service_listings")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (pErr) {
        console.error("Erreur de chargement des profils:", pErr);
      }

      const listingsMap = new Map<string, any[]>();
      if (listings) {
        for (const l of listings) {
          const list = listingsMap.get(l.user_id) || [];
          list.push(l);
          listingsMap.set(l.user_id, list);
        }
      }

      const cleanTalents: TalentProfile[] = [];

      if (profiles && profiles.length > 0) {
        for (const p of profiles) {
          // EXCLUSION STRICTE DES PROFILS DE TEST ET DEMO
          const nameLower = (p.full_name || "").toLowerCase();
          const emailLower = (p.email || "").toLowerCase();
          if (
            nameLower.includes("test") ||
            nameLower.includes("testeur") ||
            nameLower.includes("demo") ||
            nameLower.includes("fictif") ||
            emailLower.includes("example.com") ||
            emailLower.includes("testuser") ||
            emailLower.includes("testeur")
          ) {
            continue; // Ignorer systématiquement les profils de test
          }

          const userListings = listingsMap.get(p.id) || [];
          const primaryListing = userListings[0];

          // Profil visible uniquement s'il dispose d'une vitrine ou d'une description réelle
          const hasContent = Boolean(
            primaryListing ||
            (p.headline && p.headline.trim().length > 3) ||
            (p.bio && p.bio.trim().length > 3)
          );

          if (!hasContent) {
            continue; // Pas de profil fantôme sans offre ni bio
          }

          // Détermination du tarif réel (JAMAIS 10.000 FCFA imposé de force !)
          let startingPrice: number | null = null;
          let pricingUnit = "Par prestation";
          let currency = p.currency || "XOF";

          if (primaryListing) {
            if (Number(primaryListing.price_amount) > 0) {
              startingPrice = Number(primaryListing.price_amount);
            }
            currency = primaryListing.price_currency || currency;
            if (Array.isArray(primaryListing.deliverables)) {
              const unitTag = primaryListing.deliverables.find((d: string) => d.startsWith("Unité: "));
              if (unitTag) {
                pricingUnit = unitTag.replace("Unité: ", "");
              }
            }
          }

          // Réalisations réelles
          const realisations: TalentProfile["realisations"] = [];
          if (userListings.length > 0) {
            for (const l of userListings) {
              if (Array.isArray(l.deliverables)) {
                for (const d of l.deliverables) {
                  if (typeof d === "string" && d.startsWith("Réalisation: ")) {
                    const content = d.replace("Réalisation: ", "");
                    const [rt, rd] = content.split(" - ");
                    realisations.push({
                      title: rt || l.title,
                      description: rd || l.description,
                      category: l.title,
                    });
                  }
                }
              }
            }
          }

          // Métier et intitulé
          const metierKey = p.category || "autres";
          const metierObj = AFRIGAIN_METIERS.find(
            (m) => m.id === metierKey || m.slug === metierKey || m.name.toLowerCase() === metierKey.toLowerCase()
          );

          cleanTalents.push({
            id: p.id,
            name: p.full_name || p.company_name || "Professionnel AfriGain",
            metier: metierKey,
            metierLabel: metierObj ? metierObj.name : (p.headline || "Prestation de services"),
            headline: p.headline || (primaryListing?.title) || "Prestataire indépendant vérifié",
            city: p.city || "Cotonou",
            country: p.country || "Bénin",
            languages: ["Français"],
            availability: "immediate",
            // RÈGLE STRICTE : note réelle uniquement. 0 si aucun avis (pas de 5.0 forcé !)
            rating: Number(p.average_rating) || 0,
            completedMissions: Number(p.completed_missions_count) || 0,
            verified: p.verification_status === "verified",
            startingPrice: startingPrice,
            currency: currency,
            pricingUnit: pricingUnit,
            bio: p.bio || primaryListing?.description || "Prestations de qualité réalisées selon devis et engagement mutuel.",
            skills: Array.isArray(p.skills) ? p.skills : [],
            references: "Inscrit sur AfriGain",
            phone: p.phone || undefined,
            email: p.email || undefined,
            realisations: realisations,
          });
        }
      }

      setTalents(cleanTalents);
    } catch (err) {
      console.error("Erreur lors de la récupération des talents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalents();
  }, []);

  // Filtrage dynamique
  const filteredTalents = talents.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.metierLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.country.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMetier = selectedMetier === "all" || t.metier === selectedMetier;
    const matchesCountry = selectedCountry === "all" || t.country.toLowerCase() === selectedCountry.toLowerCase();
    const matchesVerified = !onlyVerified || t.verified;

    return matchesSearch && matchesMetier && matchesCountry && matchesVerified;
  });

  // Soumission de la demande de devis direct
  const handleSendContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactTalent) return;

    setIsSubmittingQuote(true);
    try {
      const res = await fetch("/api/quotes/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          talentId: contactTalent.id,
          talentName: contactTalent.name,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          clientPhone: clientContact.trim(),
          needDescription: clientNeed.trim(),
          budget: clientBudget ? Number(clientBudget) : 0,
          currency: contactTalent.currency || "XOF",
          deadline: clientDeadline,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setQuoteSuccessNumber(data.quoteNumber || "DEV-AFRIGAIN");
      } else {
        alert(data.error || "Impossible d'envoyer la demande de devis.");
      }
    } catch (err: any) {
      alert("Une erreur de communication est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const handleCloseQuoteModal = () => {
    setContactTalent(null);
    setQuoteSuccessNumber(null);
    setClientNeed("");
    setClientBudget("");
  };

  // Soumission d'un signalement anti-fraude
  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTalent) return;

    setIsSubmittingReport(true);
    try {
      const supabase = createClient();
      const { data: u } = await supabase.auth.getUser();
      await supabase.from("fraud_reports").insert({
        reporter_id: u?.user?.id || null,
        target_id: reportTalent.id,
        target_type: "profile",
        reason: reportReason,
        description: reportDetails.trim(),
        status: "pending",
      });
      setReportSent(true);
      setTimeout(() => {
        setReportSent(false);
        setReportTalent(null);
        setReportDetails("");
      }, 2000);
    } catch (err) {
      console.warn("Signalement sauvegardé", err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Création / Enregistrement de vitrine dans Supabase
  const handleCreateTalent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTalent(true);
    try {
      const payload = {
        fullName: newName.trim(),
        metier: newMetier,
        headline: newHeadline.trim(),
        country: newCountry,
        city: newCity.trim(),
        phone: newPhone.trim(),
        priceAmount: pricingType === "fixed" ? Number(newPrice) || 0 : 0,
        priceCurrency: newCurrency,
        pricingUnit: newPricingUnit,
        skills: newSkills.split(",").map((s) => s.trim()).filter(Boolean),
        bio: newBio.trim(),
        realisationTitle: newRealTitle.trim(),
        realisationDesc: newRealDesc.trim(),
      };

      const res = await fetch("/api/talents/showcase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTalentSuccessMsg("Votre vitrine de talent a été publiée avec succès sur AfriGain !");
        await fetchTalents();
        setTimeout(() => {
          setIsNewTalentModalOpen(false);
          setTalentSuccessMsg(null);
          setNewName("");
          setNewHeadline("");
          setNewBio("");
          setNewSkills("");
          setNewRealTitle("");
          setNewRealDesc("");
          setNewPrice("");
        }, 1800);
      } else {
        alert(data.error || "Impossible d'enregistrer votre vitrine.");
      }
    } catch (err: any) {
      alert("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSubmittingTalent(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Vitrine Professionnelle • Services & Talents d'Afrique & Monde
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Services & Talents Réels
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-3xl">
            Découvrez des artisans qualifiés, consultants, développeurs et prestataires vérifiés en Afrique et à l'international. Obtenez un devis direct clair et sans intermédiaire caché.
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) {
              setIsNewTalentModalOpen(true);
            } else {
              setNewName(currentUser.user_metadata?.full_name || "");
              setIsNewTalentModalOpen(true);
            }
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Créer ma vitrine de talent
        </button>
      </div>

      {/* Barre de Recherche & Filtres Internationaux */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Recherche textuelle */}
          <div className="relative md:col-span-5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Rechercher par métier, compétence, nom, ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Filtre Métiers */}
          <div className="md:col-span-3">
            <select
              value={selectedMetier}
              onChange={(e) => setSelectedMetier(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-xl text-xs bg-white text-slate-700 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="all">Tous les métiers & catégories</option>
              {AFRIGAIN_METIERS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.icon} {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Pays */}
          <div className="md:col-span-2">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-xl text-xs bg-white text-slate-700 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="all">Tous les pays</option>
              {ALL_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Vérifiés */}
          <div className="md:col-span-2 flex items-center">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Vérifiés uniquement
              </span>
            </label>
          </div>
        </div>

        {/* Compteur et indicateur */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            {loading ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" /> Chargement des vitrines réelles...
              </span>
            ) : (
              `${filteredTalents.length} prestataire${filteredTalents.length > 1 ? "s" : ""} disponible${filteredTalents.length > 1 ? "s" : ""}`
            )}
          </span>

          {(searchTerm || selectedMetier !== "all" || selectedCountry !== "all" || onlyVerified) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedMetier("all");
                setSelectedCountry("all");
                setOnlyVerified(false);
              }}
              className="text-brand-600 hover:text-brand-700 font-semibold"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* Grille des Talents */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-brand-600 mx-auto" />
          <p className="text-sm text-slate-600">Chargement des données certifiées...</p>
        </div>
      ) : filteredTalents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Briefcase className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="font-bold text-slate-900 text-base">Aucun prestataire dans cette sélection</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Aucune offre de démonstration ou faux profil n'est affiché. Soyez le premier professionnel de cette catégorie à publier votre vitrine sur AfriGain !
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedMetier("all");
                setSelectedCountry("all");
                setOnlyVerified(false);
              }}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Afficher tous les profils
            </button>
            <button
              onClick={() => setIsNewTalentModalOpen(true)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm"
            >
              Créer ma vitrine de talent
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTalents.map((talent) => (
            <div
              key={talent.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* En-tête profil */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-500 text-white font-extrabold flex items-center justify-center text-lg shadow-sm shrink-0">
                      {talent.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                        {talent.name}
                        {talent.verified && (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
                            title="Identité vérifiée par l'équipe AfriGain"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Vérifié
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-brand-700 font-semibold">{talent.metierLabel}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {talent.city ? `${talent.city}, ` : ""}{talent.country}
                        </span>
                        <span>•</span>
                        {/* AVIS RÉELS STRICTS : JAMAIS DE FAUX 5.0 */}
                        {talent.rating > 0 ? (
                          <span className="flex items-center gap-1 text-amber-600 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {talent.rating.toFixed(1)} ({talent.completedMissions} mission{talent.completedMissions > 1 ? "s" : ""})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                            <Clock className="w-3 h-3" /> Nouveau profil ({talent.completedMissions} mission{talent.completedMissions > 1 ? "s" : ""})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PRIX RÉEL STRICT : JAMAIS 10 000 FCFA FORCÉ */}
                  <div className="text-right shrink-0">
                    {talent.startingPrice && talent.startingPrice > 0 ? (
                      <>
                        <span className="text-[10px] text-slate-400 block font-medium">À partir de</span>
                        <span className="text-sm font-extrabold text-slate-900">
                          {formatCurrency(talent.startingPrice, talent.currency)}
                        </span>
                        {talent.pricingUnit && (
                          <span className="text-[10px] text-slate-500 block">/ {talent.pricingUnit.toLowerCase()}</span>
                        )}
                      </>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                        <span className="text-[10px] text-slate-500 block font-semibold">Tarif</span>
                        <span className="text-xs font-bold text-slate-800">Sur devis</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Accroche professionnelle */}
                <p className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  "{talent.headline}"
                </p>

                {/* Bio & Description */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {talent.bio}
                </p>

                {/* Compétences clés */}
                {talent.skills && talent.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {talent.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-medium"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Réalisations concrètes */}
                {talent.realisations.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
                      Réalisations & Travaux concrets :
                    </span>
                    <div className="space-y-1.5">
                      {talent.realisations.map((real, idx) => (
                        <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{real.title}</span>
                            {real.category && (
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                                {real.category}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">{real.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Boutons d'action : Signaler + Devis Direct */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <button
                  onClick={() => setReportTalent(talent)}
                  className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                  title="Signaler une fausse information ou un comportement suspect"
                >
                  <AlertTriangle className="w-3 h-3" />
                  Signaler
                </button>

                <button
                  onClick={() => setContactTalent(talent)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  Demander un devis direct <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALE 1 : DEMANDE DE DEVIS DIRECT (Enregistré dans Supabase) */}
      {contactTalent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">Mise en relation directe</span>
                <h3 className="text-lg font-bold text-slate-900">Demander un devis à {contactTalent.name}</h3>
                <span className="text-xs text-slate-500">{contactTalent.metierLabel} • {contactTalent.city}, {contactTalent.country}</span>
              </div>
              <button onClick={handleCloseQuoteModal} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {quoteSuccessNumber ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Demande de devis enregistrée !</h4>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 space-y-1">
                  <p>Référence du devis : <strong className="font-mono text-brand-700">{quoteSuccessNumber}</strong></p>
                  <p className="text-slate-500">
                    Votre demande a été stockée dans la base de données AfriGain. <strong>{contactTalent.name}</strong> a reçu une notification immédiate et prendra contact avec vous.
                  </p>
                </div>
                <button
                  onClick={handleCloseQuoteModal}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendContact} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Votre Nom / Entreprise *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Entreprise Sarl / Koffi"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+229 97 00 00 00"
                      value={clientContact}
                      onChange={(e) => setClientContact(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email de contact</label>
                  <input
                    type="email"
                    placeholder="contact@exemple.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description détaillée de votre besoin & livrables attendus *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Expliquez votre projet, les caractéristiques techniques ou les livrables souhaités..."
                    value={clientNeed}
                    onChange={(e) => setClientNeed(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Budget indicatif ({contactTalent.currency})</label>
                    <input
                      type="number"
                      placeholder="Ex: 50000"
                      value={clientBudget}
                      onChange={(e) => setClientBudget(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Délai de livraison souhaité</label>
                    <select
                      value={clientDeadline}
                      onChange={(e) => setClientDeadline(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                      <option value="Urgent (< 48h)">Urgent (&lt; 48 heures)</option>
                      <option value="Sous 1 à 2 semaines">Sous 1 à 2 semaines</option>
                      <option value="Sous 1 mois">Sous 1 mois</option>
                      <option value="À convenir / Flexible">À convenir / Flexible</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseQuoteModal}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingQuote}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm disabled:opacity-50"
                  >
                    {isSubmittingQuote ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Envoyer la demande
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODALE 2 : CRÉATION D'UNE VITRINE DE TALENT (Enregistrée dans Supabase) */}
      {isNewTalentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Créer ma Vitrine de Prestataire</h3>
                <span className="text-xs text-slate-500">Mettez en valeur votre savoir-faire réel et recevez des commandes directes</span>
              </div>
              <button onClick={() => setIsNewTalentModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {talentSuccessMsg ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Vitrine publiée avec succès !</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">{talentSuccessMsg}</p>
              </div>
            ) : !currentUser ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                  <LogIn className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-base">Connexion requise</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Pour garantir la sécurité et l'authenticité des profils, vous devez posséder un compte sur AfriGain pour publier votre vitrine.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Link
                    href="/auth/login?redirect=/services"
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                  >
                    Se connecter à mon compte
                  </Link>
                  <Link
                    href="/auth/register?role=entrepreneur"
                    className="px-5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Créer un compte prestataire
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateTalent} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Votre Nom / Entreprise *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Koffi Sègbé"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Métier / Spécialité *</label>
                    <select
                      value={newMetier}
                      onChange={(e) => setNewMetier(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                      {AFRIGAIN_METIERS.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Titre d'accroche valorisant *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Électricien certifié & installateur de kits solaires pour ateliers et maisons"
                    value={newHeadline}
                    onChange={(e) => setNewHeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pays *</label>
                    <select
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                      {ALL_COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Ville *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Cotonou"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone / WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="+229 97 00 00 00"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Choix Tarif : Fixe ou Sur devis */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-6">
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="pricingType"
                        checked={pricingType === "quote"}
                        onChange={() => setPricingType("quote")}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      Tarif sur devis uniquement
                    </label>

                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="pricingType"
                        checked={pricingType === "fixed"}
                        onChange={() => setPricingType("fixed")}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      Tarif à partir de (montant indicatif)
                    </label>
                  </div>

                  {pricingType === "fixed" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Montant de départ</label>
                        <input
                          type="number"
                          placeholder="Ex: 25000"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value ? Number(e.target.value) : "")}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Devise</label>
                        <select
                          value={newCurrency}
                          onChange={(e) => setNewCurrency(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        >
                          {SUPPORTED_CURRENCIES.map((c) => (
                            <option key={c.code} value={c.code}>{c.code} ({c.label})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Unité</label>
                        <select
                          value={newPricingUnit}
                          onChange={(e) => setNewPricingUnit(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        >
                          <option value="Par prestation">Par prestation</option>
                          <option value="Par heure">Par heure</option>
                          <option value="Par jour">Par jour</option>
                          <option value="Par projet">Par projet</option>
                          <option value="Par mois">Par mois</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Compétences clés (séparées par des virgules)</label>
                  <input
                    type="text"
                    placeholder="Ex: Câblage, Onduleurs, Dépannage rapide, Maintenance"
                    value={newSkills}
                    onChange={(e) => setNewSkills(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Présentation de vos prestations & engagements *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Décrivez vos services, vos méthodes de travail et vos garanties de satisfaction..."
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                {/* Exemple de réalisation concrète */}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <span className="text-xs font-bold text-slate-800">Ajouter une première réalisation concrète (facultatif)</span>
                  <input
                    type="text"
                    placeholder="Titre de la réalisation (ex: Installation de 6 panneaux solaires pour atelier)"
                    value={newRealTitle}
                    onChange={(e) => setNewRealTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    placeholder="Détails du travail effectué, contexte et résultat..."
                    value={newRealDesc}
                    onChange={(e) => setNewRealDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsNewTalentModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingTalent}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm disabled:opacity-50"
                  >
                    {isSubmittingTalent ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Publication...
                      </>
                    ) : (
                      "Publier ma vitrine"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODALE 3 : SIGNALEMENT ANTI-FRAUDE (Enregistré dans Supabase) */}
      {reportTalent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Modération & Sécurité</span>
                <h3 className="text-base font-bold text-slate-900">Signaler le profil de {reportTalent.name}</h3>
              </div>
              <button onClick={() => setReportTalent(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSent ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">Signalement pris en compte</h4>
                <p className="text-xs text-slate-600">
                  L'équipe de modération examinera ce signalement et appliquera les sanctions prévues par les conditions AfriGain.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Motif du signalement *</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                  >
                    <option value="Fausse information sur les réalisations">Fausse information ou réalisation volée</option>
                    <option value="Usurpation d'identité">Usurpation d'identité ou faux documents</option>
                    <option value="Demande d'argent suspecte">Demande d'argent suspecte / escroquerie</option>
                    <option value="Autre">Autre comportement abusif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Précisions utiles pour l'équipe de modération</label>
                  <textarea
                    rows={3}
                    placeholder="Expliquez ce qui vous semble anormal..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportTalent(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm disabled:opacity-50"
                  >
                    {isSubmittingReport ? "Envoi..." : "Confirmer le signalement"}
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
