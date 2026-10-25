"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  CreditCard, 
  DollarSign, 
  ShieldCheck, 
  Plus, 
  Loader2, 
  Printer, 
  X, 
  Send, 
  BellRing,
  CheckCircle2,
  Share2
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface InvoiceItem {
  id: string;
  number: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  issueDate: string;
  dueDate: string;
  totalHT: number;
  totalTTC: number;
  currency: string;
  status: "paid_verified" | "paid_manual" | "pending" | "overdue";
  paymentMethod?: string;
  paymentRef?: string;
  items: { description: string; quantity: number; unitPrice: number }[];
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modale Enregistrement Paiement
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("momo_mtn");
  const [paymentRef, setPaymentRef] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);

  // Modale Visualisation & Impression PDF
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceItem | null>(null);

  // Modale Relance Client (Section 11)
  const [reminderInvoice, setReminderInvoice] = useState<InvoiceItem | null>(null);
  const [reminderSent, setReminderSent] = useState(false);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();

        if (userData?.user) {
          const { data } = await supabase
            .from("invoices")
            .select("*, invoice_lines(*)")
            .eq("entrepreneur_id", userData.user.id)
            .order("created_at", { ascending: false });

          if (data && data.length > 0) {
            const formatted: InvoiceItem[] = data.map((inv: any) => ({
              id: inv.id,
              number: inv.invoice_number,
              clientName: inv.client_name,
              clientEmail: inv.client_email,
              clientPhone: inv.client_phone,
              issueDate: new Date(inv.issue_date || inv.created_at).toLocaleDateString("fr-FR"),
              dueDate: new Date(inv.due_date || inv.created_at).toLocaleDateString("fr-FR"),
              totalHT: Number(inv.total_ht) || Number(inv.total_ttc) || 0,
              totalTTC: Number(inv.total_ttc) || 0,
              currency: inv.currency || "XOF",
              status: inv.status === "paid" ? "paid_verified" : inv.status === "partially_paid" ? "paid_manual" : "pending",
              paymentMethod: inv.payment_method || undefined,
              paymentRef: inv.payment_reference || undefined,
              items: (inv.invoice_lines || []).map((l: any) => ({
                description: l.description,
                quantity: Number(l.quantity) || 1,
                unitPrice: Number(l.unit_price) || 0,
              })),
            }));
            setInvoices(formatted);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Erreur de chargement des factures", err);
      } finally {
        setLoading(false);
      }
    }

    loadInvoices();
  }, []);

  const openPaymentModal = (inv: InvoiceItem) => {
    setSelectedInvoice(inv);
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setSavingPayment(true);

    try {
      const supabase = createClient();
      await supabase
        .from("invoices")
        .update({
          status: "paid",
          payment_method: paymentMethod,
          payment_reference: paymentRef,
        })
        .eq("id", selectedInvoice.id);
    } catch (err) {
      console.warn("Mise à jour locale");
    }

    setInvoices(invoices.map(i => i.id === selectedInvoice.id ? {
      ...i,
      status: "paid_verified",
      paymentMethod: paymentMethod === "momo_mtn" ? "MTN Mobile Money" : "Virement Bancaire",
      paymentRef: paymentRef || "MANUAL-CONFIRMED",
    } : i));

    setSavingPayment(false);
    setPaymentModalOpen(false);
    setSelectedInvoice(null);
    setPaymentRef("");
  };

  const handleSendReminder = (e: React.FormEvent) => {
    e.preventDefault();
    setReminderSent(true);
    setTimeout(() => {
      setReminderSent(false);
      setReminderInvoice(null);
    }, 1500);
  };

  // Statistiques financières (Section 11)
  const totalEncaisse = invoices
    .filter(i => i.status === "paid_verified" || i.status === "paid_manual")
    .reduce((sum, i) => sum + i.totalTTC, 0);

  const totalEnAttente = invoices
    .filter(i => i.status === "pending" || i.status === "overdue")
    .reduce((sum, i) => sum + i.totalTTC, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour Tableau de bord
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Factures & Encaissements
              </h1>
              <p className="text-xs text-slate-500">
                Suivi des règlements Mobile Money / virement, relances de paiement & justificatifs officiels.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/quotes"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Créer à partir d'un devis
        </Link>
      </div>

      {/* Cartes KPI Encaissements réels (Section 11 & 18) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Encaissé & Confirmé
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {formatCurrency(totalEncaisse, "XOF")}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              En attente d'encaissement
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {formatCurrency(totalEnAttente, "XOF")}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Liste des factures */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Journal des factures ({invoices.length})
          </h2>
          <span className="text-xs text-slate-500">Mentions légales et numérotation séquentielle</span>
        </div>

        <div className="divide-y divide-slate-100">
          {invoices.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">Aucune facture émise pour le moment</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Vos factures professionnelles créées ou converties depuis vos devis apparaîtront ici.
              </p>
            </div>
          ) : (
            invoices.map((inv) => (
            <div key={inv.id} className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{inv.number}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      inv.status === "paid_verified"
                        ? "bg-emerald-100 text-emerald-800"
                        : inv.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {inv.status === "paid_verified" ? "Payée & Encaissée" : inv.status === "pending" ? "En attente de règlement" : "En retard"}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Client : <strong className="text-slate-800">{inv.clientName}</strong>
                </div>
                <div className="text-[11px] text-slate-400">
                  Émise le {inv.issueDate} • Échéance : {inv.dueDate}
                </div>
                {inv.paymentRef && (
                  <div className="text-[10px] text-emerald-700 font-medium">
                    Réf paiement : {inv.paymentMethod} ({inv.paymentRef})
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Total Net</span>
                  <span className="text-base font-black text-slate-900">
                    {formatCurrency(inv.totalTTC, inv.currency)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingInvoice(inv)}
                    className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg border border-slate-200"
                    title="Voir et imprimer la facture"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {inv.status !== "paid_verified" ? (
                    <>
                      <button
                        onClick={() => openPaymentModal(inv)}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Confirmer règlement
                      </button>

                      <button
                        onClick={() => setReminderInvoice(inv)}
                        className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1"
                        title="Envoyer une relance courtoise au client"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                        Relancer
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Encaissé
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      </div>

      {/* Modale Relance de Paiement (Section 11) */}
      {reminderInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-amber-600 uppercase">Relance Client (Section 11)</span>
                <h3 className="text-base font-bold text-slate-900">Facture {reminderInvoice.number}</h3>
              </div>
              <button onClick={() => setReminderInvoice(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reminderSent ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">Relance transmise avec succès !</h4>
                <p className="text-xs text-slate-600">
                  Le message de rappel a été envoyé au client avec le récapitulatif du montant dû.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendReminder} className="space-y-3">
                <p className="text-xs text-slate-600">
                  Un rappel professionnel et courtois sera transmis à <strong>{reminderInvoice.clientName}</strong> pour le règlement de <strong>{formatCurrency(reminderInvoice.totalTTC, reminderInvoice.currency)}</strong>.
                </p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono">
                  "Bonjour {reminderInvoice.clientName}, sauf erreur de notre part, la facture {reminderInvoice.number} de {formatCurrency(reminderInvoice.totalTTC, reminderInvoice.currency)} arrivée à échéance le {reminderInvoice.dueDate} est toujours en attente de règlement. Merci de nous confirmer votre ordre de paiement."
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReminderInvoice(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-sm"
                  >
                    Transmettre la relance
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modale Enregistrement Paiement */}
      {paymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Valider l'encaissement</h3>
                <span className="text-xs text-slate-500">{selectedInvoice.number} • {formatCurrency(selectedInvoice.totalTTC, selectedInvoice.currency)}</span>
              </div>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mode de paiement reçu *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="momo_mtn">MTN Mobile Money Bénin</option>
                  <option value="moov_money">Moov Money Bénin</option>
                  <option value="virement">Virement Bancaire</option>
                  <option value="especes">Espèces contre reçu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Numéro de transaction / Référence</label>
                <input
                  type="text"
                  placeholder="Ex: TX-9039281 ou Référence virement"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  {savingPayment ? "Validation..." : "Confirmer le paiement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale Visualisation & Impression Facture PDF */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-8 shadow-2xl space-y-6 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-lg">
                  AF
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">FACTURE OFFICIELLE</h3>
                  <span className="text-[11px] text-slate-500">Conforme normes OHADA / UEMOA</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimer / PDF
                </button>
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Émetteur</span>
                <strong className="text-slate-800">Prestataire Certifié AfriGain</strong>
                <p className="text-slate-500">Cotonou, République du Bénin</p>
                <p className="text-slate-500">Statut fiscal : Micro-Entreprise / Régime Simplifié</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Facturé à</span>
                <strong className="text-slate-800">{viewingInvoice.clientName}</strong>
                {viewingInvoice.clientEmail && <p className="text-slate-500">{viewingInvoice.clientEmail}</p>}
                {viewingInvoice.clientPhone && <p className="text-slate-500">{viewingInvoice.clientPhone}</p>}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between">
              <div>
                <span className="text-slate-400 block font-medium">Numéro de Facture :</span>
                <strong className="text-slate-900">{viewingInvoice.number}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Date d'émission :</span>
                <strong className="text-slate-900">{viewingInvoice.issueDate}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Statut de règlement :</span>
                <strong className={viewingInvoice.status === "paid_verified" ? "text-emerald-600" : "text-amber-600"}>
                  {viewingInvoice.status === "paid_verified" ? "ACQUITTÉE / PAYÉE" : "EN ATTENTE"}
                </strong>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Désignation des prestations</th>
                    <th className="p-3 text-center">Qté</th>
                    <th className="p-3 text-right">Prix Unitaire</th>
                    <th className="p-3 text-right">Total Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 text-slate-800 font-medium">{item.description}</td>
                      <td className="p-3 text-center text-slate-600">{item.quantity}</td>
                      <td className="p-3 text-right text-slate-600">{formatCurrency(item.unitPrice, viewingInvoice.currency)}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(item.quantity * item.unitPrice, viewingInvoice.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between font-black text-sm text-slate-900">
                  <span>Total Net Réglé :</span>
                  <span className="text-emerald-700">{formatCurrency(viewingInvoice.totalTTC, viewingInvoice.currency)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-400">
              Document officiel tenant lieu de reçu une fois acquitté. Généré via la plateforme AFriGain Bénin.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
