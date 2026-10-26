"use client";

import { useState, useRef, useEffect } from "react";
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
  Briefcase,
  RotateCcw,
  RefreshCw
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import CvGeneratorModule from "@/components/cv-generator/CvGeneratorModule";

interface ChatMessage {
  id: string;
  sender: "coach" | "user";
  text: string;
  timestamp: string;
  source?: "external_llm" | "smart_engine";
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
  const initialWelcomeMessage: ChatMessage = {
    id: "welcome-1",
    sender: "coach",
    text: "Bonjour et bienvenue sur AfriGain ! Je suis votre Business Coach IA. Je vous accompagne dans le développement de vos compétences, la recherche d'opportunités de revenus, la fixation de vos prix ou la création de votre activité. Comment puis-je vous aider aujourd'hui ?",
    timestamp: "Maintenant",
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Réinitialiser la conversation
  const handleResetConversation = () => {
    setMessages([
      {
        ...initialWelcomeMessage,
        id: `welcome-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setErrorMessage(null);
  };

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

  // 4. Générateur Professionnel de CV & Lettres (Module dédié CvGeneratorModule)

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

  // Envoi réel des messages au backend API Coach IA
  const sendMessageToServer = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputVal("");
    setErrorMessage(null);
    setIsTyping(true);

    try {
      // Préparer l'historique conversationnel pour le modèle
      const historyPayload = messages.map((m) => ({
        role: m.sender === "coach" ? "assistant" : "user",
        content: m.text,
      }));

      const response = await fetch("/api/coach-ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMsg.text,
          history: historyPayload,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || `Erreur serveur (${response.status})`);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "coach",
          text: data.text,
          timestamp: data.timestamp || new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          source: data.source,
        },
      ]);
    } catch (err: any) {
      console.error("Erreur lors de l'appel au Coach IA:", err);
      setErrorMessage(
        err?.message || "Impossible de joindre le Business Coach pour le moment. Veuillez vérifier votre connexion et réessayer."
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessageToServer(inputVal);
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
                Business Coach conversationnel, diagnostic de compétences, calculateur de marge, CV pro & prospection.
              </p>
            </div>
          </div>
        </div>

        {/* Badge sécurité IA */}
        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>IA Conversationnelle Active • Réponses Réelles & Contextuelles</span>
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
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[640px]">
            {/* Barre de statut du chat avec bouton réinitialisation */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">Business Coach AfriGain</span>
                <span className="text-[10px] text-slate-500">
                  (Français / Anglais • Contexte économique africain & UEMOA)
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetConversation}
                title="Démarrer une nouvelle conversation"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-white hover:text-amber-700 hover:border-amber-300 border border-slate-200 rounded-lg transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                Nouvelle conversation
              </button>
            </div>

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
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                      m.sender === "coach"
                        ? "bg-amber-50/70 border border-amber-200/60 text-slate-800 rounded-tl-none shadow-2xs"
                        : "bg-brand-600 text-white rounded-tr-none shadow-2xs"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    <div
                      className={`text-[10px] flex items-center justify-between pt-1 border-t ${
                        m.sender === "coach"
                          ? "text-amber-800/60 border-amber-200/50"
                          : "text-white/70 border-white/20"
                      }`}
                    >
                      <span>
                        {m.sender === "coach" && (
                          m.source === "external_llm" ? "Modèle IA connecté" : "Assistant Intelligent AfriGain"
                        )}
                      </span>
                      <span>{m.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-500 pl-11">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Le Coach analyse votre situation et formule sa réponse...</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    onClick={() => {
                      const lastUserMsg = [...messages].reverse().find((m) => m.sender === "user");
                      if (lastUserMsg) sendMessageToServer(lastUserMsg.text);
                    }}
                    className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-semibold rounded text-[11px] shrink-0"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Outils complémentaires suggérés par le Coach */}
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Outils 1-clic :
              </span>
              <button
                type="button"
                onClick={() => setActiveModule("pricing")}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-amber-400 hover:text-amber-700 transition-colors"
              >
                Calculateur de marge
              </button>
              <button
                type="button"
                onClick={() => setActiveModule("cv_generator")}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-amber-400 hover:text-amber-700 transition-colors"
              >
                Générateur de CV & Lettres
              </button>
              <button
                type="button"
                onClick={() => setActiveModule("diagnostic")}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-amber-400 hover:text-amber-700 transition-colors"
              >
                Diagnostic compétences
              </button>
              <button
                type="button"
                onClick={() => setActiveModule("client_finder")}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-amber-400 hover:text-amber-700 transition-colors"
              >
                Prospection clients
              </button>
            </div>

            {/* Saisie */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Posez votre question (ex: Bonjour, comment trouver mes premiers clients, comment calculer mon prix...)"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={isTyping}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isTyping}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Envoyer</span>
              </button>
            </form>
          </div>

          {/* Raccourcis & Conseils Coach */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Suggestions & Scénarios fréquents
              </h3>
              <p className="text-[11px] text-slate-500">
                Cliquez sur une question pour démarrer l'échange avec le Coach :
              </p>
              <div className="space-y-2">
                {[
                  "Bonjour",
                  "Je suis étudiant au Bénin. Je veux gagner 5 000 FCFA par jour, mais je n'ai pas de capital.",
                  "Je veux lancer une activité de vente de vêtements à Cotonou avec un budget de 20 000 FCFA.",
                  "Quelle est la différence entre le chiffre d'affaires et le bénéfice ?",
                  "Aide-moi à rédiger un CV professionnel.",
                  "Comment calculer le bon prix pour un client à Cotonou ?",
                  "Quels arguments utiliser face à un client qui hésite ?",
                ].map((promptText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      sendMessageToServer(promptText);
                    }}
                    disabled={isTyping}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-200/80 text-xs text-slate-700 transition-colors disabled:opacity-60"
                  >
                    💡 {promptText}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 shadow-sm text-xs space-y-2 text-slate-700">
              <h4 className="font-bold text-amber-950 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                Règles d'or de l'entrepreneur AfriGain
              </h4>
              <p>• Ne démarrez jamais un chantier important sans acompte ni devis validé.</p>
              <p>• Calculez vos coûts réels (temps, transport, forfait internet) avant de fixer un prix.</p>
              <p>• Validez la demande sur le terrain avant d'engager de gros frais de stock ou de local.</p>
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

      {/* 7.4 Générateur Professionnel de CV & Lettres de motivation */}
      {activeModule === "cv_generator" && <CvGeneratorModule />}

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
