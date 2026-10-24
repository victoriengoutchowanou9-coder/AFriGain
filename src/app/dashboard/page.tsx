"use client";

import { useState, useEffect } from "react";
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
  DollarSign,
  Loader2,
  Inbox
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface ActivityItem {
  id: string;
  type: "invoice" | "quote" | "contract";
  title: string;
  client: string;
  amount: number;
  status: string;
  date: string;
  statusColor: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInvoiced: 0,
    totalCollected: 0,
    pendingInvoices: 0,
    activeContracts: 0,
    currency: "XOF",
  });
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();

        if (!userData?.user) {
          setLoading(false);
          return;
        }

        const userId = userData.user.id;

        // 1. Récupération des factures réelles de l'utilisateur
        const { data: invoices } = await supabase
          .from("invoices")
          .select("id, invoice_number, client_name, total_ttc, status, issue_date")
          .eq("entrepreneur_id", userId)
          .order("created_at", { ascending: false });

        // 2. Récupération des devis réels de l'utilisateur
        const { data: quotes } = await supabase
          .from("quotes")
          .select("id, quote_number, client_name, total_ttc, status, created_at")
          .eq("entrepreneur_id", userId)
          .order("created_at", { ascending: false });

        // 3. Récupération des contrats réels
        const { data: contracts } = await supabase
          .from("contracts")
          .select("id, status")
          .eq("freelancer_id", userId);

        let totalInvoiced = 0;
        let totalCollected = 0;
        let pendingInvoices = 0;

        const activities: ActivityItem[] = [];

        if (invoices && invoices.length > 0) {
          invoices.forEach((inv: any) => {
            const amount = Number(inv.total_ttc) || 0;
            totalInvoiced += amount;

            if (inv.status === "paid" || inv.status === "paid_verified") {
              totalCollected += amount;
            } else if (inv.status === "sent" || inv.status === "pending") {
              pendingInvoices += amount;
            }

            activities.push({
              id: inv.id,
              type: "invoice",
              title: `Facture ${inv.invoice_number}`,
              client: inv.client_name,
              amount: amount,
              status: inv.status === "paid" ? "Payé (Vérifié)" : inv.status === "sent" ? "Envoyée" : "En attente",
              date: new Date(inv.issue_date || Date.now()).toLocaleDateString("fr-FR"),
              statusColor: inv.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200",
            });
          });
        }

        if (quotes && quotes.length > 0) {
          quotes.forEach((q: any) => {
            const amount = Number(q.total_ttc) || 0;
            activities.push({
              id: q.id,
              type: "quote",
              title: `Devis ${q.quote_number}`,
              client: q.client_name,
              amount: amount,
              status: q.status === "accepted" ? "Accepté" : q.status === "sent" ? "Envoyé" : "Brouillon",
              date: new Date(q.created_at).toLocaleDateString("fr-FR"),
              statusColor: q.status === "accepted" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200",
            });
          });
        }

        const activeContracts = (contracts || []).filter((c: any) => c.status === "active").length;

        setStats({
          totalInvoiced,
          totalCollected,
          pendingInvoices,
          activeContracts,
          currency: "XOF",
        });

        setRecentActivities(activities.slice(0, 5));
      } catch (err) {
        console.error("Erreur chargement données dashboard", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

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

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span>Chargement de votre historique...</span>
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl mx-auto flex items-center justify-center">
                <Inbox className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-slate-600">
                Aucune opération ou pièce pour le moment.
              </p>
              <div className="flex justify-center gap-2 pt-1">
                <Link
                  href="/dashboard/quotes"
                  className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold"
                >
                  Créer un devis
                </Link>
                <Link
                  href="/missions"
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold"
                >
                  Explorer les missions
                </Link>
              </div>
            </div>
          ) : (
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
          )}
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
                <span>Confirmation sécurisée de l'adresse e-mail</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Publication de votre première offre ou devis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
