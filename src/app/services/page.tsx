"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Check, 
  Clock, 
  Star, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  UserCheck
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ServicesPage() {
  const services = [
    {
      id: "srv-1",
      provider: "Koffi Mensah",
      country: "Bénin, Cotonou",
      avatar: "KM",
      verified: true,
      title: "Création de site vitrine responsive haute performance sous Next.js",
      description: "Conception complète de votre site vitrine optimisé pour mobile, avec formulaire de devis et intégration WhatsApp.",
      deliverables: ["3 à 5 pages responsives", "SEO de base", "Hébergement configuré", "Support 30 jours"],
      deliveryDays: 7,
      price: 180000,
      currency: "XOF",
      rating: 4.9,
      reviewsCount: 14,
    },
    {
      id: "srv-2",
      provider: "Aïcha Diallo",
      country: "Bénin / Sénégal",
      avatar: "AD",
      verified: true,
      title: "Identité de marque complète : Logo, Palette, Typographie & Cartes de visite",
      description: "Pour les entrepreneurs qui se lancent : livrables vectoriels complets prêts pour l'impression et les réseaux.",
      deliverables: ["3 propositions de logo", "Charte graphique PDF", "Fichiers vectoriels AI/SVG", "Bannières réseaux sociaux"],
      deliveryDays: 5,
      price: 95000,
      currency: "XOF",
      rating: 5.0,
      reviewsCount: 22,
    },
    {
      id: "srv-3",
      provider: "Rodrigue Dossou",
      country: "Bénin, Porto-Novo",
      avatar: "RD",
      verified: false,
      title: "Mise en place de votre comptabilité simplifiée & tableau de bord financier",
      description: "Structurez vos flux de trésorerie, vos devis et vos déclarations de TVA en toute conformité.",
      deliverables: ["Modèle Excel/Google Sheets personnalisé", "Calculateur de rentabilité", "Session d'accompagnement de 2h"],
      deliveryDays: 3,
      price: 60000,
      currency: "XOF",
      rating: 4.8,
      reviewsCount: 8,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Catalogue de Services & Talents
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Commandez des packs de services clés en main avec livrables et délais garantis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-500 transition-all flex flex-col justify-between p-6 space-y-6"
          >
            <div className="space-y-4">
              {/* Prestataire */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center text-sm">
                  {s.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-slate-900">{s.provider}</span>
                    {s.verified && (
                      <span title="Profil vérifié">
                        <ShieldCheck className="w-4 h-4 text-brand-600" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">{s.country}</span>
                </div>
              </div>

              {/* Titre & Description */}
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {s.description}
                </p>
              </div>

              {/* Livrables */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Ce qui est inclus :
                </span>
                {s.deliverables.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                    <Check className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pied de carte avec prix et délai */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Délai : {s.deliveryDays} jours
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {s.rating} ({s.reviewsCount} avis)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Tarif fixe</span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {formatCurrency(s.price, s.currency)}
                  </span>
                </div>

                <Link
                  href={`/dashboard/quotes?serviceTitle=${encodeURIComponent(s.title)}&amount=${s.price}`}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                >
                  Commander
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
