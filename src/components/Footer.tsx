import Link from "next/link";
import { ShieldCheck, Globe, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-lg">
                AF
              </div>
              <span className="font-bold text-xl text-white">AFriGain</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              La plateforme pour les jeunes entrepreneurs et indépendants. Trouvez des missions réelles, facturez simplement et développez des revenus durables.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400 font-medium bg-brand-950/60 border border-brand-800/60 px-3 py-1.5 rounded-full w-fit">
              <ShieldCheck className="w-4 h-4" />
              Piloté au Bénin • Architecture internationale
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-100 mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/missions" className="hover:text-white transition-colors">
                  Trouver une mission
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Catalogue de services
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-white transition-colors">
                  Recruter un prestataire
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition-colors">
                  Catégories d'activités
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-100 mb-4">
              Outils de Gestion
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/dashboard/quotes" className="hover:text-white transition-colors">
                  Créateur de devis PDF
                </Link>
              </li>
              <li>
                <Link href="/dashboard/invoices" className="hover:text-white transition-colors">
                  Facturation et reçus
                </Link>
              </li>
              <li>
                <Link href="/dashboard/coach-ia" className="hover:text-white transition-colors">
                  Business Coach IA
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Suivi des encaissements
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-100 mb-4">
              Confiance & Légal
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <span className="text-xs text-emerald-400 block mb-1">
                  ✓ Zéro promesse de gains garantis
                </span>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-white transition-colors">
                  Conditions Générales d'Utilisation
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-white transition-colors">
                  Politique de Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Support & Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AFriGain. Tous droits réservés.</p>
          <p className="text-center sm:text-right">
            Conçu pour l'émancipation économique des talents africains.
          </p>
        </div>
      </div>
    </footer>
  );
}
