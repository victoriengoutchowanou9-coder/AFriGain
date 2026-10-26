"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BarChart2, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Users, 
  Briefcase, 
  Award, 
  Building2, 
  DollarSign, 
  HeartHandshake, 
  Info,
  Clock,
  Layers,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

export default function ImpactPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeProfiles: 0,
    verifiedProfiles: 0,
    totalMissionsPosted: 0,
    activeChallenges: 0,
    activeCollectifs: 0,
    declaredRevenueTotal: 0,
  });

  useEffect(() => {
    async function loadImpact() {
      setLoading(true);
      try {
        const supabase = createClient();

        // 1. Profils réels
        const { count: profCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // 2. Profils vérifiés réels
        const { count: verifiedCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("verification_status", "verified");

        // 3. Missions réelles publiées
        const { count: jobCount } = await supabase
          .from("job_posts")
          .select("*", { count: "exact", head: true });

        // 4. Défis réels
        const { count: challengeCount } = await supabase
          .from("challenges")
          .select("*", { count: "exact", head: true });

        // 5. Projets collectifs
        const { count: collectifCount } = await supabase
          .from("collectif_projects")
          .select("*", { count: "exact", head: true });

        setStats({
          activeProfiles: profCount || 0,
          verifiedProfiles: verifiedCount || 0,
          totalMissionsPosted: jobCount || 0,
          activeChallenges: challengeCount || 0,
          activeCollectifs: collectifCount || 0,
          declaredRevenueTotal: 0, // Ne pas simuler de faux montants
        });
      } catch (err) {
        console.error("Erreur impact:", err);
      } finally {
        setLoading(false);
      }
    }

    loadImpact();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold mb-2">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
            AfriGain Impact • Mesure des Résultats Économiques Réels
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Indicateurs d'Impact & Transparence
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            Suivi des résultats professionnels réels obtenus grâce aux activités de la communauté AfriGain. Zéro chiffre artificiel : chaque indicateur correspond à une donnée réelle auditée ou déclarée.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all self-start md:self-auto shrink-0"
        >
          Consulter mon tableau de bord
        </Link>
      </div>

      {/* Cadre de fiabilité statistique (Section 9.3 du PDF) */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>Charte de Fiabilité Statistique AfriGain</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          AfriGain refuse formellement l'utilisation de faux chiffres ou de montants simulés. Nos indicateurs distinguent rigoureusement les informations déclarées par les membres, les pièces documentées et les validations confirmées par des tiers.
        </p>
      </div>

      {/* Cartes d'Impact Principal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Membres Actifs</span>
            <Users className="w-4 h-4 text-brand-600" />
          </div>
          <span className="text-3xl font-black text-slate-900">
            {stats.activeProfiles}
          </span>
          <p className="text-[11px] text-slate-500">Inscrits réels sur la plateforme</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Profils Certifiés</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-3xl font-black text-slate-900">
            {stats.verifiedProfiles}
          </span>
          <p className="text-[11px] text-slate-500">Identités officielles vérifiées</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Opportunités Ouvertes</span>
            <Briefcase className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-3xl font-black text-slate-900">
            {stats.totalMissionsPosted}
          </span>
          <p className="text-[11px] text-slate-500">Besoins et missions en direct</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Défis & Collectifs</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-3xl font-black text-slate-900">
            {stats.activeChallenges + stats.activeCollectifs}
          </span>
          <p className="text-[11px] text-slate-500">Innovations & projets collaboratifs</p>
        </div>
      </div>

      {/* Détail des Piliers d'Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-600" />
            Accompagnement vers l'Activité & l'Autonomie
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Grâce à l'Opportunity Engine et au Passeport AfriGain, chaque jeune ou artisan peut valoriser ses compétences déclarées et documentées sans devoir attendre un diplôme traditionnel, favorisant l'inclusion économique panafricaine.
          </p>
          <div className="pt-2">
            <Link
              href="/commencer"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              Découvrir le parcours sans expérience <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
            Rapports Partenaires & Bailleurs
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            AfriGain prépare des rapports agrégés et anonymisés destinés aux organismes de formation, aux bailleurs de fonds et aux programmes gouvernementaux d'insertion, mesurant le taux d'aboutissement des missions et l'élévation des compétences.
          </p>
          <div className="pt-2">
            <Link
              href="/tarifs"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              Consulter nos offres et services de partenariat <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
