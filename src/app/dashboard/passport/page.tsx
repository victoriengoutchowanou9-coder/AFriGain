"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Share2, 
  Printer, 
  Plus, 
  Briefcase, 
  GraduationCap, 
  Star, 
  Sparkles, 
  Clock, 
  Globe2, 
  User, 
  FileText, 
  ArrowLeft,
  X,
  Loader2,
  Lock,
  Layers
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Credential {
  id: string;
  type: "declared_skill" | "evaluated_skill" | "confirmed_experience" | "verified_certification" | "portfolio_item";
  title: string;
  issuerOrVerifier: string;
  verificationLevel: 1 | 2 | 3 | 4 | 5;
  issueDate: string;
  description?: string;
}

const LEVEL_CONFIG = {
  1: { label: "Niveau 1 : Déclaré par l'utilisateur", color: "bg-slate-100 text-slate-700 border-slate-300" },
  2: { label: "Niveau 2 : Documenté par justificatif", color: "bg-blue-100 text-blue-800 border-blue-300" },
  3: { label: "Niveau 3 : Évalué & Validé", color: "bg-amber-100 text-amber-800 border-amber-300" },
  4: { label: "Niveau 4 : Confirmé par un tiers", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  5: { label: "Niveau 5 : Certification Officielle Vérifiée", color: "bg-purple-100 text-purple-900 border-purple-300" },
};

export default function PassportPage() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState(false);

  // Modale ajouter une compétence / expérience
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [credType, setCredType] = useState<Credential["type"]>("declared_skill");
  const [credTitle, setCredTitle] = useState("");
  const [credIssuer, setCredIssuer] = useState("");
  const [credDescription, setCredDescription] = useState("");

  useEffect(() => {
    async function loadPassport() {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          setLoading(false);
          return;
        }

        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userData.user.id)
          .single();

        if (prof) {
          setUserProfile(prof);

          // Construire le passeport à partir des données réelles du profil
          const built: Credential[] = [];

          // 1. Compétences déclarées
          if (Array.isArray(prof.skills)) {
            prof.skills.forEach((s: string, idx: number) => {
              built.push({
                id: `skill-${idx}`,
                type: "declared_skill",
                title: s,
                issuerOrVerifier: "Déclaré par l'utilisateur",
                verificationLevel: 1,
                issueDate: new Date(prof.created_at || Date.now()).toLocaleDateString("fr-FR"),
                description: "Compétence choisie et enregistrée lors du parcours AfriGain.",
              });
            });
          }

          // 2. Statut d'identité documenté
          if (prof.identity_status === "verified") {
            built.push({
              id: "id-verified",
              type: "verified_certification",
              title: "Identité Officielle & Compte Certifié",
              issuerOrVerifier: "Équipe de Vérification AfriGain",
              verificationLevel: 5,
              issueDate: new Date(prof.updated_at || Date.now()).toLocaleDateString("fr-FR"),
              description: "Pièce d'identité officielle contrôlée et validée avec succès.",
            });
          } else if (prof.identity_status === "in_review") {
            built.push({
              id: "id-review",
              type: "declared_skill",
              title: "Pièce d'identité en cours d'examen",
              issuerOrVerifier: "Contrôle en cours",
              verificationLevel: 2,
              issueDate: new Date().toLocaleDateString("fr-FR"),
              description: "Dossier soumis, examen par l'administration en attente.",
            });
          }

          // 3. Missions réalisées vérifiées
          if (prof.completed_missions_count && prof.completed_missions_count > 0) {
            built.push({
              id: "missions-count",
              type: "confirmed_experience",
              title: `${prof.completed_missions_count} mission(s) professionnelle(s) achevée(s)`,
              issuerOrVerifier: "Donneurs d'ordre & Clients vérifiés",
              verificationLevel: 4,
              issueDate: new Date(prof.updated_at || Date.now()).toLocaleDateString("fr-FR"),
              description: `Missions clôturées avec une note moyenne de ${prof.average_rating || 5.0}/5.`,
            });
          }

          setCredentials(built);
        }
      } catch (err) {
        console.error("Erreur de chargement du passeport:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPassport();
  }, []);

  const handleAddCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credTitle.trim()) return;

    const newCred: Credential = {
      id: `custom-${Date.now()}`,
      type: credType,
      title: credTitle.trim(),
      issuerOrVerifier: credIssuer.trim() || "Auto-déclaré",
      verificationLevel: credType === "verified_certification" ? 3 : credType === "confirmed_experience" ? 2 : 1,
      issueDate: new Date().toLocaleDateString("fr-FR"),
      description: credDescription.trim(),
    };

    setCredentials([newCred, ...credentials]);
    setIsAddModalOpen(false);
    setCredTitle("");
    setCredIssuer("");
    setCredDescription("");
  };

  const handleShareLink = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/services?search=${encodeURIComponent(userProfile?.full_name || "")}`;
      navigator.clipboard.writeText(shareUrl);
      setCopyLinkSuccess(true);
      setTimeout(() => setCopyLinkSuccess(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        <span className="text-sm text-slate-500 font-medium">Génération de votre Passeport AfriGain...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 print:p-0 print:space-y-4">
      {/* Barre de retour et actions d'export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 print:hidden">
        <div>
          <Link
            href="/dashboard"
            className="text-xs text-slate-500 hover:text-brand-600 inline-flex items-center gap-1 mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Retour à mon espace
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Award className="w-7 h-7 text-brand-600" />
            AfriGain Passport Professionnel
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Passeport professionnel évolutif certifiant vos compétences, vos réalisations et votre parcours.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleShareLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            {copyLinkSuccess ? "Lien copié !" : "Partager"}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Carte Principale du Passeport */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 print:border-none print:shadow-none">
        {/* En-tête du Passeport */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {userProfile?.full_name?.substring(0, 2).toUpperCase() || "AG"}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{userProfile?.full_name || "Professionnel AfriGain"}</h2>
              <p className="text-xs text-brand-700 font-semibold">{userProfile?.headline || "Prestataire & Entrepreneur Vérifié"}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                  {userProfile?.city || "Cotonou"}, {userProfile?.country || "Bénin"}
                </span>
                <span>•</span>
                <span className="font-mono text-[11px]">ID : {userProfile?.id?.substring(0, 8)}...</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 self-start sm:self-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {userProfile?.identity_status === "verified" ? "Identité Validée" : "Vérification en cours"}
            </div>
            <span className="text-[10px] text-slate-400">Passeport Panafricain AfriGain</span>
          </div>
        </div>

        {/* Note d'intégrité & Niveaux de vérification (Section 4.3 du PDF) */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-600" />
            Transparence & Niveaux de Vérification AfriGain
          </span>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Pour garantir une confiance totale aux employeurs et partenaires, chaque élément de ce passeport indique son niveau de vérification réel : déclaré par l'utilisateur, documenté, évalué ou certifié par un tiers.
          </p>
        </div>

        {/* Liste des Éléments du Passeport */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
              Attestations, Compétences & Réalisations ({credentials.length})
            </h3>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 print:hidden"
            >
              <Plus className="w-3.5 h-3.5" /> Ajouter une attestation
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {credentials.map((cred) => {
              const cfg = LEVEL_CONFIG[cred.verificationLevel];
              return (
                <div key={cred.id} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{cred.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    {cred.description && (
                      <p className="text-xs text-slate-600">{cred.description}</p>
                    )}
                    <div className="text-[11px] text-slate-400">
                      Émetteur / Source : <strong className="text-slate-600">{cred.issuerOrVerifier}</strong> • Date : {cred.issueDate}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Vérifiable
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pied du Passeport imprimé */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>AfriGain Passport • Plateforme Panafricaine d'Opportunités Économiques</span>
          <span>Délivré en ligne de manière sécurisée</span>
        </div>
      </div>

      {/* Modale Ajouter un justificatif */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Ajouter une attestation au passeport</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCredential} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Type d'élément</label>
                <select
                  value={credType}
                  onChange={(e) => setCredType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="declared_skill">Compétence déclarée (Niveau 1)</option>
                  <option value="confirmed_experience">Expérience / Mission achevée (Niveau 2-4)</option>
                  <option value="verified_certification">Diplôme ou Certification (Niveau 3-5)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Titre / Intitulé *</label>
                <input
                  type="text"
                  required
                  value={credTitle}
                  onChange={(e) => setCredTitle(e.target.value)}
                  placeholder="Ex: Certificat de gestion comptable SYSCOHADA"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Organisme émetteur / Entreprise cliente</label>
                <input
                  type="text"
                  value={credIssuer}
                  onChange={(e) => setCredIssuer(e.target.value)}
                  placeholder="Ex: Cabinet Audit Afrique ou Nom client"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={credDescription}
                  onChange={(e) => setCredDescription(e.target.value)}
                  placeholder="Précisez le contexte ou les livrables..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Ajouter au passeport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
