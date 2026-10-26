"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  Building2, 
  Briefcase, 
  Package, 
  ArrowRight, 
  Send, 
  CheckCircle2, 
  HelpCircle,
  X,
  PhoneCall,
  DollarSign
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface PricingPlan {
  id: string;
  code: string;
  name: string;
  category: "subscription" | "sponsored_ad" | "advertising" | "free";
  price_amount: number;
  currency: string;
  duration_days: number | null;
  billing_period: string;
  description: string;
  features: string[];
  is_popular: boolean;
  display_order: number;
}

export default function TarifsPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal d'intérêt / Demande d'offre (Sans faux paiement)
  const [selectedPlanForRequest, setSelectedPlanForRequest] = useState<PricingPlan | null>(null);
  const [preferredMethod, setPreferredMethod] = useState("momo_mtn");
  const [phoneContact, setPhoneContact] = useState("");
  const [requestNotes, setRequestNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
    loadPricingPlans();
  }, []);

  const loadPricingPlans = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("pricing_plans")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (data && data.length > 0) {
      setPlans(data as any);
    } else {
      // Fallback par défaut selon les spécifications
      setPlans([
        {
          id: "1",
          code: "free_particulier",
          name: "Inscription Particuliers",
          category: "free",
          price_amount: 0,
          currency: "XOF",
          duration_days: null,
          billing_period: "free",
          description: "Accès complet pour jeunes, artisans et particuliers.",
          features: [
            "Création de profil personnel",
            "Candidature aux offres et missions",
            "Participation aux défis communautaires",
            "Consultation du fil d'actualité",
            "Messagerie professionnelle"
          ],
          is_popular: false,
          display_order: 1
        },
        {
          id: "2",
          code: "pro_base",
          name: "Profil Professionnel de Base",
          category: "free",
          price_amount: 0,
          currency: "XOF",
          duration_days: null,
          billing_period: "free",
          description: "La base indispensable pour exercer votre activité.",
          features: [
            "Vitrine avec 1 photo de réalisation",
            "Création de devis et factures conformes",
            "Référencement dans l'annuaire standard",
            "Accès aux opportunités du jour"
          ],
          is_popular: false,
          display_order: 2
        },
        {
          id: "3",
          code: "pro_plus",
          name: "Profil Professionnel Plus",
          category: "subscription",
          price_amount: 1000,
          currency: "XOF",
          duration_days: 30,
          billing_period: "month",
          description: "Visibilité renforcée pour développer votre clientèle locale.",
          features: [
            "Tous les avantages du profil de Base",
            "Galerie étendue jusqu'à 5 photos de réalisations",
            "Badge de mise en avant sur l'annuaire",
            "Édition illimitée de devis et factures",
            "Positionnement prioritaire dans « Près de moi »"
          ],
          is_popular: true,
          display_order: 3
        },
        {
          id: "4",
          code: "pro_premium",
          name: "Profil Professionnel Premium",
          category: "subscription",
          price_amount: 2500,
          currency: "XOF",
          duration_days: 30,
          billing_period: "month",
          description: "La solution ultime pour les entreprises et indépendants leaders.",
          features: [
            "Tous les avantages du Profil Plus",
            "Accès direct en avant-première aux demandes « Je recherche »",
            "Publication instantanée d'annonces sans délai de modération",
            "Vérification prioritaire des dossiers d'identité",
            "Assistance et support prioritaire dédié"
          ],
          is_popular: false,
          display_order: 4
        },
        {
          id: "5",
          code: "sponsor_7j",
          name: "Annonce Sponsorisée (7 jours)",
          category: "sponsored_ad",
          price_amount: 500,
          currency: "XOF",
          duration_days: 7,
          billing_period: "once",
          description: "Mise en tête de liste de votre offre ou service pendant 7 jours.",
          features: [
            "Épinglage en haut du fil AfriGain",
            "Mention « Annonce Sponsorisée »",
            "Visibilité maximale sur mobile et ordinateur",
            "Statistiques de vues réelles"
          ],
          is_popular: false,
          display_order: 5
        },
        {
          id: "6",
          code: "sponsor_15j",
          name: "Annonce Sponsorisée (15 jours)",
          category: "sponsored_ad",
          price_amount: 1000,
          currency: "XOF",
          duration_days: 15,
          billing_period: "once",
          description: "Visibilité continue pendant deux semaines pour trouver vos clients.",
          features: [
            "Épinglage pendant 15 jours consécutifs",
            "Mention « Annonce Sponsorisée »",
            "Diffusion prioritaire dans les résultats de recherche"
          ],
          is_popular: true,
          display_order: 6
        },
        {
          id: "7",
          code: "sponsor_30j",
          name: "Annonce Sponsorisée (30 jours)",
          category: "sponsored_ad",
          price_amount: 2000,
          currency: "XOF",
          duration_days: 30,
          billing_period: "once",
          description: "Campagne complète d'un mois pour un impact économique maximal.",
          features: [
            "Épinglage pendant 30 jours complets",
            "Présence continue dans les opportunités du jour",
            "Recommandation ciblée par compétence et ville"
          ],
          is_popular: false,
          display_order: 7
        },
        {
          id: "8",
          code: "ad_custom",
          name: "Publicité Professionnelle B2B",
          category: "advertising",
          price_amount: 5000,
          currency: "XOF",
          duration_days: null,
          billing_period: "custom",
          description: "Bannières dédiées, partenariats événementiels AfriGain Live et campagnes de marque.",
          features: [
            "Bannière exclusive dans les espaces clés",
            "Sponsoring officiel d'ateliers AfriGain Live",
            "Mise en avant ciblée par pays et secteur",
            "Accompagnement commercial sur mesure par l'administrateur"
          ],
          is_popular: false,
          display_order: 8
        }
      ]);
    }
    setIsLoading(false);
  };

  const handleSendPricingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }
    if (!selectedPlanForRequest) return;

    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("pricing_requests").insert({
      user_id: currentUser.id,
      plan_id: selectedPlanForRequest.id,
      plan_code: selectedPlanForRequest.code,
      amount: selectedPlanForRequest.price_amount,
      currency: selectedPlanForRequest.currency,
      preferred_payment_method: preferredMethod,
      phone_contact: phoneContact.trim(),
      notes: requestNotes.trim() || null,
      status: "pending",
    });

    setIsSubmitting(false);
    if (!error) {
      setRequestSuccess(true);
      setTimeout(() => {
        setSelectedPlanForRequest(null);
        setRequestSuccess(false);
        setPhoneContact("");
        setRequestNotes("");
      }, 2500);
    } else {
      alert("Erreur lors de l'enregistrement de votre demande : " + error.message);
    }
  };

  const subscriptionPlans = plans.filter((p) => p.category === "subscription" || p.category === "free");
  const sponsoredPlans = plans.filter((p) => p.category === "sponsored_ad");
  const advertisingPlans = plans.filter((p) => p.category === "advertising");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 flex-1">
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Tarifs Transparents & Sans Surprise
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tarifs et Services Professionnels
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Chez AfriGain, l'inscription et les fonctionnalités de base restent <strong className="text-slate-900">100% gratuites</strong> pour tous les particuliers, artisans, entreprises et fournisseurs. Développez votre activité avec des options professionnelles abordables.
          </p>
        </div>

        {/* 1. SECTION FORMULES & PROFILS PROFESSIONNELS */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-600" />
              Profils & Abonnements Professionnels
            </h2>
            <p className="text-xs text-slate-500">
              Des solutions accessibles pour accroître votre réputation et décrocher des contrats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Formule Gratuite de Base */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6 hover:border-slate-300 transition-colors">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  Inclus & Illimité
                </span>
                <h3 className="text-lg font-bold text-slate-900">Profil Professionnel de Base</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">0 FCFA</span>
                  <span className="text-xs text-slate-500">/ mois</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Idéal pour débuter, candidater aux missions, échanger des devis et se faire référencer.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Inscription gratuite (Particuliers & Entreprises)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Vitrine avec 1 photo de réalisation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Création de devis et factures conformes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Accès aux opportunités du jour & candidatures</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/register"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl text-center transition-colors block"
              >
                Commencer gratuitement
              </Link>
            </div>

            {/* Profil Professionnel Plus */}
            <div className="bg-white rounded-3xl border-2 border-brand-500 p-6 shadow-md flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                Recommandé
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
                  Formule Plus
                </span>
                <h3 className="text-lg font-bold text-slate-900">Profil Professionnel Plus</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-brand-600">1 000 FCFA</span>
                  <span className="text-xs text-slate-500">/ mois</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Visibilité élargie pour présenter jusqu'à 5 photos et apparaître en tête dans « Près de moi ».
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tous les avantages du profil de Base</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Galerie étendue jusqu'à 5 photos de réalisations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Badge de mise en avant sur l'annuaire</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Positionnement prioritaire dans « Près de moi »</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Édition illimitée de devis et factures</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    const p = plans.find((x) => x.code === "pro_plus") || subscriptionPlans[1];
                    setSelectedPlanForRequest(p as any);
                  }}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl text-center transition-colors shadow-xs"
                >
                  Souscrire à la formule Plus
                </button>
                <div className="flex items-center justify-center gap-1 text-[10px] text-amber-700 font-medium">
                  <Clock className="w-3 h-3" />
                  <span>Paiement en ligne bientôt disponible</span>
                </div>
              </div>
            </div>

            {/* Profil Professionnel Premium */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6 hover:border-slate-300 transition-colors">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                  Excellence
                </span>
                <h3 className="text-lg font-bold text-slate-900">Profil Professionnel Premium</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">2 500 FCFA</span>
                  <span className="text-xs text-slate-500">/ mois</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pour les entreprises et prestataires leaders voulant un accès direct aux grands marchés B2B.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tous les avantages du Profil Plus</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Accès direct aux demandes « Je recherche »</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Publication instantanée sans modération préalable</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Traitement prioritaire des documents d'identité</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Support dédié par l'équipe administrative</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    const p = plans.find((x) => x.code === "pro_premium") || subscriptionPlans[2];
                    setSelectedPlanForRequest(p as any);
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl text-center transition-colors"
                >
                  Souscrire à la formule Premium
                </button>
                <div className="flex items-center justify-center gap-1 text-[10px] text-amber-700 font-medium">
                  <Clock className="w-3 h-3" />
                  <span>Paiement en ligne bientôt disponible</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SECTION ANNONCES SPONSORISÉES (Section 3 du prompt) */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Options de Visibilité & Annonces Sponsorisées
            </h2>
            <p className="text-xs text-slate-500">
              Mettez en avant une opportunité urgente, un déstockage ou votre annonce de recrutement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 7 Jours */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Durée : 1 semaine</span>
                <h3 className="text-base font-bold text-slate-900">Annonce Sponsorisée 7 jours</h3>
                <div className="text-2xl font-black text-slate-900">500 FCFA</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Épinglage en haut du fil AfriGain pendant 7 jours consécutifs avec mention spéciale.
                </p>
              </div>
              <button
                onClick={() => {
                  const p = plans.find((x) => x.code === "sponsor_7j") || sponsoredPlans[0];
                  setSelectedPlanForRequest(p as any);
                }}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Sponsoriser 7 jours
              </button>
            </div>

            {/* 15 Jours */}
            <div className="bg-white rounded-3xl border-2 border-amber-400 p-6 shadow-md flex flex-col justify-between space-y-4 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                Populaire
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Durée : 2 semaines</span>
                <h3 className="text-base font-bold text-slate-900">Annonce Sponsorisée 15 jours</h3>
                <div className="text-2xl font-black text-amber-700">1 000 FCFA</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Deux semaines de visibilité continue et diffusion prioritaire dans les résultats de recherche.
                </p>
              </div>
              <button
                onClick={() => {
                  const p = plans.find((x) => x.code === "sponsor_15j") || sponsoredPlans[1];
                  setSelectedPlanForRequest(p as any);
                }}
                className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
              >
                Sponsoriser 15 jours
              </button>
            </div>

            {/* 30 Jours */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Durée : 1 mois</span>
                <h3 className="text-base font-bold text-slate-900">Annonce Sponsorisée 30 jours</h3>
                <div className="text-2xl font-black text-slate-900">2 000 FCFA</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Présence continue pendant 30 jours dans les opportunités du jour et recommandations directes.
                </p>
              </div>
              <button
                onClick={() => {
                  const p = plans.find((x) => x.code === "sponsor_30j") || sponsoredPlans[2];
                  setSelectedPlanForRequest(p as any);
                }}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Sponsoriser 30 jours
              </button>
            </div>
          </div>
        </div>

        {/* 3. SECTION PUBLICITÉ B2B & GESTION ADMIN */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
              Campagnes & Partenariats B2B
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold">Publicité Professionnelle Sur Mesure</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Bannières ciblées, sponsoring officiel d'ateliers en direct AfriGain Live et campagnes de marque dans toute la sous-région. Tarification modulable à partir de <strong className="text-white">5 000 FCFA</strong> selon vos objectifs.
            </p>
          </div>

          <button
            onClick={() => {
              const p = plans.find((x) => x.code === "ad_custom") || advertisingPlans[0];
              setSelectedPlanForRequest(p as any);
            }}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shrink-0 transition-colors shadow-md"
          >
            Demander une offre publicitaire
          </button>
        </div>

        {/* 4. NOTE DE TRANSPARENCE & AUCUN FAUX PAIEMENT */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            Engagement de Transparence & Moyens de Paiement
          </h4>
          <p>
            • <strong>Aucun prélèvement automatique non autorisé :</strong> L'intégration technique des passerelles de paiement locales (MTN Mobile Money, Moov Money, Celtiis Cash, Cartes bancaires UEMOA) est en cours de finalisation avec des prestataires agréés.
          </p>
          <p>
            • <strong>Zéro simulation fictive :</strong> Vous pouvez pré-commander ou manifester votre intérêt dès maintenant sans jamais être débité. Votre compte de base reste 100% opérationnel et gratuit.
          </p>
        </div>
      </main>

      {/* Modal Demande d'Offre (Sans Faux Paiement) */}
      {selectedPlanForRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                  Demande d'Offre Professionnelle
                </span>
                <h3 className="font-bold text-slate-900 text-base">{selectedPlanForRequest.name}</h3>
              </div>
              <button
                onClick={() => setSelectedPlanForRequest(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-base">Demande enregistrée !</h4>
                <p className="text-xs text-slate-500">
                  Votre demande pour <strong className="text-slate-800">{selectedPlanForRequest.name}</strong> a été enregistrée avec succès. Un administrateur vous contactera dès que la passerelle de paiement en ligne sera ouverte.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendPricingRequest} className="space-y-4 text-xs">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    Paiement en ligne bientôt disponible
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Tarif officiel : <strong>{selectedPlanForRequest.price_amount.toLocaleString("fr-FR")} {selectedPlanForRequest.currency}</strong>. Aucun paiement n'est exigé aujourd'hui.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Votre numéro WhatsApp ou Téléphone pour être notifié *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+229 97 00 00 00"
                    value={phoneContact}
                    onChange={(e) => setPhoneContact(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Moyen de paiement préféré lors de l'activation
                  </label>
                  <select
                    value={preferredMethod}
                    onChange={(e) => setPreferredMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                  >
                    <option value="momo_mtn">MTN Mobile Money (Bénin / UEMOA)</option>
                    <option value="moov_money">Moov Money (Bénin / UEMOA)</option>
                    <option value="celtiis_cash">Celtiis Cash (Bénin)</option>
                    <option value="card">Carte Bancaire Visa / Mastercard</option>
                    <option value="bank_transfer">Virement Bancaire</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Précisions ou questions (optionnel)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Détails sur votre entreprise ou besoins spécifiques..."
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanForRequest(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl disabled:opacity-50"
                  >
                    {isSubmitting ? "Envoi..." : "Enregistrer mon intérêt"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
