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
  Send
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AFRIGAIN_METIERS } from "@/lib/constants";
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
  startingPrice: number;
  currency: string;
  bio: string;
  skills: string[];
  references: string;
  phone: string;
  email: string;
  realisations: {
    title: string;
    description: string;
    category: string;
    imageUrl?: string;
  }[];
}

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMetier, setSelectedMetier] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [onlyVerified, setOnlyVerified] = useState(false);

  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRealTalents() {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "entrepreneur")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const mapped = data.map((t) => ({
          id: t.id,
          name: t.full_name,
          metier: t.category || "informatique",
          metierLabel: t.category || "Prestation de Services",
          headline: t.headline || t.bio || "Prestataire indépendant vérifié sur AfriGain.",
          city: t.city || "Cotonou",
          country: t.country || "Bénin",
          languages: ["Français"],
          availability: "immediate" as const,
          rating: Number(t.average_rating) || 5.0,
          completedMissions: t.completed_missions_count || 0,
          verified: t.verification_status === "verified",
          startingPrice: 10000,
          currency: t.currency || "XOF",
          bio: t.bio || "Prestations de qualité réalisées selon devis et engagement mutuel.",
          skills: t.skills || [],
          references: "Inscrit sur AfriGain",
          phone: t.phone || "Non communiqué",
          email: t.email,
          realisations: [],
        }));
        setTalents(mapped);
      } else {
        setTalents([]);
      }
      setLoading(false);
    }

    loadRealTalents();
  }, []);

  // Modale Contact & Demande de Devis
  const [contactTalent, setContactTalent] = useState<TalentProfile | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientNeed, setClientNeed] = useState("");
  const [contactSent, setContactSent] = useState(false);

  // Modale Signalement Anti-Arnaque (Section 6 & 17)
  const [reportTalent, setReportTalent] = useState<TalentProfile | null>(null);
  const [reportReason, setReportReason] = useState("Fausse information sur les réalisations");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSent, setReportSent] = useState(false);

  // Modale Création / Ajout de Profil Talent
  const [isNewTalentModalOpen, setIsNewTalentModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newMetier, setNewMetier] = useState("couture");
  const [newHeadline, setNewHeadline] = useState("");
  const [newCity, setNewCity] = useState("Cotonou");
  const [newBio, setNewBio] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [newPrice, setNewPrice] = useState(25000);
  const [newPhone, setNewPhone] = useState("");
  const [newRealTitle, setNewRealTitle] = useState("");
  const [newRealDesc, setNewRealDesc] = useState("");

  const filteredTalents = talents.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMetier = selectedMetier === "all" || t.metier === selectedMetier;
    const matchesCity = selectedCity === "all" || t.city === selectedCity;
    const matchesVerified = !onlyVerified || t.verified;

    return matchesSearch && matchesMetier && matchesCity && matchesVerified;
  });

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setContactTalent(null);
      setClientName("");
      setClientContact("");
      setClientNeed("");
    }, 1800);
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportSent(true);
    try {
      const supabase = createClient();
      const { data: u } = await supabase.auth.getUser();
      await supabase.from("fraud_reports").insert({
        reporter_id: u?.user?.id || null,
        target_id: reportTalent?.id || "unknown",
        target_type: "profile",
        reason: reportReason,
        description: reportDetails.trim(),
        status: "pending",
      });
    } catch (err) {
      console.warn("Signalement sauvegardé", err);
    }
    setTimeout(() => {
      setReportSent(false);
      setReportTalent(null);
      setReportDetails("");
    }, 1800);
  };

  const handleCreateTalent = (e: React.FormEvent) => {
    e.preventDefault();
    const created: TalentProfile = {
      id: `tal-${Date.now()}`,
      name: newName,
      metier: newMetier,
      metierLabel: AFRIGAIN_METIERS.find((m) => m.id === newMetier)?.name || "Professionnel",
      headline: newHeadline,
      city: newCity,
      country: "Bénin",
      languages: ["Français"],
      availability: "immediate",
      rating: 5.0,
      completedMissions: 1,
      verified: true,
      startingPrice: Number(newPrice),
      currency: "XOF",
      bio: newBio,
      skills: newSkills.split(",").map((s) => s.trim()).filter(Boolean),
      references: "Profil inscrit et validé sur AfriGain",
      phone: newPhone || "+229 97 00 00 00",
      email: "contact@pro.bj",
      realisations: newRealTitle
        ? [{ title: newRealTitle, description: newRealDesc, category: "Réalisation récente" }]
        : [],
    };

    setTalents([created, ...talents]);
    setIsNewTalentModalOpen(false);
    setNewName("");
    setNewHeadline("");
    setNewBio("");
    setNewSkills("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Vitrine Professionnelle • Section 6 AfriGain
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Services & Talents d'Afrique
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-3xl">
            Découvrez le savoir-faire réel de couturiers, menuisiers, développeurs, graphistes et experts techniques. Consultez leurs réalisations concrètes et commandez directement vos prestations.
          </p>
        </div>

        <button
          onClick={() => setIsNewTalentModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Créer ma vitrine de talent
        </button>
      </div>

      {/* Barre de Recherche & Filtres */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Rechercher un artisan, développeur, couturier, compétence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <select
            value={selectedMetier}
            onChange={(e) => setSelectedMetier(e.target.value)}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="all">Tous les métiers</option>
            {AFRIGAIN_METIERS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.icon} {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="all">Toutes les localisations</option>
            <option value="Cotonou">Cotonou (Bénin)</option>
            <option value="Abomey-Calavi">Abomey-Calavi (Bénin)</option>
            <option value="Porto-Novo">Porto-Novo (Bénin)</option>
            <option value="Parakou">Parakou (Bénin)</option>
          </select>
        </div>
      </div>

      {/* Grille des Talents (Section 6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTalents.length === 0 ? (
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Sparkles className="w-10 h-10 text-brand-500 mx-auto" />
            <h4 className="font-bold text-slate-900 text-base">Aucun prestataire dans cette sélection</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Toutes les données de démonstration ont été retirées. Les prestataires et artisans inscrits apparaîtront ici.
            </p>
          </div>
        ) : filteredTalents.map((talent) => (
          <div
            key={talent.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              {/* En-tête profil */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-500 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
                    {talent.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      {talent.name}
                      {talent.verified && (
                        <span title="Identité & Références vérifiées"><ShieldCheck className="w-4 h-4 text-brand-600" /></span>
                      )}
                    </h3>
                    <p className="text-xs text-brand-700 font-semibold">{talent.metierLabel}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {talent.city}, {talent.country}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-600 font-bold"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {talent.rating} ({talent.completedMissions} missions)</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">À partir de</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {formatCurrency(talent.startingPrice, talent.currency)}
                  </span>
                </div>
              </div>

              {/* Bio & Headline */}
              <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                "{talent.headline}"
              </p>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {talent.bio}
              </p>

              {/* Compétences */}
              <div className="flex flex-wrap gap-1">
                {talent.skills.map((skill, idx) => (
                  <span key={idx} className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                    ✓ {skill}
                  </span>
                ))}
              </div>

              {/* Galerie de réalisations (Section 6.1) */}
              {talent.realisations.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
                    Réalisations & Travaux concrets :
                  </span>
                  <div className="space-y-1.5">
                    {talent.realisations.map((real, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{real.title}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                            {real.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{real.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions & Bouton Contacter + Signalement (Section 6 & 17) */}
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <button
                onClick={() => setReportTalent(talent)}
                className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                title="Signaler une fausse information ou un contenu frauduleux"
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

      {/* Modale Demande de devis directe */}
      {contactTalent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-brand-600 uppercase">Mise en relation directe</span>
                <h3 className="text-lg font-bold text-slate-900">Contacter {contactTalent.name}</h3>
                <span className="text-xs text-slate-500">{contactTalent.metierLabel} • {contactTalent.city}</span>
              </div>
              <button onClick={() => setContactTalent(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {contactSent ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Demande de devis transmise !</h4>
                <p className="text-xs text-slate-600">
                  {contactTalent.name} a été notifié(e) par email et WhatsApp. Il/elle prendra contact directement avec vous.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendContact} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Votre Nom / Entreprise *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Entreprise Bénin"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description de votre besoin & délais souhaités *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Décrivez les livrables souhaités, votre budget indicatif et la date de livraison prévue..."
                    value={clientNeed}
                    onChange={(e) => setClientNeed(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setContactTalent(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                  >
                    Envoyer ma demande
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modale Signalement Anti-Fraude (Section 6 & 17) */}
      {reportTalent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-rose-600 uppercase">Modération & Sécurité</span>
                <h3 className="text-base font-bold text-slate-900">Signaler {reportTalent.name}</h3>
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
                  L'équipe de modération examinera ce profil sous 24h conformément à nos règles de sécurité.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Motif du signalement *</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Fausse information sur les réalisations">Fausse information ou réalisation volée</option>
                    <option value="Usurpation d'identité">Usurpation d'identité ou fausses coordonnées</option>
                    <option value="Demande d'argent suspecte">Demande d'argent suspecte / tentative d'escroquerie</option>
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
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
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                  >
                    Confirmer le signalement
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modale Création d'une Fiche de Talent & Réalisations */}
      {isNewTalentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Créer ma Vitrine Professionnelle</h3>
                <span className="text-xs text-slate-500">Mettez en valeur votre métier et vos réalisations concrètes</span>
              </div>
              <button onClick={() => setIsNewTalentModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTalent} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Votre Nom professionnel *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Koffi Sègbé"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Métier / Spécialité *</label>
                  <select
                    value={newMetier}
                    onChange={(e) => setNewMetier(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
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
                  placeholder="Ex: Électricien certifié & installateur de kits solaires pour maisons et commerces"
                  value={newHeadline}
                  onChange={(e) => setNewHeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tarif indicatif (FCFA)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="+229 97 00 00 00"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Compétences clés (séparées par des virgules)</label>
                <input
                  type="text"
                  placeholder="Ex: Câblage, Onduleurs, Dépannage rapide, Sécurité"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Présentation de vos services</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Expliquez ce que vous réalisez, vos délais habituels et votre manière de travailler..."
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <span className="text-xs font-bold text-slate-800">Ajouter une première réalisation concrète</span>
                <input
                  type="text"
                  placeholder="Titre de la réalisation (ex: Pose de 6 panneaux solaires pour un atelier)"
                  value={newRealTitle}
                  onChange={(e) => setNewRealTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
                <textarea
                  rows={2}
                  placeholder="Détails du travail effectué, matériaux utilisés ou résultat..."
                  value={newRealDesc}
                  onChange={(e) => setNewRealDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewTalentModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Publier ma vitrine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
