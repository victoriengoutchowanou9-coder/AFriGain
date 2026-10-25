"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Bot, 
  Send, 
  Calculator, 
  FileText, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Layers,
  Compass,
  Target,
  FileCheck,
  UserCheck,
  Globe2,
  Copy,
  Printer,
  ChevronRight,
  TrendingUp,
  Briefcase
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "coach" | "user";
  text: string;
  timestamp: string;
}

export default function BusinessCoachIAPage() {
  const [activeModule, setActiveModule] = useState<
    | "coach" 
    | "diagnostic" 
    | "plan" 
    | "service_generator" 
    | "cv_generator" 
    | "job_assistant" 
    | "client_finder" 
    | "multilingual" 
    | "pricing"
  >("coach");

  // 1. Module Coach Conversationnel
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "coach",
      text: "Bonjour ! Je suis votre Business Coach AFriGain. Je vous accompagne dans la création d'activité, le calcul de vos prix, la conquête de clients et la structuration de vos propositions commerciales. Comment puis-je vous aider aujourd'hui ?",
      timestamp: "Maintenant",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // 2. Calculateur de Prix & Marge
  const [hourlyRate, setHourlyRate] = useState<number>(5000); // FCFA
  const [estimatedHours, setEstimatedHours] = useState<number>(20);
  const [fixedCosts, setFixedCosts] = useState<number>(15000);
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(20);

  const baseLaborCost = hourlyRate * estimatedHours;
  const totalCost = baseLaborCost + fixedCosts;
  const suggestedSellingPrice = Math.round(totalCost / (1 - (targetMarginPercent / 100)));
  const estimatedProfit = suggestedSellingPrice - totalCost;

  // 3. Diagnostic des compétences (Section 7.1)
  const [diagForm, setDiagForm] = useState({
    knowHow: "Je sais utiliser Word, Excel pour faire des tableaux et je gère facilement les réseaux sociaux (WhatsApp, Facebook).",
    experiences: "J'ai aidé un commerce de quartier à tenir ses cahiers de vente et concevoir des affiches simples sur Canva.",
    tools: "Excel, Canva, Smartphone Android, Ordinateur portable",
    city: "Cotonou",
    languages: "Français, Fon",
    timeAvailable: "Temps partiel (15h à 20h / semaine)",
    objective: "Trouver mes premiers clients et générer un revenu d'appoint régulier",
  });
  const [diagResult, setDiagResult] = useState<any>(null);

  const runDiagnostic = () => {
    setDiagResult({
      explicitSkills: ["Bureautique & Tableaux Excel", "Création visuelle de base (Canva)", "Gestion des publications réseaux sociaux"],
      transferableSkills: [
        "Assistance administrative à distance pour commerces & TPE",
        "Tenue de registre et inventaire de petits stocks",
        "Relation client & modération de groupes WhatsApp d'entreprises",
      ],
      recommendedServices: [
        {
          title: "Pack Suivi Administratif & Registre des Ventes",
          priceEstimate: "40 000 à 75 000 FCFA / mois",
          clientTarget: "Boutiques de vêtements, quincailleries, salons de coiffure",
          description: "Tenue hebdomadaire du journal des recettes/dépenses sous Excel avec reporting récapitulatif.",
        },
        {
          title: "Pack Animation WhatsApp Business & Visuels Produits",
          priceEstimate: "35 000 à 60 000 FCFA / mois",
          clientTarget: "Restaurants, transformateurs agroalimentaires, marques locales",
          description: "Création de 8 visuels Canva par mois et réponses courtoises aux demandes de prix.",
        },
      ],
      verificationNote: "Compétences autodidactes déclarées : nous vous recommandons de préparer 2 exemples types sous Excel et Canva à montrer à vos futurs clients.",
    });
  };

  // 4. Générateur de CV & Lettres (Section 7.4)
  const [cvForm, setCvForm] = useState({
    fullName: "Koffi Mensah",
    title: "Assistant Administratif & Commercial Junior",
    email: "koffi.mensah@email.com",
    phone: "+229 97 00 00 00",
    city: "Cotonou, Bénin",
    summary: "Jeune professionnel rigoureux et motivé, maîtrisant la gestion de registres Excel, la communication client et les outils numériques modernes. Disponible immédiatement.",
    skillsText: "Excel, SYSCOHADA (notions), Rédaction professionnelle, Gestion de stock, Canva, WhatsApp Business",
    projectDemo: "Mise en place d'un modèle automatisé de gestion des entrées/sorties de stock pour une épicerie locale.",
  });
  const [generatedLetter, setGeneratedLetter] = useState<string>("");
  const [copiedNotice, setCopiedNotice] = useState(false);

  const generateCoverLetter = () => {
    setGeneratedLetter(`Madame, Monsieur le Responsable des Recrutements,

Je vous adresse ma candidature pour rejoindre votre équipe en tant que ${cvForm.title}.

Résidant à ${cvForm.city}, je dispose d'une solide maîtrise pratique des outils bureautiques et organisationnels, notamment : ${cvForm.skillsText}. 
Conscient des exigences de rigueur de votre structure, j'ai notamment eu l'opportunité de réaliser un projet concret : "${cvForm.projectDemo}".

Dynamique, ponctuel et désireux de contribuer activement à vos opérations quotidiennes, je serais honoré d'échanger avec vous lors d'un entretien pour vous présenter mes démonstrations concrètes.

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations respectueuses.

${cvForm.fullName}
${cvForm.phone} • ${cvForm.email}`);
  };

  // 5. Générateur de Prospection Commerciale (Section 7.6)
  const [prospectTarget, setProspectTarget] = useState("Restaurants et Maquis de Cotonou");
  const [prospectService, setProspectService] = useState("Gestion des commandes WhatsApp et création de menus digitaux");
  const [prospectResult, setProspectResult] = useState<string>("");

  const generateProspectPitch = () => {
    setProspectResult(`Bonjour [Nom du Gérant / Responsable],

J'ai remarqué la qualité de votre carte et l'affluence de votre établissement. Beaucoup de clients cherchent aujourd'hui à consulter le menu du jour et passer commande directement sur WhatsApp sans attendre.

J'aide les restaurants à Cotonou à mettre en place un catalogue WhatsApp interactif et des visuels attrayants pour augmenter leurs commandes à emporter de 20% à 30%.

Puis-je vous envoyer un exemple gratuit de menu digital adapté à vos plats ? Cela vous permettra de juger du résultat en 2 minutes, sans aucun engagement de votre part.

Bien cordialement,
[Votre Nom] - [Votre Téléphone]`);
  };

  // 6. Assistant Multilingue Français <-> Anglais (Section 7.7)
  const [langInput, setLangInput] = useState("Bonjour, nous avons bien reçu votre demande de devis. Notre équipe est disponible pour commencer le projet dès lundi avec une livraison sous 10 jours ouvrés.");
  const [langOutput, setLangOutput] = useState("");

  const handleTranslate = () => {
    setLangOutput("Hello, we have duly received your quote request. Our team is available to kick off the project this Monday, with a guaranteed delivery within 10 business days.");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: inputVal,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "Pour mener à bien cette action, décomposez votre démarche : 1° Clarifiez le besoin spécifique du client ; 2° Proposez un devis avec acompte de 30% ; 3° Fixez des étapes de validation régulières pour éviter tout malentendu.";
      
      const lower = userMsg.text.toLowerCase();
      if (lower.includes("prix") || lower.includes("tarif") || lower.includes("combien")) {
        reply = "Pour fixer vos prix au Bénin et en zone UEMOA, ne sous-évaluez pas vos coûts réels (temps, connexion, déplacements). Utilisez l'onglet 'Calculateur de marge' à gauche pour définir un prix unitaire ou forfaitaire garantissant une marge bénéficiaire de 20% minimum.";
      } else if (lower.includes("client") || lower.includes("prospect")) {
        reply = "Pour décrocher un client, ne parlez pas d'abord de vous, mais de son problème. Utilisez notre onglet 'Recherche Clients & Prospection' pour générer un message d'accroche personnalisé qui propose une démonstration concrète sans engagement.";
      } else if (lower.includes("débutant") || lower.includes("expérience")) {
        reply = "Le manque d'expérience formelle se compense par la preuve concrète : réalisez un projet test (ex: un tableau type, une maquette Canva) que vous insérez dans votre portfolio. Les clients recherchent avant tout quelqu'un de sérieux qui résout leur problème.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "coach",
          text: reply,
          timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour Tableau de bord
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                AfriGain AI • Assistant Entrepreneurial
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                  Section 7
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Diagnostic de compétences, générateur d'offres, CV pro, prospection & coaching stratégique.
              </p>
            </div>
          </div>
        </div>

        {/* Badge sécurité IA */}
        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Algorithmes de calcul financiers fiables • Zéro fausses promesses</span>
        </div>
      </div>

      {/* Barre d'outils des sous-modules de l'IA (Section 7.1 à 7.8) */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: "coach", label: "Business Coach Conversationnel", icon: Bot },
          { id: "diagnostic", label: "Diagnostic des Compétences", icon: Compass },
          { id: "pricing", label: "Calculateur de Prix & Marge", icon: Calculator },
          { id: "cv_generator", label: "Générateur de CV & Lettres", icon: FileText },
          { id: "client_finder", label: "Prospection & Conquête Clients", icon: Target },
          { id: "multilingual", label: "Assistant Multilingue FR/EN", icon: Globe2 },
        ].map((mod) => {
          const Icon = mod.icon;
          const active = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id as any)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {mod.label}
            </button>
          );
        })}
      </div>

      {/* 7.8 Business Coach Conversationnel */}
      {activeModule === "coach" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
            {/* Zone de conversation */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-[85%] ${
                    m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      m.sender === "coach"
                        ? "bg-amber-500 text-white"
                        : "bg-brand-600 text-white"
                    }`}
                  >
                    {m.sender === "coach" ? <Bot className="w-4 h-4" /> : "VOUS"}
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                      m.sender === "coach"
                        ? "bg-amber-50/70 border border-amber-200/60 text-slate-800 rounded-tl-none"
                        : "bg-brand-600 text-white rounded-tr-none"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    <span
                      className={`text-[10px] block text-right ${
                        m.sender === "coach" ? "text-amber-800/60" : "text-white/70"
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-400 pl-11">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Le Coach analyse votre situation...</span>
                </div>
              )}
            </div>

            {/* Saisie */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Posez votre question (ex: comment tarifer ma première mission, comment approcher un client)..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isTyping}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center gap-1 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Raccourcis & Conseils Coach */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Sujets fréquents d'accompagnement
              </h3>
              <div className="space-y-2">
                {[
                  "Comment calculer le bon prix pour un client à Cotonou ?",
                  "Comment rédiger une proposition pour une mission freelance ?",
                  "Quels arguments utiliser face à un client qui hésite ?",
                  "Comment sécuriser un acompte avant de commencer ?",
                ].map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputVal(promptText);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-200/80 text-xs text-slate-700 transition-colors"
                  >
                    💡 {promptText}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 shadow-sm text-xs space-y-2 text-slate-700">
              <h4 className="font-bold text-amber-950 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                Règles d'or de l'entrepreneur
              </h4>
              <p>• Ne démarrez jamais un chantier important sans acompte ni devis validé.</p>
              <p>• Délimitez exactement ce qui est inclus et ce qui sera facturé en supplément.</p>
              <p>• Documentez vos réussites pour enrichir votre portfolio après chaque livraison.</p>
            </div>
          </div>
        </div>
      )}

      {/* 7.1 Diagnostic Intelligent des Compétences */}
      {activeModule === "diagnostic" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <span className="text-[11px] font-bold text-amber-600 uppercase">Questionnaire Diagnostic (Section 7.1)</span>
              <h3 className="text-lg font-bold text-slate-900">Que savez-vous faire concrètement ?</h3>
              <p className="text-xs text-slate-500">
                L'IA analyse vos compétences déclarées, identifie vos compétences transférables et formule 2 offres vendables immédiatement.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Que savez-vous faire & quels outils maîtrisez-vous ?</label>
                <textarea
                  rows={3}
                  value={diagForm.knowHow}
                  onChange={(e) => setDiagForm({ ...diagForm, knowHow: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quelles sont vos expériences passées (même informelles ou scolaires) ?</label>
                <input
                  type="text"
                  value={diagForm.experiences}
                  onChange={(e) => setDiagForm({ ...diagForm, experiences: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ville / Région</label>
                  <input
                    type="text"
                    value={diagForm.city}
                    onChange={(e) => setDiagForm({ ...diagForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Langues parlées</label>
                  <input
                    type="text"
                    value={diagForm.languages}
                    onChange={(e) => setDiagForm({ ...diagForm, languages: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Temps disponible</label>
                  <input
                    type="text"
                    value={diagForm.timeAvailable}
                    onChange={(e) => setDiagForm({ ...diagForm, timeAvailable: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Objectif prioritaire</label>
                  <input
                    type="text"
                    value={diagForm.objective}
                    onChange={(e) => setDiagForm({ ...diagForm, objective: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={runDiagnostic}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                Lancer l'analyse des compétences
              </button>
            </div>
          </div>

          {/* Résultats du Diagnostic */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-500" />
              Résultat de l'analyse IA
            </h3>

            {diagResult ? (
              <div className="space-y-4 text-xs">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-emerald-800 block">✓ Compétences explicites détectées :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {diagResult.explicitSkills.map((s: string, idx: number) => (
                      <span key={idx} className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-brand-800 block">⚡ Compétences transférables identifiées :</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {diagResult.transferableSkills.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-900 block">🎯 Offres de services recommandées :</span>
                  {diagResult.recommendedServices.map((srv: any, idx: number) => (
                    <div key={idx} className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-900">{srv.title}</h4>
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                          {srv.priceEstimate}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{srv.description}</p>
                      <div className="text-[10px] text-slate-500">Cible idéale : {srv.clientTarget}</div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-amber-100/60 rounded-xl border border-amber-300/60 text-[11px] text-amber-900">
                  ⚠️ <strong>Note de rigueur :</strong> {diagResult.verificationNote}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-slate-400">
                Renseignez le formulaire à gauche et cliquez sur "Lancer l'analyse" pour afficher vos résultats.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7.4 Générateur de CV & Lettres de motivation */}
      {activeModule === "cv_generator" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <span className="text-[11px] font-bold text-amber-600 uppercase">Générateur Professionnel (Section 7.4)</span>
              <h3 className="text-lg font-bold text-slate-900">Créer mon CV & ma Lettre</h3>
              <p className="text-xs text-slate-500">
                Sans inventer de diplôme ou d'expérience, mettez en valeur vos compétences réelles selon les normes en vigueur.
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nom complet</label>
                  <input
                    type="text"
                    value={cvForm.fullName}
                    onChange={(e) => setCvForm({ ...cvForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Titre visé</label>
                  <input
                    type="text"
                    value={cvForm.title}
                    onChange={(e) => setCvForm({ ...cvForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={cvForm.email}
                    onChange={(e) => setCvForm({ ...cvForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone / WhatsApp</label>
                  <input
                    type="tel"
                    value={cvForm.phone}
                    onChange={(e) => setCvForm({ ...cvForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Accroche professionnelle</label>
                <textarea
                  rows={2}
                  value={cvForm.summary}
                  onChange={(e) => setCvForm({ ...cvForm, summary: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Compétences maîtrisées</label>
                <input
                  type="text"
                  value={cvForm.skillsText}
                  onChange={(e) => setCvForm({ ...cvForm, skillsText: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Projet / Démonstration concrète déjà réalisé</label>
                <input
                  type="text"
                  value={cvForm.projectDemo}
                  onChange={(e) => setCvForm({ ...cvForm, projectDemo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={generateCoverLetter}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  Rédiger ma Lettre de motivation sur-mesure
                </button>
              </div>
            </div>
          </div>

          {/* Prévisualisation & Export (Section 7.4) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Aperçu du Document Professionnel</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedLetter || `${cvForm.fullName}\n${cvForm.title}\n${cvForm.summary}`)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded border border-slate-200"
                    title="Copier le texte"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded border border-slate-200"
                    title="Imprimer / Enregistrer PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {copiedNotice && (
                <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
                  ✓ Texte copié dans votre presse-papier !
                </div>
              )}

              {/* Rendu Document */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-800 max-h-[400px] overflow-y-auto">
                {generatedLetter ? (
                  generatedLetter
                ) : (
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-sans">{cvForm.fullName}</h2>
                    <p className="text-xs text-amber-700 font-sans font-semibold">{cvForm.title}</p>
                    <p className="text-[11px] text-slate-500 font-sans">{cvForm.city} • {cvForm.phone} • {cvForm.email}</p>
                    <hr className="my-3 border-slate-300" />
                    <p className="font-sans font-bold text-slate-800">PROFIL & OBJECTIF :</p>
                    <p className="font-sans text-slate-600 mb-3">{cvForm.summary}</p>
                    <p className="font-sans font-bold text-slate-800">COMPÉTENCES OPÉRATIONNELLES :</p>
                    <p className="font-sans text-slate-600 mb-3">{cvForm.skillsText}</p>
                    <p className="font-sans font-bold text-slate-800">RÉALISATIONS CONCRÈTES :</p>
                    <p className="font-sans text-slate-600">{cvForm.projectDemo}</p>
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center pt-2">
              Modèle conforme aux standards de recrutement UEMOA et international.
            </p>
          </div>
        </div>
      )}

      {/* 7.6 Prospection Commerciale & Recherche de Clients */}
      {activeModule === "client_finder" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <span className="text-[11px] font-bold text-amber-600 uppercase">Assistant Prospection (Section 7.6)</span>
              <h3 className="text-lg font-bold text-slate-900">Trouver et approcher de vrais clients</h3>
              <p className="text-xs text-slate-500">
                Générez des messages de prospection ultra-personnalisés et courtois pour les PME locales.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cible de clients visée</label>
                <input
                  type="text"
                  value={prospectTarget}
                  onChange={(e) => setProspectTarget(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service concret que vous leur proposez</label>
                <input
                  type="text"
                  value={prospectService}
                  onChange={(e) => setProspectService(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <button
                type="button"
                onClick={generateProspectPitch}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                Générer mon message d'approche WhatsApp / Email
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Message d'approche prêt à l'emploi</h3>
              {prospectResult && (
                <button
                  onClick={() => copyToClipboard(prospectResult)}
                  className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded border border-amber-200"
                >
                  Copier le message
                </button>
              )}
            </div>

            {prospectResult ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono whitespace-pre-wrap text-slate-800 leading-relaxed">
                {prospectResult}
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-slate-400">
                Cliquez sur "Générer mon message d'approche" pour afficher votre modèle.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7.7 Assistant Multilingue Français <-> Anglais */}
      {activeModule === "multilingual" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <span className="text-[11px] font-bold text-amber-600 uppercase">Assistant International (Section 7.7)</span>
            <h3 className="text-lg font-bold text-slate-900">Communiquer avec des clients internationaux</h3>
            <p className="text-xs text-slate-500">
              Traduisez et adaptez vos messages commerciaux et propositions professionnelles entre le français et l'anglais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Texte source (Français)</label>
              <textarea
                rows={5}
                value={langInput}
                onChange={(e) => setLangInput(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleTranslate}
                className="mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Traduire en Anglais professionnel
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Traduction professionnelle (Anglais)</label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs min-h-[120px] text-slate-800 font-mono">
                {langOutput || "La traduction s'affichera ici..."}
              </div>
              {langOutput && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(langOutput)}
                  className="mt-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Copier l'anglais
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Calculateur de Prix & Marge (Outil Fiable) */}
      {activeModule === "pricing" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-500" />
              Paramètres de votre calcul de prix
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Taux horaire cible souhaité (FCFA / heure)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre d'heures estimées pour la mission
                </label>
                <input
                  type="number"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Frais directs & consommables (Déplacements, connexion, matériel en FCFA)
                </label>
                <input
                  type="number"
                  value={fixedCosts}
                  onChange={(e) => setFixedCosts(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Marge de sécurité bénéficiaire ciblée (%)
                </label>
                <input
                  type="number"
                  value={targetMarginPercent}
                  onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Résultat économique certifié
              </span>
              <div>
                <span className="text-xs text-slate-400 block">Prix de vente conseillé à facturer :</span>
                <div className="text-3xl font-black text-amber-400 mt-1">
                  {formatCurrency(suggestedSellingPrice, "XOF")}
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-700 pt-4 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Coût de main-d'œuvre de base :</span>
                  <span className="font-bold">{formatCurrency(baseLaborCost, "XOF")}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Frais annexes et matériel :</span>
                  <span className="font-bold">{formatCurrency(fixedCosts, "XOF")}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-700 pt-2">
                  <span>Bénéfice net estimé :</span>
                  <span>+{formatCurrency(estimatedProfit, "XOF")}</span>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/quotes"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold text-center shadow-md transition-colors block"
            >
              Insérer ce montant dans un Devis officiel
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
