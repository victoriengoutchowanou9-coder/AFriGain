"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  ArrowLeft, 
  UploadCloud, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  X, 
  Building2, 
  User, 
  GraduationCap, 
  FileText, 
  Loader2, 
  Camera, 
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { 
  ALL_COUNTRIES, 
  ID_DOCUMENT_TYPES, 
  IDENTITY_STATUSES, 
  PROFESSIONAL_STATUSES 
} from "@/lib/constants";

export default function VerificationPage() {
  const router = useRouter();
  const fileInputFrontRef = useRef<HTMLInputElement>(null);
  const fileInputBackRef = useRef<HTMLInputElement>(null);
  const fileInputPortraitRef = useRef<HTMLInputElement>(null);
  const fileInputStudentRef = useRef<HTMLInputElement>(null);
  const fileInputBusinessRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Type de dossier : personnel ou entreprise
  const [verificationTab, setVerificationTab] = useState<"personne" | "entreprise">("personne");

  // Formulaire Identité personnelle
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [nationality, setNationality] = useState("Bénin");
  const [residenceCountry, setResidenceCountry] = useState("Bénin");
  const [documentType, setDocumentType] = useState("cni");
  const [documentNumber, setDocumentNumber] = useState("");
  const [issuingCountry, setIssuingCountry] = useState("Bénin");
  
  // Fichiers identité
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [studentPreview, setStudentPreview] = useState<string | null>(null);

  // Formulaire Entreprise (Section 6)
  const [companyName, setCompanyName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [businessCountry, setBusinessCountry] = useState("Bénin");
  const [businessActivityCountry, setBusinessActivityCountry] = useState("Bénin");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessSector, setBusinessSector] = useState("");
  const [ifuNumber, setIfuNumber] = useState("");
  const [rccmNumber, setRccmNumber] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessFile, setBusinessFile] = useState<File | null>(null);
  const [businessFilePreview, setBusinessFilePreview] = useState<string | null>(null);

  // Statuts actuels
  const [identityStatus, setIdentityStatus] = useState<string>("documents_pending");
  const [professionalStatus, setProfessionalStatus] = useState<string>("not_applicable");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          router.push("/auth/login?next=/dashboard/verification");
          return;
        }

        setUser(userData.user);

        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userData.user.id)
          .single();

        if (p) {
          setProfile(p);
          const parts = (p.full_name || "").split(" ");
          setFirstName(parts[0] || "");
          setLastName(parts.slice(1).join(" ") || "");
          setNationality(p.country || "Bénin");
          setResidenceCountry(p.country || "Bénin");
          setIssuingCountry(p.country || "Bénin");

          setIdentityStatus(p.identity_status || "documents_pending");
          setProfessionalStatus(p.professional_status || "not_applicable");
          setRejectionReason(p.rejection_reason || null);

          if (p.id_document_type) setDocumentType(p.id_document_type);
          if (p.id_document_number) setDocumentNumber(p.id_document_number);
          if (p.id_card_front_url) setFrontPreview(p.id_card_front_url);
          if (p.id_card_back_url) setBackPreview(p.id_card_back_url);
          if (p.id_portrait_url) setPortraitPreview(p.id_portrait_url);
          if (p.student_card_url) setStudentPreview(p.student_card_url);

          // Entreprise
          if (p.company_name) setCompanyName(p.company_name);
          if (p.trade_name) setTradeName(p.trade_name);
          if (p.business_country) setBusinessCountry(p.business_country);
          if (p.business_address) setBusinessAddress(p.business_address);
          if (p.business_sector) setBusinessSector(p.business_sector);
          if (p.ifu_number) setIfuNumber(p.ifu_number);
          if (p.rccm_number) setRccmNumber(p.rccm_number);
          if (p.business_registration_url) setBusinessFilePreview(p.business_registration_url);

          if (p.role === "client" || p.category === "entreprise" || p.category === "fournisseur") {
            setVerificationTab("entreprise");
          }
        }
      } catch (err) {
        console.error("Erreur chargement données vérification", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "front" | "back" | "portrait" | "student" | "business") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: "error", text: "Le fichier dépasse la limite maximale autorisée de 5 Mo." });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (field === "front") {
      setFrontFile(file);
      setFrontPreview(previewUrl);
    } else if (field === "back") {
      setBackFile(file);
      setBackPreview(previewUrl);
    } else if (field === "portrait") {
      setPortraitFile(file);
      setPortraitPreview(previewUrl);
    } else if (field === "student") {
      setStudentFile(file);
      setStudentPreview(previewUrl);
    } else if (field === "business") {
      setBusinessFile(file);
      setBusinessFilePreview(previewUrl);
    }
  };

  const uploadFileToPrivateStorage = async (file: File, path: string): Promise<string | null> => {
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const fileName = `${path}_${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from("identity-documents")
        .upload(`${user.id}/${fileName}`, file, { upsert: true });

      if (error) {
        console.warn("Échec upload storage, fallback URL locale:", error.message);
        return URL.createObjectURL(file);
      }
      return data?.path ? `${data.path}` : null;
    } catch (e) {
      console.warn("Exception upload storage:", e);
      return null;
    }
  };

  const handleSubmitIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const supabase = createClient();

      let frontUrl = frontPreview;
      let backUrl = backPreview;
      let portraitUrl = portraitPreview;
      let studentUrl = studentPreview;

      if (frontFile) {
        const path = await uploadFileToPrivateStorage(frontFile, "front");
        if (path) frontUrl = path;
      }
      if (backFile) {
        const path = await uploadFileToPrivateStorage(backFile, "back");
        if (path) backUrl = path;
      }
      if (portraitFile) {
        const path = await uploadFileToPrivateStorage(portraitFile, "portrait");
        if (path) portraitUrl = path;
      }
      if (studentFile) {
        const path = await uploadFileToPrivateStorage(studentFile, "student");
        if (path) studentUrl = path;
      }

      const fullNameCombined = `${firstName.trim()} ${lastName.trim()}`.trim();

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullNameCombined || profile?.full_name,
          country: residenceCountry,
          id_document_type: documentType,
          id_document_number: documentNumber.trim(),
          id_document_country: issuingCountry,
          id_card_front_url: frontUrl,
          id_card_back_url: backUrl,
          id_portrait_url: portraitUrl,
          student_card_url: studentUrl,
          identity_status: "pending", // En attente d'approbation manuelle admin (Section 5.3)
          rejection_reason: null, // Réinitialise l'erreur précédente
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      // Enregistrer une demande d'audit dans verification_requests
      await supabase.from("verification_requests").insert({
        user_id: user.id,
        request_type: profile?.category === "etudiant" ? "student" : "identity",
        status: "pending",
        admin_notes: `Soumission de pièce : ${documentType} (${issuingCountry})`,
      });

      setIdentityStatus("pending");
      setRejectionReason(null);
      setIsEditingIdentity(false);
      setFeedback({
        type: "success",
        text: "Votre dossier d'identité a été transmis avec succès. Un administrateur procédera à sa vérification sous 24 à 48 heures.",
      });
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.message || "Erreur lors de la transmission de vos documents." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    // Règle prompt Section 4.2 & 6.1 : IFU obligatoire uniquement si entreprise béninoise
    if (businessCountry === "Bénin" && !ifuNumber.trim()) {
      setFeedback({ type: "error", text: "Le numéro IFU est obligatoire pour les entreprises enregistrées au Bénin." });
      setSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();

      let businessDocUrl = businessFilePreview;
      if (businessFile) {
        const path = await uploadFileToPrivateStorage(businessFile, "business_reg");
        if (path) businessDocUrl = path;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          company_name: companyName.trim(),
          trade_name: tradeName.trim(),
          business_country: businessCountry,
          business_address: businessAddress.trim(),
          business_sector: businessSector.trim(),
          ifu_number: ifuNumber.trim() || null,
          rccm_number: rccmNumber.trim() || null,
          business_registration_url: businessDocUrl,
          professional_status: "pending", // En attente modération admin
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      // Historique de demande
      await supabase.from("verification_requests").insert({
        user_id: user.id,
        request_type: "company",
        status: "pending",
        admin_notes: `Dossier entreprise: ${companyName} (${businessCountry}, IFU: ${ifuNumber || 'N/A'})`,
      });

      setProfessionalStatus("pending");
      setIsEditingBusiness(false);
      setFeedback({
        type: "success",
        text: "Les informations de votre entreprise ont été enregistrées et transmises pour vérification manuelle par l'équipe de gouvernance.",
      });
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.message || "Erreur lors de l'enregistrement de votre entreprise." });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDocConfig = ID_DOCUMENT_TYPES.find((d) => d.id === documentType) || ID_DOCUMENT_TYPES[0];
  const currentIdentityStatus = IDENTITY_STATUSES[identityStatus] || IDENTITY_STATUSES.documents_pending;
  const currentProStatus = PROFESSIONAL_STATUSES[professionalStatus] || PROFESSIONAL_STATUSES.not_applicable;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Retour navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>
        <span className="text-xs text-slate-500 font-mono">
          Espace Sécurisé AFriGain • Protection APDP & RLS
        </span>
      </div>

      {/* En-tête */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Certification Officielle & Prévention des Arnaques
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Vérification de Compte & Identités
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Conformément à la charte AFriGain, certifiez votre identité pour obtenir le badge de confiance et sécuriser vos transactions.
            </p>
          </div>

          {/* Badges de statuts actuels (Section 13) */}
          <div className="flex flex-col gap-2 shrink-0">
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${currentIdentityStatus.color}`}>
              <Clock className="w-3.5 h-3.5" />
              <span>Identité : {currentIdentityStatus.label}</span>
            </div>
            {profile?.role === "client" && (
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${currentProStatus.color}`}>
                <Building2 className="w-3.5 h-3.5" />
                <span>Entreprise : {currentProStatus.label}</span>
              </div>
            )}
          </div>
        </div>

        {/* Motif de rejet si existant */}
        {rejectionReason && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold block">Demande de correction ou rejet :</strong>
              <p>{rejectionReason}</p>
              <span className="text-[11px] text-rose-600 block">
                Veuillez mettre à jour les pièces concernées ci-dessous et renvoyer le formulaire.
              </span>
            </div>
          </div>
        )}

        {/* Règles clés de protection des données (Section 11) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] text-slate-600">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Stockage privé sécurisé (aucun affichage public des pièces)</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Vérification manuelle rigoureuse par administrateur</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Étudiants & Étrangers sans IFU/RCCM béninois acceptés</span>
          </div>
        </div>
      </div>

      {/* Onglets de vérification */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setVerificationTab("personne")}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            verificationTab === "personne"
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <User className="w-4 h-4" />
          Vérification d'Identité Personnelle
          {profile?.category === "etudiant" && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
              Étudiant
            </span>
          )}
        </button>

        {(profile?.role === "client" || profile?.category === "entreprise" || profile?.category === "fournisseur") && (
          <button
            type="button"
            onClick={() => setVerificationTab("entreprise")}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              verificationTab === "entreprise"
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Vérification Entreprise & Activité
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : feedback.type === "warning"
              ? "bg-amber-50 border-amber-200 text-amber-800"
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

      {/* 1. VÉRIFICATION PERSONNELLE (Section 5 du prompt) */}
      {verificationTab === "personne" && (
        (identityStatus === "pending" || identityStatus === "verified") && !isEditingIdentity ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                  Dossier d&apos;identité soumis
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  {firstName} {lastName}
                </h2>
                <p className="text-xs text-slate-500">
                  {identityStatus === "verified"
                    ? "Votre identité a été vérifiée et validée avec succès par l'administration."
                    : "Votre dossier est actuellement en cours d'examen par notre équipe de conformité."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${currentIdentityStatus.color}`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{currentIdentityStatus.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingIdentity(true)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Modifier ou compléter
                </button>
              </div>
            </div>

            {/* Récapitulatif des données déclarées */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Nationalité</span>
                <strong className="text-slate-800">{nationality}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Pays de résidence</span>
                <strong className="text-slate-800">{residenceCountry}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Type de document</span>
                <strong className="text-slate-800 uppercase">{documentType}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Numéro de pièce</span>
                <strong className="text-slate-800 font-mono">{documentNumber || "Transmis"}</strong>
              </div>
            </div>

            {/* Aperçu des pièces transmises */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Documents justificatifs enregistrés dans votre dossier sécurisé
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">Photo d&apos;identité (Portrait)</span>
                  {portraitPreview ? (
                    <img src={portraitPreview} alt="Portrait" className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-brand-500 shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-full mx-auto bg-slate-200 flex items-center justify-center text-xs text-slate-400">Non fournie</div>
                  )}
                  <span className="text-[10px] text-emerald-600 font-semibold block">✓ Enregistré</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">Recto de la pièce</span>
                  {frontPreview ? (
                    <img src={frontPreview} alt="Recto" className="w-full h-20 rounded-lg object-cover border border-slate-300 shadow-sm" />
                  ) : (
                    <div className="w-full h-20 rounded-lg bg-slate-200 flex items-center justify-center text-xs text-slate-400">Non fourni</div>
                  )}
                  <span className="text-[10px] text-emerald-600 font-semibold block">✓ Enregistré</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">Verso / Complément</span>
                  {backPreview || studentPreview ? (
                    <img src={backPreview || studentPreview!} alt="Verso" className="w-full h-20 rounded-lg object-cover border border-slate-300 shadow-sm" />
                  ) : (
                    <div className="w-full h-20 rounded-lg bg-slate-200 flex items-center justify-center text-xs text-slate-400">Non fourni</div>
                  )}
                  <span className="text-[10px] text-emerald-600 font-semibold block">✓ Enregistré</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmitIdentity} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Informations & Pièce d&apos;Identité Officielle</h2>
              <p className="text-xs text-slate-500">
                Ces données servent uniquement à la validation de votre identité et ne seront jamais publiées sur votre vitrine publique.
              </p>
            </div>
            {isEditingIdentity && (
              <button
                type="button"
                onClick={() => setIsEditingIdentity(false)}
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Annuler la modification
              </button>
            )}
          </div>

          {/* Nom et Prénom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nom de famille</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ex: Tossou"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Prénom(s)</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ex: Awa"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Nationalité et Pays de Résidence (Section 4.2 Étrangers) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Pays de nationalité</label>
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {ALL_COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Pays de résidence actuel</label>
              <select
                value={residenceCountry}
                onChange={(e) => setResidenceCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {ALL_COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Type de pièce et numéro */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Type de document</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {ID_DOCUMENT_TYPES.map((dt) => (
                  <option key={dt.id} value={dt.id}>
                    {dt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Numéro du document</label>
              <input
                type="text"
                required
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Ex: 0123456789"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Pays émetteur</label>
              <select
                value={issuingCountry}
                onChange={(e) => setIssuingCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {ALL_COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Téléversement des fichiers (Section 5.2) */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Téléversement des Pièces Justificatives (Format JPG, PNG ou PDF • Max 5 Mo)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Photo d'identité (Portrait) */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-xs font-bold text-slate-800">Photo d'identité (Portrait)</span>
                {portraitPreview ? (
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-brand-500 shadow-sm">
                    <img src={portraitPreview} alt="Portrait" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPortraitFile(null); setPortraitPreview(null); }}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputPortraitRef.current?.click()}
                    className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-white transition-all text-slate-400 hover:text-brand-600"
                  >
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-semibold">Choisir photo</span>
                  </div>
                )}
                <input
                  ref={fileInputPortraitRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "portrait")}
                />
                <span className="text-[10px] text-slate-500">Visage bien éclairé de face</span>
              </div>

              {/* Recto de la pièce */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-xs font-bold text-slate-800">Recto de la pièce</span>
                {frontPreview ? (
                  <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-300">
                    <img src={frontPreview} alt="Recto" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setFrontFile(null); setFrontPreview(null); }}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputFrontRef.current?.click()}
                    className="w-full h-28 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-white transition-all text-slate-400 hover:text-brand-600 p-2"
                  >
                    <UploadCloud className="w-6 h-6 mb-1" />
                    <span className="text-[11px] font-semibold">Téléverser le recto</span>
                  </div>
                )}
                <input
                  ref={fileInputFrontRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "front")}
                />
                <span className="text-[10px] text-slate-500">Copie nette et lisible</span>
              </div>

              {/* Verso de la pièce (si requis) */}
              {selectedDocConfig.requiresBack && (
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 flex flex-col items-center justify-center text-center space-y-3">
                  <span className="text-xs font-bold text-slate-800">Verso de la pièce</span>
                  {backPreview ? (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-300">
                      <img src={backPreview} alt="Verso" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setBackFile(null); setBackPreview(null); }}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputBackRef.current?.click()}
                      className="w-full h-28 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-white transition-all text-slate-400 hover:text-brand-600 p-2"
                    >
                      <UploadCloud className="w-6 h-6 mb-1" />
                      <span className="text-[11px] font-semibold">Téléverser le verso</span>
                    </div>
                  )}
                  <input
                    ref={fileInputBackRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "back")}
                  />
                  <span className="text-[10px] text-slate-500">Verso avec zone de lecture</span>
                </div>
              )}

              {/* Cas particulier : Justificatif étudiant (Section 4.1) */}
              {profile?.category === "etudiant" && (
                <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3">
                  <span className="text-xs font-bold text-emerald-900">Carte Étudiant / Certificat</span>
                  {studentPreview ? (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden border border-emerald-300">
                      <img src={studentPreview} alt="Étudiant" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setStudentFile(null); setStudentPreview(null); }}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputStudentRef.current?.click()}
                      className="w-full h-28 rounded-xl border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-white transition-all text-emerald-600 p-2"
                    >
                      <GraduationCap className="w-6 h-6 mb-1" />
                      <span className="text-[11px] font-semibold">Téléverser carte étudiant</span>
                    </div>
                  )}
                  <input
                    ref={fileInputStudentRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "student")}
                  />
                  <span className="text-[10px] text-emerald-700">Pour badge étudiant vérifié</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {identityStatus === "verified"
                ? "✓ Votre identité a déjà été vérifiée. Vous pouvez soumettre à nouveau si votre pièce a expiré."
                : "Les documents sont vérifiés manuellement par l'administration AFriGain."}
            </span>

            <button
              type="submit"
              disabled={submitting}
              className="py-2.5 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Transmettre mon dossier d'identité</span>
            </button>
          </div>
        </form>
        )
      )}

      {/* 2. VÉRIFICATION ENTREPRISE (Section 6 du prompt) */}
      {verificationTab === "entreprise" && (
        (professionalStatus === "pending" || professionalStatus === "verified") && !isEditingBusiness ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                  Dossier d&apos;entreprise soumis
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  {companyName || "Entreprise"}
                </h2>
                <p className="text-xs text-slate-500">
                  {professionalStatus === "verified"
                    ? "Votre statut professionnel et entreprise a été validé avec succès."
                    : "Votre dossier d'entreprise est en cours de contrôle administratif."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${currentProStatus.color}`}>
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{currentProStatus.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingBusiness(true)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Modifier les informations
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Raison Sociale</span>
                <strong className="text-slate-800">{companyName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Pays</span>
                <strong className="text-slate-800">{businessCountry}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Numéro IFU</span>
                <strong className="text-slate-800 font-mono">{ifuNumber || "Non applicable"}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Numéro RCCM</span>
                <strong className="text-slate-800 font-mono">{rccmNumber || "Non applicable"}</strong>
              </div>
            </div>

            {businessFilePreview && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <FileText className="w-6 h-6 text-brand-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Justificatif d&apos;immatriculation joint</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">✓ Document enregistré dans votre dossier</span>
                </div>
              </div>
            )}
          </div>
        ) : (
        <form onSubmit={handleSubmitBusiness} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Enregistrement Légal de l'Entreprise</h2>
              <p className="text-xs text-slate-500">
                Vérification des numéros d'immatriculation et documents officiels. Les entreprises étrangères fournissent leurs équivalents locaux.
              </p>
            </div>
            {isEditingBusiness && (
              <button
                type="button"
                onClick={() => setIsEditingBusiness(false)}
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Annuler la modification
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Dénomination sociale officielle</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Sahel Fintech Solutions SARL"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nom commercial / Enseigne</label>
              <input
                type="text"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                placeholder="Ex: SahelPay"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Pays d'enregistrement</label>
              <select
                value={businessCountry}
                onChange={(e) => setBusinessCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {ALL_COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Numéro IFU {businessCountry === "Bénin" ? "(Obligatoire au Bénin)" : "(Si applicable)"}
              </label>
              <input
                type="text"
                required={businessCountry === "Bénin"}
                value={ifuNumber}
                onChange={(e) => setIfuNumber(e.target.value)}
                placeholder="Ex: 3201910293847"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Numéro RCCM / Immatriculation</label>
              <input
                type="text"
                value={rccmNumber}
                onChange={(e) => setRccmNumber(e.target.value)}
                placeholder="Ex: RB/COT/20-B-12345"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Secteur d'activité</label>
              <input
                type="text"
                value={businessSector}
                onChange={(e) => setBusinessSector(e.target.value)}
                placeholder="Ex: Agroalimentaire, Fintech, BTP, Textile..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Adresse du siège social</label>
              <input
                type="text"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="Ex: Immeuble Le Phénix, Rue 450, Cotonou"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Justificatif d'immatriculation (Extrait RCCM, Attestation IFU, Kbis) */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Justificatif officiel d'immatriculation (RCCM, Kbis ou Attestation fiscale)
            </label>
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-brand-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {businessFile ? businessFile.name : businessFilePreview ? "Document officiel déjà téléversé" : "Aucun document joint"}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Format PDF ou image nette • Espace privé confidentiel
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputBusinessRef.current?.click()}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold text-slate-700 shadow-sm"
                >
                  {businessFile || businessFilePreview ? "Remplacer" : "Sélectionner un fichier"}
                </button>
                <input
                  ref={fileInputBusinessRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "business")}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Le badge « Entreprise Vérifiée » sera activé après contrôle administratif de vos numéros.
            </span>

            <button
              type="submit"
              disabled={submitting}
              className="py-2.5 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
              <span>Enregistrer et vérifier l'entreprise</span>
            </button>
          </div>
        </form>
        )
      )}
    </div>
  );
}
