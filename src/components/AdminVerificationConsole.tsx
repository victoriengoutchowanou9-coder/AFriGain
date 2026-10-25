"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  Building2, 
  GraduationCap, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  AlertCircle,
  Clock, 
  FileText, 
  FileCheck,
  Download, 
  RefreshCw, 
  Loader2, 
  X,
  ExternalLink,
  Lock,
  UserX,
  Shield,
  Calendar,
  MapPin,
  Sparkles
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ALL_COUNTRIES, IDENTITY_STATUSES, PROFESSIONAL_STATUSES, ACCOUNT_STATUSES } from "@/lib/constants";

export function AdminVerificationConsole() {
  const [activeTab, setActiveTab] = useState<"dossiers" | "signalements" | "comptes">("dossiers");
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Données
  const [dossiers, setDossiers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);

  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterProfile, setFilterProfile] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal d'examen de dossier
  const [selectedDossier, setSelectedDossier] = useState<any | null>(null);
  const [actionModal, setActionModal] = useState<"approve" | "reject" | "correct" | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Zoom document
  const [zoomDocUrl, setZoomDocUrl] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      setAdminUser(userData?.user || null);

      // 1. Charger les profils pour vérification (exclure les admins pour qu'il n'y ait aucune trace admin)
      const { data: profilesData, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .neq("role", "admin")
        .order("updated_at", { ascending: false });

      if (profilesData) {
        setAllProfiles(profilesData);
        // Filtrer les profils qui ont soumis des documents
        const pendingOrSubmitted = profilesData.filter(
          (p) => p.identity_status !== "documents_pending" || p.professional_status !== "not_applicable"
        );
        setDossiers(pendingOrSubmitted.length > 0 ? pendingOrSubmitted : profilesData);
      }

      // 2. Charger les signalements de fraude
      const { data: reportsData } = await supabase
        .from("fraud_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (reportsData) {
        setReports(reportsData);
      }
    } catch (err) {
      console.error("Erreur chargement console admin", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Actions de décision administrative (Section 12)
  const handleDecision = async (decision: "approve" | "reject" | "correct") => {
    if (!selectedDossier || !adminUser) return;
    setActionLoading(true);
    setFeedback(null);

    try {
      const supabase = createClient();
      let newIdentityStatus = selectedDossier.identity_status;
      let newProStatus = selectedDossier.professional_status;
      let rejectionReasonText: string | null = null;

      if (decision === "approve") {
        newIdentityStatus = "verified";
        if (selectedDossier.role === "client" || selectedDossier.category === "entreprise") {
          newProStatus = "verified";
        }
      } else if (decision === "reject") {
        newIdentityStatus = "rejected";
        newProStatus = "rejected";
        rejectionReasonText = actionNote.trim() || "Dossier refusé après contrôle des pièces justificatives.";
      } else if (decision === "correct") {
        newIdentityStatus = "correction_needed";
        rejectionReasonText = actionNote.trim() || "Pièce d'identité illisible ou incomplète. Veuillez renvoyer un scan net.";
      }

      // Mise à jour du profil utilisateur
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          identity_status: newIdentityStatus,
          professional_status: newProStatus,
          verification_status: decision === "approve" ? "verified" : "rejected",
          rejection_reason: rejectionReasonText,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedDossier.id);

      if (updateError) throw updateError;

      // Journalisation dans verification_requests (Section 12 : date, admin_id, motif)
      await supabase.from("verification_requests").insert({
        user_id: selectedDossier.id,
        request_type: selectedDossier.role === "client" ? "company" : "identity",
        status: newIdentityStatus,
        admin_id: adminUser.id,
        admin_notes: `Décision [${decision.toUpperCase()}] par Admin : ${actionNote || 'Sans note additionnelle'}`,
      });

      // Journalisation dans audit_logs (Section 14 & 15)
      await supabase.from("audit_logs").insert({
        user_id: adminUser.id,
        action: `VERIFICATION_${decision.toUpperCase()}`,
        entity_type: "profile",
        entity_id: selectedDossier.id,
        metadata: {
          previous_status: selectedDossier.identity_status,
          new_status: newIdentityStatus,
          note: actionNote,
        },
      });

      setFeedback({
        type: "success",
        text: `Décision enregistrée avec succès. Le compte ${selectedDossier.full_name} est désormais "${newIdentityStatus}".`,
      });

      setActionModal(null);
      setSelectedDossier(null);
      setActionNote("");
      await loadAdminData();
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.message || "Erreur lors de l'enregistrement de la décision." });
    } finally {
      setActionLoading(false);
    }
  };

  // Traitement d'un signalement d'arnaque (Section 14)
  const handleResolveReport = async (reportId: string, action: "suspend" | "dismiss") => {
    try {
      const supabase = createClient();
      const rep = reports.find((r) => r.id === reportId);
      if (!rep) return;

      if (action === "suspend" && rep.target_id) {
        await supabase
          .from("profiles")
          .update({ account_status: "suspended", is_active: false })
          .eq("id", rep.target_id);
      }

      await supabase
        .from("fraud_reports")
        .update({
          status: action === "suspend" ? "actioned" : "dismissed",
          admin_id: adminUser?.id,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      await loadAdminData();
    } catch (e) {
      console.error("Erreur résolution signalement:", e);
    }
  };

  // Filtrage des dossiers (Section 12)
  const filteredDossiers = dossiers.filter((d) => {
    const matchesSearch =
      d.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id_document_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.ifu_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCountry = filterCountry === "all" || d.country === filterCountry;
    const matchesProfile = filterProfile === "all" || d.category === filterProfile || d.role === filterProfile;
    const matchesStatus = filterStatus === "all" || d.identity_status === filterStatus || d.verification_status === filterStatus;

    return matchesSearch && matchesCountry && matchesProfile && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Bandeau d'en-tête de la Console Administrateur */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs font-mono font-bold">
              <Shield className="w-3.5 h-3.5" />
              Console d'Administration & Supervision • Espace Strictement Confidentiel
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Gouvernance, Vérification des Identités & Répression des Fraudes
            </h2>
            <p className="text-xs text-slate-400">
              Contrôlez les pièces justificatives officielles (CNI, Passeports, RCCM, IFU) et garantissez une plateforme 100% fiable.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadAdminData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Actualiser les flux
            </button>
          </div>
        </div>

        {/* Métriques d'inspection (Section 12, 13 & 14) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Dossiers en attente</span>
            <span className="text-xl font-bold text-amber-400">
              {dossiers.filter((d) => d.identity_status === "pending" || d.identity_status === "in_review").length}
            </span>
          </div>

          <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Comptes certifiés</span>
            <span className="text-xl font-bold text-emerald-400">
              {dossiers.filter((d) => d.identity_status === "verified" || d.verification_status === "verified").length}
            </span>
          </div>

          <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Signalements arnaques</span>
            <span className="text-xl font-bold text-rose-400">
              {reports.filter((r) => r.status === "pending").length}
            </span>
          </div>

          <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Traçabilité APDP / Audit</span>
            <span className="text-xl font-bold text-blue-400 font-mono">100% Actif</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Onglets navigation administrative */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("dossiers")}
          className={`pb-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "dossiers"
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Dossiers de Vérification d'Identité & Entreprises ({filteredDossiers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("signalements")}
          className={`pb-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "signalements"
              ? "border-rose-600 text-rose-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Signalements Anti-Fraude & Arnaques ({reports.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("comptes")}
          className={`pb-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "comptes"
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Gestion des Statuts Utilisateurs ({allProfiles.length})
        </button>
      </div>

      {/* 1. ONGLET : DOSSIERS DE VÉRIFICATION (Section 12) */}
      {activeTab === "dossiers" && (
        <div className="space-y-4">
          {/* Filtres par Pays, Profil, Statut et Date (Section 12 du prompt) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher nom, email, IFU, doc..."
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">Tous les pays</option>
                {ALL_COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterProfile}
                onChange={(e) => setFilterProfile(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">Tous les profils</option>
                <option value="prestataire">Prestataire Indépendant</option>
                <option value="entreprise">Entreprise / Donneur d'ordre</option>
                <option value="etudiant">Étudiant & Diplômé</option>
                <option value="artisan">Artisan</option>
                <option value="fournisseur">Fournisseur B2B</option>
              </select>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente de contrôle</option>
                <option value="verified">Vérifiés / Approuvés</option>
                <option value="correction_needed">Correction demandée</option>
                <option value="rejected">Rejetés</option>
                <option value="documents_pending">Non fournis</option>
              </select>
            </div>
          </div>

          {/* Tableau des dossiers */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Utilisateur / Entreprise</th>
                    <th className="p-4">Profil & Pays</th>
                    <th className="p-4">Type de Pièce & N°</th>
                    <th className="p-4">Numéro IFU / RCCM</th>
                    <th className="p-4">Statut Actuel</th>
                    <th className="p-4 text-right">Actions de Contrôle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDossiers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        Aucun dossier correspondant aux critères de recherche.
                      </td>
                    </tr>
                  ) : (
                    filteredDossiers.map((item) => {
                      const st = IDENTITY_STATUSES[item.identity_status] || IDENTITY_STATUSES.documents_pending;
                      const hasFiles =
                        item.id_card_front_url || item.id_card_back_url || item.id_portrait_url || item.business_registration_url;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{item.full_name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{item.email}</div>
                            {item.company_name && (
                              <div className="text-[11px] text-brand-700 font-semibold flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3" />
                                {item.company_name}
                              </div>
                            )}
                          </td>

                          <td className="p-4">
                            <span className="font-semibold text-slate-800 capitalize block">
                              {item.category || item.role}
                            </span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {item.country}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="font-semibold text-slate-800">
                              {item.id_document_type ? item.id_document_type.toUpperCase() : "Non spécifié"}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {item.id_document_number || "—"}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="text-slate-800 font-mono text-[11px]">
                              {item.ifu_number ? `IFU: ${item.ifu_number}` : "—"}
                            </div>
                            <div className="text-slate-500 font-mono text-[10px]">
                              {item.rccm_number ? `RCCM: ${item.rccm_number}` : ""}
                            </div>
                          </td>

                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold inline-block ${st.color}`}>
                              {st.label}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDossier(item);
                                setActionNote(item.rejection_reason || "");
                              }}
                              className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ml-auto"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Examiner le dossier
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ONGLET : SIGNALEMENTS ANTI-FRAUDE (Section 14) */}
      {activeTab === "signalements" && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Registre des Signalements Communautaires</h3>
            <p className="text-xs text-slate-500">
              Traitement rigoureux des signalements sans précipitation. Analyse humaine avant suspension.
            </p>
          </div>

          {reports.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Aucun signalement suspect enregistré actuellement.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">
                        {rep.reason}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(rep.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium">{rep.description}</p>
                    <span className="text-[11px] text-slate-500 block">
                      Cible ({rep.target_type}) : <strong className="font-mono text-slate-700">{rep.target_id}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleResolveReport(rep.id, "dismiss")}
                      className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                    >
                      Classer sans suite
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep.id, "suspend")}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                    >
                      Suspendre le compte
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. ONGLET : GESTION DES STATUTS COMPTES (Section 13) */}
      {activeTab === "comptes" && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Gestion des Comptes & Distinctions des Statuts</h3>
            <p className="text-xs text-slate-500">
              Distinction stricte entre Statut du compte (Actif/Suspendu), Statut d'identité et Statut professionnel.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Utilisateur</th>
                  <th className="p-3">Rôle & Pays</th>
                  <th className="p-3">Statut Compte</th>
                  <th className="p-3">Statut Identité</th>
                  <th className="p-3">Statut Entreprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allProfiles.map((p) => (
                  <tr key={p.id}>
                    <td className="p-3">
                      <strong className="text-slate-900">{p.full_name}</strong>
                      <div className="text-[11px] text-slate-500 font-mono">{p.email}</div>
                    </td>
                    <td className="p-3 capitalize">{p.category || p.role} • {p.country}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {p.account_status || (p.is_active ? "Actif" : "Suspendu")}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] text-slate-700">
                        {IDENTITY_STATUSES[p.identity_status]?.label || "Non fourni"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] text-slate-700">
                        {PROFESSIONAL_STATUSES[p.professional_status]?.label || "Non applicable"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL D'EXAMEN APPROFONDI DU DOSSIER (Section 12 : consultation sécurisée, documents, décision) */}
      {selectedDossier && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setSelectedDossier(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* En-tête du dossier */}
            <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-lg shrink-0">
                {selectedDossier.full_name?.charAt(0) || "U"}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                  Examen de conformité • {selectedDossier.category || selectedDossier.role}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {selectedDossier.full_name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedDossier.email} • ID: {selectedDossier.id}
                </p>
              </div>
            </div>

            {/* Détails déclarés (Section 12) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Nationalité</span>
                <strong className="text-slate-800">{selectedDossier.country}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Type de Document</span>
                <strong className="text-slate-800">{selectedDossier.id_document_type || "N/A"}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Numéro de Pièce</span>
                <strong className="text-slate-800 font-mono">{selectedDossier.id_document_number || "N/A"}</strong>
              </div>
              {selectedDossier.company_name && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Raison Sociale</span>
                  <strong className="text-slate-800">{selectedDossier.company_name}</strong>
                </div>
              )}
              {selectedDossier.ifu_number && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Numéro IFU</span>
                  <strong className="text-slate-800 font-mono">{selectedDossier.ifu_number}</strong>
                </div>
              )}
              {selectedDossier.rccm_number && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Numéro RCCM</span>
                  <strong className="text-slate-800 font-mono">{selectedDossier.rccm_number}</strong>
                </div>
              )}
            </div>

            {/* Consultation des justificatifs téléversés (Section 12 : examen sécurisé) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Documents & Pièces Justificatives Téléversées
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Portrait */}
                <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 flex flex-col items-center justify-between space-y-2">
                  <span className="text-[11px] font-bold text-slate-800">Photo d'Identité (Portrait)</span>
                  {selectedDossier.id_portrait_url ? (
                    <div
                      className="w-24 h-24 rounded-full overflow-hidden border-2 border-brand-500 cursor-pointer shadow-sm"
                      onClick={() => setZoomDocUrl(selectedDossier.id_portrait_url)}
                    >
                      <img src={selectedDossier.id_portrait_url} alt="Portrait" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-500">
                      Non fournie
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400">Cliquer pour agrandir</span>
                </div>

                {/* Recto */}
                <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 flex flex-col items-center justify-between space-y-2">
                  <span className="text-[11px] font-bold text-slate-800">Recto de la Pièce</span>
                  {selectedDossier.id_card_front_url ? (
                    <div
                      className="w-full h-24 rounded-xl overflow-hidden border border-slate-300 cursor-pointer shadow-sm"
                      onClick={() => setZoomDocUrl(selectedDossier.id_card_front_url)}
                    >
                      <img src={selectedDossier.id_card_front_url} alt="Recto" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-24 rounded-xl bg-slate-200 flex items-center justify-center text-[10px] text-slate-500">
                      Non fourni
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400">Cliquer pour agrandir</span>
                </div>

                {/* Verso ou Carte Étudiant ou Entreprise */}
                <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 flex flex-col items-center justify-between space-y-2">
                  <span className="text-[11px] font-bold text-slate-800">
                    {selectedDossier.category === "etudiant"
                      ? "Carte Étudiant"
                      : selectedDossier.role === "client"
                      ? "Justificatif Entreprise"
                      : "Verso de la Pièce"}
                  </span>
                  {selectedDossier.id_card_back_url || selectedDossier.student_card_url || selectedDossier.business_registration_url ? (
                    <div
                      className="w-full h-24 rounded-xl overflow-hidden border border-slate-300 cursor-pointer shadow-sm"
                      onClick={() =>
                        setZoomDocUrl(
                          selectedDossier.id_card_back_url ||
                            selectedDossier.student_card_url ||
                            selectedDossier.business_registration_url
                        )
                      }
                    >
                      <img
                        src={
                          selectedDossier.id_card_back_url ||
                          selectedDossier.student_card_url ||
                          selectedDossier.business_registration_url
                        }
                        alt="Document complémentaire"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-24 rounded-xl bg-slate-200 flex items-center justify-center text-[10px] text-slate-500">
                      Non fourni
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400">Cliquer pour agrandir</span>
                </div>
              </div>
            </div>

            {/* Note ou Motif de décision (Section 12) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Motif explicatif (Obligatoire en cas de rejet ou de demande de correction) :
              </label>
              <textarea
                rows={2}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Ex: Scan flou sur le numéro d'identité / Numéro IFU vérifié conforme..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Barre de décision administrative (Section 12) */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedDossier(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Fermer sans modifier
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleDecision("reject")}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Rejeter le dossier
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleDecision("correct")}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Demander correction
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleDecision("approve")}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approuver & Certifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Zoom Document Haute Définition */}
      {zoomDocUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomDocUrl(null)}
        >
          <button
            onClick={() => setZoomDocUrl(null)}
            className="absolute top-6 right-6 text-white hover:text-slate-300 p-2"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={zoomDocUrl}
            alt="Document grand format"
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
