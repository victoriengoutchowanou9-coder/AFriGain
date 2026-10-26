"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Settings, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe2, 
  Tag, 
  ShieldCheck, 
  ArrowLeft, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  X,
  Lock,
  ExternalLink
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ALL_COUNTRIES } from "@/lib/constants";

const POPULAR_SKILLS = [
  "Rédaction de textes",
  "Maîtrise du français",
  "Création de visuels avec Canva",
  "Montage vidéo",
  "Gestion de pages Facebook",
  "Utilisation de TikTok",
  "Vente de produits",
  "Cuisine & Restauration",
  "Maîtrise d'Excel",
  "Réparation de téléphones",
  "Enseignement et soutien scolaire",
  "Coiffure & Esthétique",
  "Marketing digital",
  "Gestion administrative",
  "Saisie de données",
  "Développement web & mobile",
  "Couture & Stylisme",
  "Électricité & Énergie solaire",
  "Comptabilité & Finance",
  "Livraison & Logistique",
  "Service client & Téléphonie"
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Informations utilisateur
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("Bénin");
  const [city, setCity] = useState("Cotonou");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Statuts d'identité et de vérification (séparés et protégés)
  const [identityStatus, setIdentityStatus] = useState("documents_pending");
  const [verificationStatus, setVerificationStatus] = useState("unverified");
  const [accountRole, setAccountRole] = useState("entrepreneur");

  useEffect(() => {
    async function loadUserSettings() {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          setLoading(false);
          return;
        }

        setUserId(userData.user.id);
        setEmail(userData.user.email || "");

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userData.user.id)
          .single();

        if (profile) {
          setFullName(profile.full_name || "");
          setCompanyName(profile.company_name || "");
          setHeadline(profile.headline || "");
          setBio(profile.bio || "");
          setCountry(profile.country || "Bénin");
          setCity(profile.city || "Cotonou");
          setPhone(profile.phone || "");
          setSkills(Array.isArray(profile.skills) ? profile.skills : []);
          setIdentityStatus(profile.identity_status || "documents_pending");
          setVerificationStatus(profile.verification_status || "unverified");
          setAccountRole(profile.role || "entrepreneur");
        }
      } catch (err: any) {
        console.error("Erreur de chargement des paramètres:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUserSettings();
  }, []);

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const addCustomSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCustomSkillInput("");
      setShowCustomInput(false);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    if (!fullName.trim()) {
      setFeedback({ type: "error", text: "Le nom et prénom ne peuvent pas être vides." });
      setSaving(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          company_name: companyName.trim(),
          headline: headline.trim(),
          bio: bio.trim(),
          country: country,
          city: city.trim(),
          phone: phone.trim(),
          skills: skills,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      setFeedback({
        type: "success",
        text: "Vos paramètres et compétences ont été enregistrés avec succès dans votre profil.",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Une erreur est survenue lors de l'enregistrement de vos modifications.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        <span className="text-sm font-medium text-slate-500">Chargement de vos paramètres...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <Link
            href="/dashboard"
            className="text-xs text-slate-500 hover:text-brand-600 inline-flex items-center gap-1 mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Retour à mon espace
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-brand-600" />
            Paramètres du Compte
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Gérez vos informations personnelles, vos coordonnées et choisissez vos compétences professionnelles.
          </p>
        </div>

        <Link
          href="/dashboard/verification"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all self-start sm:self-auto"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Vérification d'identité</span>
        </Link>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : "bg-rose-50 border border-rose-200 text-rose-900"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* 1. Informations Générales */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600" />
                Informations Personnelles
              </h2>
              <p className="text-xs text-slate-500">
                Ces informations vous identifient sur la plateforme AfriGain.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
              Rôle : {accountRole}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nom et prénom *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  placeholder="Votre nom complet"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Raison Sociale (Optionnel)</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="Ex: Entreprise, Atelier ou Marque"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Adresse e-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-slate-400">
                Identifiant de connexion protégé. Les changements d'e-mail s'effectuent via validation sécurisée.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Numéro de téléphone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  placeholder="+229 97 00 00 00"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Pays de localisation</label>
              <div className="relative">
                <Globe2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                >
                  {ALL_COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Ville / Commune</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  placeholder="Ex: Cotonou, Lomé, Abidjan..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Titre professionnel / Accroche</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              placeholder="Ex: Comptable gestionnaire & Spécialiste Excel / Designer graphique freelance"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Présentation personnelle / Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              placeholder="Décrivez brièvement vos activités, vos réalisations et ce que vous proposez..."
            />
          </div>
        </div>

        {/* 2. Gestion Autonome des Compétences */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-600" />
                Vos Compétences Autonomes
              </h2>
              <p className="text-xs text-slate-500">
                Sélectionnez ou modifiez vous-même vos compétences. Elles servent à personnaliser vos opportunités.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-100 text-brand-800">
              {skills.length} compétence{skills.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Liste des compétences actuelles */}
          {skills.length > 0 ? (
            <div className="p-3 bg-brand-50/50 rounded-2xl border border-brand-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-900 block">
                Compétences actives sur votre profil :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 bg-white border border-brand-300 text-brand-950 px-3 py-1 rounded-xl text-xs font-semibold shadow-xs"
                  >
                    ✓ {s}
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      className="text-slate-400 hover:text-rose-600"
                      title="Supprimer cette compétence"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
              Aucune compétence sélectionnée. Choisissez parmi les suggestions ci-dessous ou ajoutez les vôtres.
            </div>
          )}

          {/* Suggestions rapides */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">
              Suggestions de compétences professionnelles :
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {POPULAR_SKILLS.map((skill) => {
                const active = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      active
                        ? "bg-brand-600 text-white shadow-sm ring-1 ring-brand-700"
                        : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-brand-50/60 hover:border-brand-300"
                    }`}
                  >
                    {active && <CheckCircle2 className="w-3 h-3 text-white" />}
                    {skill}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="px-3 py-1 rounded-lg text-xs font-bold border border-dashed border-brand-500 bg-white text-brand-700 hover:bg-brand-50 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Autre compétence...
              </button>
            </div>

            {showCustomInput && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomSkill();
                    }
                  }}
                  placeholder="Précisez votre savoir-faire..."
                  className="flex-1 px-3 py-2 text-xs border border-brand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => addCustomSkill()}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold"
                >
                  Ajouter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Sécurité & Données d'Identité (Protégées) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              Sécurité & Protection des Données Personnelles
            </h2>
            <p className="text-xs text-slate-500">
              Vos pièces d'identité sont conservées dans un espace de stockage chiffré et privé.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 block uppercase">
                Statut de vérification d'identité
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    identityStatus === "verified"
                      ? "bg-emerald-100 text-emerald-800"
                      : identityStatus === "in_review"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {identityStatus === "verified"
                    ? "Validée ✓"
                    : identityStatus === "in_review"
                    ? "Vérification en cours"
                    : identityStatus === "rejected"
                    ? "Refusée"
                    : "En attente"}
                </span>
                <span className="text-[11px] text-slate-400">
                  Numéro et photo de pièce strictement confidentiels.
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-emerald-950 block">Dossier de certification</span>
                <p className="text-[11px] text-emerald-800">
                  Besoin de mettre à jour votre pièce d'identité ou vos documents professionnels ?
                </p>
              </div>
              <Link
                href="/dashboard/verification"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 self-start"
              >
                Accéder au formulaire de certification <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bouton Enregistrer */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Enregistrer les paramètres
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
