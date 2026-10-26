"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Mail, 
  User, 
  Briefcase, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Globe2, 
  GraduationCap, 
  Hammer, 
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Tag,
  Plus,
  X
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

export default function RegisterPage() {
  const router = useRouter();
  
  // Rôles principaux (préservés selon Section 2.2 du prompt)
  const [role, setRole] = useState<"entrepreneur" | "client">("entrepreneur");
  
  // Profil spécifique (Section 4 du prompt : Étudiant, Particulier, Artisan, Fournisseur, etc.)
  const [category, setCategory] = useState<"prestataire" | "etudiant" | "particulier" | "artisan" | "entreprise" | "fournisseur">("prestataire");
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("Bénin");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setCustomSkillInput("");
      setShowCustomInput(false);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skillToRemove));
  };


  const handleRoleSelect = (newRole: "entrepreneur" | "client") => {
    setRole(newRole);
    if (newRole === "entrepreneur") {
      if (category === "entreprise" || category === "fournisseur") {
        setCategory("prestataire");
      }
    } else {
      setCategory("entreprise");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Vérification des exigences de sécurité (Section 9.1)
    if (password.length < 8) {
      setErrorMsg("Le mot de passe doit comporter au moins 8 caractères.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Les deux mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const emailRedirectTo = `${origin}/auth/confirm?next=/dashboard`;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: role,
            category: category,
            country: country,
            skills: selectedSkills,
          },
          emailRedirectTo,
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes("user already registered")) {
          setErrorMsg("Un compte existe déjà avec cette adresse e-mail. Vous pouvez vous connecter directement.");
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      // Orientation vers confirmation par e-mail
      if (data?.user?.id && selectedSkills.length > 0) {
        try {
          await supabase.from("profiles").update({ skills: selectedSkills }).eq("id", data.user.id);
        } catch (_) {}
      }

      if (data?.user && !data.session) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      } else if (data?.user?.email_confirmed_at) {
        router.push("/dashboard");
      } else {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Une erreur inattendue est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-100 text-brand-700 font-bold text-xl rounded-2xl mx-auto flex items-center justify-center shadow-sm">
            AF
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Rejoindre AFriGain</h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Plateforme économique panafricaine & internationale. Développez vos opportunités en toute transparence.
          </p>
        </div>

        {/* 1. Profils d'inscription principaux (Section 2.2 : Prestataire & Entreprise) */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
            Votre profil principal
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleRoleSelect("entrepreneur")}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-2 ${
                role === "entrepreneur"
                  ? "border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <Briefcase className={`w-5 h-5 ${role === "entrepreneur" ? "text-brand-600" : "text-slate-500"}`} />
                {role === "entrepreneur" && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
              </div>
              <div>
                <span className="font-bold text-sm block text-slate-900">Prestataire / Indépendant</span>
                <span className="text-[11px] text-slate-500">Entrepreneur, talent, artisan, étudiant</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect("client")}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-2 ${
                role === "client"
                  ? "border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <Building2 className={`w-5 h-5 ${role === "client" ? "text-brand-600" : "text-slate-500"}`} />
                {role === "client" && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
              </div>
              <div>
                <span className="font-bold text-sm block text-slate-900">Entreprise / Donneur d'ordre</span>
                <span className="text-[11px] text-slate-500">TPE, recruteur, fournisseur B2B</span>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Catégories spécifiques adaptées (Section 4 du prompt : Étudiant, Artisan, etc.) */}
        <div className="space-y-2 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block flex items-center justify-between">
            <span>Précisez votre activité</span>
            {category === "etudiant" && (
              <span className="text-[10px] text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full">
                Sans IFU ni RCCM
              </span>
            )}
          </label>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {role === "entrepreneur" ? (
              <>
                <button
                  type="button"
                  onClick={() => setCategory("prestataire")}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    category === "prestataire"
                      ? "border-brand-600 bg-white font-bold text-brand-700 ring-2 ring-brand-500/10 shadow-sm"
                      : "border-slate-200 bg-white/60 text-slate-700 hover:bg-white"
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 mb-1 text-brand-600" />
                  Prestataire Freelance
                </button>

                <button
                  type="button"
                  onClick={() => setCategory("etudiant")}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    category === "etudiant"
                      ? "border-emerald-600 bg-white font-bold text-emerald-800 ring-2 ring-emerald-500/20 shadow-sm"
                      : "border-slate-200 bg-white/60 text-slate-700 hover:bg-white"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 mb-1 text-emerald-600" />
                  Étudiant / Diplômé
                </button>

                <button
                  type="button"
                  onClick={() => setCategory("artisan")}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    category === "artisan"
                      ? "border-amber-600 bg-white font-bold text-amber-800 ring-2 ring-amber-500/20 shadow-sm"
                      : "border-slate-200 bg-white/60 text-slate-700 hover:bg-white"
                  }`}
                >
                  <Hammer className="w-3.5 h-3.5 mb-1 text-amber-600" />
                  Artisan / Créateur
                </button>

                <button
                  type="button"
                  onClick={() => setCategory("particulier")}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    category === "particulier"
                      ? "border-blue-600 bg-white font-bold text-blue-800 ring-2 ring-blue-500/20 shadow-sm"
                      : "border-slate-200 bg-white/60 text-slate-700 hover:bg-white"
                  }`}
                >
                  <User className="w-3.5 h-3.5 mb-1 text-blue-600" />
                  Particulier / Emploi
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setCategory("entreprise")}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    category === "entreprise"
                      ? "border-brand-600 bg-white font-bold text-brand-700 ring-2 ring-brand-500/10 shadow-sm"
                      : "border-slate-200 bg-white/60 text-slate-700 hover:bg-white"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 mb-1 text-brand-600" />
                  Entreprise / Recruteur
                </button>

                <button
                  type="button"
                  onClick={() => setCategory("fournisseur")}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    category === "fournisseur"
                      ? "border-indigo-600 bg-white font-bold text-indigo-800 ring-2 ring-indigo-500/20 shadow-sm"
                      : "border-slate-200 bg-white/60 text-slate-700 hover:bg-white"
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 mb-1 text-indigo-600" />
                  Fournisseur B2B
                </button>
              </>
            )}
          </div>

          {/* Note contextuelle adaptée selon profil (Section 4.1 et 4.2) */}
          <div className="pt-2 text-[11px] text-slate-600 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
            {category === "etudiant" && (
              <span>
                <strong>Parcours Étudiant dédié :</strong> Vous n'avez pas besoin de numéro IFU ni RCCM. Votre carte d'étudiant ou certificat d'inscription sera suffisant pour certifier votre compte.
              </span>
            )}
            {category === "prestataire" && (
              <span>
                <strong>Parcours Indépendant :</strong> Proposez vos services, créez vos devis et factures et accédez aux missions sans contrainte préalable.
              </span>
            )}
            {category === "artisan" && (
              <span>
                <strong>Parcours Artisanat :</strong> Mettez en avant vos réalisations et votre savoir-faire auprès d'une clientèle locale et internationale.
              </span>
            )}
            {category === "particulier" && (
              <span>
                <strong>Parcours Opportunités :</strong> Postulez directement aux offres d'emploi, de stage ou aux missions ouvertes.
              </span>
            )}
            {category === "entreprise" && (
              <span>
                <strong>Parcours Entreprise :</strong> Recrutez des talents, publiez des missions et valorisez votre société avec une galerie d'activité de 5 photos.
              </span>
            )}
            {category === "fournisseur" && (
              <span>
                <strong>Parcours Fournisseur B2B :</strong> Exposez vos produits et matières premières avec galerie d'au moins 5 photos par référence.
              </span>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Nom ou Raison Sociale */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              {role === "client" ? "Raison Sociale / Nom de l'entreprise" : "Nom et prénom"}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === "client" ? "Ex: Société AgroBénin SARL" : "Ex: Mensah Dossou"}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Pays de résidence ou d'enregistrement (Section 4.2 Étrangers & Afrique) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Pays de localisation</span>
              <span className="text-[11px] text-brand-600 font-normal">Afrique & International</span>
            </label>
            <div className="relative">
              <Globe2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {ALL_COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {country !== "Bénin" && (
              <p className="text-[11px] text-slate-500">
                Les pièces officielles de votre pays ({country}) sont pleinement acceptées. Aucun document béninois n'est exigé.
              </p>
            )}
          </div>

          {/* Adresse e-mail professionnelle (Section 9.1) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Adresse e-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@exemple.com"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Mots de passe avec confirmation (Section 9.1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Mot de passe (8 car. min)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>


          {/* Section 1 : Choix autonome des compétences par l'utilisateur */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-600" />
                  Vos compétences clés
                </label>
                <p className="text-[11px] text-slate-500">
                  Choisissez vous-même vos savoir-faire. Vous pourrez les modifier à tout moment.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
                {selectedSkills.length} sélectionnée{selectedSkills.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Aperçu des compétences sélectionnées */}
            {selectedSkills.length > 0 && (
              <div className="p-2.5 bg-white rounded-xl border border-brand-200 space-y-1.5">
                <span className="text-[10px] font-bold text-brand-900 block uppercase tracking-wider">
                  Compétences qui seront enregistrées dans votre profil :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSkills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 bg-brand-50 border border-brand-300 text-brand-900 px-2.5 py-0.5 rounded-lg text-xs font-semibold"
                    >
                      ✓ {s}
                      <button
                        type="button"
                        onClick={() => removeSkill(s)}
                        className="text-brand-500 hover:text-brand-800 ml-0.5"
                        title="Retirer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Grille de sélection des compétences suggérées */}
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {POPULAR_SKILLS.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      isSelected
                        ? "bg-brand-600 text-white shadow-sm ring-1 ring-brand-700"
                        : "bg-white border border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-brand-50/50"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                    {skill}
                  </button>
                );
              })}

              {/* Bouton Autre compétence */}
              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold border border-dashed border-brand-400 bg-white text-brand-700 hover:bg-brand-50 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Autre compétence...
              </button>
            </div>

            {/* Champ de saisie pour compétence personnalisée */}
            {showCustomInput && (
              <div className="flex items-center gap-2 pt-1">
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
                  placeholder="Précisez votre compétence..."
                  className="flex-1 px-3 py-1.5 text-xs border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => addCustomSkill()}
                  className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold"
                >
                  Ajouter
                </button>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <span>
              Vos mots de passe sont chiffrés et sécurisés. Les pièces d'identité et justificatifs sont stockés dans un espace privé inaccessible au public.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer mon compte sécurisé"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Vous possédez déjà un compte AFriGain ?{" "}
          <Link href="/auth/login" className="font-semibold text-brand-600 hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
