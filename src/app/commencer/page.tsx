"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Briefcase, 
  FileText, 
  ShieldAlert, 
  DollarSign, 
  MessageSquare, 
  Award, 
  BookOpen, 
  ChevronRight,
  UserCheck,
  Compass,
  Lightbulb,
  Check
} from "lucide-react";

interface GuideItem {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  content: string[];
  actionLink?: string;
  actionLabel?: string;
}

const ACTION_GUIDES: GuideItem[] = [
  {
    id: "cv",
    title: "Comment créer un CV professionnel percutant sans expérience",
    subtitle: "Valorisez vos projets personnels, compétences pratiques et sérieux",
    icon: FileText,
    content: [
      "1. Remplacez le manque d'expérience par une rubrique 'Réalisations & Projets concrets' : montrez ce que vous avez déjà fait (exercices d'école réussis, visuels créés, tableaux Excel montés).",
      "2. Soyez très précis sur vos compétences techniques et logicielles : ne dites pas 'bonne maîtrise de l'informatique', écrivez 'Tenue de registres Excel, saisie 45 mots/minute, retouche Canva'.",
      "3. Ajoutez une courte phrase d'accroche professionnelle qui exprime votre valeur : 'Jeune rigoureux disponible pour assister vos opérations commerciales et administratives au quotidien'.",
      "4. Utilisez notre Générateur de CV intégré dans AfriGain AI pour obtenir une mise en page claire et professionnelle sans rien payer.",
    ],
    actionLink: "/dashboard/coach-ia",
    actionLabel: "Générer mon CV avec l'IA",
  },
  {
    id: "competences",
    title: "Comment identifier et présenter ses compétences réelles",
    subtitle: "Vous savez faire plus de choses que vous ne le pensez",
    icon: Lightbulb,
    content: [
      "1. Compétences explicites vs transférables : Si vous savez gérer un groupe WhatsApp ou une page Facebook, vous avez des compétences en community management et relation client !",
      "2. Si vous savez organiser des documents et calculer des totaux, vous pouvez proposer un service d'assistance administrative ou de petite gestion de stocks.",
      "3. Faites le Diagnostic Intelligent AfriGain AI : en 2 minutes, répondez à 5 questions pour détecter vos compétences valorisables.",
    ],
    actionLink: "/dashboard/coach-ia",
    actionLabel: "Lancer mon diagnostic de compétences",
  },
  {
    id: "fixer-prix",
    title: "Comment fixer son prix sans se faire exploiter ni faire fuir le client",
    subtitle: "Règles simples de tarification réaliste en Afrique de l'Ouest",
    icon: DollarSign,
    content: [
      "1. Ne travaillez jamais gratuitement sous prétexte 'd'apprendre' : demandez au minimum le remboursement de votre temps et de vos frais de connexion/déplacement.",
      "2. Calculez votre temps : pour une mission de 10 heures au Bénin, visez un taux horaire plancher de 2 500 à 5 000 FCFA/heure selon la technicité.",
      "3. Proposez un forfait clair avec des livrables délimités : ex: 'Création de 5 visuels pour 25 000 FCFA' plutôt qu'un flou artistique qui déborde.",
      "4. Utilisez le Calculateur de Marge AfriGain pour intégrer vos coûts fixes et une marge bénéficiaire nette.",
    ],
    actionLink: "/dashboard/coach-ia",
    actionLabel: "Ouvrir le calculateur de prix",
  },
  {
    id: "repondre-mission",
    title: "Comment répondre à une mission et être sélectionné",
    subtitle: "Les 4 éléments qui font la différence face aux concurrents",
    icon: Briefcase,
    content: [
      "1. Ne faites pas de copier-coller générique : montrez que vous avez lu le besoin de l'entreprise en citant son problème précis.",
      "2. Proposez une méthode en 3 étapes : 'Étape 1 : Cadrage sous 24h ; Étape 2 : Première version ; Étape 3 : Ajustements finaux'.",
      "3. Joignez un exemple concret ou un aperçu direct de ce que vous ferez pour eux.",
      "4. Rassurez sur les délais : donnez une date exacte de livraison plutôt qu'un vague 'bientôt'.",
    ],
    actionLink: "/missions",
    actionLabel: "Voir les missions débutants",
  },
  {
    id: "rediger-devis",
    title: "Comment rédiger un premier devis et une facture aux normes",
    subtitle: "Sécurisez vos paiements dès la première mission",
    icon: Award,
    content: [
      "1. Exigez un acompte à la commande : 30% à 50% avant de démarrer toute prestation pour couvrir vos frais.",
      "2. Détaillez chaque ligne de prestation pour que le client comprenne la valeur de votre travail.",
      "3. Indiquez la date de validité du devis (ex: valable 15 jours) et le mode de paiement (Mobile Money, Virement).",
      "4. Utilisez notre module Devis & Factures AfriGain pour générer un document propre, numéroté et téléchargeable en un clic.",
    ],
    actionLink: "/dashboard/quotes",
    actionLabel: "Créer un devis gratuit",
  },
  {
    id: "eviter-arnaques",
    title: "Comment repérer et éviter les arnaques professionnelles",
    subtitle: "Règles absolues de protection pour votre sécurité financière",
    icon: ShieldAlert,
    content: [
      "1. Règle d'or : Ne payez JAMAIS pour obtenir un travail, un entretien ou un contrat. Toute offre exigeant des 'frais de dossier' ou 'd'inscription préalable' est une arnaque !",
      "2. Méfiez-vous des promesses de gains disproportionnés et faciles ('Gagnez 500 000 FCFA en 2 jours sans rien faire').",
      "3. Vérifiez toujours la présence physique ou légale de l'entreprise avant de vous déplacer dans des lieux isolés.",
      "4. Privilégiez les entreprises portant le badge 'Vérifié' sur AfriGain et signalez tout comportement suspect à nos modérateurs.",
    ],
  },
  {
    id: "preparer-entretien",
    title: "Comment réussir son premier entretien client ou d'embauche",
    subtitle: "Avoir confiance et démontrer son professionnalisme",
    icon: MessageSquare,
    content: [
      "1. Renseignez-vous à fond sur l'entreprise avant l'appel : son activité, ses clients, ses actualités.",
      "2. Soyez ponctuel et soignez votre environnement (bonne connexion, endroit calme, tenue soignée).",
      "3. Répondez avec la méthode Situation - Action - Résultat : racontez un exemple concret où vous avez résolu un problème.",
      "4. Posez une question intelligente à la fin : 'Quels sont les objectifs prioritaires pour ce poste au cours des trois prochains mois ?'.",
    ],
  },
];

export default function CommencerPage() {
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);

  // Évaluation interactive rapide (Étape 1 & 2)
  const [stepScore, setStepScore] = useState<{ [key: string]: boolean }>({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  });

  const toggleStep = (stepKey: string) => {
    setStepScore((prev) => ({ ...prev, [stepKey]: !prev[stepKey] }));
  };

  const completedCount = Object.values(stepScore).filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* En-tête Hero */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-brand-700 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-200" />
            Parcours Débutants • Aucun prérequis, zéro frais
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Je commence avec AfriGain
          </h1>
          <p className="text-emerald-50 text-sm sm:text-base leading-relaxed">
            Vous n'avez pas encore d'expérience professionnelle ou de réseau ? Pas de panique. Ce programme vous guide étape par étape pour valoriser ce que vous savez déjà faire, réaliser vos premières démonstrations et décrocher vos premiers revenus.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/emplois"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-md"
            >
              <Briefcase className="w-4 h-4" />
              Offres accessibles aux débutants
            </Link>
            <Link
              href="/dashboard/coach-ia"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold text-xs border border-white/20 transition-colors"
            >
              <Compass className="w-4 h-4" />
              Faire mon diagnostic de compétences avec l'IA
            </Link>
          </div>
        </div>
      </div>

      {/* Le Parcours en 10 Étapes Concrètes (Section 14) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block">
            Feuille de route pas-à-pas
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            Les 10 Étapes pour passer de l'ambition aux premiers revenus
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Cochez vos étapes terminées pour suivre votre progression réelle :
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: "s1", num: "1", title: "Évaluation simple de mes compétences", desc: "Identifier tout ce que je sais faire (bureautique, réseaux sociaux, retouche, langues, organisation).", link: "/dashboard/coach-ia", linkText: "Diagnostic IA" },
            { id: "s2", num: "2", title: "Définition de mes 2 ou 3 premiers services", desc: "Formuler des offres précises et compréhensibles par des commerçants ou PME locales.", link: "/dashboard/coach-ia", linkText: "Générateur d'offres" },
            { id: "s3", num: "3", title: "Création de mon profil professionnel", desc: "Renseigner ma bio, mes compétences clés et mes moyens de contact sans mentir.", link: "/dashboard/profile", linkText: "Mon profil" },
            { id: "s4", num: "4", title: "Réalisation d'un premier projet de démonstration", desc: "Créer un exemple concret (un document type, une maquette, un compte rendu) pour prouver ma valeur.", link: null, linkText: null },
            { id: "s5", num: "5", title: "Constitution de mon portfolio", desc: "Regrouper mes réalisations dans un dossier ou lien partageable.", link: "/services", linkText: "Exemples vitrines" },
            { id: "s6", num: "6", title: "Ciblage des missions adaptées aux débutants", desc: "Filtrer les opportunités sans exigences de 5 ans d'expérience.", link: "/emplois", linkText: "Voir les offres" },
            { id: "s7", num: "7", title: "Préparation de propositions commerciales convaincantes", desc: "Expliquer en 3 points comment je vais résoudre le problème du client.", link: "/missions", linkText: "Missions ouvertes" },
            { id: "s8", num: "8", title: "Accès aux opportunités d'apprentissage pratiques", desc: "Consulter les stages d'immersion et formations rapides orientées action.", link: "/opportunites", linkText: "Opportunités" },
            { id: "s9", num: "9", title: "Négociation & premier devis officiel", desc: "Fixer un prix juste et éditer un devis clair pour sécuriser un acompte.", link: "/dashboard/quotes", linkText: "Créateur de devis" },
            { id: "s10", num: "10", title: "Suivi et fidélisation de mon premier client", desc: "Livrer à l'heure, demander un avis authentique et proposer un suivi régulier.", link: "/dashboard", linkText: "Tableau de bord" },
          ].map((step, idx) => (
            <div
              key={step.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-brand-500 hover:shadow-sm transition-all space-y-2 flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0 text-sm">
                {step.num}
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                <p className="text-xs text-slate-500">{step.desc}</p>
                {step.link && (
                  <Link
                    href={step.link}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 pt-1"
                  >
                    {step.linkText} <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bibliothèque de Mini-Guides Pratiques Orientés Action (Section 14) */}
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block">
            Fiches Pratiques
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            Guides d'action rapides pour réussir
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Des conseils concrets, sans jargon théorique, pour vous protéger et avancer vite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACTION_GUIDES.map((guide) => {
            const Icon = guide.icon;
            return (
              <div
                key={guide.id}
                onClick={() => setSelectedGuide(guide)}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-brand-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{guide.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{guide.subtitle}</p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs font-semibold text-brand-600">
                  <span>Lire le guide</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modale de lecture d'un guide */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-brand-600 uppercase">Fiche pratique AfriGain</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedGuide.title}</h3>
                <p className="text-xs text-slate-500">{selectedGuide.subtitle}</p>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {selectedGuide.content.map((paragraph, idx) => (
                <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  {paragraph}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedGuide(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Fermer
              </button>
              {selectedGuide.actionLink && (
                <Link
                  href={selectedGuide.actionLink}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  {selectedGuide.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
