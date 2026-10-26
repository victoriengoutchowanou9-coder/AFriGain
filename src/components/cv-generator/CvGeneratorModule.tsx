"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  Download,
  Plus,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Award,
  Layers,
  Languages,
  BookOpen,
  Camera,
  Check,
  Send,
  Eye,
  RefreshCw,
  Info
} from "lucide-react";

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  missions: string;
  achievements?: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  startYear?: string;
  endYear?: string;
  fieldOfStudy?: string;
  mention?: string;
}

export interface ToolItem {
  id: string;
  name: string;
  level: "Débutant" | "Intermédiaire" | "Avancé" | "Expert";
}

export interface LanguageItem {
  id: string;
  name: string;
  level: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  role?: string;
  results?: string;
}

export interface ReferenceItem {
  id: string;
  fullName: string;
  title: string;
  company: string;
  contact: string;
}

export default function CvGeneratorModule() {
  const [activeSubTab, setActiveSubTab] = useState<"cv" | "letter">("cv");
  const [selectedTheme, setSelectedTheme] = useState<"navy" | "emerald" | "slate" | "amber">("navy");
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  // -------------------------------------------------------------
  // DONNÉES DU CV PROFESSIONNEL
  // -------------------------------------------------------------
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "Koffi Mensah",
    title: "Assistant Administratif & Commercial Junior",
    photoUrl: "",
    includePhoto: false,
    email: "koffi.mensah@email.com",
    phone: "+229 97 00 00 00",
    whatsapp: "+229 97 00 00 00",
    cityCountry: "Cotonou, Bénin",
    address: "",
    nationality: "Béninoise",
    birthDate: "",
    driverLicense: "Permis B",
    linkedin: "linkedin.com/in/koffi-mensah",
    portfolio: "",
  });

  const [summary, setSummary] = useState(
    "Professionnel rigoureux et motivé, titulaire d'une formation en gestion commerciale avec une solide maîtrise pratique des registres Excel, du service client et des outils numériques modernes. Disponible immédiatement pour contribuer activement au développement de votre entreprise."
  );

  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    {
      id: "exp-1",
      jobTitle: "Assistant Administratif & Ventes",
      company: "Établissements Sahel Distribution",
      location: "Cotonou, Bénin",
      startDate: "Mars 2023",
      endDate: "Présent",
      isCurrent: true,
      missions: "Gestion quotidienne des factures, suivi des stocks de marchandises et tenue des journaux de vente sous Excel. Accueil téléphonique et traitement des commandes clients sur WhatsApp Business.",
      achievements: "Réduction des écarts d'inventaire de 18% grâce à la mise en place d'un tableau de contrôle automatisé.",
    },
  ]);

  const [educations, setEducations] = useState<EducationItem[]>([
    {
      id: "edu-1",
      degree: "Licence Professionnelle en Gestion & Commerce",
      institution: "Université d'Abomey-Calavi (UAC)",
      location: "Bénin",
      startYear: "2020",
      endYear: "2023",
      fieldOfStudy: "Gestion commerciale & comptabilité de base",
      mention: "Assez Bien",
    },
  ]);

  const [skills, setSkills] = useState<string[]>([
    "Gestion administrative",
    "Suivi de trésorerie & stocks",
    "Relation client & négociation",
    "Saisie comptable (SYSCOHADA)",
    "Communication professionnelle",
  ]);
  const [newSkillInput, setNewSkillInput] = useState("");

  const [tools, setTools] = useState<ToolItem[]>([
    { id: "tool-1", name: "Microsoft Excel", level: "Avancé" },
    { id: "tool-2", name: "Canva Pro", level: "Intermédiaire" },
    { id: "tool-3", name: "WhatsApp Business", level: "Expert" },
    { id: "tool-4", name: "Word & PowerPoint", level: "Avancé" },
  ]);

  const [languages, setLanguages] = useState<LanguageItem[]>([
    { id: "lang-1", name: "Français", level: "Courant / Professionnel" },
    { id: "lang-2", name: "Anglais", level: "Intermédiaire" },
    { id: "lang-3", name: "Fon", level: "Langue maternelle" },
  ]);

  const [certifications, setCertifications] = useState<Array<{ id: string; title: string; issuer: string; year: string }>>([
    { id: "cert-1", title: "Certificat d'initiation aux outils bureautiques avancés", issuer: "Institut Numérique Bénin", year: "2023" },
  ]);

  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: "proj-1",
      title: "Automatisation du registre des ventes pour commerce de quartier",
      description: "Création d'un classeur Excel complet de suivi des recettes, dépenses et réapprovisionnements.",
      role: "Concepteur & Formateur du commerçant",
      results: "Gain de 3h de calcul hebdomadaire pour le commerçant.",
    },
  ]);

  const [interests, setInterests] = useState<string>("Bénévolat associatif, lecture économique, football de quartier.");
  const [referencesAvailableOnDemand, setReferencesAvailableOnDemand] = useState(true);
  const [references, setReferences] = useState<ReferenceItem[]>([]);

  // -------------------------------------------------------------
  // FORMULAIRE POUR LA LETTRE DE MOTIVATION (DISTINCT)
  // -------------------------------------------------------------
  const [letterForm, setLetterForm] = useState({
    targetJobTitle: "Assistant Administratif & Comptable",
    targetCompany: "Société Béninoise de Logistique & Négoce (SBLN)",
    targetLocation: "Cotonou, Bénin",
    recipientName: "Monsieur le Directeur des Ressources Humaines",
    jobReference: "OFFRE-SBLN-2024-08",
    applicationDate: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
    // CHAMP OBLIGATOIRE CENTRAL
    jobMissions: `Sous l'autorité du Responsable Administratif et Financier, vos principales missions seront :
1. Enregistrer et classer les pièces comptables et factures fournisseurs.
2. Assurer le suivi hebdomadaire des stocks et participer aux inventaires physiques.
3. Rédiger les correspondances administratives et relancer les créances clients.
4. Tenir à jour les tableaux de bord sous Excel et assister à la préparation des déclarations.`,
    jobRequirements: "Titulaire d'un Bac+2/3 en Gestion ou Comptabilité. Maîtrise confirmée d'Excel. Rigueur, intégrité et esprit d'équipe.",
    candidateMotivation: "Très attiré par la croissance rapide de votre entreprise dans le secteur de la logistique à Cotonou, je souhaite mettre ma rigueur sur Excel et mon expérience pratique des stocks à votre service.",
    tone: "professional" as "professional" | "dynamic" | "formal",
  });

  const [generatedLetter, setGeneratedLetter] = useState<string>("");
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [letterError, setLetterError] = useState<string | null>(null);

  // Initialisation par défaut de la lettre
  useEffect(() => {
    if (!generatedLetter) {
      // Génération locale initiale
      setGeneratedLetter(
`${personalInfo.fullName}
${personalInfo.cityCountry}
Tél. : ${personalInfo.phone}
Email : ${personalInfo.email}

À l'attention de :
${letterForm.recipientName}
${letterForm.targetCompany}
${letterForm.targetLocation}

Fait le ${letterForm.applicationDate}

Objet : Candidature au poste de ${letterForm.targetJobTitle} - Réf. : ${letterForm.jobReference}

${letterForm.recipientName},

C'est avec un très grand intérêt que je vous présente ma candidature au poste de ${letterForm.targetJobTitle} au sein de votre prestigieuse structure, ${letterForm.targetCompany}.

${letterForm.candidateMotivation}

Fort d'une solide formation en ${educations[0]?.degree || "gestion"} et d'une expérience concrète acquise chez ${experiences[0]?.company || "mes précédents collaborateurs"}, j'ai développé une rigueur absolue dans la gestion des pièces administratives, le suivi rigoureux des inventaires et la tenue de tableaux de bord financiers sur Excel.

Votre offre d'emploi mentionne notamment la prise en charge de missions clés telles que l'enregistrement des pièces comptables, le contrôle méthodique des stocks et le suivi des factures. Ces tâches correspondent précisément aux responsabilités que j'ai assumées au quotidien avec des résultats mesurables, en réduisant notamment les écarts de stock.

Méthodique, autonome et doté d'un excellent sens relationnel, je serais honoré de mettre mon énergie et mes compétences au service de l'équipe de ${letterForm.targetCompany}.

Je me tiens à votre disposition pour convenir d'une date d'entretien à votre convenance.

Dans l'attente de votre retour, je vous prie d'agréer, ${letterForm.recipientName}, l'expression de mes salutations les plus respectueuses.


${personalInfo.fullName}`
      );
    }
  }, []);

  // -------------------------------------------------------------
  // ACTIONS ET SOUMISSIONS
  // -------------------------------------------------------------
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotice(label);
    setTimeout(() => setCopiedNotice(null), 2500);
  };

  const handlePrintDocument = () => {
    window.print();
  };

  // Ajout / Suppression dynamique
  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      missions: "",
      achievements: "",
    };
    setExperiences([...experiences, newExp]);
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter((e) => e.id !== id));
  };

  const addEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: "",
      institution: "",
      location: "",
      startYear: "",
      endYear: "",
      fieldOfStudy: "",
      mention: "",
    };
    setEducations([...educations, newEdu]);
  };

  const removeEducation = (id: string) => {
    setEducations(educations.filter((e) => e.id !== id));
  };

  const addSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, idx) => idx !== index));
  };

  const addTool = () => {
    setTools([...tools, { id: `tool-${Date.now()}`, name: "", level: "Intermédiaire" }]);
  };

  const removeTool = (id: string) => {
    setTools(tools.filter((t) => t.id !== id));
  };

  const addLanguage = () => {
    setLanguages([...languages, { id: `lang-${Date.now()}`, name: "", level: "Courant" }]);
  };

  const removeLanguage = (id: string) => {
    setLanguages(languages.filter((l) => l.id !== id));
  };

  const addProject = () => {
    setProjects([
      ...projects,
      { id: `proj-${Date.now()}`, title: "", description: "", role: "", results: "" },
    ]);
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  // Upload photo locale (Data URL base64)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("La photo ne doit pas dépasser 2 Mo.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setPersonalInfo({
          ...personalInfo,
          photoUrl: event.target?.result as string,
          includePhoto: true,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Appel API pour générer la lettre avec l'IA
  const handleGenerateLetterWithAI = async () => {
    if (!letterForm.jobMissions.trim()) {
      setLetterError("Veuillez renseigner les missions et responsabilités du poste afin de permettre à l'IA d'adapter votre lettre.");
      return;
    }

    setIsGeneratingLetter(true);
    setLetterError(null);

    try {
      const candidateProfile = {
        fullName: personalInfo.fullName,
        title: personalInfo.title,
        email: personalInfo.email,
        phone: personalInfo.phone,
        whatsapp: personalInfo.whatsapp,
        cityCountry: personalInfo.cityCountry,
        address: personalInfo.address,
        summary: summary,
        experiences: experiences.filter((e) => e.jobTitle.trim()),
        educations: educations.filter((ed) => ed.degree.trim()),
        skills: skills,
        tools: tools.filter((t) => t.name.trim()),
        languages: languages.filter((l) => l.name.trim()),
        projects: projects.filter((p) => p.title.trim()),
        certifications: certifications.filter((c) => c.title.trim()),
      };

      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate: candidateProfile,
          job: letterForm,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Erreur lors de la génération de la lettre.");
      }

      setGeneratedLetter(data.letter);
    } catch (err: any) {
      console.error("Erreur génération lettre:", err);
      setLetterError(err?.message || "Impossible de générer la lettre pour le moment. Veuillez vérifier votre connexion.");
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  // Couleurs du modèle de CV sélectionné
  const themeStyles = {
    navy: {
      headerBg: "bg-slate-900 text-white",
      accentTitle: "text-sky-400",
      accentBorder: "border-sky-500",
      accentBg: "bg-sky-50 text-sky-800",
      badge: "bg-slate-800 text-slate-100",
      sectionHeading: "text-slate-900 border-b-2 border-sky-600",
      bullet: "text-sky-600",
    },
    emerald: {
      headerBg: "bg-emerald-950 text-white",
      accentTitle: "text-emerald-400",
      accentBorder: "border-emerald-500",
      accentBg: "bg-emerald-50 text-emerald-800",
      badge: "bg-emerald-900 text-emerald-100",
      sectionHeading: "text-emerald-950 border-b-2 border-emerald-600",
      bullet: "text-emerald-600",
    },
    slate: {
      headerBg: "bg-slate-800 text-white",
      accentTitle: "text-amber-400",
      accentBorder: "border-amber-500",
      accentBg: "bg-amber-50 text-amber-900",
      badge: "bg-slate-700 text-slate-200",
      sectionHeading: "text-slate-900 border-b-2 border-amber-500",
      bullet: "text-amber-600",
    },
    amber: {
      headerBg: "bg-gradient-to-r from-amber-900 to-amber-950 text-white",
      accentTitle: "text-amber-300",
      accentBorder: "border-amber-500",
      accentBg: "bg-amber-50 text-amber-900",
      badge: "bg-amber-800 text-amber-100",
      sectionHeading: "text-amber-950 border-b-2 border-amber-600",
      bullet: "text-amber-600",
    },
  }[selectedTheme];

  return (
    <div className="space-y-6">
      {/* Sélecteur de fonction : CV ou Lettre de motivation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab("cv")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "cv"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <FileText className="w-4 h-4 text-sky-400" />
            1. Créer mon CV Professionnel
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("letter")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "letter"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Mail className="w-4 h-4" />
            2. Créer ma Lettre de Motivation Ciblée
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === "cv" && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-[11px] font-semibold">Style du CV :</span>
              <button
                type="button"
                onClick={() => setSelectedTheme("navy")}
                className={`w-5 h-5 rounded-full bg-slate-900 border-2 ${
                  selectedTheme === "navy" ? "border-amber-400 ring-2 ring-amber-200" : "border-white"
                }`}
                title="Bleu Marine & Cyan"
              />
              <button
                type="button"
                onClick={() => setSelectedTheme("emerald")}
                className={`w-5 h-5 rounded-full bg-emerald-900 border-2 ${
                  selectedTheme === "emerald" ? "border-amber-400 ring-2 ring-amber-200" : "border-white"
                }`}
                title="Émeraude Moderne"
              />
              <button
                type="button"
                onClick={() => setSelectedTheme("slate")}
                className={`w-5 h-5 rounded-full bg-slate-700 border-2 ${
                  selectedTheme === "slate" ? "border-amber-400 ring-2 ring-amber-200" : "border-white"
                }`}
                title="Ardoise & Or"
              />
              <button
                type="button"
                onClick={() => setSelectedTheme("amber")}
                className={`w-5 h-5 rounded-full bg-amber-800 border-2 ${
                  selectedTheme === "amber" ? "border-amber-400 ring-2 ring-amber-200" : "border-white"
                }`}
                title="Ambre Signature"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handlePrintDocument}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors border border-slate-300"
            title="Imprimer ou enregistrer en PDF via le navigateur"
          >
            <Printer className="w-3.5 h-3.5" />
            Télécharger en PDF / Imprimer
          </button>
        </div>
      </div>

      {copiedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{copiedNotice}</span>
        </div>
      )}

      {/* ============================================================= */}
      {/* SOUS-MODULE 1 : CRÉATEUR DE CV PROFESSIONNEL                 */}
      {/* ============================================================= */}
      {activeSubTab === "cv" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Formulaire complet CV (7 colonnes sur grands écrans) */}
          <div className="xl:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold text-sky-600 uppercase">Formulaire de Saisie du CV</span>
              <h2 className="text-lg font-bold text-slate-900">Renseignez votre profil professionnel</h2>
              <p className="text-xs text-slate-500">
                Vos informations réelles sont immédiatement mises en page selon les normes de recrutement africaines et internationales. Les rubriques non renseignées sont masquées automatiquement.
              </p>
            </div>

            {/* A. Informations personnelles */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-sky-700">
                <User className="w-4 h-4" /> 1. Informations Personnelles & Coordonnées
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nom et prénom(s) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={personalInfo.fullName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="Ex: Koffi Mensah"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Intitulé professionnel / Métier visé <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={personalInfo.title}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="Ex: Assistant Administratif & Commercial"
                  />
                </div>
              </div>

              {/* Photo d'identité facultative */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-800 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-slate-500" /> Photo professionnelle (Facultative)
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={personalInfo.includePhoto}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, includePhoto: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span>Inclure sur le CV</span>
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  {personalInfo.photoUrl && (
                    <img
                      src={personalInfo.photoUrl}
                      alt="Aperçu photo"
                      className="w-10 h-10 rounded-full object-cover border border-slate-300"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                  />
                  {personalInfo.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPersonalInfo({ ...personalInfo, photoUrl: "", includePhoto: false })}
                      className="text-[11px] text-red-600 hover:underline"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email professionnel <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">WhatsApp (si différent)</label>
                  <input
                    type="tel"
                    value={personalInfo.whatsapp}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Ville & Pays <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={personalInfo.cityCountry}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, cityCountry: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="Cotonou, Bénin"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nationalité</label>
                  <input
                    type="text"
                    value={personalInfo.nationality}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, nationality: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">LinkedIn (facultatif)</label>
                  <input
                    type="text"
                    value={personalInfo.linkedin}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="linkedin.com/in/votre-nom"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Permis de conduire</label>
                  <input
                    type="text"
                    value={personalInfo.driverLicense}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, driverLicense: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="Ex: Permis B"
                  />
                </div>
              </div>
            </div>

            {/* B. Profil professionnel & Résumé */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-sky-700">
                  <User className="w-4 h-4" /> 2. Profil Professionnel (Résumé)
                </h3>
              </div>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                placeholder="Décrivez en 3 à 4 phrases vos points forts, votre formation et vos objectifs professionnels..."
              />
            </div>

            {/* C. Expériences professionnelles (dynamique) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-sky-700">
                    <Briefcase className="w-4 h-4" /> 3. Expériences Professionnelles
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    (Facultatif pour les étudiants et personnes sans expérience)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addExperience}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Ajouter un poste
                </button>
              </div>

              {experiences.length === 0 && (
                <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500">
                  Aucune expérience renseignée. Vos formations, compétences et projets concrets seront valorisés.
                </div>
              )}

              {experiences.map((exp, idx) => (
                <div key={exp.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Poste #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Supprimer ce poste"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Intitulé du poste"
                      value={exp.jobTitle}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].jobTitle = e.target.value;
                        setExperiences(updated);
                      }}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Entreprise ou Organisation"
                      value={exp.company}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].company = e.target.value;
                        setExperiences(updated);
                      }}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Date début (ex: Jan 2022)"
                      value={exp.startDate}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].startDate = e.target.value;
                        setExperiences(updated);
                      }}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Date fin (ex: Présent)"
                      value={exp.endDate}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].endDate = e.target.value;
                        setExperiences(updated);
                      }}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Ville, Pays"
                      value={exp.location}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].location = e.target.value;
                        setExperiences(updated);
                      }}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Missions et responsabilités exercées..."
                    value={exp.missions}
                    onChange={(e) => {
                      const updated = [...experiences];
                      updated[idx].missions = e.target.value;
                      setExperiences(updated);
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Réalisations concrètes ou résultats chiffrés (facultatif)"
                    value={exp.achievements}
                    onChange={(e) => {
                      const updated = [...experiences];
                      updated[idx].achievements = e.target.value;
                      setExperiences(updated);
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white"
                  />
                </div>
              ))}
            </div>

            {/* D. Formations & Diplômes (dynamique) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-sky-700">
                  <GraduationCap className="w-4 h-4" /> 4. Formations & Diplômes
                </h3>
                <button
                  type="button"
                  onClick={addEducation}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Ajouter un diplôme
                </button>
              </div>

              {educations.map((edu, idx) => (
                <div key={edu.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Formation #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeEducation(edu.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Intitulé du diplôme ou certification"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...educations];
                        updated[idx].degree = e.target.value;
                        setEducations(updated);
                      }}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Établissement ou Université"
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...educations];
                        updated[idx].institution = e.target.value;
                        setEducations(updated);
                      }}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Année début / fin (ex: 2020 - 2023)"
                      value={edu.endYear}
                      onChange={(e) => {
                        const updated = [...educations];
                        updated[idx].endYear = e.target.value;
                        setEducations(updated);
                      }}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Spécialité (facultatif)"
                      value={edu.fieldOfStudy}
                      onChange={(e) => {
                        const updated = [...educations];
                        updated[idx].fieldOfStudy = e.target.value;
                        setEducations(updated);
                      }}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Mention (facultatif)"
                      value={edu.mention}
                      onChange={(e) => {
                        const updated = [...educations];
                        updated[idx].mention = e.target.value;
                        setEducations(updated);
                      }}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* E. Compétences & Outils informatiques */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-sky-700">
                <Award className="w-4 h-4" /> 5. Compétences Professionnelles & Logiciels
              </h3>

              {/* Tags compétences */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Compétences professionnelles (saisie libre)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Ex: Comptabilité SYSCOHADA, Gestion des stocks, Négociation..."
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
                  >
                    Ajouter
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs border border-slate-200"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSkill(idx)}
                        className="text-slate-400 hover:text-red-600 font-bold ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Outils & Logiciels */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Logiciels & Outils maîtrisés avec niveau
                  </label>
                  <button
                    type="button"
                    onClick={addTool}
                    className="text-[11px] font-semibold text-sky-700 hover:underline"
                  >
                    + Ajouter un outil
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tools.map((t, idx) => (
                    <div key={t.id} className="flex gap-1 items-center p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                      <input
                        type="text"
                        placeholder="Outil (ex: Excel)"
                        value={t.name}
                        onChange={(e) => {
                          const updated = [...tools];
                          updated[idx].name = e.target.value;
                          setTools(updated);
                        }}
                        className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                      />
                      <select
                        value={t.level}
                        onChange={(e) => {
                          const updated = [...tools];
                          updated[idx].level = e.target.value as any;
                          setTools(updated);
                        }}
                        className="text-xs px-1.5 py-1 border border-slate-300 rounded bg-white text-slate-700"
                      >
                        <option value="Débutant">Débutant</option>
                        <option value="Intermédiaire">Intermédiaire</option>
                        <option value="Avancé">Avancé</option>
                        <option value="Expert">Expert</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeTool(t.id)}
                        className="text-slate-400 hover:text-red-600 px-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* F. Langues & Références */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-sky-700">
                  <Languages className="w-4 h-4" /> 6. Langues & Références
                </h3>
                <button
                  type="button"
                  onClick={addLanguage}
                  className="text-[11px] font-semibold text-sky-700 hover:underline"
                >
                  + Ajouter une langue
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {languages.map((l, idx) => (
                  <div key={l.id} className="flex gap-1 items-center p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                      type="text"
                      placeholder="Langue (ex: Français, Fon, Yoruba)"
                      value={l.name}
                      onChange={(e) => {
                        const updated = [...languages];
                        updated[idx].name = e.target.value;
                        setLanguages(updated);
                      }}
                      className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Niveau (ex: Courant)"
                      value={l.level}
                      onChange={(e) => {
                        const updated = [...languages];
                        updated[idx].level = e.target.value;
                        setLanguages(updated);
                      }}
                      className="w-28 px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeLanguage(l.id)}
                      className="text-slate-400 hover:text-red-600 px-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Projets concrets (précieux pour étudiants / juniors) */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700">
                      Projets concrets & réalisations (Facultatif mais recommandé)
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={addProject}
                    className="text-[11px] font-semibold text-sky-700 hover:underline"
                  >
                    + Ajouter un projet
                  </button>
                </div>
                {projects.map((proj, idx) => (
                  <div key={proj.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        placeholder="Titre du projet / réalisation"
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].title = e.target.value;
                          setProjects(updated);
                        }}
                        className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded bg-white font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => removeProject(proj.id)}
                        className="text-slate-400 hover:text-red-600 px-2"
                      >
                        ×
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Description du projet et résultats obtenus..."
                      value={proj.description}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].description = e.target.value;
                        setProjects(updated);
                      }}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                    />
                  </div>
                ))}
              </div>

              {/* Références */}
              <div className="pt-2">
                <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={referencesAvailableOnDemand}
                    onChange={(e) => setReferencesAvailableOnDemand(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Afficher la mention : « Références disponibles sur demande »</span>
                </label>
              </div>
            </div>
          </div>

          {/* Prévisualisation en direct du CV (5 colonnes) */}
          <div className="xl:col-span-6 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Aperçu du CV Professionnel</h3>
                <span className="text-[10px] text-slate-400 font-mono">Format A4 Standard</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(`${personalInfo.fullName}\n${personalInfo.title}\n${summary}`, "Contenu du CV copié !")}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded border border-slate-200"
                  title="Copier le texte"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handlePrintDocument}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exporter PDF
                </button>
              </div>
            </div>

            {/* Document CV Printable (Format conforme au modèle de référence) */}
            <div
              id="cv-printable-document"
              className="bg-white rounded-2xl border border-slate-300 shadow-md overflow-hidden text-slate-800 print:shadow-none print:border-none print:m-0"
              style={{ minHeight: "820px" }}
            >
              {/* En-tête bleu profond / marine */}
              <div className={`${themeStyles.headerBg} p-6 sm:p-8 relative`}>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  {personalInfo.includePhoto && personalInfo.photoUrl && (
                    <img
                      src={personalInfo.photoUrl}
                      alt={personalInfo.fullName}
                      className="w-24 h-24 rounded-full object-cover border-3 border-white/80 shadow-md shrink-0"
                    />
                  )}
                  <div className="flex-1 text-center sm:text-left space-y-1.5">
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide">
                      {personalInfo.fullName || "Votre Nom Complet"}
                    </h1>
                    <p className={`text-sm sm:text-base font-semibold tracking-wide ${themeStyles.accentTitle}`}>
                      {personalInfo.title || "Titre du Métier Visé"}
                    </p>

                    {/* Coordonnées alignées */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-200 pt-2 font-sans">
                      {personalInfo.cityCountry && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-white/80" /> {personalInfo.cityCountry}
                        </span>
                      )}
                      {personalInfo.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-white/80" /> {personalInfo.phone}
                        </span>
                      )}
                      {personalInfo.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-white/80" /> {personalInfo.email}
                        </span>
                      )}
                      {personalInfo.linkedin && (
                        <span className="flex items-center gap-1">
                          <Linkedin className="w-3.5 h-3.5 text-white/80" /> {personalInfo.linkedin}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Corps du CV en deux colonnes (Disposition moderne équilibrée) */}
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 text-xs leading-relaxed">
                {/* Colonne Principale (Gauche - 8 cols) : Profil, Expériences, Formations */}
                <div className="md:col-span-8 space-y-6">
                  {/* Profil professionnel */}
                  {summary && (
                    <div className="space-y-1.5">
                      <h2 className={`font-bold uppercase tracking-wider text-xs pb-1 ${themeStyles.sectionHeading}`}>
                        Profil Professionnel
                      </h2>
                      <p className="text-slate-600 text-[11px] leading-relaxed text-justify">
                        {summary}
                      </p>
                    </div>
                  )}

                  {/* Expériences professionnelles (si présentes) */}
                  {experiences.filter((e) => e.jobTitle.trim()).length > 0 && (
                    <div className="space-y-3">
                      <h2 className={`font-bold uppercase tracking-wider text-xs pb-1 ${themeStyles.sectionHeading}`}>
                        Expériences Professionnelles
                      </h2>
                      <div className="space-y-3.5">
                        {experiences
                          .filter((e) => e.jobTitle.trim())
                          .map((exp) => (
                            <div key={exp.id} className="space-y-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                <span className="font-bold text-slate-900 text-xs">{exp.jobTitle}</span>
                                <span className="text-[10px] text-slate-500 font-semibold">
                                  {exp.startDate} {exp.endDate ? `— ${exp.endDate}` : ""}
                                </span>
                              </div>
                              <div className="text-[11px] text-sky-800 font-medium">
                                {exp.company} {exp.location ? `• ${exp.location}` : ""}
                              </div>
                              {exp.missions && (
                                <p className="text-slate-600 text-[11px] pl-2 border-l-2 border-slate-200">
                                  {exp.missions}
                                </p>
                              )}
                              {exp.achievements && (
                                <p className="text-[10.5px] text-emerald-800 font-medium pl-2">
                                  ✓ Réalisation clé : {exp.achievements}
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Formations & Diplômes */}
                  {educations.filter((edu) => edu.degree.trim()).length > 0 && (
                    <div className="space-y-3">
                      <h2 className={`font-bold uppercase tracking-wider text-xs pb-1 ${themeStyles.sectionHeading}`}>
                        Formations & Diplômes
                      </h2>
                      <div className="space-y-2.5">
                        {educations
                          .filter((edu) => edu.degree.trim())
                          .map((edu) => (
                            <div key={edu.id} className="space-y-0.5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                <span className="font-bold text-slate-900 text-xs">{edu.degree}</span>
                                <span className="text-[10px] text-slate-500 font-semibold">{edu.endYear}</span>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                {edu.institution} {edu.location ? `• ${edu.location}` : ""}
                                {edu.mention ? ` (Mention ${edu.mention})` : ""}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Projets & Réalisations concrètes */}
                  {projects.filter((p) => p.title.trim()).length > 0 && (
                    <div className="space-y-2.5">
                      <h2 className={`font-bold uppercase tracking-wider text-xs pb-1 ${themeStyles.sectionHeading}`}>
                        Projets & Démonstrations Concrètes
                      </h2>
                      {projects
                        .filter((p) => p.title.trim())
                        .map((p) => (
                          <div key={p.id} className="space-y-0.5">
                            <span className="font-bold text-slate-900 text-xs block">{p.title}</span>
                            <p className="text-slate-600 text-[11px]">{p.description}</p>
                            {p.results && (
                              <p className="text-[10.5px] text-sky-800 font-medium">→ Impact : {p.results}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Colonne Latérale (Droite - 4 cols) : Compétences, Outils, Langues, Références */}
                <div className="md:col-span-4 space-y-6 md:border-l md:border-slate-100 md:pl-5">
                  {/* Compétences professionnelles */}
                  {skills.length > 0 && (
                    <div className="space-y-2">
                      <h3 className={`font-bold uppercase tracking-wider text-[11px] pb-1 ${themeStyles.sectionHeading}`}>
                        Compétences Clés
                      </h3>
                      <ul className="space-y-1 text-slate-700 text-[11px]">
                        {skills.map((s, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className={themeStyles.bullet}>•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Logiciels & Outils avec niveau */}
                  {tools.filter((t) => t.name.trim()).length > 0 && (
                    <div className="space-y-2">
                      <h3 className={`font-bold uppercase tracking-wider text-[11px] pb-1 ${themeStyles.sectionHeading}`}>
                        Outils & Logiciels
                      </h3>
                      <div className="space-y-1.5">
                        {tools
                          .filter((t) => t.name.trim())
                          .map((t) => (
                            <div key={t.id} className="space-y-0.5">
                              <div className="flex justify-between text-[11px]">
                                <span className="font-semibold text-slate-800">{t.name}</span>
                                <span className="text-[10px] text-slate-500">{t.level}</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    t.level === "Expert"
                                      ? "w-full bg-sky-600"
                                      : t.level === "Avancé"
                                      ? "w-4/5 bg-sky-500"
                                      : t.level === "Intermédiaire"
                                      ? "w-3/5 bg-sky-400"
                                      : "w-2/5 bg-sky-300"
                                  }`}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Langues */}
                  {languages.filter((l) => l.name.trim()).length > 0 && (
                    <div className="space-y-2">
                      <h3 className={`font-bold uppercase tracking-wider text-[11px] pb-1 ${themeStyles.sectionHeading}`}>
                        Langues
                      </h3>
                      <ul className="space-y-1 text-slate-700 text-[11px]">
                        {languages
                          .filter((l) => l.name.trim())
                          .map((l) => (
                            <li key={l.id} className="flex justify-between items-center">
                              <span className="font-medium text-slate-800">{l.name}</span>
                              <span className="text-[10px] text-slate-500">{l.level}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {/* Certifications si présentes */}
                  {certifications.filter((c) => c.title.trim()).length > 0 && (
                    <div className="space-y-1.5">
                      <h3 className={`font-bold uppercase tracking-wider text-[11px] pb-1 ${themeStyles.sectionHeading}`}>
                        Certifications
                      </h3>
                      {certifications
                        .filter((c) => c.title.trim())
                        .map((c) => (
                          <div key={c.id} className="text-[10.5px]">
                            <span className="font-semibold text-slate-800 block">{c.title}</span>
                            <span className="text-slate-500">{c.issuer} {c.year ? `(${c.year})` : ""}</span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Références */}
                  {referencesAvailableOnDemand && (
                    <div className="space-y-1 pt-2 border-t border-slate-100">
                      <h3 className={`font-bold uppercase tracking-wider text-[11px] pb-1 ${themeStyles.sectionHeading}`}>
                        Références
                      </h3>
                      <p className="text-[10px] text-slate-500 italic">
                        Références professionnelles disponibles sur demande.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* SOUS-MODULE 2 : FORMULAIRE DISTINCT POUR LA LETTRE DE MOTIVATION */}
      {/* ============================================================= */}
      {activeSubTab === "letter" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Formulaire dédié à l'offre ciblée (6 colonnes) */}
          <div className="xl:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold text-amber-600 uppercase">Formulaire Offre & Missions</span>
              <h2 className="text-lg font-bold text-slate-900">Renseignez l'offre d'emploi ciblée</h2>
              <p className="text-xs text-slate-500">
                L'IA analyse vos compétences réelles (issues de votre profil CV) et les met en adéquation directe avec les missions du poste pour produire une lettre percutante.
              </p>
            </div>

            {letterError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{letterError}</span>
              </div>
            )}

            {/* A. Poste ciblé & Entreprise */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-amber-800">
                A. Informations sur le poste & l'entreprise
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Intitulé exact du poste visé <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={letterForm.targetJobTitle}
                    onChange={(e) => setLetterForm({ ...letterForm, targetJobTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="Ex: Assistant Administratif & Comptable"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Entreprise / Organisation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={letterForm.targetCompany}
                    onChange={(e) => setLetterForm({ ...letterForm, targetCompany: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="Ex: Société Béninoise de Logistique"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ville / Lieu</label>
                  <input
                    type="text"
                    value={letterForm.targetLocation}
                    onChange={(e) => setLetterForm({ ...letterForm, targetLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="Cotonou"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nom du recruteur</label>
                  <input
                    type="text"
                    value={letterForm.recipientName}
                    onChange={(e) => setLetterForm({ ...letterForm, recipientName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="Monsieur le Responsable..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Référence offre</label>
                  <input
                    type="text"
                    value={letterForm.jobReference}
                    onChange={(e) => setLetterForm({ ...letterForm, jobReference: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="Ex: OFFRE-2024-01"
                  />
                </div>
              </div>
            </div>

            {/* B. Missions et responsabilités du poste (ZONE CENTRALE OBLIGATOIRE) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider text-amber-800">
                B. Missions et responsabilités du poste <span className="text-red-500">*</span>
              </label>
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Champ central :</strong> Décrivez ici les principales missions, les responsabilités et les tâches mentionnées dans l'offre d'emploi. Vous pouvez copier-coller la description du poste.
                </span>
              </div>
              <textarea
                rows={5}
                value={letterForm.jobMissions}
                onChange={(e) => setLetterForm({ ...letterForm, jobMissions: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                placeholder="Ex: Enregistrement des pièces comptables, suivi de trésorerie, inventaires physiques, rapprochements bancaires..."
              />
            </div>

            {/* C. Compétences & Exigences requises */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider text-amber-800">
                C. Compétences & Exigences recherchées par l'offre (Facultatif)
              </label>
              <input
                type="text"
                value={letterForm.jobRequirements}
                onChange={(e) => setLetterForm({ ...letterForm, jobRequirements: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                placeholder="Ex: Bac+2/3 en Gestion, maîtrise d'Excel, rigueur, autonomie..."
              />
            </div>

            {/* D. Motivations du candidat */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider text-amber-800">
                D. Pourquoi souhaitez-vous rejoindre cette entreprise ? (Facultatif)
              </label>
              <textarea
                rows={2}
                value={letterForm.candidateMotivation}
                onChange={(e) => setLetterForm({ ...letterForm, candidateMotivation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                placeholder="Ex: Très intéressé par votre leadership dans la logistique à Cotonou et par l'opportunité de mettre ma rigueur sur Excel à votre service..."
              />
            </div>

            {/* Bouton de génération IA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateLetterWithAI}
                disabled={isGeneratingLetter || !letterForm.jobMissions.trim()}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {isGeneratingLetter ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>L'IA analyse les missions et rédige votre lettre...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Rédiger ma Lettre de motivation sur-mesure par l'IA</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Prévisualisation & Édition de la Lettre de motivation (6 colonnes) */}
          <div className="xl:col-span-6 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Aperçu & Édition de la Lettre</h3>
                <span className="text-[10px] text-slate-400">
                  Vous pouvez modifier directement le texte ci-dessous avant d'exporter.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedLetter, "Lettre de motivation copiée !")}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded border border-slate-200"
                  title="Copier le texte"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handlePrintDocument}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-xs flex items-center gap-1 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exporter PDF / Imprimer
                </button>
              </div>
            </div>

            {/* Document Lettre Editable */}
            <div
              id="letter-printable-document"
              className="bg-white p-8 rounded-2xl border border-slate-300 shadow-md text-xs font-serif leading-relaxed text-slate-800 min-h-[600px] print:shadow-none print:border-none print:m-0"
            >
              <textarea
                rows={22}
                value={generatedLetter}
                onChange={(e) => setGeneratedLetter(e.target.value)}
                className="w-full h-full p-2 border-0 focus:ring-0 text-xs font-serif leading-relaxed text-slate-800 resize-y bg-transparent"
                placeholder="Votre lettre de motivation apparaîtra ici..."
              />
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              Lettre rédigée selon les normes professionnelles UEMOA et internationales. Zéro fausse information inventée.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
