"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  FileText, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  ArrowUpRight,
  Bot,
  DollarSign
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  // Données initiales du tableau de bord
  const stats = {
    totalInvoiced: 480000,
    totalCollected: 330000,
    pendingInvoices: 150000,
    activeContracts: 2,
    currency: "XOF",
  };

  const recentActivities = [
    {
      id: "act-1",
      type: "invoice",
      title: "Facture FACT-2024-001 encaissée",
      client: "BioSaveurs Afrique",
      amount: 150000,
      status: "Payé (Vérifié)",
      date: "14 Oct 2024",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "act-2",
      type: "quote",
      title: "Devis DEVIS-2024-003 envoyé",
      client: "AgroBénin SARL",
      amount: 350000,
      status: "En attente",
      date: "12 Oct 2024",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      id: "act-3",
      type: "contract",
      title: "Mission 'Charte Graphique' en cours",
      client: "BioSaveurs Afrique",
      amount: 150000,
      status: "En cours",
      date: "10 Oct 2024",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Espace Entrepreneur & Activité
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Suivi en temps réel de votre chiffre d'affaires, missions et factures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/quotes"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            Nouveau Devis
          </Link>
          <Link
            href="/dashboard/coach-ia"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Bot className="w-3.5 h-3.5" />
            Coach IA
          </Link>
        </div>
      </div>

      {/* Cartes KPI Financiers Réels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Chiffre d'Affaires Facturé
          </span>
          <div className="text-2xl font-extrabold text-slate-900">
            {formatCurrency(stats.totalInvoiced, stats.currency)}
          </div>
          <p className="text-[11px] text-slate-400">Total des factures émises</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">
            Sommes Encaissées
          </span>
          <div className="text-2xl font-extrabold text-emerald-700">
            {formatCurrency(stats.totalCollected, stats.currency)}
          </div>
          <p className="text-[11px] text-slate-400">Paiements reçus et confirmés</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block">
            En Attente de Règlement
          </span>
          <div className="text-2xl font-extrabold text-amber-700">
            {formatCurrency(stats.pendingInvoices, stats.currency)}
          </div>
          <p className="text-[11px] text-slate-400">Factures envoyées non échues</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider block">
            Missions Actives
          </span>
          <div className="text-2xl font-extrabold text-brand-700">
            {stats.activeContracts}
          </div>
          <p className="text-[11px] text-slate-400">Contrats en cours de réalisation</p>
        </div>
      </div>

      {/* Raccourcis & Modules Principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Devis & Facturation */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Dernières opérations & documents
              </h2>
              <span className="text-xs text-slate-500">
                Historique transparent et traçabilité des pièces
              </span>
            </div>
            <Link
              href="/dashboard/invoices"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              Voir tout <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-semibold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{act.title}</h4>
                    <span className="text-slate-500 text-[11px]">
                      Client : {act.client} • {act.date}
                    </span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <span className="font-bold text-slate-900 block text-sm">
                    {formatCurrency(act.amount, "XOF")}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${act.statusColor}`}>
                    {act.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panneau Coach IA & Actions Rapides */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl p-6 text-white shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-amber-100" />
              <h3 className="font-bold text-base">Business Coach IA</h3>
            </div>
            <p className="text-xs text-amber-50 leading-relaxed">
              Besoin d'aide pour rédiger une proposition pour une mission ou fixer le juste prix avec marge ?
            </p>
            <Link
              href="/dashboard/coach-ia"
              className="inline-block w-full py-2 px-3 bg-white text-amber-900 font-bold rounded-lg text-xs text-center shadow hover:bg-amber-50 transition-colors"
            >
              Lancer une session d'assistance
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Checklist de Démarrage
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <span>Création du profil professionnel</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <span>Configuration de la devise par défaut (FCFA)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Publication de votre première offre de service</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
