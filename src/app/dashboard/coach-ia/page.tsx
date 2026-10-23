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
  Layers
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "coach" | "user";
  text: string;
  timestamp: string;
}

export default function BusinessCoachIAPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "coach",
      text: "Bonjour ! Je suis votre Business Coach AFriGain. Je vous aide à structurer vos offres de services, calculer des prix réalistes avec marge nette, et rédiger des propositions percutantes pour vos clients. Sur quoi travaillons-nous aujourd'hui ?",
      timestamp: "Maintenant",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Outil Calculateur de marge intégré
  const [activeTab, setActiveTab] = useState<"chat" | "pricing">("chat");
  const [hourlyRate, setHourlyRate] = useState<number>(5000); // 5000 FCFA/h
  const [estimatedHours, setEstimatedHours] = useState<number>(25);
  const [fixedCosts, setFixedCosts] = useState<number>(15000);
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(20);

  // Calculs
  const baseLaborCost = hourlyRate * estimatedHours;
  const totalCost = baseLaborCost + fixedCosts;
  const suggestedSellingPrice = Math.round(totalCost / (1 - (targetMarginPercent / 100)));
  const estimatedProfit = suggestedSellingPrice - totalCost;

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

    // Réponse intelligente du Coach IA axée méthodologie entrepreneuriale
    setTimeout(() => {
      let reply = "Pour cette prestation, je vous suggère de décomposer votre offre en 3 livrables concrets avec jalons de validation. Prévoyez un acompte de 30% à la signature pour sécuriser votre trésorerie, et détaillez précisément ce qui est inclus et hors périmètre pour éviter les glissements de mission.";
      
      if (inputVal.toLowerCase().includes("prix") || inputVal.toLowerCase().includes("devis") || inputVal.toLowerCase().includes("tarif")) {
        reply = `Pour tarifer cette prestation au Bénin / UEMOA, utilisez notre calculateur de prix à droite. À titre indicatif, basez-vous sur votre taux horaire cible (ex: ${formatCurrency(hourlyRate, "XOF")}/h) plus une marge de sécurité de 15 à 20% pour couvrir les imprévus.`;
      } else if (inputVal.toLowerCase().includes("client") || inputVal.toLowerCase().includes("prospect")) {
        reply = "Pour approcher ce client, mettez en avant un cas concret similaire déjà réalisé dans votre portfolio. Insistez sur le retour sur investissement opérationnel pour son entreprise plutôt que sur des aspects purement techniques.";
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
    }, 900);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour Tableau de bord
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Business Coach IA
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Conseil en structuration d'offres, tarification et rédaction commerciale.
          </p>
        </div>

        {/* Onglets navigation */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "chat" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Discussion Coach
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "pricing" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Calculateur de marge
          </button>
        </div>
      </div>

      {/* Règle de transparence IA (Conformité Module H) */}
      <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p>
          <strong>Principe d'intégrité IA :</strong> Les suggestions générées sont des aides méthodologiques fondées sur vos données et hypothèses. Elles ne constituent ni une garantie de vente ni un conseil fiscal agréé.
        </p>
      </div>

      {activeTab === "chat" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fenêtre de discussion */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px]">
            {/* Messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-xl ${m.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      m.sender === "user" ? "bg-brand-600 text-white" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {m.sender === "user" ? "Moi" : "IA"}
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      m.sender === "user"
                        ? "bg-brand-600 text-white rounded-tr-none"
                        : "bg-slate-100 text-slate-800 rounded-tl-none"
                    }`}
                  >
                    {m.text}
                    <span className={`block text-[10px] mt-1.5 ${m.sender === "user" ? "text-brand-200" : "text-slate-400"}`}>
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 items-center text-xs text-slate-400">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
                    IA
                  </div>
                  <span>Le Coach réfléchit à la meilleure stratégie...</span>
                </div>
              )}
            </div>

            {/* Saisie */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Posez votre question (ex: Comment structurer une offre de maintenance web ?)"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Envoyer
              </button>
            </form>
          </div>

          {/* Raccourcis de génération d'offres */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                Actions Rapides Recommandées
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setInputVal("Rédige un message de prospection pour proposer la refonte d'un site web d'une entreprise locale")}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-100 hover:border-amber-300 hover:bg-amber-50/50 text-xs text-slate-700 transition-colors"
                >
                  📨 Message de prospection pour entreprise locale
                </button>
                <button
                  onClick={() => setInputVal("Quelles sont les clauses indispensables dans un devis pour éviter les retards de paiement ?")}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-100 hover:border-amber-300 hover:bg-amber-50/50 text-xs text-slate-700 transition-colors"
                >
                  🛡️ Clauses pour sécuriser un acompte
                </button>
                <button
                  onClick={() => setInputVal("Comment convertir un client ponctuel en contrat récurrent de maintenance mensuelle ?")}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-100 hover:border-amber-300 hover:bg-amber-50/50 text-xs text-slate-700 transition-colors"
                >
                  🔄 Transformer une mission en revenu récurrent
                </button>
              </div>
            </div>

            <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl space-y-2 text-xs">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> Quota Coach IA
              </div>
              <p className="text-slate-400">
                Plan gratuit : 10 requêtes incluses par mois. Les calculs et simulations de prix restent illimités.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Calculateur de marge et tarification */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-brand-600" />
              Hypothèses de votre prestation
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Votre taux horaire visé (FCFA / heure)
                </label>
                <input
                  type="number"
                  step="500"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nombre d'heures estimées pour la mission
                </label>
                <input
                  type="number"
                  min="1"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Frais et débours (abonnements, transport, ressources) en FCFA
                </label>
                <input
                  type="number"
                  step="1000"
                  value={fixedCosts}
                  onChange={(e) => setFixedCosts(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Marge bénéficiaire nette cible (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={targetMarginPercent}
                  onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Résultat simulé */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Décomposition du Prix Conseillé
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Coût de votre temps ({estimatedHours}h) :</span>
                  <span className="font-semibold">{formatCurrency(baseLaborCost, "XOF")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Frais annexes et charges :</span>
                  <span className="font-semibold">{formatCurrency(fixedCosts, "XOF")}</span>
                </div>
                <div className="flex justify-between text-slate-900 border-t border-slate-200 pt-2 font-bold">
                  <span>Coût de revient total :</span>
                  <span>{formatCurrency(totalCost, "XOF")}</span>
                </div>
                <div className="flex justify-between text-emerald-700 pt-1 font-semibold">
                  <span>Marge nette calculée ({targetMarginPercent}%) :</span>
                  <span>+{formatCurrency(estimatedProfit, "XOF")}</span>
                </div>
              </div>

              <div className="bg-brand-50 border border-brand-200 p-4 rounded-xl space-y-1">
                <span className="text-[11px] font-semibold text-brand-800 uppercase block">
                  Prix minimal à inscrire sur votre devis :
                </span>
                <span className="text-2xl font-extrabold text-brand-700">
                  {formatCurrency(suggestedSellingPrice, "XOF")}
                </span>
              </div>
            </div>

            <Link
              href={`/dashboard/quotes?amount=${suggestedSellingPrice}&desc=${encodeURIComponent(`Mission de ${estimatedHours}h estimées`)}`}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-center text-xs shadow-sm transition-all"
            >
              Insérer ce montant dans un devis
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
