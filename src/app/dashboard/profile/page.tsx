"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  User, 
  ShieldCheck, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  X, 
  Globe, 
  Phone, 
  MapPin, 
  Users, 
  FileText, 
  Award, 
  Download, 
  Eye, 
  Trash2, 
  UploadCloud, 
  Sparkles,
  Lock,
  Unlock,
  Check,
  Building,
  UserCheck,
  UserPlus,
  UserMinus,
  Briefcase
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ALL_COUNTRIES } from "@/lib/constants";

interface FollowerUser {
  id: string;
  full_name: string;
  company_name?: string;
  headline?: string;
  country?: string;
  city?: string;
  avatar_url?: string;
  is_following?: boolean;
}

interface UserCV {
  id: string;
  title: string;
  file_url: string;
  is_primary: boolean;
  is_public: boolean;
  source: "uploaded" | "afrigain_ai";
  created_at: string;
}

interface WorkCertificate {
  id: string;
  title: string;
  client_name: string;
  completion_date: string;
  description: string;
  file_url: string;
  created_at: string;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [activeTab, setActiveTab] = useState<"info" | "social" | "cv" | "certificates">("info");
  const [userId, setUserId] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("entrepreneur");

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("Bénin");
  const [city, setCity] = useState("Cotonou");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("unverified");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Followers & Following state
  const [followers, setFollowers] = useState<FollowerUser[]>([]);
  const [following, setFollowing] = useState<FollowerUser[]>([]);
  const [socialSubTab, setSocialSubTab] = useState<"followers" | "following">("followers");
  const [socialLoading, setSocialLoading] = useState(false);

  // CV Management state
  const [cvList, setCvList] = useState<UserCV[]>([]);
  const [uploadingCv, setUploadingCv] = useState(false);
  const cvFileInputRef = useRef<HTMLInputElement>(null);

  // Work Certificates state
  const [certificates, setCertificates] = useState<WorkCertificate[]>([]);
  const [isAddingCert, setIsAddingCert] = useState(false);
  const [certTitle, setCertTitle] = useState("");
  const [certClient, setCertClient] = useState("");
  const [certDate, setCertDate] = useState("");
  const [certDesc, setCertDesc] = useState("");
  const certFileInputRef = useRef<HTMLInputElement>(null);
  const [certFile, setCertFile] = useState<File | null>(null);

  // Dynamic Profile Completion Calculation
  const calculateCompleteness = () => {
    let score = 0;
    const missing: string[] = [];
    const isCompany = userRole === "client" || companyName.trim().length > 0;

    if (isCompany) {
      if (companyName.trim()) score += 20; else missing.push("Raison sociale");
      if (headline.trim() || bio.trim()) score += 20; else missing.push("Présentation d'activité");
      if (country.trim()) score += 15; else missing.push("Pays");
      if (city.trim()) score += 15; else missing.push("Ville");
      if (phone.trim()) score += 15; else missing.push("Téléphone");
      if (certificates.length > 0 || avatarUrl) score += 15; else missing.push("Logo ou attestation");
    } else {
      if (fullName.trim()) score += 20; else missing.push("Nom complet");
      if (headline.trim()) score += 15; else missing.push("Titre professionnel");
      if (country.trim()) score += 15; else missing.push("Pays");
      if (city.trim()) score += 15; else missing.push("Ville");
      if (skills.length >= 3) {
        score += 20;
      } else if (skills.length > 0) {
        score += 10;
        missing.push("Au moins 3 compétences");
      } else {
        missing.push("Compétences clés");
      }
      if (bio.trim()) score += 15; else missing.push("Présentation détaillée");
    }

    return { percent: Math.min(100, Math.max(0, score)), missing };
  };

  const { percent: completionPercent, missing: missingFields } = calculateCompleteness();

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;

        setUserId(userData.user.id);

        const { data: profile } = await supabase
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
          setSkills(profile.skills || []);
          setVerificationStatus(profile.verification_status || "unverified");
          setAvatarUrl(profile.avatar_url || null);
          setUserRole(profile.role || "entrepreneur");
        }

        // Load Followers & Following from user_followers
        await loadFollowers(userData.user.id, supabase);

        // Load local CVs & Certificates from user metadata or profile
        const storedCvs = localStorage.getItem(`afrigain_cvs_${userData.user.id}`);
        if (storedCvs) {
          try { setCvList(JSON.parse(storedCvs)); } catch (_) {}
        } else {
          // Check if AI CV was generated
          const aiCv = localStorage.getItem("afrigain_cv_personal");
          if (aiCv) {
            const initialCv: UserCV = {
              id: "cv-ai-1",
              title: "CV Principal généré via AfriGain AI",
              file_url: "/dashboard/coach-ia",
              is_primary: true,
              is_public: true,
              source: "afrigain_ai",
              created_at: new Date().toLocaleDateString("fr-FR"),
            };
            setCvList([initialCv]);
            localStorage.setItem(`afrigain_cvs_${userData.user.id}`, JSON.stringify([initialCv]));
          }
        }

        const storedCerts = localStorage.getItem(`afrigain_certs_${userData.user.id}`);
        if (storedCerts) {
          try { setCertificates(JSON.parse(storedCerts)); } catch (_) {}
        }
      } catch (err) {
        console.error("Erreur chargement profil", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const loadFollowers = async (currentUserId: string, supabaseClient: any) => {
    try {
      setSocialLoading(true);

      // Users who follow me (abonnés)
      const { data: followersData } = await supabaseClient
        .from("user_followers")
        .select("follower_id, profiles:follower_id(id, full_name, company_name, headline, country, city, avatar_url)")
        .eq("following_id", currentUserId);

      // Users I follow (abonnements)
      const { data: followingData } = await supabaseClient
        .from("user_followers")
        .select("following_id, profiles:following_id(id, full_name, company_name, headline, country, city, avatar_url)")
        .eq("follower_id", currentUserId);

      const myFollowingIds = new Set((followingData || []).map((f: any) => f.following_id));

      if (followersData) {
        const formattedFollowers: FollowerUser[] = followersData
          .filter((f: any) => f.profiles)
          .map((f: any) => ({
            id: f.profiles.id,
            full_name: f.profiles.full_name || "Membre AfriGain",
            company_name: f.profiles.company_name,
            headline: f.profiles.headline || "Professionnel indépendant",
            country: f.profiles.country || "Afrique",
            city: f.profiles.city || "",
            avatar_url: f.profiles.avatar_url,
            is_following: myFollowingIds.has(f.profiles.id),
          }));
        setFollowers(formattedFollowers);
      }

      if (followingData) {
        const formattedFollowing: FollowerUser[] = followingData
          .filter((f: any) => f.profiles)
          .map((f: any) => ({
            id: f.profiles.id,
            full_name: f.profiles.full_name || "Membre AfriGain",
            company_name: f.profiles.company_name,
            headline: f.profiles.headline || "Professionnel indépendant",
            country: f.profiles.country || "Afrique",
            city: f.profiles.city || "",
            avatar_url: f.profiles.avatar_url,
            is_following: true,
          }));
        setFollowing(formattedFollowing);
      }
    } catch (err) {
      console.warn("Table user_followers :", err);
    } finally {
      setSocialLoading(false);
    }
  };

  const handleToggleFollow = async (targetUser: FollowerUser) => {
    if (!userId || targetUser.id === userId) return;

    const supabase = createClient();
    const currentlyFollowing = targetUser.is_following;

    try {
      if (currentlyFollowing) {
        // Unfollow
        await supabase
          .from("user_followers")
          .delete()
          .eq("follower_id", userId)
          .eq("following_id", targetUser.id);

        setFollowing((prev) => prev.filter((u) => u.id !== targetUser.id));
        setFollowers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, is_following: false } : u))
        );
      } else {
        // Follow
        await supabase.from("user_followers").insert({
          follower_id: userId,
          following_id: targetUser.id,
        });

        const newFollowingUser = { ...targetUser, is_following: true };
        setFollowing((prev) => [...prev, newFollowingUser]);
        setFollowers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, is_following: true } : u))
        );
      }
    } catch (err) {
      console.error("Erreur toggle follow :", err);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) => {
    setSkills(skills.filter((item) => item !== s));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        setFeedback({ type: "error", text: "Veuillez vous connecter pour enregistrer." });
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          company_name: companyName.trim() || null,
          headline: headline.trim(),
          bio: bio.trim(),
          country: country,
          city: city.trim(),
          phone: phone.trim(),
          skills: skills,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userData.user.id);

      if (error) throw error;

      setFeedback({ type: "success", text: "Votre profil a été mis à jour avec succès !" });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Erreur de mise à jour." });
    } finally {
      setSaving(false);
    }
  };

  // CV Actions
  const handleUploadCV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCv(true);
    const newCv: UserCV = {
      id: `cv-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ""),
      file_url: URL.createObjectURL(file),
      is_primary: cvList.length === 0,
      is_public: true,
      source: "uploaded",
      created_at: new Date().toLocaleDateString("fr-FR"),
    };

    const updated = [newCv, ...cvList];
    setCvList(updated);
    if (userId) {
      localStorage.setItem(`afrigain_cvs_${userId}`, JSON.stringify(updated));
    }
    setUploadingCv(false);
    setFeedback({ type: "success", text: "Votre CV a été ajouté à votre espace professionnel !" });
  };

  const setPrimaryCv = (cvId: string) => {
    const updated = cvList.map((c) => ({ ...c, is_primary: c.id === cvId }));
    setCvList(updated);
    if (userId) {
      localStorage.setItem(`afrigain_cvs_${userId}`, JSON.stringify(updated));
    }
  };

  const toggleCvVisibility = (cvId: string) => {
    const updated = cvList.map((c) => (c.id === cvId ? { ...c, is_public: !c.is_public } : c));
    setCvList(updated);
    if (userId) {
      localStorage.setItem(`afrigain_cvs_${userId}`, JSON.stringify(updated));
    }
  };

  const deleteCv = (cvId: string) => {
    const updated = cvList.filter((c) => c.id !== cvId);
    setCvList(updated);
    if (userId) {
      localStorage.setItem(`afrigain_cvs_${userId}`, JSON.stringify(updated));
    }
  };

  // Work Certificates Actions
  const handleAddCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certTitle.trim() || !certClient.trim()) return;

    const newCert: WorkCertificate = {
      id: `cert-${Date.now()}`,
      title: certTitle.trim(),
      client_name: certClient.trim(),
      completion_date: certDate || new Date().toISOString().split("T")[0],
      description: certDesc.trim(),
      file_url: certFile ? URL.createObjectURL(certFile) : "",
      created_at: new Date().toLocaleDateString("fr-FR"),
    };

    const updated = [newCert, ...certificates];
    setCertificates(updated);
    if (userId) {
      localStorage.setItem(`afrigain_certs_${userId}`, JSON.stringify(updated));
    }

    setCertTitle("");
    setCertClient("");
    setCertDate("");
    setCertDesc("");
    setCertFile(null);
    setIsAddingCert(false);
    setFeedback({ type: "success", text: "Attestation de fin de travaux enregistrée dans votre portfolio !" });
  };

  const deleteCertificate = (certId: string) => {
    const updated = certificates.filter((c) => c.id !== certId);
    setCertificates(updated);
    if (userId) {
      localStorage.setItem(`afrigain_certs_${userId}`, JSON.stringify(updated));
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        <span className="text-sm text-slate-500">Chargement de votre profil...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div>
        <Link href="/dashboard" className="text-xs text-slate-500 hover:text-brand-600 inline-flex items-center gap-1 mb-2 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour à mon espace
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
              {fullName?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {fullName || "Mon Profil Professionnel"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {headline || "Définissez votre présence économique sur la plateforme."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>{verificationStatus === "verified" ? "Identité Certifiée ✓" : "Identité non vérifiée"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Jauge Complétude Réelle du Profil (Section 4 du prompt) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Niveau de complétude de votre profil
              </span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                completionPercent >= 80 ? "bg-emerald-100 text-emerald-800" : completionPercent >= 50 ? "bg-brand-100 text-brand-800" : "bg-amber-100 text-amber-800"
              }`}>
                {completionPercent}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Calcul exact basé sur vos informations renseignées. Aucun pourcentage arbitraire.
            </p>
          </div>
          {missingFields.length > 0 ? (
            <div className="text-right text-[11px] text-slate-600">
              <span className="font-semibold text-amber-700">Pour atteindre 100% :</span>{" "}
              {missingFields.slice(0, 3).join(", ")}
            </div>
          ) : (
            <div className="text-right text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Profil complet et attractif !
            </div>
          )}
        </div>

        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              completionPercent >= 80 ? "bg-emerald-500" : completionPercent >= 50 ? "bg-brand-600" : "bg-amber-500"
            }`}
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "info"
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <User className="w-4 h-4" />
          Informations du profil
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "social"
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          Réseau • Abonnés ({followers.length}) & Abonnements ({following.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("cv")}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "cv"
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          Mes CV & Documents ({cvList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("certificates")}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "certificates"
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Award className="w-4 h-4" />
          Attestations de fin de travaux & Références ({certificates.length})
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2.5 text-xs ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* 1. ONGLET INFORMATIONS DU PROFIL */}
      {activeTab === "info" && (
        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Nom complet *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Nom commercial / Entreprise (facultatif)
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Africom Digital SARL"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Titre professionnel / Métier recherché *
            </label>
            <input
              type="text"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Ex: Développeur Full-Stack, Comptable agréé, Designer UX/UI..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Pays de résidence *
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {ALL_COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Ville / Localité *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: Cotonou, Lomé, Dakar..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Téléphone professionnel
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+229 97 00 00 00"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Compétences clés */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Vos compétences & expertises clés
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Audit financier, React, Négociation commerciale..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-800 border border-brand-200 text-xs rounded-lg font-medium"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Bio / Présentation */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Présentation détaillée & Réalisations
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Présentez votre parcours, vos points forts, vos méthodologies de travail et vos réussites..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Enregistrer les modifications
            </button>
          </div>
        </form>
      )}

      {/* 2. ONGLET RÉSEAU : ABONNÉS & ABONNEMENTS (Section 5 du prompt) */}
      {activeTab === "social" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-600" />
                Réseau Professionnel AfriGain
              </h2>
              <p className="text-xs text-slate-500">
                Abonnés réels et abonnements actifs, certifiés sans chiffres factices.
              </p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSocialSubTab("followers")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  socialSubTab === "followers"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Abonnés ({followers.length})
              </button>
              <button
                type="button"
                onClick={() => setSocialSubTab("following")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  socialSubTab === "following"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Abonnements ({following.length})
              </button>
            </div>
          </div>

          {socialLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-600" />
              Chargement de votre réseau...
            </div>
          ) : socialSubTab === "followers" ? (
            followers.length === 0 ? (
              <div className="p-8 text-center max-w-sm mx-auto space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">0 abonné pour l&apos;instant</h3>
                <p className="text-xs text-slate-500">
                  Complétez votre profil et publiez des réalisations pour attirer des abonnés et des recruteurs.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {followers.map((f) => (
                  <div key={f.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-800 font-bold flex items-center justify-center shrink-0 text-xs">
                        {f.full_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <strong className="text-xs font-bold text-slate-900 block truncate">{f.full_name}</strong>
                        <span className="text-[11px] text-slate-500 block truncate">{f.headline}</span>
                        {f.city && <span className="text-[10px] text-slate-400 block">{f.city}, {f.country}</span>}
                      </div>
                    </div>
                    {f.id !== userId && (
                      <button
                        type="button"
                        onClick={() => handleToggleFollow(f)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                          f.is_following
                            ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            : "bg-brand-600 hover:bg-brand-700 text-white"
                        }`}
                      >
                        {f.is_following ? "Suivi" : "Suivre"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            following.length === 0 ? (
              <div className="p-8 text-center max-w-sm mx-auto space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">0 abonnement actif</h3>
                <p className="text-xs text-slate-500">
                  Découvrez des profils de freelances et entreprises certifiés sur AfriGain pour suivre leurs actualités.
                </p>
                <Link
                  href="/missions"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline pt-1"
                >
                  Explorer les profils et opportunités →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {following.map((f) => (
                  <div key={f.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-800 font-bold flex items-center justify-center shrink-0 text-xs">
                        {f.full_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <strong className="text-xs font-bold text-slate-900 block truncate">{f.full_name}</strong>
                        <span className="text-[11px] text-slate-500 block truncate">{f.headline}</span>
                        {f.city && <span className="text-[10px] text-slate-400 block">{f.city}, {f.country}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleFollow(f)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 shrink-0 transition-colors"
                    >
                      Se désabonner
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* 3. ONGLET GESTION DES CV (Section 6 du prompt) */}
      {activeTab === "cv" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" />
                Espace CV & Documents Professionnels
              </h2>
              <p className="text-xs text-slate-500">
                Téléversez votre CV PDF ou associez le CV rédigé avec l&apos;IA AfriGain.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/coach-ia"
                className="px-3 py-2 bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                Générateur de CV IA
              </Link>
              <input
                type="file"
                ref={cvFileInputRef}
                onChange={handleUploadCV}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => cvFileInputRef.current?.click()}
                disabled={uploadingCv}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Téléverser un CV (PDF)
              </button>
            </div>
          </div>

          {cvList.length === 0 ? (
            <div className="p-8 text-center max-w-sm mx-auto space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Aucun CV rattaché à votre profil</h3>
              <p className="text-xs text-slate-500">
                Téléversez votre fichier ou utilisez le Générateur Professionnel de CV d&apos;AfriGain pour en créer un gratuitement.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cvList.map((cv) => (
                <div
                  key={cv.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    cv.is_primary ? "border-brand-500 bg-brand-50/30 shadow-sm" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-bold text-slate-900">{cv.title}</strong>
                        {cv.is_primary && (
                          <span className="text-[10px] font-bold uppercase bg-brand-600 text-white px-2 py-0.5 rounded-full">
                            CV Principal
                          </span>
                        )}
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {cv.source === "afrigain_ai" ? "IA AfriGain" : "PDF Importé"}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Ajouté le {cv.created_at} • {cv.is_public ? "Visible par les recruteurs" : "Privé (invisible)"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {!cv.is_primary && (
                      <button
                        type="button"
                        onClick={() => setPrimaryCv(cv.id)}
                        className="px-2.5 py-1 text-slate-600 hover:text-brand-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium"
                      >
                        Définir comme principal
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleCvVisibility(cv.id)}
                      className={`p-1.5 rounded-lg text-xs font-medium ${
                        cv.is_public ? "text-emerald-700 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"
                      }`}
                      title={cv.is_public ? "Rendre privé" : "Rendre public"}
                    >
                      {cv.is_public ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </button>
                    {cv.file_url.startsWith("http") || cv.file_url.startsWith("blob:") ? (
                      <a
                        href={cv.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                        title="Voir ou télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    ) : (
                      <Link
                        href={cv.file_url}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                        title="Ouvrir dans le module IA"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteCv(cv.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. ONGLET ATTESTATIONS DE FIN DE TRAVAUX (Section 6 du prompt) */}
      {activeTab === "certificates" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-600" />
                Attestations de fin de travaux & Références
              </h2>
              <p className="text-xs text-slate-500">
                Prouvez la qualité de vos réalisations grâce aux attestations délivrées par vos clients et donneurs d&apos;ordre.
              </p>
            </div>
            {!isAddingCert && (
              <button
                type="button"
                onClick={() => setIsAddingCert(true)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter une attestation
              </button>
            )}
          </div>

          {/* Formulaire d'ajout d'attestation */}
          {isAddingCert && (
            <form onSubmit={handleAddCertificate} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Nouvelle Attestation de Réalisation
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingCert(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Intitulé de la mission ou prestation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Refonte complète du système de gestion des stocks"
                    value={certTitle}
                    onChange={(e) => setCertTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Client / Entreprise donneur d&apos;ordre *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Société Béninoise d'Agro-business (SOBEA)"
                    value={certClient}
                    onChange={(e) => setCertClient(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date d&apos;achèvement ou de livraison
                  </label>
                  <input
                    type="date"
                    value={certDate}
                    onChange={(e) => setCertDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Document justificatif (PDF ou scan d&apos;attestation)
                  </label>
                  <input
                    type="file"
                    ref={certFileInputRef}
                    onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description succincte des travaux réalisés & résultats
                </label>
                <textarea
                  rows={2}
                  placeholder="Détaillez les livrables remis, le budget ou l'impact opérationnel..."
                  value={certDesc}
                  onChange={(e) => setCertDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCert(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Enregistrer l&apos;attestation
                </button>
              </div>
            </form>
          )}

          {/* Liste des attestations */}
          {certificates.length === 0 ? (
            <div className="p-8 text-center max-w-sm mx-auto space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Aucune attestation enregistrée</h3>
              <p className="text-xs text-slate-500">
                Ajoutez les attestations de bonne fin d&apos;exécution signées par vos clients pour rassurer vos futurs partenaires commerciaux.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <strong className="text-xs font-bold text-slate-900 block">{cert.title}</strong>
                      <span className="text-[11px] text-brand-700 font-semibold block">Client : {cert.client_name}</span>
                      <span className="text-[10px] text-slate-400 block">Livré le {cert.completion_date}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteCertificate(cert.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {cert.description && (
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {cert.description}
                    </p>
                  )}

                  {cert.file_url && (
                    <a
                      href={cert.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:underline pt-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Consulter le document justificatif
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
