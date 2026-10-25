import Link from "next/link";
import { ShieldCheck, Globe, Heart, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Col 1 : Marque & Vision */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-lg">
                AF
              </div>
              <span className="font-extrabold text-xl text-white">AFriGain</span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Plateforme intelligente de transformation économique. Nous connectons les jeunes, les artisans, les indépendants, les entrepreneurs et les entreprises au Bénin, en Afrique et à l'international.
            </p>
            <div className="flex items-center gap-2 text-brand-400 font-medium bg-brand-950/60 border border-brand-800/60 px-3 py-1.5 rounded-full w-fit">
              <ShieldCheck className="w-4 h-4" />
              Piloté au Bénin • Déploiement UEMOA & International
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Principe : Des compétences aux opportunités réelles sans fausses promesses.
            </div>
          </div>

          {/* Col 2 : Opportunités & Marchés */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">
              Opportunités & Marchés
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li>
                <Link href="/emplois" className="hover:text-white transition-colors">
                  Emplois par Métier & Région
                </Link>
              </li>
              <li>
                <Link href="/missions" className="hover:text-white transition-colors">
                  Missions Rémunérées
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Catalogue Services & Talents
                </Link>
              </li>
              <li>
                <Link href="/opportunites" className="hover:text-white transition-colors">
                  Index des Opportunités Économiques
                </Link>
              </li>
              <li>
                <Link href="/fournisseurs" className="hover:text-white transition-colors">
                  Marketplace Fournisseurs B2B
                </Link>
              </li>
              <li>
                <Link href="/entreprises" className="hover:text-white transition-colors">
                  Annuaire des Entreprises
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 : Outils Professionnels & IA */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">
              Outils & AfriGain AI
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li>
                <Link href="/dashboard/coach-ia" className="hover:text-white transition-colors text-amber-400 font-medium">
                  🤖 Business Coach IA
                </Link>
              </li>
              <li>
                <Link href="/dashboard/quotes" className="hover:text-white transition-colors">
                  Créateur de Devis PDF
                </Link>
              </li>
              <li>
                <Link href="/dashboard/invoices" className="hover:text-white transition-colors">
                  Facturation & Encaissements
                </Link>
              </li>
              <li>
                <Link href="/dashboard/coach-ia" className="hover:text-white transition-colors">
                  Calculateur de Prix & Marge
                </Link>
              </li>
              <li>
                <Link href="/dashboard/coach-ia" className="hover:text-white transition-colors">
                  Générateur de CV Professionnel
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Mon Espace (Tableau de bord)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 : Parcours Débutants & Sécurité */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">
              Débutants & Confiance
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li>
                <Link href="/commencer" className="hover:text-white transition-colors text-emerald-400 font-semibold">
                  ✨ Je commence sans expérience
                </Link>
              </li>
              <li>
                <Link href="/commencer" className="hover:text-white transition-colors">
                  Guides d'action anti-arnaques
                </Link>
              </li>
              <li>
                <Link href="/commencer" className="hover:text-white transition-colors">
                  Comment fixer son premier prix
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Signalement de contenu suspect
                </Link>
              </li>
              <li>
                <span className="text-[11px] text-slate-500 block pt-1">
                  Assistance : support@afrigain.bj
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bas de page */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 AFriGain. Plateforme de transformation économique. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <span>Bénin (Cotonou, Parakou, Porto-Novo, Calavi)</span>
            <span>•</span>
            <span>Afrique de l'Ouest & International</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
